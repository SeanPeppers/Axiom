import { PUZZLES } from '../data/puzzles'

const EPOCH = new Date('2025-01-01T00:00:00Z')

export function getDailyInfo() {
  const now = new Date()
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const dayNumber = Math.floor((today - EPOCH) / 86_400_000) + 1
  const puzzleIndex = (dayNumber - 1) % PUZZLES.length
  return {
    dayNumber,
    puzzleIndex,
    dateString: today.toISOString().slice(0, 10),
  }
}

/** localStorage key scoped to today's date so state resets each new day */
export function getDailyStorageKey(dateString) {
  return `axiom-daily-${dateString}`
}
