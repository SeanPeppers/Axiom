/**
 * Axiom Logic Engine
 *
 * All rules are declarative objects. `checkLogic(rule, placements)` is the
 * single evaluation entry-point. Conditional rules use material implication:
 *   P → Q  ≡  ¬P ∨ Q  (false antecedent = vacuous truth)
 *
 * Three-entity rules (BETWEEN, ENCLOSURE) use entities[0] as the subject
 * and entities[1], entities[2] as the reference pair.
 */

import { GRID_ROWS, GRID_COLS } from '../config'

export const R = {
  // ── positional (single entity) ─────────────────────────────────────────
  IN_ROW:            'IN_ROW',
  IN_COLUMN:         'IN_COLUMN',
  NOT_IN_ROW:        'NOT_IN_ROW',
  NOT_IN_COLUMN:     'NOT_IN_COLUMN',
  IN_CORNER:         'IN_CORNER',
  NOT_IN_CORNER:     'NOT_IN_CORNER',
  ON_EDGE:           'ON_EDGE',
  NOT_ON_EDGE:       'NOT_ON_EDGE',
  IN_QUADRANT:       'IN_QUADRANT',   // rule.quadrant: 0=TL 1=TR 2=BL 3=BR
  ISOLATED:          'ISOLATED',      // no other entity is 8-directionally adjacent
  ALL_WITHIN_N:      'ALL_WITHIN_N',  // all other entities within rule.distance of rule.entities[0]

  // ── relational (two entities) ──────────────────────────────────────────
  SAME_ROW:          'SAME_ROW',
  SAME_COLUMN:       'SAME_COLUMN',
  DIFFERENT_ROW:     'DIFFERENT_ROW',
  DIFFERENT_COLUMN:  'DIFFERENT_COLUMN',
  ADJACENT:          'ADJACENT',          // 8-directional (includes diagonal)
  ORTHOGONAL:        'ORTHOGONAL',        // 4-directional only
  NOT_ADJACENT:      'NOT_ADJACENT',
  SAME_DIAGONAL:     'SAME_DIAGONAL',     // |Δrow| === |Δcol|
  NOT_SAME_DIAGONAL: 'NOT_SAME_DIAGONAL',
  WITHIN_N:          'WITHIN_N',          // Manhattan distance ≤ rule.distance
  FARTHER_N:         'FARTHER_N',         // Manhattan distance > rule.distance
  KNIGHT_MOVE:       'KNIGHT_MOVE',       // (|Δr|=2&&|Δc|=1)||(|Δr|=1&&|Δc|=2)
  NOT_KNIGHT_MOVE:   'NOT_KNIGHT_MOVE',
  SIGHTLINE:         'SIGHTLINE',         // same row or col, not orthogonally adjacent
  CHECKERBOARD:      'CHECKERBOARD',      // (a.row+a.col)%2 === (b.row+b.col)%2
  NORTH_OF:          'NORTH_OF',          // A.row < B.row
  SOUTH_OF:          'SOUTH_OF',          // A.row > B.row
  EAST_OF:           'EAST_OF',           // A.col > B.col
  WEST_OF:           'WEST_OF',           // A.col < B.col
  MIRROR_H:          'MIRROR_H',          // same col, rows sum to GRID_ROWS-1
  MIRROR_V:          'MIRROR_V',          // same row, cols sum to GRID_COLS-1

  // ── three-entity ───────────────────────────────────────────────────────
  BETWEEN:           'BETWEEN',    // A on same row/col as B&C, strictly between them
  ENCLOSURE:         'ENCLOSURE',  // A within 2D bounding box of B and C

  // ── logical ────────────────────────────────────────────────────────────
  CONDITIONAL:       'CONDITIONAL', // { condition: rule, consequence: rule }
}

export const RULE_LABELS = {
  [R.IN_ROW]:            'IN ROW',
  [R.IN_COLUMN]:         'IN COL',
  [R.NOT_IN_ROW]:        'NOT ROW',
  [R.NOT_IN_COLUMN]:     'NOT COL',
  [R.IN_CORNER]:         'CORNER',
  [R.NOT_IN_CORNER]:     'NOT CORNER',
  [R.ON_EDGE]:           'BORDER',
  [R.NOT_ON_EDGE]:       'INNER',
  [R.IN_QUADRANT]:       'QUADRANT',
  [R.ISOLATED]:          'ISOLATED',
  [R.ALL_WITHIN_N]:      'HUB RANGE',
  [R.SAME_ROW]:          'SAME ROW',
  [R.SAME_COLUMN]:       'SAME COL',
  [R.DIFFERENT_ROW]:     'DIFF ROW',
  [R.DIFFERENT_COLUMN]:  'DIFF COL',
  [R.ADJACENT]:          'ADJACENT',
  [R.ORTHOGONAL]:        'NEIGHBOR',
  [R.NOT_ADJACENT]:      'NOT ADJ',
  [R.SAME_DIAGONAL]:     'DIAGONAL',
  [R.NOT_SAME_DIAGONAL]: 'NOT DIAG',
  [R.WITHIN_N]:          'WITHIN',
  [R.FARTHER_N]:         'DISTANT',
  [R.KNIGHT_MOVE]:       'KNIGHT',
  [R.NOT_KNIGHT_MOVE]:   'NOT KNIGHT',
  [R.SIGHTLINE]:         'SIGHTLINE',
  [R.CHECKERBOARD]:      'CHECKERED',
  [R.NORTH_OF]:          'NORTH',
  [R.SOUTH_OF]:          'SOUTH',
  [R.EAST_OF]:           'EAST',
  [R.WEST_OF]:           'WEST',
  [R.MIRROR_H]:          'MIRROR H',
  [R.MIRROR_V]:          'MIRROR V',
  [R.BETWEEN]:           'BETWEEN',
  [R.ENCLOSURE]:         'ENCLOSE',
  [R.CONDITIONAL]:       'IF → THEN',
}

