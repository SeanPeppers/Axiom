import { R } from '../engine/logicEngine'

/**
 * Puzzle pool – rotates daily.  5×5 grid, 6 entities (DN FW RT VX PX ST).
 * Each puzzle has exactly 5 constraints; every entity appears in ≥ 1 constraint.
 * Solutions are verified for both static constraints AND the routing simulation:
 *   – DN packets must reach ST before VX reaches DN.
 *   – Infrastructure (FW RT PX ST) blocks virus spread.
 */
export const PUZZLES = [
  // ── #1  Boot Sequence  ───────────────────────────────────────────────────
  // Solution: VX=(0,0) FW=(0,1) DN=(4,2) ST=(3,2) RT=(2,3) PX=(4,4)
  // Sim: DN→ST in 1 tick. VX blocked east by FW, south: 6+ ticks to reach DN. ✓
  {
    id: 1, title: 'Boot Sequence', difficulty: 'BASIC',
    scenario: 'A fresh cluster is initialising. Route each process to its Sentinel before the watchdog fires.',
    solution: { virus:{row:0,col:0}, firewall:{row:0,col:1}, 'data-node':{row:4,col:2}, sentinel:{row:3,col:2}, router:{row:2,col:3}, proxy:{row:4,col:4} },
    constraints: [
      { id:'c1', type:R.IN_CORNER,   entities:['virus'],              text:'Virus must occupy a corner cell.' },
      { id:'c2', type:R.ADJACENT,    entities:['firewall','virus'],   text:'Firewall must be adjacent to Virus.' },
      { id:'c3', type:R.WITHIN_N,    entities:['data-node','sentinel'], distance:1, text:'Data Node must be within 1 step of Sentinel.' },
      { id:'c4', type:R.NORTH_OF,    entities:['router','data-node'], text:'Router must be north of Data Node.' },
      { id:'c5', type:R.IN_CORNER,   entities:['proxy'],              text:'Proxy must occupy a corner cell.' },
    ],
  },

  // ── #2  Packet Storm  ────────────────────────────────────────────────────
  // Solution: VX=(0,4) FW=(1,4) DN=(4,1) ST=(4,2) RT=(2,2) PX=(3,0)
  // Sim: DN→ST in 1 tick. VX blocked south by FW, spreads west far from DN. ✓
  {
    id: 2, title: 'Packet Storm', difficulty: 'BASIC',
    scenario: 'Traffic is spiking across all sectors. Route every service to its designated Sentinel cluster.',
    solution: { virus:{row:0,col:4}, firewall:{row:1,col:4}, 'data-node':{row:4,col:1}, sentinel:{row:4,col:2}, router:{row:2,col:2}, proxy:{row:3,col:0} },
    constraints: [
      { id:'c1', type:R.IN_CORNER,        entities:['virus'],              text:'Virus must occupy a corner cell.' },
      { id:'c2', type:R.ORTHOGONAL,       entities:['firewall','virus'],   text:'Firewall must be directly adjacent (no diagonal) to Virus.' },
      { id:'c3', type:R.ADJACENT,         entities:['data-node','sentinel'], text:'Data Node must be adjacent to Sentinel.' },
      { id:'c4', type:R.IN_ROW,           entities:['data-node'], row:4,   text:'Data Node must be in Row 5.' },
      { id:'c5', type:R.DIFFERENT_COLUMN, entities:['router','proxy'],     text:'Router and Proxy must NOT share a column.' },
    ],
  },

  // ── #3  Access Protocol  ─────────────────────────────────────────────────
  // Solution: VX=(4,4) FW=(3,4) DN=(0,2) ST=(0,3) RT=(2,2) PX=(2,0)
  // Sim: DN→ST in 1 tick. VX blocked north by FW, spreads west far from DN. ✓
  {
    id: 3, title: 'Access Protocol', difficulty: 'STANDARD',
    scenario: 'An unauthorised signal is probing the perimeter. Lock it out before it finds an open port.',
    solution: { virus:{row:4,col:4}, firewall:{row:3,col:4}, 'data-node':{row:0,col:2}, sentinel:{row:0,col:3}, router:{row:2,col:2}, proxy:{row:2,col:0} },
    constraints: [
      { id:'c1', type:R.IN_CORNER,    entities:['virus'],               text:'Virus must occupy a corner cell.' },
      { id:'c2', type:R.ADJACENT,     entities:['firewall','virus'],    text:'Firewall must be adjacent to Virus.' },
      { id:'c3', type:R.WITHIN_N,     entities:['data-node','sentinel'], distance:1, text:'Data Node must be within 1 step of Sentinel.' },
      { id:'c4', type:R.CHECKERBOARD, entities:['router','proxy'],      text:'Router and Proxy must share the same checkerboard colour.' },
      { id:'c5', type:R.NORTH_OF,     entities:['data-node','virus'],   text:'Data Node must be north of Virus.' },
    ],
  },

  // ── #4  Firewall Config  ─────────────────────────────────────────────────
  // Solution: VX=(0,0) FW=(1,0) DN=(4,4) ST=(3,4) RT=(2,3) PX=(0,1)
  // Sim: DN→ST in 1 tick. VX blocked south by FW, PX blocks east → contained. ✓
  {
    id: 4, title: 'Firewall Config', difficulty: 'STANDARD',
    scenario: 'The mesh topology is misconfigured. Realign all nodes before the next health-check cycle.',
    solution: { virus:{row:0,col:0}, firewall:{row:1,col:0}, 'data-node':{row:4,col:4}, sentinel:{row:3,col:4}, router:{row:2,col:3}, proxy:{row:0,col:1} },
    constraints: [
      { id:'c1', type:R.IN_CORNER,      entities:['virus'],               text:'Virus must occupy a corner cell.' },
      { id:'c2', type:R.ORTHOGONAL,     entities:['firewall','virus'],    text:'Firewall must be directly adjacent (no diagonal) to Virus.' },
      { id:'c3', type:R.WITHIN_N,       entities:['data-node','sentinel'], distance:1, text:'Data Node must be within 1 step of Sentinel.' },
      { id:'c4', type:R.SAME_DIAGONAL,  entities:['router','proxy'],      text:'Router and Proxy must lie on the same diagonal.' },
      { id:'c5', type:R.SOUTH_OF,       entities:['data-node','sentinel'], text:'Data Node must be south of Sentinel.' },
    ],
  },

  // ── #5  Intrusion Detection  ─────────────────────────────────────────────
  // Solution: VX=(4,0) FW=(4,1) DN=(0,3) ST=(0,4) RT=(2,2) PX=(3,4)
  // Sim: DN→ST in 1 tick. VX blocked east by FW, north path 7+ ticks to DN. ✓
  {
    id: 5, title: 'Intrusion Detection', difficulty: 'STANDARD',
    scenario: 'Anomalous traffic detected. The IDS needs every endpoint mapped to isolate the breach vector.',
    solution: { virus:{row:4,col:0}, firewall:{row:4,col:1}, 'data-node':{row:0,col:3}, sentinel:{row:0,col:4}, router:{row:2,col:2}, proxy:{row:3,col:4} },
    constraints: [
      { id:'c1', type:R.IN_CORNER,   entities:['virus'],               text:'Virus must occupy a corner cell.' },
      { id:'c2', type:R.ADJACENT,    entities:['firewall','virus'],    text:'Firewall must be adjacent to Virus.' },
      { id:'c3', type:R.IN_CORNER,   entities:['sentinel'],            text:'Sentinel must occupy a corner cell.' },
      { id:'c4', type:R.WITHIN_N,    entities:['data-node','sentinel'], distance:1, text:'Data Node must be within 1 step of Sentinel.' },
      { id:'c5', type:R.KNIGHT_MOVE, entities:['router','proxy'],      text:'Router and Proxy must be a knight\'s move apart.' },
    ],
  },

  // ── #6  System Override  ─────────────────────────────────────────────────
  // Solution: VX=(4,4) FW=(3,4) DN=(0,0) ST=(1,0) RT=(2,2) PX=(4,2)
  // Sim: DN→ST in 1 tick. VX blocked north by FW, PX blocks west path. ✓
  {
    id: 6, title: 'System Override', difficulty: 'ADVANCED',
    scenario: 'A privileged override is rewriting the security matrix. Place all agents before the final commit.',
    solution: { virus:{row:4,col:4}, firewall:{row:3,col:4}, 'data-node':{row:0,col:0}, sentinel:{row:1,col:0}, router:{row:2,col:2}, proxy:{row:4,col:2} },
    constraints: [
      { id:'c1', type:R.IN_CORNER,   entities:['virus'],               text:'Virus must occupy a corner cell.' },
      { id:'c2', type:R.ORTHOGONAL,  entities:['firewall','virus'],    text:'Firewall must be directly adjacent (no diagonal) to Virus.' },
      { id:'c3', type:R.ADJACENT,    entities:['data-node','sentinel'], text:'Data Node must be adjacent to Sentinel.' },
      { id:'c4', type:R.NOT_ON_EDGE, entities:['router'],              text:'Router must be in the inner zone (not on the grid border).' },
      { id:'c5', type:R.IN_QUADRANT, entities:['proxy'], quadrant:3,   text:'Proxy must be in the bottom-right quadrant.' },
    ],
  },

  // ── #7  Zero Day  ────────────────────────────────────────────────────────
  // Solution: VX=(4,0) FW=(3,0) DN=(0,4) ST=(0,3) RT=(1,2) PX=(3,2)
  // Sim: DN→ST in 1 tick. VX blocked north by FW, PX+RT block central path. ✓
  {
    id: 7, title: 'Zero Day', difficulty: 'ADVANCED',
    scenario: 'A critical zero-day exploit is active. One shot at the correct configuration — no margin for error.',
    solution: { virus:{row:4,col:0}, firewall:{row:3,col:0}, 'data-node':{row:0,col:4}, sentinel:{row:0,col:3}, router:{row:1,col:2}, proxy:{row:3,col:2} },
    constraints: [
      { id:'c1', type:R.IN_CORNER,  entities:['virus'],               text:'Virus must occupy a corner cell.' },
      { id:'c2', type:R.ADJACENT,   entities:['firewall','virus'],    text:'Firewall must be adjacent to Virus.' },
      { id:'c3', type:R.WITHIN_N,   entities:['data-node','sentinel'], distance:1, text:'Data Node must be within 1 step of Sentinel.' },
      { id:'c4', type:R.MIRROR_H,   entities:['router','proxy'],      text:'Router and Proxy must mirror each other vertically (same column, rows sum to 4).' },
      { id:'c5', type:R.EAST_OF,    entities:['data-node','sentinel'], text:'Data Node must be east of Sentinel.' },
    ],
  },

  // ── #8  Kernel Panic  ────────────────────────────────────────────────────
  // Solution: RT=(2,2) VX=(4,2) FW=(3,2) DN=(0,2) ST=(1,2) PX=(2,4)
  // ALL_WITHIN_N: all 5 others within 2 of RT=(2,2). VX blocked by FW, detoured 6+ ticks. ✓
  {
    id: 8, title: 'Kernel Panic', difficulty: 'ADVANCED',
    scenario: 'The kernel has panicked and entropy is spreading. Contain it before the system is unrecoverable.',
    solution: { router:{row:2,col:2}, virus:{row:4,col:2}, firewall:{row:3,col:2}, 'data-node':{row:0,col:2}, sentinel:{row:1,col:2}, proxy:{row:2,col:4} },
    constraints: [
      { id:'c1', type:R.ALL_WITHIN_N,  entities:['router'], distance:2,    text:'All entities must be within 2 steps of Router (hub range).' },
      { id:'c2', type:R.SAME_COLUMN,   entities:['firewall','virus'],       text:'Firewall and Virus must share a column.' },
      { id:'c3', type:R.ADJACENT,      entities:['data-node','sentinel'],   text:'Data Node must be adjacent to Sentinel.' },
      { id:'c4', type:R.EAST_OF,       entities:['proxy','router'],         text:'Proxy must be east of Router.' },
      { id:'c5', type:R.NOT_ON_EDGE,   entities:['router'],                 text:'Router must be in the inner zone (not on the grid border).' },
    ],
  },

  // ── #9  Signal Mirror  ───────────────────────────────────────────────────
  // Solution: VX=(4,4) FW=(4,3) DN=(0,1) ST=(0,2) RT=(2,1) PX=(1,0)
  // Sim: DN→ST in 1 tick. VX blocked west by FW, ST blocks (0,2) path — 9+ ticks to DN. ✓
  {
    id: 9, title: 'Signal Mirror', difficulty: 'STANDARD',
    scenario: 'Two conflicting signals are creating reflective interference. Separate them or the mesh collapses.',
    solution: { virus:{row:4,col:4}, firewall:{row:4,col:3}, 'data-node':{row:0,col:1}, sentinel:{row:0,col:2}, router:{row:2,col:1}, proxy:{row:1,col:0} },
    constraints: [
      { id:'c1', type:R.IN_CORNER,  entities:['virus'],               text:'Virus must occupy a corner cell.' },
      { id:'c2', type:R.ORTHOGONAL, entities:['firewall','virus'],    text:'Firewall must be directly adjacent (no diagonal) to Virus.' },
      { id:'c3', type:R.WITHIN_N,   entities:['data-node','sentinel'], distance:1, text:'Data Node must be within 1 step of Sentinel.' },
      { id:'c4', type:R.SIGHTLINE,  entities:['router','data-node'],  text:'Router must have line-of-sight to Data Node (same row or col, not adjacent).' },
      { id:'c5', type:R.WEST_OF,    entities:['proxy','router'],      text:'Proxy must be west of Router.' },
    ],
  },

  // ── #10  Network Hub  ────────────────────────────────────────────────────
  // Solution: RT=(2,2) VX=(2,4) FW=(2,3) DN=(2,0) ST=(1,1) PX=(4,2)
  // ALL_WITHIN_N: all within 2 of RT. VX blocked west by FW, 7+ ticks to DN. ✓
  {
    id: 10, title: 'Network Hub', difficulty: 'ADVANCED',
    scenario: 'The Router is the central node. Every service must stay within signal range or the mesh fragments.',
    solution: { router:{row:2,col:2}, virus:{row:2,col:4}, firewall:{row:2,col:3}, 'data-node':{row:2,col:0}, sentinel:{row:1,col:1}, proxy:{row:4,col:2} },
    constraints: [
      { id:'c1', type:R.ALL_WITHIN_N, entities:['router'], distance:2,  text:'All entities must be within 2 steps of Router (hub range).' },
      { id:'c2', type:R.SIGHTLINE,    entities:['data-node','virus'],   text:'Data Node must have line-of-sight to Virus (same row or col, not adjacent).' },
      { id:'c3', type:R.ADJACENT,     entities:['firewall','virus'],    text:'Firewall must be adjacent to Virus.' },
      { id:'c4', type:R.IN_QUADRANT,  entities:['sentinel'], quadrant:0, text:'Sentinel must be in the top-left quadrant.' },
      { id:'c5', type:R.IN_QUADRANT,  entities:['proxy'],    quadrant:3, text:'Proxy must be in the bottom-right quadrant.' },
    ],
  },
]
