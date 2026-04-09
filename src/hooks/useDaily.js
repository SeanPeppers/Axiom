import { PUZZLES } from '../data/puzzles'

// Day #1 is 2026-04-09 (EST/EDT).  Arithmetic is done on date strings only —
// no UTC timestamps — so DST never causes an off-by-one on the rollover hour.
const EPOCH_DATE = '2026-04-09'

function daysBetween(fromDateStr, toDateStr) {
  const parse = (s) => { const [y,m,d] = s.split('-').map(Number); return Date.UTC(y, m-1, d) }
  return Math.round((parse(toDateStr) - parse(fromDateStr)) / 86_400_000)
}

export function getDailyInfo() {
  // toLocaleDateString with America/New_York gives the correct NY calendar date
  // (flips to the next day exactly at midnight ET, DST-aware).
  const estDateStr  = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const dayNumber   = daysBetween(EPOCH_DATE, estDateStr) + 1
  const puzzleIndex = ((dayNumber - 1) % PUZZLES.length + PUZZLES.length) % PUZZLES.length
  return {
    dayNumber,
    puzzleIndex,
    dateString: estDateStr,
  }
}

/** localStorage key scoped to today's date so state resets each new day */
export function getDailyStorageKey(dateString) {
  return `axiom-daily-${dateString}`
}
