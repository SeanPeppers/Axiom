import { useState, useMemo, useCallback, useEffect } from 'react'
import { ENTITIES } from '../data/entities'
import { evaluatePuzzle } from '../engine/logicEngine'
import { runSimulation } from '../engine/simulationEngine'

const EMPTY = Object.fromEntries(ENTITIES.map((e) => [e.id, null]))
const MAX_COMPILES = 3

function loadSaved(storageKey) {
  if (!storageKey) return null
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/**
 * @param {{ puzzle: object, storageKey: string|null, dayNumber: number }} params
 *   puzzle      – the active puzzle object
 *   storageKey  – localStorage key (null = don't persist, e.g. random mode)
 *   dayNumber   – displayed in the result card (#42, etc.)
 */
export function useGameState({ puzzle, storageKey, dayNumber }) {
  const saved = loadSaved(storageKey)

  // 'simulating' is transient — never restore it
  const savedStatus = saved?.gameStatus
  const initStatus  = (savedStatus === 'simulating' ? 'playing' : savedStatus) ?? 'playing'

  const [placements,         setPlacements]         = useState(saved?.placements ?? EMPTY)
  const [attempts,           setAttempts]           = useState(saved?.attempts ?? [])
  const [gameStatus,         setGameStatus]         = useState(initStatus)
  const [lastCompileResults, setLastCompileResults] = useState(saved?.lastCompileResults ?? null)
  const [simulationResult,   setSimulationResult]   = useState(null)
  const [hoveredCell,        setHoveredCell]        = useState(null)
  const [showSolution,       setShowSolution]       = useState(false)

  // Persist to localStorage (skip transient state, skip when no key)
  useEffect(() => {
    if (gameStatus === 'simulating' || !storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({ placements, attempts, gameStatus, lastCompileResults }))
    } catch { /* quota / private mode */ }
  }, [placements, attempts, gameStatus, lastCompileResults, storageKey])

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

  /**
   * COMPILE — evaluate axioms; if all pass, run routing simulation.
   * Routing result is computed synchronously and stored in the attempt record
   * (the animation in SimulationLayer is purely cosmetic).
   */
  const compile = useCallback(() => {
    if (gameStatus !== 'playing') return 'locked'
    if (!allPlaced) return 'not-ready'

    setSimulationResult(null)  // clear previous sim result for clean UI

    const results = evaluatePuzzle(puzzle, placements)
    const correct = results.every((r) => r.status === 'satisfied')

    let sim          = null
    let routingPassed = null  // null = constraints failed, didn't run

    if (correct) {
      sim          = runSimulation(placements)
      routingPassed = sim?.success ?? false
      setSimulationResult(sim)
      setGameStatus('simulating')
    }

    const newAttempts = [...attempts, { results, correct, routingPassed }]
    setLastCompileResults(results)
    setAttempts(newAttempts)

    if (correct) return 'simulating'

    if (newAttempts.length >= MAX_COMPILES) { setGameStatus('lost'); return 'lost' }
    return 'failed'
  }, [gameStatus, allPlaced, puzzle, placements, attempts])

  /**
   * Called by SimulationLayer when its animation completes.
   * Transitions: simulating → won  (sim passed)
   *              simulating → playing / lost  (sim failed)
   */
  const finishSimulation = useCallback(() => {
    if (simulationResult?.success) {
      setGameStatus('won')
    } else {
      if (attempts.length >= MAX_COMPILES) {
        setGameStatus('lost')
      } else {
        // Keep simulationResult so the UI can show the "routing failed" warning
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
    if (storageKey) {
      try { localStorage.removeItem(storageKey) } catch { /* */ }
    }
  }, [storageKey])

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
