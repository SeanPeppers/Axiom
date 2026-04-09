/**
 * Procedural puzzle generator for AXIOM.
 *
 * Given a numeric seed, deterministically generates a valid puzzle:
 *   1. Build a DN → [infra]+ → ST chain (2-hop or 3-hop)
 *   2. Place VX far from DN with a blocker entity adjacent to it
 *   3. Derive 5 satisfiable constraints that cover all 6 entities
 *
 * The same seed always produces the same puzzle, so seeds can be shared.
 */

import { R } from './logicEngine'
import { GRID_ROWS, GRID_COLS } from '../config'

// ── Seeded PRNG (xorshift32-based) ───────────────────────────────────────────

function makePRNG(seed) {
  let s = (seed ^ 0xdeadbeef) >>> 0 || 1
  const next = () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5
    return (s >>> 0) / 0x100000000
  }
  return {
    next,
    int:     (n) => Math.floor(next() * n),
    pick:    (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    },
  }
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

const DIRS = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }]

const inBounds  = (r, c) => r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS
const manhattan = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
const isCorner  = (p) => (p.row === 0 || p.row === GRID_ROWS - 1) && (p.col === 0 || p.col === GRID_COLS - 1)
const isEdge    = (p) => p.row === 0 || p.row === GRID_ROWS - 1 || p.col === 0 || p.col === GRID_COLS - 1
const isInner   = (p) => !isEdge(p)
const colLetter = (c) => 'ABCDE'[c] ?? c

const ENTITY_LABELS = {
  'data-node': 'Data Node', firewall: 'Firewall', router: 'Router',
  proxy: 'Proxy', sentinel: 'Sentinel', virus: 'Virus',
}
const lbl = (id) => ENTITY_LABELS[id] ?? id

function getQuadrant(p) {
  const mr = Math.floor(GRID_ROWS / 2), mc = Math.floor(GRID_COLS / 2)
  if (p.row === mr || p.col === mc) return null
  if (p.row < mr && p.col < mc) return 0
  if (p.row < mr && p.col > mc) return 1
  if (p.row > mr && p.col < mc) return 2
  if (p.row > mr && p.col > mc) return 3
  return null
}
const QUADRANT_NAMES = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

// ── Chain generation ──────────────────────────────────────────────────────────

/** Random-walk chain of `hopCount + 1` cells starting from a random position. */
function generateChain(rng, hopCount) {
  const chainLen = hopCount + 1
  for (let attempt = 0; attempt < 300; attempt++) {
    const start = { row: rng.int(GRID_ROWS), col: rng.int(GRID_COLS) }
    const cells = [start]
    const used = new Set([`${start.row},${start.col}`])
    let ok = true

    for (let i = 1; i < chainLen; i++) {
      const prev = cells[i - 1]
      const candidates = rng.shuffle(DIRS)
      let added = false
      for (const { dr, dc } of candidates) {
        const r = prev.row + dr, c = prev.col + dc, k = `${r},${c}`
        if (inBounds(r, c) && !used.has(k)) {
          cells.push({ row: r, col: c })
          used.add(k)
          added = true
          break
        }
      }
      if (!added) { ok = false; break }
    }

    if (ok) return cells
  }
  return null
}

// ── Constraint candidate generation ──────────────────────────────────────────

/**
 * Returns all constraints that are satisfied by the given placement.
 * Filters out trivially weak ones (WITHIN_N distance 4+, etc.).
 */
