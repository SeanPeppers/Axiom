import { useRef, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { getDailyInfo, getDailyStorageKey } from './hooks/useDaily'
import { GameHeader } from './components/GameHeader'
import { Grid } from './components/Grid'
import { DraggableToken } from './components/DraggableToken'
import { ConstraintSidebar } from './components/ConstraintSidebar'
import { CompileButton } from './components/CompileButton'
import { ResultCard } from './components/ResultCard'
import { SimulationLayer } from './components/SimulationLayer'
import { ENTITIES } from './data/entities'
import { PUZZLES } from './data/puzzles'
import { generatePuzzle } from './engine/puzzleGenerator'
import { useSizes } from './contexts/SizeContext'

const COL_LABELS = ['A', 'B', 'C', 'D', 'E']
const ROW_LABELS = ['1', '2', '3', '4', '5']

// ── Outer shell: owns mode and random seed ────────────────────────────────────

export default function App() {
  const [mode,       setMode]       = useState('daily')
  const [randomSeed, setRandomSeed] = useState(() => (Date.now() & 0x7fffffff) || 1)

  const { dayNumber, puzzleIndex, dateString } = getDailyInfo()
  const dailyPuzzle   = PUZZLES[puzzleIndex]
  const dailyKey      = getDailyStorageKey(dateString)

  // Derive puzzle and storage key for the active session
  const activePuzzle     = mode === 'daily' ? dailyPuzzle : (generatePuzzle(randomSeed) ?? dailyPuzzle)
  const activeStorageKey = mode === 'daily' ? dailyKey : null  // random mode: no persistence
  const activeDayNumber  = mode === 'daily' ? dayNumber : randomSeed

  // When mode or randomSeed changes, remount GameSession by changing the key
  const sessionKey = mode === 'daily' ? `daily-${dateString}` : `random-${randomSeed}`

  const handleNewRandom = () => setRandomSeed((Date.now() & 0x7fffffff) || 1)

  return (
    <div style={{ minHeight: '100vh', background: '#060b18', display: 'flex', flexDirection: 'column' }}>
      <GameSession
        key={sessionKey}
        puzzle={activePuzzle}
        storageKey={activeStorageKey}
        dayNumber={activeDayNumber}
        mode={mode}
        onModeChange={setMode}
        onNewRandom={handleNewRandom}
      />
    </div>
  )
}

// ── Inner session: owns game state for one puzzle run ─────────────────────────

function GameSession({ puzzle, storageKey, dayNumber, mode, onModeChange, onNewRandom }) {
  const {
    placements, lastCompileResults,
    simulationResult,
    attempts, gameStatus,
    allPlaced, compilesUsed, compilesLeft,
    hoveredCell, setHoveredCell,
    showSolution, setShowSolution,
    placeToken, removeToken, compile, finishSimulation, resetPuzzle,
  } = useGameState({ puzzle, storageKey, dayNumber })

  const { isMobile, CELL_SIZE, CONTAINER_WIDTH, CONTAINER_HEIGHT, LABEL_W } = useSizes()

  const containerRef = useRef(null)
  const [hoveredEntityId, setHoveredEntityId] = useState(null)

  const displayPlacements = showSolution ? puzzle.solution : placements
  const isLocked = gameStatus !== 'playing'

  const sidebarConstraints = showSolution
    ? puzzle.constraints.map((c) => ({ ...c, status: 'satisfied' }))
    : lastCompileResults
    ?? puzzle.constraints.map((c) => ({ ...c, status: 'evaluating' }))

  return (
    <>
      <GameHeader
        puzzle={puzzle}
        dayNumber={dayNumber}
        gameStatus={gameStatus}
        mode={mode}
        onModeChange={onModeChange}
        onNewRandom={onNewRandom}
        onReset={resetPuzzle}
      />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        justifyContent: 'center',
        gap: isMobile ? 20 : 40,
        padding: isMobile ? '12px 12px 24px' : '36px 24px',
      }}>

        {/* ── Left column: board ───────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Column labels */}
          <div style={{ display: 'flex', paddingLeft: LABEL_W, marginBottom: 5 }}>
            {COL_LABELS.map((lbl) => (
              <div key={lbl} style={{ width: CELL_SIZE, textAlign: 'center', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(148,163,184,0.4)', letterSpacing: '0.1em' }}>
                {lbl}
              </div>
            ))}
          </div>

          {/* Row labels + token container */}
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>

            {/* Row labels */}
            <div style={{ display: 'flex', flexDirection: 'column', width: LABEL_W, flexShrink: 0 }}>
              {ROW_LABELS.map((lbl) => (
                <div key={lbl} style={{ height: CELL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 7, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(148,163,184,0.4)', letterSpacing: '0.1em' }}>
                  {lbl}
                </div>
              ))}
            </div>

            {/*
              containerRef – starts exactly at grid cell (0,0).
              All token x/y values are relative to this origin.
              DO NOT put labels, margin, or padding inside this div.
            */}
            <div
              ref={containerRef}
              style={{ position: 'relative', width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT }}
            >
              {/* Grid background + hand dock */}
              <Grid placements={displayPlacements} hoveredCell={isLocked ? null : hoveredCell} />

              {/* Draggable token layer */}
              {ENTITIES.map((entity, i) => (
                <DraggableToken
                  key={entity.id}
                  entity={entity}
                  handIndex={i}
                  placement={displayPlacements[entity.id]}
                  containerRef={containerRef}
                  onPlace={placeToken}
                  onRemove={removeToken}
                  onHoverCell={setHoveredCell}
                  onHoverEntity={setHoveredEntityId}
                  disabled={isLocked || showSolution}
                />
              ))}

              {/* Simulation overlay */}
              {gameStatus === 'simulating' && simulationResult && (
                <SimulationLayer
                  simulation={simulationResult}
                  onComplete={finishSimulation}
                />
              )}
            </div>
          </div>

          {/* Routing simulation legend */}
          <div style={{
            paddingLeft: LABEL_W, marginTop: 16,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <span style={{
              fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
              color: 'rgba(148,163,184,0.3)', letterSpacing: '0.16em',
            }}>
              ROUTING SIMULATION
            </span>
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              border: '1px solid rgba(99,102,241,0.12)',
              background: 'rgba(6,11,24,0.6)',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 6 : 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(99,102,241,0.7)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'rgba(165,180,252,0.8)' }}>
                    Packets from <strong style={{ color: '#a5b4fc' }}>DN</strong> must reach <strong style={{ color: '#fde68a' }}>ST</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(239,68,68,0.7)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'rgba(252,165,165,0.8)' }}>
                    Virus from <strong style={{ color: '#fca5a5' }}>VX</strong> must not reach <strong style={{ color: '#a5b4fc' }}>DN</strong>
                  </span>
                </div>
              </div>
              <div style={{
                paddingTop: 6, borderTop: '1px solid rgba(99,102,241,0.08)',
                display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)' }}>Virus blocked by:</span>
                {[
                  { abbr: 'FW', color: '#10b981' },
                  { abbr: 'RT', color: '#8b5cf6' },
                  { abbr: 'PX', color: '#06b6d4' },
                  { abbr: 'ST', color: '#f59e0b' },
                ].map(({ abbr, color }) => (
                  <span key={abbr} style={{
                    fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600, color,
                    padding: '1px 6px', borderRadius: 4,
                    border: `1px solid ${color}40`,
                    background: `${color}10`,
                  }}>
                    {abbr}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Compile button / simulation status / result card */}
          <div style={{ paddingLeft: LABEL_W, marginTop: 10 }}>
            {gameStatus === 'playing' ? (
              <>
                {simulationResult && !simulationResult.success && (
                  <div style={{
                    marginBottom: 8, padding: '8px 12px', borderRadius: 6,
                    border: '1px solid rgba(239,68,68,0.35)',
                    background: 'rgba(239,68,68,0.06)',
                    display: 'flex', flexDirection: 'column', gap: 3,
                  }}>
                    <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#ef4444', letterSpacing: '0.14em' }}>
                      ✕ ROUTING FAILED
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(252,165,165,0.7)', lineHeight: 1.5 }}>
                      Axioms passed but Virus reached Data Node before packets reached Sentinel. Reroute and compile again.
                    </span>
                  </div>
                )}
                <CompileButton
                  allPlaced={allPlaced}
                  compilesUsed={compilesUsed}
                  compilesLeft={compilesLeft}
                  gameStatus={gameStatus}
                  onCompile={compile}
                />
              </>
            ) : gameStatus === 'simulating' ? (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                border: '1px solid rgba(99,102,241,0.22)',
                background: 'rgba(99,102,241,0.05)',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <span style={{
                  fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                  color: 'rgba(99,102,241,0.8)', letterSpacing: '0.18em',
                }}>
                  ◈ ROUTING SIMULATION
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(99,102,241,0.55)', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: 'rgba(165,180,252,0.75)', lineHeight: 1.4 }}>
                      Packet flood — spreading from <strong style={{ color: '#a5b4fc' }}>DN</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(239,68,68,0.55)', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: 'rgba(252,165,165,0.75)', lineHeight: 1.4 }}>
                      Virus spread — blocked by <strong style={{ color: '#fca5a5' }}>FW · RT · PX · ST</strong>
                    </span>
                  </div>
                </div>
                <p style={{
                  margin: 0, fontSize: 10, lineHeight: 1.5,
                  color: 'rgba(148,163,184,0.55)',
                  borderTop: '1px solid rgba(99,102,241,0.1)',
                  paddingTop: 7,
                }}>
                  Packets must reach <strong style={{ color: '#fde68a' }}>ST</strong> before Virus reaches <strong style={{ color: '#a5b4fc' }}>DN</strong>. A failed route counts as a compile attempt.
                </p>
              </div>
            ) : (
              <ResultCard
                dayNumber={dayNumber}
                attempts={attempts}
                gameStatus={gameStatus}
                onReset={resetPuzzle}
                onShowSolution={() => setShowSolution(true)}
                isRandom={mode === 'random'}
              />
            )}
          </div>
        </div>

        {/* ── Right column: constraints ────────────────── */}
        <ConstraintSidebar
          constraints={sidebarConstraints}
          revealKey={attempts.length}
          puzzle={puzzle}
          gameStatus={gameStatus}
          hoveredEntityId={hoveredEntityId}
          isMobile={isMobile}
          mobileWidth={CONTAINER_WIDTH + LABEL_W}
        />
      </main>
    </>
  )
}
