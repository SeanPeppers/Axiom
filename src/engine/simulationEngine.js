/**
 * Axiom Simulation Engine
 *
 * Packets flood from DN but can ONLY travel through infrastructure cells
 * (FW, RT, PX) and arrive at the destination (ST).
 * This means the player must create a connected chain:
 *   DN → [FW/RT/PX]* → ST
 *
 * Virus spreads freely (4-directional) but is blocked by all infrastructure.
 *
 * Win:  a packet reaches ST before virus reaches DN
 * Lose: virus reaches DN before any packet reaches ST
 *
 * Returns { frames, success, packetReached, virusReachedDN }
 * Each frame: { packets: Set<"r,c">, infected: Set<"r,c">, tick }
 */

import { GRID_ROWS, GRID_COLS } from '../config'

const DIRS = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }]

function key(r, c) { return `${r},${c}` }

export function runSimulation(placements) {
  const get = (id) => placements[id] ?? null
  const dn = get('data-node')
  const fw = get('firewall')
  const rt = get('router')
  const px = get('proxy')
  const st = get('sentinel')
  const vx = get('virus')

  if (!dn || !st || !vx) return null

  // Infrastructure cells: packets can only spread TO these
  const infraKeys = new Set()
  ;[fw, rt, px, st].forEach((e) => { if (e) infraKeys.add(key(e.row, e.col)) })

  // Infrastructure also blocks virus spread
  const blockers = infraKeys

  const stKey = key(st.row, st.col)
  const dnKey = key(dn.row, dn.col)

  let packets  = new Set([dnKey])
  let infected = new Set([key(vx.row, vx.col)])

  const frames = []
  let packetReached  = false
  let virusReachedDN = false

  for (let tick = 1; tick <= 8; tick++) {
    // ── packets: spread only to adjacent infrastructure/destination cells ──
    const nextPackets = new Set(packets)
    for (const pos of packets) {
      const [r, c] = pos.split(',').map(Number)
      for (const { dr, dc } of DIRS) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
          const k = key(nr, nc)
          if (infraKeys.has(k) && !infected.has(k)) nextPackets.add(k)
        }
      }
    }

    // ── virus: flood to adjacent non-blocker cells ────────────────────────
    const nextInfected = new Set(infected)
    for (const pos of infected) {
      const [r, c] = pos.split(',').map(Number)
      for (const { dr, dc } of DIRS) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
          const k = key(nr, nc)
          if (!blockers.has(k)) nextInfected.add(k)
        }
      }
    }

    packets  = nextPackets
    infected = nextInfected

    if (packets.has(stKey))  packetReached  = true
    if (infected.has(dnKey)) virusReachedDN = true

    frames.push({
      packets:  new Set(packets),
      infected: new Set(infected),
      packetReached,
      virusReachedDN,
      tick,
    })

    if (packetReached || virusReachedDN) break
  }

  return {
    frames,
    success:       packetReached && !virusReachedDN,
    packetReached,
    virusReachedDN,
  }
}