function buildCandidates(placement) {
  const ids = Object.keys(placement)
  const get = (id) => placement[id]
  const cands = []
  const add = (c) => cands.push(c)

  // ── Single-entity ──────────────────────────────────────────────────────────
  for (const id of ids) {
    const p = get(id)
    if (!p) continue

    if (isCorner(p)) {
      add({ type: R.IN_CORNER, entities: [id], text: `${lbl(id)} must occupy a corner cell.` })
    }
    if (isInner(p)) {
      add({ type: R.NOT_ON_EDGE, entities: [id], text: `${lbl(id)} must be in the inner zone (not on the grid border).` })
    }
    if (isEdge(p) && !isCorner(p)) {
      add({ type: R.ON_EDGE, entities: [id], text: `${lbl(id)} must be on the grid border.` })
    }
    const q = getQuadrant(p)
    if (q !== null) {
      add({ type: R.IN_QUADRANT, quadrant: q, entities: [id], text: `${lbl(id)} must be in the ${QUADRANT_NAMES[q]} quadrant.` })
    }
  }

  // ── Pair constraints ───────────────────────────────────────────────────────
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const [ia, ib] = [ids[i], ids[j]]
      const [a, b] = [get(ia), get(ib)]
      if (!a || !b) continue

      const md    = manhattan(a, b)
      const dRow  = Math.abs(a.row - b.row)
      const dCol  = Math.abs(a.col - b.col)
      const adj4  = md === 1
      const adj8  = dRow <= 1 && dCol <= 1 && md > 0

      if (a.row === b.row) add({ type: R.SAME_ROW,    entities: [ia, ib], text: `${lbl(ia)} and ${lbl(ib)} must share a row.` })
      if (a.col === b.col) add({ type: R.SAME_COLUMN, entities: [ia, ib], text: `${lbl(ia)} and ${lbl(ib)} must share a column.` })
      if (adj8) add({ type: R.ADJACENT,   entities: [ia, ib], text: `${lbl(ia)} must be adjacent to ${lbl(ib)}.` })
      if (adj4) add({ type: R.ORTHOGONAL, entities: [ia, ib], text: `${lbl(ia)} must be orthogonally adjacent to ${lbl(ib)}.` })

      // Directional
      if (a.row < b.row) add({ type: R.NORTH_OF, entities: [ia, ib], text: `${lbl(ia)} must be north of ${lbl(ib)}.` })
      if (a.row > b.row) add({ type: R.SOUTH_OF, entities: [ia, ib], text: `${lbl(ia)} must be south of ${lbl(ib)}.` })
      if (a.col > b.col) add({ type: R.EAST_OF,  entities: [ia, ib], text: `${lbl(ia)} must be east of ${lbl(ib)}.` })
      if (a.col < b.col) add({ type: R.WEST_OF,  entities: [ia, ib], text: `${lbl(ia)} must be west of ${lbl(ib)}.` })

      // Sightline (same row/col, not adjacent)
      if ((a.row === b.row && dCol >= 2) || (a.col === b.col && dRow >= 2)) {
        add({ type: R.SIGHTLINE, entities: [ia, ib], text: `${lbl(ia)} must have line-of-sight to ${lbl(ib)} (same row or column, not adjacent).` })
      }

      // WITHIN_N – only for meaningful distances
      if (md <= 2) {
        add({ type: R.WITHIN_N, distance: md, entities: [ia, ib], text: `${lbl(ia)} must be within ${md} step${md > 1 ? 's' : ''} of ${lbl(ib)}.` })
      }

      // Knight's move
      if ((dRow === 1 && dCol === 2) || (dRow === 2 && dCol === 1)) {
        add({ type: R.KNIGHT_MOVE, entities: [ia, ib], text: `${lbl(ia)} and ${lbl(ib)} must be a knight\'s move apart.` })
      }

      // Checkerboard
      if ((a.row + a.col) % 2 === (b.row + b.col) % 2) {
        add({ type: R.CHECKERBOARD, entities: [ia, ib], text: `${lbl(ia)} and ${lbl(ib)} must share the same checkerboard colour.` })
      }

      // Same diagonal
      if (dRow === dCol && dRow > 0) {
        add({ type: R.SAME_DIAGONAL, entities: [ia, ib], text: `${lbl(ia)} and ${lbl(ib)} must lie on the same diagonal.` })
      }
    }
  }

  // ── BETWEEN (A strictly between B and C on same row or col) ───────────────
  for (let a = 0; a < ids.length; a++) {
    for (let b = 0; b < ids.length; b++) {
      if (b === a) continue
      for (let c = b + 1; c < ids.length; c++) {
        if (c === a) continue
        const [ia, ib, ic] = [ids[a], ids[b], ids[c]]
        const [pa, pb, pc] = [get(ia), get(ib), get(ic)]
        if (!pa || !pb || !pc) continue

        const inRow = pb.row === pc.row && pa.row === pb.row &&
          pa.col > Math.min(pb.col, pc.col) && pa.col < Math.max(pb.col, pc.col)
        const inCol = pb.col === pc.col && pa.col === pb.col &&
          pa.row > Math.min(pb.row, pc.row) && pa.row < Math.max(pb.row, pc.row)

        if (inRow || inCol) {
          add({ type: R.BETWEEN, entities: [ia, ib, ic], text: `${lbl(ia)} must lie strictly between ${lbl(ib)} and ${lbl(ic)}.` })
        }
      }
    }
  }

  return cands
}

// ── Constraint picker ─────────────────────────────────────────────────────────

/** Picks exactly 5 constraints that together cover every entity in `entityIds`. */
function pickConstraints(rng, candidates, entityIds) {
  for (let attempt = 0; attempt < 2000; attempt++) {
    const shuffled = rng.shuffle(candidates)
    const chosen = []
    const covered = new Set()

    // Pass 1: prefer constraints that introduce new entity coverage
    for (const c of shuffled) {
      if (chosen.length === 5) break
      if (c.entities.some((id) => !covered.has(id))) {
        chosen.push(c)
        c.entities.forEach((id) => covered.add(id))
      }
    }
    // Pass 2: fill remaining slots
    for (const c of shuffled) {
      if (chosen.length === 5) break
      if (!chosen.includes(c)) {
        chosen.push(c)
        c.entities.forEach((id) => covered.add(id))
      }
    }

    if (entityIds.every((id) => covered.has(id)) && chosen.length === 5) {
      return chosen.map((c, i) => ({ ...c, id: `c${i + 1}` }))
    }
  }
  return null
}

