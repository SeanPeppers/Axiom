import { useState, useMemo, useCallback, useEffect } from 'react'
import { ENTITIES } from '../data/entities'
import { PUZZLES } from '../data/puzzles'
import { evaluatePuzzle } from '../engine/logicEngine'
import { runSimulation } from '../engine/simulationEngine'
import { getDailyInfo, getDailyStorageKey } from './useDaily'

const { dayNumber, puzzleIndex, dateString } = getDailyInfo()
const STORAGE_KEY = getDailyStorageKey(dateString)
const EMPTY = Object.fromEntries(ENTITIES.map((e) => [e.id, null]))
const MAX_COMPILES = 3

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function useGameState() {
  const puzzle = PUZZLES[puzzleIndex]
  const saved  = loadSaved()

  // 'simulating' is a transient state — never persist it
  const savedStatus = saved?.gameStatus
  const initStatus  = (savedStatus === 'simulating' ? 'playing' : savedStatus) ?? 'playing'

  const [placements,         setPlacements]         = useState(saved?.placements ?? EMPTY)
  const [attempts,           setAttempts]           = useState(saved?.attempts ?? [])
  const [gameStatus,         setGameStatus]         = useState(initStatus)
  const [lastCompileResults, setLastCompileResults] = useState(saved?.lastCompileResults ?? null)
  const [simulationResult,   setSimulationResult]   = useState(null)
  const [hoveredCell,        setHoveredCell]        = useState(null)
  const [showSolution,       setShowSolution]       = useState(false)

  useEffect(() => {
    if (gameStatus === 'simulating') return  // don't persist transient state
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ placements, attempts, gameStatus, lastCompileResults }))
    } catch { /* quota / private mode */ }
  }, [placements, attempts, gameStatus, lastCompileResults])

  const allPlaced = useMemo(() => Object.values(placements).every(Boolean), [placements])

  const placeToken = useCallback((entityId, row, col) => {
    if (gameStatus !== 'playing') return 'locked'
    const curr = placements[entityId]
    if (curr?.row === row && curr?.col === col) return 'same'
    const taken = Object.entries(placements).some(
      ([id, pos]) => id !== entityId && pos?.row === row && pos?.col === col
    )
    if (taken) return 'occupied'
    setPlacements((prev) => ({ ...prev, [entityId]: { row, col } }))
    return 'placed'
  }, [placements, gameStatus])

  const removeToken = useCallback((entityId) => {
    if (gameStatus !== 'playing') return
    setPlacements((prev) => ({ ...prev, [entityId]: null }))
  }, [gameStatus])

  /** COMPILE — evaluate axioms, then if all pass, trigger simulation. */
  const compile = useCallback(() => {
    if (gameStatus !== 'playing') return 'locked'
    if (!allPlaced) return 'not-ready'

    setSimulationResult(null)   // clear any previous sim result on new compile
    const results = evaluatePuzzle(puzzle, placements)
    const correct = results.every((r) => r.status === 'satisfied')
    const newAttempts = [...attempts, { results, correct }]

    setLastCompileResults(results)
    setAttempts(newAttempts)

    if (correct) {
      const sim = runSimulation(placements)
      setSimulationResult(sim)
      setGameStatus('simulating')
      return 'simulating'
    }

    if (newAttempts.length >= MAX_COMPILES) { setGameStatus('lost'); return 'lost' }
    return 'failed'
  }, [gameStatus, allPlaced, puzzle, placements, attempts])

  /**
   * Called by SimulationLayer when its animation completes.
   * Transitions: simulating → won  (if sim succeeded)
   *              simulating → playing / lost  (if sim failed)
   */
  const finishSimulation = useCallback(() => {
    if (simulationResult?.success) {
      setGameStatus('won')
    } else {
      // Simulation failed — the attempt was already counted in compile()
      if (attempts.length >= MAX_COMPILES) {
        setGameStatus('lost')
      } else {
        // Keep simulationResult so the UI can show "routing failed" warning
        setGameStatus('playing')
      }
    }
  }, [simulationResult, attempts.length])

  const resetPuzzle = useCallback(() => {
    setPlacements(EMPTY)
    setAttempts([])
    setGameStatus('playing')
    setLastCompileResults(null)
    setSimulationResult(null)
    setHoveredCell(null)
    setShowSolution(false)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* */ }
  }, [])

  return {
    puzzle, dayNumber,
    placements,
    lastCompileResults,
    simulationResult,
    attempts, gameStatus,
    allPlaced,
    compilesUsed: attempts.length,
    compilesLeft: MAX_COMPILES - attempts.length,
    hoveredCell, setHoveredCell,
    showSolution, setShowSolution,
    placeToken, removeToken, compile, finishSimulation, resetPuzzle,
  }
}
