import { R } from '../engine/logicEngine'

/**
 * Puzzle pool – rotates daily. 5×5 grid, 5 entities (DN FW RT VX PX).
 * Row/col values are 0-indexed (row 0 = top, col 0 = left).
 * Solutions verified against all constraints.
 */
export const PUZZLES = [
  // ── #1  Boot Sequence  ────────────────────────────────────────────────────
  // Solution: VX=(0,4) FW=(2,0) PX=(4,0) DN=(4,2) RT=(3,3)
  {
    id: 1, title: 'Boot Sequence', difficulty: 'BASIC',
    scenario: 'A fresh cluster is initialising. Route each process to its assigned node before the watchdog fires.',
    solution: { virus:{row:0,col:4}, firewall:{row:2,col:0}, proxy:{row:4,col:0}, 'data-node':{row:4,col:2}, router:{row:3,col:3} },
    constraints: [
      { id:'c1', type:R.IN_CORNER,    entities:['virus'],                 text:'Virus must occupy a corner cell.' },
      { id:'c2', type:R.IN_COLUMN,    entities:['firewall'], col:0,       text:'Firewall must be in Column A.' },
      { id:'c3', type:R.SAME_COLUMN,  entities:['proxy','firewall'],      text:'Proxy must share a column with Firewall.' },
      { id:'c4', type:R.IN_ROW,       entities:['data-node'], row:4,      text:'Data Node must be in Row 5.' },
    ],
  },

  // ── #2  Packet Storm  ─────────────────────────────────────────────────────
  // Solution: DN=(0,2) PX=(0,0) RT=(2,1) FW=(1,4) VX=(3,2)
  {
    id: 2, title: 'Packet Storm', difficulty: 'BASIC',
    scenario: 'Traffic is spiking across all sectors. Every service must reach its designated cluster.',
    solution: { 'data-node':{row:0,col:2}, proxy:{row:0,col:0}, router:{row:2,col:1}, firewall:{row:1,col:4}, virus:{row:3,col:2} },
    constraints: [
      { id:'c1', type:R.SAME_ROW,     entities:['proxy','data-node'],     text:'Proxy must be in the same row as Data Node.' },
      { id:'c2', type:R.NOT_ADJACENT, entities:['firewall','proxy'],      text:'Firewall must NOT be adjacent to Proxy.' },
      { id:'c3', type:R.IN_COLUMN,    entities:['router'], col:1,         text:'Router must be in Column B.' },
      { id:'c4', type:R.ON_EDGE,      entities:['firewall'],              text:'Firewall must be on the grid border.' },
    ],
  },

  // ── #3  Access Protocol  ──────────────────────────────────────────────────
  // Solution: RT=(0,2) VX=(3,3) FW=(1,1) PX=(2,3) DN=(2,0)
  {
    id: 3, title: 'Access Protocol', difficulty: 'STANDARD',
    scenario: 'An unauthorised signal is probing the perimeter. Lock it out before it finds an open port.',
    solution: { router:{row:0,col:2}, virus:{row:3,col:3}, firewall:{row:1,col:1}, proxy:{row:2,col:3}, 'data-node':{row:2,col:0} },
    constraints: [
      { id:'c1', type:R.NORTH_OF,     entities:['router','virus'],        text:'Router must be north of (above) Virus.' },
      { id:'c2', type:R.KNIGHT_MOVE,  entities:['firewall','proxy'],      text:'Firewall and Proxy must be a knight\'s move apart.' },
      { id:'c3', type:R.NOT_IN_CORNER,entities:['data-node'],             text:'Data Node must NOT be in a corner cell.' },
      { id:'c4', type:R.IN_COLUMN,    entities:['virus'], col:3,          text:'Virus must be in Column D.' },
    ],
  },

  // ── #4  Firewall Config  ──────────────────────────────────────────────────
  // Solution: DN=(4,0) RT=(4,3) FW=(1,1) PX=(3,2) VX=(0,2)
  {
    id: 4, title: 'Firewall Config', difficulty: 'STANDARD',
    scenario: 'The mesh topology is misconfigured. Realign all nodes before the next health-check cycle.',
    solution: { 'data-node':{row:4,col:0}, router:{row:4,col:3}, firewall:{row:1,col:1}, proxy:{row:3,col:2}, virus:{row:0,col:2} },
    constraints: [
      { id:'c1', type:R.SIGHTLINE,    entities:['data-node','router'],    text:'Data Node must have line-of-sight to Router (same row or col, not adjacent).' },
      { id:'c2', type:R.CHECKERBOARD, entities:['firewall','virus'],      text:'Firewall and Virus must be on the same checkerboard colour.' },
      { id:'c3', type:R.NOT_ON_EDGE,  entities:['proxy'],                 text:'Proxy must be in the inner zone (not on the grid border).' },
      { id:'c4', type:R.NORTH_OF,     entities:['firewall','proxy'],      text:'Firewall must be north of (above) Proxy.' },
    ],
  },

  // ── #5  Intrusion Detection  ──────────────────────────────────────────────
  // Solution: PX=(2,1) RT=(2,3) FW=(1,2) DN=(1,4) VX=(4,4)
  {
    id: 5, title: 'Intrusion Detection', difficulty: 'STANDARD',
    scenario: 'Anomalous traffic detected. The IDS needs every endpoint correctly mapped to isolate the vector.',
    solution: { proxy:{row:2,col:1}, router:{row:2,col:3}, firewall:{row:1,col:2}, 'data-node':{row:1,col:4}, virus:{row:4,col:4} },
    constraints: [
      { id:'c1', type:R.MIRROR_V,     entities:['proxy','router'],        text:'Proxy and Router must mirror each other horizontally across the grid.' },
      { id:'c2', type:R.WITHIN_N,     entities:['data-node','firewall'], distance:2, text:'Data Node must be within 2 steps of Firewall (Manhattan).' },
      { id:'c3', type:R.EAST_OF,      entities:['virus','firewall'],      text:'Virus must be east of (right of) Firewall.' },
      { id:'c4', type:R.NOT_IN_CORNER,entities:['data-node'],             text:'Data Node must NOT be in a corner cell.' },
    ],
  },

  // ── #6  System Override  ──────────────────────────────────────────────────
  // Solution: DN=(0,0) FW=(2,2) PX=(4,2) VX=(3,3) RT=(0,4)
  {
    id: 6, title: 'System Override', difficulty: 'ADVANCED',
    scenario: 'A privileged override is rewriting the security matrix. Place agents precisely before the final write commits.',
    solution: { 'data-node':{row:0,col:0}, firewall:{row:2,col:2}, proxy:{row:4,col:2}, virus:{row:3,col:3}, router:{row:0,col:4} },
    constraints: [
      { id:'c1', type:R.ENCLOSURE,    entities:['firewall','data-node','proxy'], text:'Firewall must lie within the zone bounded by Data Node and Proxy.' },
      { id:'c2', type:R.ISOLATED,     entities:['router'],                text:'Router must have no adjacent entities (all 8 directions).' },
      { id:'c3', type:R.IN_QUADRANT,  entities:['virus'], quadrant:3,     text:'Virus must be in the bottom-right quadrant.' },
      { id:'c4', type:R.CONDITIONAL,  entities:['data-node','firewall'],
        text:'IF Data Node is on the grid border, THEN Firewall must be in Column C.',
        condition:   { type:R.ON_EDGE,    entities:['data-node']          },
        consequence: { type:R.IN_COLUMN,  entities:['firewall'], col:2    },
      },
    ],
  },

  // ── #7  Zero Day  ─────────────────────────────────────────────────────────
  // Solution: RT=(1,3) PX=(3,3) DN=(0,0) FW=(2,2) VX=(1,1)
  {
    id: 7, title: 'Zero Day', difficulty: 'ADVANCED',
    scenario: 'A critical zero-day exploit is active. One shot at the correct configuration — no margin for error.',
    solution: { router:{row:1,col:3}, proxy:{row:3,col:3}, 'data-node':{row:0,col:0}, firewall:{row:2,col:2}, virus:{row:1,col:1} },
    constraints: [
      { id:'c1', type:R.MIRROR_H,     entities:['router','proxy'],        text:'Router and Proxy must mirror each other vertically across the grid.' },
      { id:'c2', type:R.ENCLOSURE,    entities:['virus','firewall','data-node'], text:'Virus must lie within the zone bounded by Firewall and Data Node.' },
      { id:'c3', type:R.EAST_OF,      entities:['firewall','data-node'],  text:'Firewall must be east of (right of) Data Node.' },
      { id:'c4', type:R.NOT_IN_CORNER,entities:['router'],                text:'Router must NOT be in a corner cell.' },
    ],
  },

  // ── #8  Kernel Panic  ─────────────────────────────────────────────────────
  // Solution: DN=(4,4) VX=(2,3) RT=(1,1) FW=(0,2) PX=(4,3)
  {
    id: 8, title: 'Kernel Panic', difficulty: 'ADVANCED',
    scenario: 'The kernel has panicked and entropy is spreading. Contain it before the system is unrecoverable.',
    solution: { 'data-node':{row:4,col:4}, virus:{row:2,col:3}, router:{row:1,col:1}, firewall:{row:0,col:2}, proxy:{row:4,col:3} },
    constraints: [
      { id:'c1', type:R.KNIGHT_MOVE,  entities:['data-node','virus'],     text:'Data Node and Virus must be a knight\'s move apart.' },
      { id:'c2', type:R.CHECKERBOARD, entities:['router','firewall'],     text:'Router and Firewall must be on the same checkerboard colour.' },
      { id:'c3', type:R.FARTHER_N,    entities:['data-node','router'],   distance:3, text:'Data Node must be more than 3 steps from Router (Manhattan).' },
      { id:'c4', type:R.SOUTH_OF,     entities:['proxy','router'],        text:'Proxy must be south of (below) Router.' },
    ],
  },

  // ── #10  Network Hub  ─────────────────────────────────────────────────────
  // Solution: RT=(2,2) DN=(0,2) FW=(2,0) VX=(1,3) PX=(3,1)
  // All entities within distance 2 of the Router hub
  {
    id: 10, title: 'Network Hub', difficulty: 'ADVANCED',
    scenario: 'The Router is the central node. Every service must stay within signal range or the mesh fragments.',
    solution: { router:{row:2,col:2}, 'data-node':{row:0,col:2}, firewall:{row:2,col:0}, virus:{row:1,col:3}, proxy:{row:3,col:1} },
    constraints: [
      { id:'c1', type:R.ALL_WITHIN_N, entities:['router'], distance:2, text:'All entities must be within 2 steps of Router (Manhattan hub range).' },
      { id:'c2', type:R.NOT_ON_EDGE,  entities:['router'],             text:'Router must be in the inner zone (not on the grid border).' },
      { id:'c3', type:R.SIGHTLINE,    entities:['data-node','router'], text:'Data Node must have line-of-sight to Router (same row or col, not adjacent).' },
      { id:'c4', type:R.DIFFERENT_COLUMN, entities:['firewall','virus'], text:'Firewall and Virus must NOT share a column.' },
    ],
  },

  // ── #9  Signal Mirror  ────────────────────────────────────────────────────
  // Solution: DN=(0,2) PX=(3,1) RT=(2,3) VX=(4,4) FW=(1,0)
  {
    id: 9, title: 'Signal Mirror', difficulty: 'STANDARD',
    scenario: 'Two conflicting signals are creating reflective interference. Separate them or the mesh collapses.',
    solution: { 'data-node':{row:0,col:2}, proxy:{row:3,col:1}, router:{row:2,col:3}, virus:{row:4,col:4}, firewall:{row:1,col:0} },
    constraints: [
      { id:'c1', type:R.DIFFERENT_COLUMN, entities:['data-node','virus'], text:'Data Node and Virus must NOT share a column.' },
      { id:'c2', type:R.WITHIN_N,     entities:['router','data-node'],   distance:3, text:'Router must be within 3 steps of Data Node (Manhattan).' },
      { id:'c3', type:R.FARTHER_N,    entities:['firewall','virus'],     distance:2, text:'Firewall must be more than 2 steps from Virus (Manhattan).' },
      { id:'c4', type:R.CONDITIONAL,  entities:['data-node','proxy'],
        text:'IF Data Node is on the grid border, THEN Proxy must be in Column B.',
        condition:   { type:R.ON_EDGE,    entities:['data-node']          },
        consequence: { type:R.IN_COLUMN,  entities:['proxy'], col:1       },
      },
    ],
  },
]
