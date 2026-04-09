/**
 * SizeContext – responsive grid sizing.
 *
 * Desktop (≥ 768px): CELL_SIZE = 100px (original layout)
 * Mobile  (< 768px): CELL_SIZE shrinks to fit the viewport width
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { GRID_COLS, GRID_ROWS, NUM_ENTITIES } from '../config'

const MOBILE_BREAKPOINT = 768
const HAND_GAP = 16

function compute(vw) {
  const isMobile = vw < MOBILE_BREAKPOINT

  let CELL_SIZE, TOKEN_SIZE, LABEL_W
  if (isMobile) {
    LABEL_W = 20
    // Available grid width: viewport - outer padding (32px) - row-label gutter
    const available = vw - 32 - LABEL_W
    CELL_SIZE  = Math.max(52, Math.min(80, Math.floor(available / GRID_COLS)))
    TOKEN_SIZE = Math.round(CELL_SIZE * 0.66)
  } else {
    CELL_SIZE  = 100
    TOKEN_SIZE = 64
    LABEL_W    = 24
  }

  const GRID_WIDTH      = CELL_SIZE * GRID_COLS
  const GRID_HEIGHT     = CELL_SIZE * GRID_ROWS
  const HAND_SLOT_SIZE  = Math.floor(GRID_WIDTH / NUM_ENTITIES)
  const HAND_ROW_TOP    = GRID_HEIGHT + HAND_GAP
  const CONTAINER_WIDTH  = GRID_WIDTH
  const CONTAINER_HEIGHT = HAND_ROW_TOP + CELL_SIZE + 4

  const getCellTopLeft = (row, col) => ({
    x: col * CELL_SIZE + (CELL_SIZE - TOKEN_SIZE) / 2,
    y: row * CELL_SIZE + (CELL_SIZE - TOKEN_SIZE) / 2,
  })

  const getHandTopLeft = (index) => ({
    x: index * HAND_SLOT_SIZE + Math.floor((HAND_SLOT_SIZE - TOKEN_SIZE) / 2),
    y: HAND_ROW_TOP + Math.floor((HAND_SLOT_SIZE - TOKEN_SIZE) / 2),
  })

  return {
    isMobile,
    CELL_SIZE, TOKEN_SIZE, LABEL_W,
    GRID_WIDTH, GRID_HEIGHT,
    HAND_SLOT_SIZE, HAND_ROW_TOP,
    CONTAINER_WIDTH, CONTAINER_HEIGHT,
    getCellTopLeft, getHandTopLeft,
  }
}

const SizeContext = createContext(null)

export function SizeProvider({ children }) {
  const [sizes, setSizes] = useState(() => compute(window.innerWidth))

  useEffect(() => {
    const handler = () => setSizes(compute(window.innerWidth))
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return <SizeContext.Provider value={sizes}>{children}</SizeContext.Provider>
}

export const useSizes = () => useContext(SizeContext)