const QUADRANT_NAMES = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
export { QUADRANT_NAMES }

// ── geometry helpers ──────────────────────────────────────────────────────────

const adj8      = (a, b) => Math.abs(a.row-b.row) <= 1 && Math.abs(a.col-b.col) <= 1 && !(a.row===b.row && a.col===b.col)
const adj4      = (a, b) => (Math.abs(a.row-b.row)===1 && a.col===b.col) || (a.row===b.row && Math.abs(a.col-b.col)===1)
const manhattan = (a, b) => Math.abs(a.row-b.row) + Math.abs(a.col-b.col)
const knight    = (a, b) => (Math.abs(a.row-b.row)===2 && Math.abs(a.col-b.col)===1) || (Math.abs(a.row-b.row)===1 && Math.abs(a.col-b.col)===2)
const isCorner  = (p)    => (p.row===0||p.row===GRID_ROWS-1) && (p.col===0||p.col===GRID_COLS-1)
const isEdge    = (p)    => p.row===0 || p.row===GRID_ROWS-1 || p.col===0 || p.col===GRID_COLS-1
const isInner   = (p)    => p.row>=1 && p.row<=GRID_ROWS-2 && p.col>=1 && p.col<=GRID_COLS-2
const quadrant  = (p)    => (p.row < Math.floor(GRID_ROWS/2) ? 0 : 2) + (p.col < Math.floor(GRID_COLS/2) ? 0 : 1)

// ── atomic evaluator ─────────────────────────────────────────────────────────

