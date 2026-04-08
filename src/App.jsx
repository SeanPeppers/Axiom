import { useRef, useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { GameHeader } from './components/GameHeader'
import { Grid } from './components/Grid'
import { DraggableToken } from './components/DraggableToken'
import { ConstraintSidebar } from './components/ConstraintSidebar'
import { CompileButton } from './components/CompileButton'
import { ResultCard } from './components/ResultCard'
import { ENTITIES } from './data/entities'
import { CELL_SIZE, CONTAINER_WIDTH, CONTAINER_HEIGHT } from './config'

const COL_LABELS = ['A', 'B', 'C', 'D', 'E']
const ROW_LABELS = ['1', '2', '3', '4', '5']
const LABEL_W = 24  // px – width of the row-label gutter

export default function App() {
  const {
    puzzle, dayNumber,
    placements, lastCompileResults,
    attempts, gameStatus,
    allPlaced, compilesUsed, compilesLeft,
    hoveredCell, setHoveredCell,
    showSolution, setShowSolution,
    placeToken, removeToken, compile, resetPuzzle,
  } = useGameState()

  const containerRef = useRef(null)
  const [hoveredEntityId, setHoveredEntityId] = useState(null)

  const displayPlacements = showSolution ? puzzle.solution : placements
  const isLocked = gameStatus !== 'playing'

  /**
   * What the sidebar displays:
   *  - Before first compile → all 'evaluating' (completely hidden)
   *  - After any compile    → results from that compile attempt
   *  - Solution revealed    → all 'satisfied' (solution is always correct)
   */
  const sidebarConstraints = showSolution
    ? puzzle.constraints.map((c) => ({ ...c, status: 'satisfied' }))
    : lastCompileResults
    ?? puzzle.constraints.map((c) => ({ ...c, status: 'evaluating' }))

  return (
    <div style={{ minHeight: '100vh', background: '#060b18', display: 'flex', flexDirection: 'column' }}>
      <GameHeader
        puzzle={puzzle}
        dayNumber={dayNumber}
        gameStatus={gameStatus}
        onReset={resetPuzzle}
      />

      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 40,
        padding: '36px 24px',
      }}>

        {/* ── Left column: board ───────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Column labels (outside containerRef) */}
          <div style={{ display: 'flex', paddingLeft: LABEL_W, marginBottom: 5 }}>
            {COL_LABELS.map((lbl) => (
              <div key={lbl} style={{ width: CELL_SIZE, textAlign: 'center', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(148,163,184,0.4)', letterSpacing: '0.1em' }}>
                {lbl}
              </div>
            ))}
          </div>

          {/* Row labels + token container */}
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>

            {/* Row labels (outside containerRef) */}
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
            </div>
          </div>

          {/* Compile button / result card */}
          <div style={{ paddingLeft: LABEL_W, marginTop: 4 }}>
            {gameStatus === 'playing' ? (
              <CompileButton
                allPlaced={allPlaced}
                compilesUsed={compilesUsed}
                compilesLeft={compilesLeft}
                gameStatus={gameStatus}
                onCompile={compile}
              />
            ) : (
              <ResultCard
                dayNumber={dayNumber}
                attempts={attempts}
                gameStatus={gameStatus}
                onReset={resetPuzzle}
                onShowSolution={() => setShowSolution(true)}
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
        />
      </main>
    </div>
  )
}
