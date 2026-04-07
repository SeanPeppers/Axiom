import { useState, useMemo, useCallback, useEffect } from 'react'
import { ENTITIES } from '../data/entities'
import { PUZZLES } from '../data/puzzles'
import { evaluatePuzzle } from '../engine/logicEngine'
import { getDailyInfo, getDailyStorageKey } from './useDaily'

const { dayNumber, puzzleIndex, dateString } = getDailyInfo()
const STORAGE_KEY = getDailyStorageKey(dateString)
const EMPTY = Object.fromEntries(ENTITIES.map((e) => [e.id, null]))
const MAX_COMPILES = 3

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useGameState() {
  const puzzle = PUZZLES[puzzleIndex]

  // ── restore from localStorage or start fresh ─────────────────────────────
  const saved = loadSaved()

  const [placements, setPlacements] = useState(saved?.placements ?? EMPTY)
  const [attempts, setAttempts] = useState(saved?.attempts ?? [])   // [{results, correct}]
  const [gameStatus, setGameStatus] = useState(saved?.gameStatus ?? 'playing')  // 'playing'|'won'|'lost'
  const [hoveredCell, setHoveredCell] = useState(null)
  const [showSolution, setShowSolution] = useState(false)

  // ── persist on every change ───────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ placements, attempts, gameStatus }))
    } catch { /* quota exceeded or private mode */ }
  }, [placements, attempts, gameStatus])

  // ── live constraint evaluation ────────────────────────────────────────────
  const constraintResults = useMemo(
    () => evaluatePuzzle(puzzle, placements),
    [puzzle, placements]
  )

  const allPlaced = useMemo(
    () => Object.values(placements).every(Boolean),
    [placements]
  )

  // ── actions ───────────────────────────────────────────────────────────────

  const placeToken = useCallback(
    (entityId, row, col) => {
      if (gameStatus !== 'playing') return 'locked'
      const curr = placements[entityId]
      if (curr?.row === row && curr?.col === col) return 'same'
      const taken = Object.entries(placements).some(
        ([id, pos]) => id !== entityId && pos?.row === row && pos?.col === col
      )
      if (taken) return 'occupied'
      setPlacements((prev) => ({ ...prev, [entityId]: { row, col } }))
      return 'placed'
    },
    [placements, gameStatus]
  )

  const removeToken = useCallback(
    (entityId) => {
      if (gameStatus !== 'playing') return
      setPlacements((prev) => ({ ...prev, [entityId]: null }))
    },
    [gameStatus]
  )

  /**
   * COMPILE – submit the current configuration.
   * Returns 'won' | 'failed' | 'lost' | 'not-ready'
   */
  const compile = useCallback(() => {
    if (gameStatus !== 'playing') return 'locked'
    if (!allPlaced) return 'not-ready'

    const results = evaluatePuzzle(puzzle, placements)
    const correct = results.every((r) => r.status === 'satisfied')
    const newAttempt = { results, correct }
    const newAttempts = [...attempts, newAttempt]

    setAttempts(newAttempts)

    if (correct) {
      setGameStatus('won')
      return 'won'
    }

    if (newAttempts.length >= MAX_COMPILES) {
      setGameStatus('lost')
      return 'lost'
    }

    return 'failed'
  }, [gameStatus, allPlaced, puzzle, placements, attempts])

  const resetPuzzle = useCallback(() => {
    setPlacements(EMPTY)
    setAttempts([])
    setGameStatus('playing')
    setHoveredCell(null)
    setShowSolution(false)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* */ }
  }, [])

  return {
    puzzle,
    dayNumber,
    placements,
    constraintResults,
    attempts,
    gameStatus,
    allPlaced,
    compilesUsed: attempts.length,
    compilesLeft: MAX_COMPILES - attempts.length,
    hoveredCell,
    setHoveredCell,
    showSolution,
    setShowSolution,
    placeToken,
    removeToken,
    compile,
    resetPuzzle,
  }
}
