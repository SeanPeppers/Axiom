import { R } from '../engine/logicEngine'

/**
 * Puzzle pool – rotates daily.  5×5 grid, 6 entities (DN FW RT VX PX ST).
 * Each puzzle has exactly 5 constraints; every entity appears in ≥ 1 constraint.
 *
 * Routing simulation: packets travel ONLY through adjacent infrastructure cells
 * (FW, RT, PX) and must reach ST. The chain must be: DN → [FW/RT/PX]+ → ST.
 * Virus floods freely but is blocked by all infrastructure (FW, RT, PX, ST).
 *
 * Constraint difficulty — avoid the obvious "IN_CORNER VX + ADJACENT FW+VX"
 * everywhere.  Prefer MIRROR_H, MIRROR_V, SAME_DIAGONAL, KNIGHT_MOVE, BETWEEN,
 * SIGHTLINE, CHECKERBOARD so players have to deduce rather than read off positions.
 *
 *   MIRROR_H [a,b]     – same column, a.row + b.row = 4  (horizontal reflection)
 *   MIRROR_V [a,b]     – same row,    a.col + b.col = 4  (vertical reflection)
 *   SAME_DIAGONAL [a,b]– |Δrow| = |Δcol|  (any diagonal)
 *   SIGHTLINE [a,b]    – same row or col, distance ≥ 2  (not adjacent)
 *   BETWEEN [a,b,c]    – a strictly between b and c on same row or col
 *   KNIGHT_MOVE [a,b]  – chess knight: (±1,±2) or (±2,±1)
 *   CHECKERBOARD [a,b] – (row+col) parity matches
 */