function evalAtomic(rule, p) {
  const get = (id) => p[id] ?? null

  switch (rule.type) {
    // ── positional ──────────────────────────────────────────────────────────
    case R.IN_ROW:           { const pos=get(rule.entities[0]); if(!pos) return 'pending'; return pos.row===rule.row ? 'satisfied' : 'violated' }
    case R.IN_COLUMN:        { const pos=get(rule.entities[0]); if(!pos) return 'pending'; return pos.col===rule.col ? 'satisfied' : 'violated' }
    case R.NOT_IN_ROW:       { const pos=get(rule.entities[0]); if(!pos) return 'pending'; return pos.row!==rule.row ? 'satisfied' : 'violated' }
    case R.NOT_IN_COLUMN:    { const pos=get(rule.entities[0]); if(!pos) return 'pending'; return pos.col!==rule.col ? 'satisfied' : 'violated' }
    case R.IN_CORNER:        { const pos=get(rule.entities[0]); if(!pos) return 'pending'; return isCorner(pos)  ? 'satisfied' : 'violated' }
    case R.NOT_IN_CORNER:    { const pos=get(rule.entities[0]); if(!pos) return 'pending'; return !isCorner(pos) ? 'satisfied' : 'violated' }
    case R.ON_EDGE:          { const pos=get(rule.entities[0]); if(!pos) return 'pending'; return isEdge(pos)    ? 'satisfied' : 'violated' }
    case R.NOT_ON_EDGE:      { const pos=get(rule.entities[0]); if(!pos) return 'pending'; return isInner(pos)   ? 'satisfied' : 'violated' }
    case R.IN_QUADRANT: {
      const pos=get(rule.entities[0]); if(!pos) return 'pending'
      return quadrant(pos)===rule.quadrant ? 'satisfied' : 'violated'
    }
    case R.ISOLATED: {
      const a=get(rule.entities[0]); if(!a) return 'pending'
      const others = Object.entries(p).filter(([id]) => id !== rule.entities[0])
      if (others.some(([,pos]) => !pos)) return 'pending'
      return others.some(([,pos]) => adj8(a, pos)) ? 'violated' : 'satisfied'
    }
    case R.ALL_WITHIN_N: {
      // All other entities must be within rule.distance (Manhattan) of the hub entity
      const hub=get(rule.entities[0]); if(!hub) return 'pending'
      const others = Object.entries(p).filter(([id]) => id !== rule.entities[0])
      if (others.some(([,pos]) => !pos)) return 'pending'
      return others.every(([,pos]) => manhattan(hub, pos) <= rule.distance) ? 'satisfied' : 'violated'
    }

    // ── relational (two entities) ───────────────────────────────────────────
    case R.SAME_ROW:         { const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'; return a.row===b.row ? 'satisfied' : 'violated' }
    case R.SAME_COLUMN:      { const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'; return a.col===b.col ? 'satisfied' : 'violated' }
    case R.DIFFERENT_ROW:    { const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'; return a.row!==b.row ? 'satisfied' : 'violated' }
    case R.DIFFERENT_COLUMN: { const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'; return a.col!==b.col ? 'satisfied' : 'violated' }
    case R.ADJACENT:         { const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'; return adj8(a,b)    ? 'satisfied' : 'violated' }
    case R.ORTHOGONAL:       { const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'; return adj4(a,b)    ? 'satisfied' : 'violated' }
    case R.NOT_ADJACENT:     { const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'; return !adj8(a,b)   ? 'satisfied' : 'violated' }
    case R.SAME_DIAGONAL: {
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return Math.abs(a.row-b.row)===Math.abs(a.col-b.col) && a.row!==b.row ? 'satisfied' : 'violated'
    }
    case R.NOT_SAME_DIAGONAL: {
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return !(Math.abs(a.row-b.row)===Math.abs(a.col-b.col) && a.row!==b.row) ? 'satisfied' : 'violated'
    }
    case R.WITHIN_N: {
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return manhattan(a,b)<=rule.distance ? 'satisfied' : 'violated'
    }
    case R.FARTHER_N: {
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return manhattan(a,b)>rule.distance ? 'satisfied' : 'violated'
    }
    case R.KNIGHT_MOVE: {
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return knight(a,b) ? 'satisfied' : 'violated'
    }
    case R.NOT_KNIGHT_MOVE: {
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return !knight(a,b) ? 'satisfied' : 'violated'
    }
    case R.SIGHTLINE: {
      // Same row or col, with at least one cell gap (not orthogonally adjacent)
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      const sameRow = a.row===b.row && Math.abs(a.col-b.col)>=2
      const sameCol = a.col===b.col && Math.abs(a.row-b.row)>=2
      return (sameRow || sameCol) ? 'satisfied' : 'violated'
    }
    case R.CHECKERBOARD: {
      // Same cell color on a checkerboard pattern
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return (a.row+a.col)%2 === (b.row+b.col)%2 ? 'satisfied' : 'violated'
    }
    case R.NORTH_OF: {
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return a.row < b.row ? 'satisfied' : 'violated'
    }
    case R.SOUTH_OF: {
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return a.row > b.row ? 'satisfied' : 'violated'
    }
    case R.EAST_OF: {
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return a.col > b.col ? 'satisfied' : 'violated'
    }
    case R.WEST_OF: {
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return a.col < b.col ? 'satisfied' : 'violated'
    }
    case R.MIRROR_H: {
      // Same column, rows are reflections of each other (sum = GRID_ROWS-1)
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return (a.col===b.col && a.row+b.row===GRID_ROWS-1) ? 'satisfied' : 'violated'
    }
    case R.MIRROR_V: {
      // Same row, cols are reflections of each other (sum = GRID_COLS-1)
      const [a,b]=rule.entities.map(get); if(!a||!b) return 'pending'
      return (a.row===b.row && a.col+b.col===GRID_COLS-1) ? 'satisfied' : 'violated'
    }

    // ── three-entity ────────────────────────────────────────────────────────
    case R.BETWEEN: {
      // A is on the same row or col as both B and C, strictly between them
      const [a,b,c]=rule.entities.map(get); if(!a||!b||!c) return 'pending'
      const inRow = b.row===c.row && a.row===b.row &&
        a.col>Math.min(b.col,c.col) && a.col<Math.max(b.col,c.col)
      const inCol = b.col===c.col && a.col===b.col &&
        a.row>Math.min(b.row,c.row) && a.row<Math.max(b.row,c.row)
      return (inRow || inCol) ? 'satisfied' : 'violated'
    }
    case R.ENCLOSURE: {
      // A is within the 2D bounding box formed by B and C
      const [a,b,c]=rule.entities.map(get); if(!a||!b||!c) return 'pending'
      const minR=Math.min(b.row,c.row), maxR=Math.max(b.row,c.row)
      const minC=Math.min(b.col,c.col), maxC=Math.max(b.col,c.col)
      return (a.row>=minR && a.row<=maxR && a.col>=minC && a.col<=maxC) ? 'satisfied' : 'violated'
    }

    default: return 'pending'
  }
}

// ── public ────────────────────────────────────────────────────────────────────

export function checkLogic(rule, placements) {
  if (rule.type === R.CONDITIONAL) {
    const cond = evalAtomic(rule.condition, placements)
    if (cond === 'pending')  return 'pending'
    if (cond === 'violated') return 'satisfied'   // vacuous truth: ¬P ∨ Q
    return evalAtomic(rule.consequence, placements)
  }
  return evalAtomic(rule, placements)
}

export function evaluatePuzzle(puzzle, placements) {
  return puzzle.constraints.map((c) => ({ ...c, status: checkLogic(c, placements) }))
}
