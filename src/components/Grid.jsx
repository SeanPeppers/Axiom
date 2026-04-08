/**
 * Grid.jsx – renders ONLY the 5×5 cell matrix and the hand-dock below.
 * Column/row labels are rendered OUTSIDE this component (in App.jsx) so
 * the parent containerRef starts exactly at cell (0,0) – critical for
 * correct drag-snap coordinate math.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { CELL_SIZE, GRID_ROWS, GRID_COLS, HAND_ROW_TOP, CONTAINER_WIDTH } from '../config'
import { ENTITIES, getEntity } from '../data/entities'

export function Grid({ placements, hoveredCell }) {
  return (
    <>
      {/* ── 4×4 cell matrix ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`,
          width: CONTAINER_WIDTH,
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 6,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Scanline overlay */}
        <div
          className="grid-scanline"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
        />

        {Array.from({ length: GRID_ROWS }, (_, row) =>
          Array.from({ length: GRID_COLS }, (_, col) => {
            const occupantId = Object.entries(placements).find(
              ([, pos]) => pos?.row === row && pos?.col === col
            )?.[0]
            const occupant = occupantId ? getEntity(occupantId) : null
            const isHovered = hoveredCell?.row === row && hoveredCell?.col === col

            return (
              <GridCell
                key={`${row}-${col}`}
                row={row}
                col={col}
                occupant={occupant}
                isHovered={isHovered}
              />
            )
          })
        )}
      </div>

      {/* ── hand-dock separator ─────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: HAND_ROW_TOP - 12,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.25), transparent)' }} />
        <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(148,163,184,0.35)', letterSpacing: '0.15em' }}>
          ENTITY BUFFER
        </span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.25), transparent)' }} />
      </div>

      {/* ── hand slot outlines ───────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: HAND_ROW_TOP,
          left: 0,
          display: 'flex',
          width: CONTAINER_WIDTH,
        }}
      >
        {ENTITIES.map((entity) => {
          const isPlaced = placements[entity.id] !== null
          return (
            <div
              key={entity.id}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                border: `1px dashed ${entity.colors.stroke}${isPlaced ? '35' : '20'}`,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.25s',
              }}
            >
              {isPlaced && (
                <span style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: entity.colors.dimText,
                  letterSpacing: '0.1em',
                }}>
                  {entity.abbr}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function GridCell({ row, col, occupant, isHovered }) {
  const isEven = (row + col) % 2 === 0
  return (
    <div
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        background: isEven ? 'rgba(10,16,32,0.92)' : 'rgba(13,21,38,0.92)',
        borderRight: col < GRID_COLS - 1 ? '1px solid rgba(30,45,71,0.8)' : 'none',
        borderBottom: row < GRID_ROWS - 1 ? '1px solid rgba(30,45,71,0.8)' : 'none',
        position: 'relative',
        zIndex: 1,
        transition: 'background 0.12s, box-shadow 0.12s',
        ...(isHovered && { background: 'rgba(99,102,241,0.1)', boxShadow: 'inset 0 0 0 2px rgba(99,102,241,0.6)' }),
        ...(!isHovered && occupant && { boxShadow: `inset 0 0 22px ${occupant.colors.glow}1a` }),
      }}
    >
      {/* Coordinate label */}
      {!occupant && (
        <span style={{
          position: 'absolute', bottom: 5, right: 7,
          fontSize: 9,
          fontFamily: "'JetBrains Mono', monospace",
          color: 'rgba(148,163,184,0.1)',
          userSelect: 'none', pointerEvents: 'none',
        }}>
          {['A','B','C','D','E'][col]}{row + 1}
        </span>
      )}

      <AnimatePresence>
        {isHovered && (
          <motion.div
            key="glow"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at center, rgba(99,102,241,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