// ── Scenario pool ─────────────────────────────────────────────────────────────

const SCENARIOS = [
  'An anomalous process is forking uncontrollably. Route the signal before entropy wins.',
  'The intrusion signature is morphing. Lock down the relay chain immediately.',
  'A rogue subnet is broadcasting noise. Isolate the correct signal path.',
  'Packet loss is cascading. Rebuild the routing table before corruption spreads.',
  'System integrity is degrading. Establish a clean channel to the Sentinel.',
  'An unknown agent is replicating across the mesh. Contain it now.',
  'The network topology has shifted. Rediscover the optimal routing path.',
  'Cascade failure detected. Emergency reroute through available infrastructure.',
  'A zero-trust violation has been flagged. Verify the chain of custody.',
  'Latency spikes indicate a relay fault. Diagnose and reroute before timeout.',
  'The firewall signature database is stale. Rebuild the perimeter before re-exposure.',
  'DNS poisoning detected. Route around the compromised resolver.',
]

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Generates a deterministic random puzzle from a numeric seed.
 * Returns a puzzle object matching the PUZZLES array shape, or null on failure.
 */
export function generatePuzzle(seed) {
  if (typeof seed !== 'number' || !isFinite(seed)) return null
  const rng = makePRNG(seed)
  const INFRA_IDS = ['firewall', 'router', 'proxy']

  for (let globalAttempt = 0; globalAttempt < 120; globalAttempt++) {
    // 2-hop more common than 3-hop for playability
    const hopCount = rng.pick([2, 2, 2, 3])
    const shuffledInfra = rng.shuffle([...INFRA_IDS])

    // Chain uses: DN + (hopCount-1) infra entities + ST
    const chainInfraIds  = shuffledInfra.slice(0, hopCount - 1)
    // remaining infra: [0] = blocker adjacent to VX; [1] (if exists) = extra, placed randomly
    const remainingInfra = shuffledInfra.slice(hopCount - 1)

    const chain = generateChain(rng, hopCount)
    if (!chain) continue

    const dnPos         = chain[0]
    const stPos         = chain[chain.length - 1]
    const infraPositions = chain.slice(1, -1)

    const occupiedSet = new Set(chain.map((p) => `${p.row},${p.col}`))

    // Place VX far from DN (manhattan ≥ 4)
    let vxPos = null
    for (let i = 0; i < 150; i++) {
      const r = rng.int(GRID_ROWS), c = rng.int(GRID_COLS), k = `${r},${c}`
      if (occupiedSet.has(k)) continue
      const pos = { row: r, col: c }
      if (manhattan(pos, dnPos) < 4) continue
      vxPos = pos
      occupiedSet.add(k)
      break
    }
    if (!vxPos) continue

    // Place blocker adjacent to VX (remainingInfra[0])
    let blockerPos = null
    for (const { dr, dc } of rng.shuffle(DIRS)) {
      const r = vxPos.row + dr, c = vxPos.col + dc, k = `${r},${c}`
      if (!inBounds(r, c) || occupiedSet.has(k)) continue
      blockerPos = { row: r, col: c }
      occupiedSet.add(k)
      break
    }
    if (!blockerPos) continue

    // Place extra infra (only for 2-hop: one leftover infra entity)
    let extraPos = null
    if (remainingInfra.length > 1) {
      for (let i = 0; i < 150; i++) {
        const r = rng.int(GRID_ROWS), c = rng.int(GRID_COLS), k = `${r},${c}`
        if (!occupiedSet.has(k)) { extraPos = { row: r, col: c }; occupiedSet.add(k); break }
      }
      if (!extraPos) continue
    }

    // Build placement
    const placement = {
      'data-node': dnPos,
      sentinel:    stPos,
      virus:       vxPos,
      [remainingInfra[0]]: blockerPos,
    }
    chainInfraIds.forEach((id, i) => { placement[id] = infraPositions[i] })
    if (remainingInfra.length > 1) placement[remainingInfra[1]] = extraPos

    // Generate constraints
    const candidates  = buildCandidates(placement)
    const constraints = pickConstraints(rng, candidates, Object.keys(placement))
    if (!constraints) continue

    return {
      id:         seed,
      title:      'Random Circuit',
      difficulty: hopCount === 3 ? 'ADVANCED' : 'STANDARD',
      scenario:   rng.pick(SCENARIOS),
      solution:   placement,
      constraints,
    }
  }

  return null  // generation failed (extremely rare)
}
