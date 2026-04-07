/**
 * Axiom Logic Engine
 *
 * All rules are declarative objects. `checkLogic(rule, placements)` is the
 * single evaluation entry-point. Conditional rules use material implication:
 *   P → Q  ≡  ¬P ∨ Q  (false antecedent = vacuous truth)
 */

export const R = {
  SAME_COLUMN:      'SAME_COLUMN',
  SAME_ROW:         'SAME_ROW',
  DIFFERENT_ROW:    'DIFFERENT_ROW',
  DIFFERENT_COLUMN: 'DIFFERENT_COLUMN',
  ADJACENT:         'ADJACENT',        // 8-directional
  ORTHOGONAL:       'ORTHOGONAL',      // 4-directional (no diagonal)
  NOT_ADJACENT:     'NOT_ADJACENT',
  IN_ROW:           'IN_ROW',
  IN_COLUMN:        'IN_COLUMN',
  NOT_IN_ROW:       'NOT_IN_ROW',
  NOT_IN_COLUMN:    'NOT_IN_COLUMN',
  CONDITIONAL:      'CONDITIONAL',     // { condition: rule, consequence: rule }
}

export const RULE_LABELS = {
  [R.SAME_COLUMN]:      'SAME COL',
  [R.SAME_ROW]:         'SAME ROW',
  [R.DIFFERENT_ROW]:    'DIFF ROW',
  [R.DIFFERENT_COLUMN]: 'DIFF COL',
  [R.ADJACENT]:         'ADJACENT',
  [R.ORTHOGONAL]:       'NEIGHBOR',
  [R.NOT_ADJACENT]:     'NOT ADJ',
  [R.IN_ROW]:           'IN ROW',
  [R.IN_COLUMN]:        'IN COL',
  [R.NOT_IN_ROW]:       'NOT ROW',
  [R.NOT_IN_COLUMN]:    'NOT COL',
  [R.CONDITIONAL]:      'IF → THEN',
}

// ── geometry ─────────────────────────────────────────────────────────────────

const adj8 = (a, b) => Math.abs(a.row - b.row) <= 1 && Math.abs(a.col - b.col) <= 1 && !(a.row === b.row && a.col === b.col)
const adj4 = (a, b) => (Math.abs(a.row - b.row) === 1 && a.col === b.col) || (a.row === b.row && Math.abs(a.col - b.col) === 1)

// ── atomic evaluator ─────────────────────────────────────────────────────────

function evalAtomic(rule, p) {
  const get = (id) => p[id] ?? null
  switch (rule.type) {
    case R.SAME_COLUMN: {
      const [a, b] = rule.entities.map(get); if (!a || !b) return 'pending'
      return a.col === b.col ? 'satisfied' : 'violated'
    }
    case R.SAME_ROW: {
      const [a, b] = rule.entities.map(get); if (!a || !b) return 'pending'
      return a.row === b.row ? 'satisfied' : 'violated'
    }
    case R.DIFFERENT_ROW: {
      const [a, b] = rule.entities.map(get); if (!a || !b) return 'pending'
      return a.row !== b.row ? 'satisfied' : 'violated'
    }
    case R.DIFFERENT_COLUMN: {
      const [a, b] = rule.entities.map(get); if (!a || !b) return 'pending'
      return a.col !== b.col ? 'satisfied' : 'violated'
    }
    case R.ADJACENT: {
      const [a, b] = rule.entities.map(get); if (!a || !b) return 'pending'
      return adj8(a, b) ? 'satisfied' : 'violated'
    }
    case R.ORTHOGONAL: {
      const [a, b] = rule.entities.map(get); if (!a || !b) return 'pending'
      return adj4(a, b) ? 'satisfied' : 'violated'
    }
    case R.NOT_ADJACENT: {
      const [a, b] = rule.entities.map(get); if (!a || !b) return 'pending'
      return !adj8(a, b) ? 'satisfied' : 'violated'
    }
    case R.IN_ROW: {
      const pos = get(rule.entities[0]); if (!pos) return 'pending'
      return pos.row === rule.row ? 'satisfied' : 'violated'
    }
    case R.IN_COLUMN: {
      const pos = get(rule.entities[0]); if (!pos) return 'pending'
      return pos.col === rule.col ? 'satisfied' : 'violated'
    }
    case R.NOT_IN_ROW: {
      const pos = get(rule.entities[0]); if (!pos) return 'pending'
      return pos.row !== rule.row ? 'satisfied' : 'violated'
    }
    case R.NOT_IN_COLUMN: {
      const pos = get(rule.entities[0]); if (!pos) return 'pending'
      return pos.col !== rule.col ? 'satisfied' : 'violated'
    }
    default: return 'pending'
  }
}

// ── public ───────────────────────────────────────────────────────────────────

export function checkLogic(rule, placements) {
  if (rule.type === R.CONDITIONAL) {
    const cond = evalAtomic(rule.condition, placements)
    if (cond === 'pending')  return 'pending'
    if (cond === 'violated') return 'satisfied'   // vacuous truth
    return evalAtomic(rule.consequence, placements)
  }
  return evalAtomic(rule, placements)
}

export function evaluatePuzzle(puzzle, placements) {
  return puzzle.constraints.map((c) => ({ ...c, status: checkLogic(c, placements) }))
}