export const PUZZLES = [
  // ── #1  Boot Sequence  ───────────────────────────────────────────────────
  // Chain: DN(4,0)→RT(3,0)→ST(2,0)  packets reach ST at tick 2
  // VX(0,4) ─ FW(0,3) contains virus; PX(4,4) corner blocker
  {
    id: 1, title: 'Boot Sequence', difficulty: 'BASIC',
    scenario: 'A fresh cluster is initialising. Route each process to its Sentinel before the watchdog fires.',
    solution: {
      'data-node': { row: 4, col: 0 },
      router:      { row: 3, col: 0 },
      sentinel:    { row: 2, col: 0 },
      virus:       { row: 0, col: 4 },
      firewall:    { row: 0, col: 3 },
      proxy:       { row: 4, col: 4 },
    },
    constraints: [
      // VX(0,4) & PX(4,4): same col=4, rows 0+4=4  →  MIRROR_H
      { id: 'c1', type: R.MIRROR_H,       entities: ['virus', 'proxy'],               text: 'Virus and Proxy are horizontal reflections in the same column.' },
      // FW(0,3) & RT(3,0): |Δr|=3 |Δc|=3  →  SAME_DIAGONAL
      { id: 'c2', type: R.SAME_DIAGONAL,  entities: ['firewall', 'router'],            text: 'Firewall and Router lie on the same diagonal.' },
      // RT(3,0) strictly between DN(4,0) and ST(2,0) in col 0
      { id: 'c3', type: R.BETWEEN,        entities: ['router', 'data-node', 'sentinel'], text: 'Router lies strictly between Data Node and Sentinel.' },
      // FW(0,3) & VX(0,4): same row=0
      { id: 'c4', type: R.SAME_ROW,       entities: ['firewall', 'virus'],             text: 'Firewall and Virus share a row.' },
      // DN(4,0): corner
      { id: 'c5', type: R.IN_CORNER,      entities: ['data-node'],                    text: 'Data Node must occupy a corner cell.' },
    ],
  },

  // ── #2  Packet Storm  ────────────────────────────────────────────────────
  // Chain: DN(0,0)→RT(0,1)→ST(0,2)  tick 2
  // VX(4,4) ─ FW(3,4) virus containment; PX(4,0) corner
  {
    id: 2, title: 'Packet Storm', difficulty: 'BASIC',
    scenario: 'Traffic is spiking across all sectors. Route every service to its designated Sentinel cluster.',
    solution: {
      'data-node': { row: 0, col: 0 },
      router:      { row: 0, col: 1 },
      sentinel:    { row: 0, col: 2 },
      virus:       { row: 4, col: 4 },
      firewall:    { row: 3, col: 4 },
      proxy:       { row: 4, col: 0 },
    },
    constraints: [
      // DN(0,0) & VX(4,4): |Δr|=4 |Δc|=4  →  SAME_DIAGONAL (main diagonal)
      { id: 'c1', type: R.SAME_DIAGONAL,  entities: ['data-node', 'virus'],            text: 'Data Node and Virus lie on the same diagonal.' },
      // DN(0,0) & PX(4,0): same col=0, rows 0+4=4  →  MIRROR_H
      { id: 'c2', type: R.MIRROR_H,       entities: ['data-node', 'proxy'],            text: 'Data Node and Proxy are horizontal reflections in the same column.' },
      // RT(0,1) strictly between DN(0,0) and ST(0,2) in row 0
      { id: 'c3', type: R.BETWEEN,        entities: ['router', 'data-node', 'sentinel'], text: 'Router lies strictly between Data Node and Sentinel.' },
      // FW(3,4) & RT(0,1): |Δr|=3 |Δc|=3  →  SAME_DIAGONAL
      { id: 'c4', type: R.SAME_DIAGONAL,  entities: ['firewall', 'router'],            text: 'Firewall and Router lie on the same diagonal.' },
      // VX(4,4) & PX(4,0): same row=4, cols 4+0=4  →  MIRROR_V
      { id: 'c5', type: R.MIRROR_V,       entities: ['virus', 'proxy'],                text: 'Virus and Proxy are vertical reflections in the same row.' },
    ],
  },

  // ── #3  Access Protocol  ─────────────────────────────────────────────────
  // Chain: DN(4,4)→RT(4,3)→ST(4,2)  tick 2
  // VX(0,0) ─ FW(0,1); PX(2,2) inner blocker
  {
    id: 3, title: 'Access Protocol', difficulty: 'STANDARD',
    scenario: 'An unauthorised signal is probing the perimeter. Lock it out before it finds an open port.',
    solution: {
      'data-node': { row: 4, col: 4 },
      router:      { row: 4, col: 3 },
      sentinel:    { row: 4, col: 2 },
      virus:       { row: 0, col: 0 },
      firewall:    { row: 0, col: 1 },
      proxy:       { row: 2, col: 2 },
    },
    constraints: [
      // DN(4,4) & PX(2,2): |Δr|=2 |Δc|=2  →  SAME_DIAGONAL
      { id: 'c1', type: R.SAME_DIAGONAL,  entities: ['data-node', 'proxy'],            text: 'Data Node and Proxy lie on the same diagonal.' },
      // FW(0,1) & PX(2,2): |Δr|=2 |Δc|=1  →  KNIGHT_MOVE
      { id: 'c2', type: R.KNIGHT_MOVE,    entities: ['firewall', 'proxy'],             text: 'Firewall and Proxy are a knight\'s move apart.' },
      // RT(4,3) strictly between DN(4,4) and ST(4,2) in row 4
      { id: 'c3', type: R.BETWEEN,        entities: ['router', 'data-node', 'sentinel'], text: 'Router lies strictly between Data Node and Sentinel.' },
      // VX(0,0) & PX(2,2): |Δr|=2 |Δc|=2  →  SAME_DIAGONAL
      { id: 'c4', type: R.SAME_DIAGONAL,  entities: ['virus', 'proxy'],                text: 'Virus and Proxy lie on the same diagonal.' },
      // PX(2,2) & ST(4,2): same col=2, |Δr|=2 ≥ 2  →  SIGHTLINE
      { id: 'c5', type: R.SIGHTLINE,      entities: ['proxy', 'sentinel'],             text: 'Proxy has line-of-sight to Sentinel (same column, not adjacent).' },
    ],
  },

  // ── #4  Firewall Config  ─────────────────────────────────────────────────
  // Chain: DN(4,4)→PX(3,4)→ST(2,4)  tick 2  (PX in chain)
  // VX(0,0) ─ FW(1,0); RT(2,1) inner
  {
    id: 4, title: 'Firewall Config', difficulty: 'STANDARD',
    scenario: 'The mesh topology is misconfigured. Realign all nodes before the next health-check cycle.',
    solution: {
      'data-node': { row: 4, col: 4 },
      proxy:       { row: 3, col: 4 },
      sentinel:    { row: 2, col: 4 },
      virus:       { row: 0, col: 0 },
      firewall:    { row: 1, col: 0 },
      router:      { row: 2, col: 1 },
    },
    constraints: [
      // RT(2,1) & VX(0,0): |Δr|=2 |Δc|=1  →  KNIGHT_MOVE
      { id: 'c1', type: R.KNIGHT_MOVE,    entities: ['router', 'virus'],               text: 'Router and Virus are a knight\'s move apart.' },
      // RT(2,1) & ST(2,4): same row=2, |Δc|=3 ≥ 2  →  SIGHTLINE
      { id: 'c2', type: R.SIGHTLINE,      entities: ['router', 'sentinel'],            text: 'Router has line-of-sight to Sentinel (same row, not adjacent).' },
      // PX(3,4) strictly between DN(4,4) and ST(2,4) in col 4
      { id: 'c3', type: R.BETWEEN,        entities: ['proxy', 'data-node', 'sentinel'], text: 'Proxy lies strictly between Data Node and Sentinel.' },
      // RT(2,1) & FW(1,0): |Δr|=1 |Δc|=1  →  SAME_DIAGONAL
      { id: 'c4', type: R.SAME_DIAGONAL,  entities: ['router', 'firewall'],            text: 'Router and Firewall lie on the same diagonal.' },
      // RT(2,1): (2+1)%2=1  PX(3,4): (3+4)%2=1  →  CHECKERBOARD
      { id: 'c5', type: R.CHECKERBOARD,   entities: ['router', 'proxy'],               text: 'Router and Proxy share the same checkerboard colour.' },
    ],
  },

  // ── #5  Intrusion Detection  ─────────────────────────────────────────────
  // Chain: DN(2,0)→RT(2,1)→ST(2,2)  tick 2
  // VX(0,4) ─ FW(1,4); PX(4,2) southern blocker
  {
    id: 5, title: 'Intrusion Detection', difficulty: 'STANDARD',
    scenario: 'Anomalous traffic detected. The IDS needs every endpoint mapped to isolate the breach vector.',
    solution: {
      'data-node': { row: 2, col: 0 },
      router:      { row: 2, col: 1 },
      sentinel:    { row: 2, col: 2 },
      virus:       { row: 0, col: 4 },
      firewall:    { row: 1, col: 4 },
      proxy:       { row: 4, col: 2 },
    },
    constraints: [
      // FW(1,4) & ST(2,2): |Δr|=1 |Δc|=2  →  KNIGHT_MOVE
      { id: 'c1', type: R.KNIGHT_MOVE,    entities: ['firewall', 'sentinel'],          text: 'Firewall and Sentinel are a knight\'s move apart.' },
      // PX(4,2) & RT(2,1): |Δr|=2 |Δc|=1  →  KNIGHT_MOVE
      { id: 'c2', type: R.KNIGHT_MOVE,    entities: ['proxy', 'router'],               text: 'Proxy and Router are a knight\'s move apart.' },
      // PX(4,2) & DN(2,0): |Δr|=2 |Δc|=2  →  SAME_DIAGONAL
      { id: 'c3', type: R.SAME_DIAGONAL,  entities: ['proxy', 'data-node'],            text: 'Proxy and Data Node lie on the same diagonal.' },
      // VX(0,4): (0+4)%2=0  PX(4,2): (4+2)%2=0  →  CHECKERBOARD
      { id: 'c4', type: R.CHECKERBOARD,   entities: ['virus', 'proxy'],                text: 'Virus and Proxy share the same checkerboard colour.' },
      // RT(2,1) strictly between DN(2,0) and ST(2,2) in row 2
      { id: 'c5', type: R.BETWEEN,        entities: ['router', 'data-node', 'sentinel'], text: 'Router lies strictly between Data Node and Sentinel.' },
    ],
  },

  // ── #6  System Override  ─────────────────────────────────────────────────
  // Chain: DN(4,0)→FW(3,0)→RT(2,0)→ST(1,0)  tick 3  (FW in chain)
  // VX(0,4) far corner; PX(4,4) corner blocker
  {
    id: 6, title: 'System Override', difficulty: 'ADVANCED',
    scenario: 'A privileged override is rewriting the security matrix. Place all agents before the final commit.',
    solution: {
      'data-node': { row: 4, col: 0 },
      firewall:    { row: 3, col: 0 },
      router:      { row: 2, col: 0 },
      sentinel:    { row: 1, col: 0 },
      virus:       { row: 0, col: 4 },
      proxy:       { row: 4, col: 4 },
    },
    constraints: [
      // VX(0,4) & PX(4,4): same col=4, rows 0+4=4  →  MIRROR_H
      { id: 'c1', type: R.MIRROR_H,       entities: ['virus', 'proxy'],                text: 'Virus and Proxy are horizontal reflections in the same column.' },
      // FW(3,0) & ST(1,0): same col=0, rows 3+1=4  →  MIRROR_H
      { id: 'c2', type: R.MIRROR_H,       entities: ['firewall', 'sentinel'],          text: 'Firewall and Sentinel are horizontal reflections in the same column.' },
      // VX(0,4) & DN(4,0): |Δr|=4 |Δc|=4  →  SAME_DIAGONAL (anti-diagonal)
      { id: 'c3', type: R.SAME_DIAGONAL,  entities: ['virus', 'data-node'],            text: 'Virus and Data Node lie on the same diagonal.' },
      // FW(3,0) strictly between DN(4,0) and ST(1,0) in col 0
      { id: 'c4', type: R.BETWEEN,        entities: ['firewall', 'data-node', 'sentinel'], text: 'Firewall lies strictly between Data Node and Sentinel.' },
      // RT(2,0) & DN(4,0): same col=0, |Δr|=2 ≥ 2  →  SIGHTLINE
      { id: 'c5', type: R.SIGHTLINE,      entities: ['router', 'data-node'],           text: 'Router has line-of-sight to Data Node (same column, not adjacent).' },
    ],
  },

  // ── #7  Zero Day  ────────────────────────────────────────────────────────
  // Chain: DN(4,4)→PX(3,4)→RT(2,4)→ST(1,4)  tick 3  (PX in chain)
  // VX(0,0) ─ FW(1,0)
  {
    id: 7, title: 'Zero Day', difficulty: 'ADVANCED',
    scenario: 'A critical zero-day exploit is active. One shot at the correct configuration — no margin for error.',
    solution: {
      'data-node': { row: 4, col: 4 },
      proxy:       { row: 3, col: 4 },
      router:      { row: 2, col: 4 },
      sentinel:    { row: 1, col: 4 },
      virus:       { row: 0, col: 0 },
      firewall:    { row: 1, col: 0 },
    },
    constraints: [
      // PX(3,4) & ST(1,4): same col=4, rows 3+1=4  →  MIRROR_H
      { id: 'c1', type: R.MIRROR_H,       entities: ['proxy', 'sentinel'],             text: 'Proxy and Sentinel are horizontal reflections in the same column.' },
      // FW(1,0) & ST(1,4): same row=1, cols 0+4=4  →  MIRROR_V
      { id: 'c2', type: R.MIRROR_V,       entities: ['firewall', 'sentinel'],          text: 'Firewall and Sentinel are vertical reflections in the same row.' },
      // DN(4,4) & VX(0,0): |Δr|=4 |Δc|=4  →  SAME_DIAGONAL (main diagonal)
      { id: 'c3', type: R.SAME_DIAGONAL,  entities: ['data-node', 'virus'],            text: 'Data Node and Virus lie on the same diagonal.' },
      // RT(2,4) strictly between DN(4,4) and ST(1,4) in col 4
      { id: 'c4', type: R.BETWEEN,        entities: ['router', 'data-node', 'sentinel'], text: 'Router lies strictly between Data Node and Sentinel.' },
      // FW(1,0): (1+0)%2=1  ST(1,4): (1+4)%2=1  →  CHECKERBOARD
      { id: 'c5', type: R.CHECKERBOARD,   entities: ['firewall', 'sentinel'],          text: 'Firewall and Sentinel share the same checkerboard colour.' },
    ],
  },

  // ── #8  Kernel Panic  ────────────────────────────────────────────────────
  // Chain: DN(0,2)→FW(1,2)→RT(2,2)→ST(3,2)  tick 3  (FW in chain)
  // VX(4,2) blocked by column wall; PX(2,4) eastern relay
  {
    id: 8, title: 'Kernel Panic', difficulty: 'ADVANCED',
    scenario: 'The kernel has panicked and entropy is spreading. Contain it before the system is unrecoverable.',
    solution: {
      'data-node': { row: 0, col: 2 },
      firewall:    { row: 1, col: 2 },
      router:      { row: 2, col: 2 },
      sentinel:    { row: 3, col: 2 },
      virus:       { row: 4, col: 2 },
      proxy:       { row: 2, col: 4 },
    },
    constraints: [
      // DN(0,2) & VX(4,2): same col=2, rows 0+4=4  →  MIRROR_H
      { id: 'c1', type: R.MIRROR_H,       entities: ['data-node', 'virus'],            text: 'Data Node and Virus are horizontal reflections in the same column.' },
      // FW(1,2) & ST(3,2): same col=2, rows 1+3=4  →  MIRROR_H
      { id: 'c2', type: R.MIRROR_H,       entities: ['firewall', 'sentinel'],          text: 'Firewall and Sentinel are horizontal reflections in the same column.' },
      // PX(2,4) & FW(1,2): |Δr|=1 |Δc|=2  →  KNIGHT_MOVE
      { id: 'c3', type: R.KNIGHT_MOVE,    entities: ['proxy', 'firewall'],             text: 'Proxy and Firewall are a knight\'s move apart.' },
      // PX(2,4) & DN(0,2): |Δr|=2 |Δc|=2  →  SAME_DIAGONAL
      { id: 'c4', type: R.SAME_DIAGONAL,  entities: ['proxy', 'data-node'],            text: 'Proxy and Data Node lie on the same diagonal.' },
      // RT(2,2): inner zone (not on grid border)
      { id: 'c5', type: R.NOT_ON_EDGE,    entities: ['router'],                        text: 'Router must be in the inner zone (not on the grid border).' },
    ],
  },

  // ── #9  Signal Mirror  ───────────────────────────────────────────────────
  // Chain: DN(0,2)→RT(1,2)→ST(2,2)  tick 2
  // VX(4,4) ─ FW(4,3); PX(0,0) corner blocker
  {
    id: 9, title: 'Signal Mirror', difficulty: 'STANDARD',
    scenario: 'Two conflicting signals are creating reflective interference. Separate them or the mesh collapses.',
    solution: {
      'data-node': { row: 0, col: 2 },
      router:      { row: 1, col: 2 },
      sentinel:    { row: 2, col: 2 },
      virus:       { row: 4, col: 4 },
      firewall:    { row: 4, col: 3 },
      proxy:       { row: 0, col: 0 },
    },
    constraints: [
      // PX(0,0) & VX(4,4): |Δr|=4 |Δc|=4  →  SAME_DIAGONAL (main diagonal)
      { id: 'c1', type: R.SAME_DIAGONAL,  entities: ['proxy', 'virus'],                text: 'Proxy and Virus lie on the same diagonal.' },
      // PX(0,0) & ST(2,2): |Δr|=2 |Δc|=2  →  SAME_DIAGONAL
      { id: 'c2', type: R.SAME_DIAGONAL,  entities: ['proxy', 'sentinel'],             text: 'Proxy and Sentinel lie on the same diagonal.' },
      // PX(0,0) & RT(1,2): |Δr|=1 |Δc|=2  →  KNIGHT_MOVE
      { id: 'c3', type: R.KNIGHT_MOVE,    entities: ['proxy', 'router'],               text: 'Proxy and Router are a knight\'s move apart.' },
      // FW(4,3) & ST(2,2): |Δr|=2 |Δc|=1  →  KNIGHT_MOVE
      { id: 'c4', type: R.KNIGHT_MOVE,    entities: ['firewall', 'sentinel'],          text: 'Firewall and Sentinel are a knight\'s move apart.' },
      // DN(0,2) & ST(2,2): same col=2, |Δr|=2 ≥ 2  →  SIGHTLINE
      { id: 'c5', type: R.SIGHTLINE,      entities: ['data-node', 'sentinel'],         text: 'Data Node has line-of-sight to Sentinel (same column, not adjacent).' },
    ],
  },

  // ── #10  Network Hub  ────────────────────────────────────────────────────
  // Chain: DN(2,0)→FW(2,1)→RT(2,2)→ST(2,3)  tick 3  (FW in chain)
  // VX(1,3) inner; PX(4,2) southern
  {
    id: 10, title: 'Network Hub', difficulty: 'ADVANCED',
    scenario: 'The Router is the central node. Every service must stay within signal range or the mesh fragments.',
    solution: {
      'data-node': { row: 2, col: 0 },
      firewall:    { row: 2, col: 1 },
      router:      { row: 2, col: 2 },
      sentinel:    { row: 2, col: 3 },
      virus:       { row: 1, col: 3 },
      proxy:       { row: 4, col: 2 },
    },
    constraints: [
      // VX(1,3) & FW(2,1): |Δr|=1 |Δc|=2  →  KNIGHT_MOVE
      { id: 'c1', type: R.KNIGHT_MOVE,    entities: ['virus', 'firewall'],             text: 'Virus and Firewall are a knight\'s move apart.' },
      // VX(1,3) & RT(2,2): |Δr|=1 |Δc|=1  →  SAME_DIAGONAL
      { id: 'c2', type: R.SAME_DIAGONAL,  entities: ['virus', 'router'],               text: 'Virus and Router lie on the same diagonal.' },
      // PX(4,2) & DN(2,0): |Δr|=2 |Δc|=2  →  SAME_DIAGONAL
      { id: 'c3', type: R.SAME_DIAGONAL,  entities: ['proxy', 'data-node'],            text: 'Proxy and Data Node lie on the same diagonal.' },
      // DN(2,0) & ST(2,3): same row=2, |Δc|=3 ≥ 2  →  SIGHTLINE
      { id: 'c4', type: R.SIGHTLINE,      entities: ['data-node', 'sentinel'],         text: 'Data Node has line-of-sight to Sentinel (same row, not adjacent).' },
      // PX(4,2) & ST(2,3): |Δr|=2 |Δc|=1  →  KNIGHT_MOVE
      { id: 'c5', type: R.KNIGHT_MOVE,    entities: ['proxy', 'sentinel'],             text: 'Proxy and Sentinel are a knight\'s move apart.' },
    ],
  },
]
