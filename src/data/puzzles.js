import { R } from '../engine/logicEngine'

/**
 * Puzzle pool – rotates daily.
 * Each puzzle has a verified solution for the "reveal solution" feature.
 * Solutions use 0-indexed (row, col) where row 0 = top, col 0 = leftmost.
 */
export const PUZZLES = [
  // ── #1 ────────────────────────────────────────────────────────────────────
  // Solution: DN=(3,1) RT=(2,1) FW=(2,2) VX=(1,0)
  {
    id: 1,
    title: 'Boot Sequence',
    scenario: 'A fresh system is coming online. Route each process to its correct node before the watchdog timer expires.',
    difficulty: 'BASIC',
    solution: { 'data-node': { row: 3, col: 1 }, router: { row: 2, col: 1 }, firewall: { row: 2, col: 2 }, virus: { row: 1, col: 0 } },
    constraints: [
      { id: 'c1', type: R.SAME_COLUMN, entities: ['data-node', 'router'], text: 'Data Node must share a column with Router.' },
      { id: 'c2', type: R.ADJACENT, entities: ['firewall', 'router'], text: 'Firewall must be adjacent to Router.' },
      { id: 'c3', type: R.NOT_IN_ROW, entities: ['virus'], row: 0, text: 'Virus must NOT occupy Row 1.' },
      { id: 'c4', type: R.IN_ROW, entities: ['data-node'], row: 3, text: 'Data Node must be placed in Row 4.' },
    ],
  },

  // ── #2 ────────────────────────────────────────────────────────────────────
  // Solution: DN=(2,0) RT=(2,1) FW=(3,2) VX=(0,3)
  {
    id: 2,
    title: 'Access Protocol',
    scenario: 'An unauthorized signal is probing the perimeter. Lock it out before it finds an open port.',
    difficulty: 'STANDARD',
    solution: { 'data-node': { row: 2, col: 0 }, router: { row: 2, col: 1 }, firewall: { row: 3, col: 2 }, virus: { row: 0, col: 3 } },
    constraints: [
      { id: 'c1', type: R.ORTHOGONAL, entities: ['router', 'data-node'], text: 'Router must be directly adjacent (no diagonal) to Data Node.' },
      { id: 'c2', type: R.NOT_ADJACENT, entities: ['virus', 'firewall'], text: 'Virus must NOT be adjacent to Firewall in any direction.' },
      { id: 'c3', type: R.NOT_IN_COLUMN, entities: ['data-node'], col: 3, text: 'Data Node must NOT be in Column D.' },
      {
        id: 'c4', type: R.CONDITIONAL, entities: ['firewall', 'router'],
        text: 'IF Firewall is in Column A, THEN Router must be in Row 4.',
        condition:   { type: R.IN_COLUMN, entities: ['firewall'], col: 0 },
        consequence: { type: R.IN_ROW,    entities: ['router'],   row: 3 },
      },
    ],
  },

  // ── #3 ────────────────────────────────────────────────────────────────────
  // Solution: DN=(0,2) RT=(2,1) FW=(1,0) VX=(1,3)
  {
    id: 3,
    title: 'Packet Storm',
    scenario: 'Traffic is spiking across all sectors. Assign each service to its designated cluster.',
    difficulty: 'BASIC',
    solution: { 'data-node': { row: 0, col: 2 }, router: { row: 2, col: 1 }, firewall: { row: 1, col: 0 }, virus: { row: 1, col: 3 } },
    constraints: [
      { id: 'c1', type: R.SAME_ROW, entities: ['virus', 'firewall'], text: 'Virus must be in the same row as Firewall.' },
      { id: 'c2', type: R.IN_COLUMN, entities: ['router'], col: 1, text: 'Router must be in Column B.' },
      { id: 'c3', type: R.IN_ROW, entities: ['data-node'], row: 0, text: 'Data Node must be in Row 1.' },
      { id: 'c4', type: R.NOT_IN_COLUMN, entities: ['firewall'], col: 3, text: 'Firewall must NOT be in Column D.' },
    ],
  },

  // ── #4 ────────────────────────────────────────────────────────────────────
  // Solution: DN=(0,2) RT=(2,3) FW=(3,2) VX=(1,3)
  {
    id: 4,
    title: 'Firewall Config',
    scenario: 'The mesh topology is misconfigured. Realign all nodes before the next health check.',
    difficulty: 'STANDARD',
    solution: { 'data-node': { row: 0, col: 2 }, router: { row: 2, col: 3 }, firewall: { row: 3, col: 2 }, virus: { row: 1, col: 3 } },
    constraints: [
      { id: 'c1', type: R.SAME_COLUMN, entities: ['data-node', 'firewall'], text: 'Data Node and Firewall must share a column.' },
      { id: 'c2', type: R.ADJACENT, entities: ['router', 'virus'], text: 'Router must be adjacent to Virus.' },
      { id: 'c3', type: R.NOT_IN_COLUMN, entities: ['virus'], col: 0, text: 'Virus must NOT be in Column A.' },
      {
        id: 'c4', type: R.CONDITIONAL, entities: ['data-node', 'firewall'],
        text: 'IF Data Node is in Row 4, THEN Firewall must be in Row 1.',
        condition:   { type: R.IN_ROW, entities: ['data-node'], row: 3 },
        consequence: { type: R.IN_ROW, entities: ['firewall'],  row: 0 },
      },
    ],
  },

  // ── #5 ────────────────────────────────────────────────────────────────────
  // Solution: DN=(1,0) RT=(1,3) FW=(3,2) VX=(0,3)
  {
    id: 5,
    title: 'Intrusion Detection',
    scenario: 'Anomalous traffic detected. The IDS needs every endpoint correctly mapped to isolate the threat vector.',
    difficulty: 'STANDARD',
    solution: { 'data-node': { row: 1, col: 0 }, router: { row: 1, col: 3 }, firewall: { row: 3, col: 2 }, virus: { row: 0, col: 3 } },
    constraints: [
      { id: 'c1', type: R.SAME_ROW,  entities: ['router', 'data-node'],    text: 'Router must be in the same row as Data Node.' },
      { id: 'c2', type: R.ORTHOGONAL, entities: ['virus', 'router'],       text: 'Virus must be directly adjacent (no diagonal) to Router.' },
      { id: 'c3', type: R.NOT_ADJACENT, entities: ['firewall', 'data-node'], text: 'Firewall must NOT be adjacent to Data Node.' },
      { id: 'c4', type: R.IN_COLUMN, entities: ['router'], col: 3,         text: 'Router must be in Column D.' },
    ],
  },

  // ── #6 ────────────────────────────────────────────────────────────────────
  // Solution: DN=(1,1) FW=(1,3) RT=(2,2) VX=(0,0)
  {
    id: 6,
    title: 'System Override',
    scenario: 'An override command is rewriting the security matrix. Place the agents correctly before the final write.',
    difficulty: 'ADVANCED',
    solution: { 'data-node': { row: 1, col: 1 }, firewall: { row: 1, col: 3 }, router: { row: 2, col: 2 }, virus: { row: 0, col: 0 } },
    constraints: [
      { id: 'c1', type: R.SAME_ROW,     entities: ['data-node', 'firewall'], text: 'Data Node and Firewall must be in the same row.' },
      { id: 'c2', type: R.NOT_ADJACENT, entities: ['router', 'virus'],       text: 'Router must NOT be adjacent to Virus.' },
      { id: 'c3', type: R.IN_COLUMN,    entities: ['virus'], col: 0,         text: 'Virus must be in Column A.' },
      {
        id: 'c4', type: R.CONDITIONAL, entities: ['router', 'data-node'],
        text: 'IF Router is in Row 4, THEN Data Node must be in Column B.',
        condition:   { type: R.IN_ROW,    entities: ['router'],    row: 3 },
        consequence: { type: R.IN_COLUMN, entities: ['data-node'], col: 1 },
      },
    ],
  },

  // ── #7 ────────────────────────────────────────────────────────────────────
  // Solution: DN=(0,3) FW=(3,2) RT=(3,3) VX=(2,1)
  {
    id: 7,
    title: 'Zero Day',
    scenario: 'A critical zero-day exploit is active. You have one shot at the correct configuration — no margin for error.',
    difficulty: 'ADVANCED',
    solution: { 'data-node': { row: 0, col: 3 }, firewall: { row: 3, col: 2 }, router: { row: 3, col: 3 }, virus: { row: 2, col: 1 } },
    constraints: [
      { id: 'c1', type: R.ORTHOGONAL,       entities: ['router', 'firewall'],     text: 'Router must be directly adjacent (no diagonal) to Firewall.' },
      { id: 'c2', type: R.DIFFERENT_COLUMN, entities: ['data-node', 'virus'],     text: 'Data Node and Virus must NOT share a column.' },
      { id: 'c3', type: R.DIFFERENT_ROW,    entities: ['data-node', 'router'],    text: 'Data Node and Router must NOT share a row.' },
      {
        id: 'c4', type: R.CONDITIONAL, entities: ['virus', 'firewall'],
        text: 'IF Virus is in Row 1, THEN Firewall must be in Column D.',
        condition:   { type: R.IN_ROW,    entities: ['virus'],    row: 0 },
        consequence: { type: R.IN_COLUMN, entities: ['firewall'], col: 3 },
      },
    ],
  },
]
