export const CELL_SIZE = 100       // px – grid cell width & height
export const TOKEN_SIZE = 64       // px – token bounding box
export const GRID_COLS = 5
export const GRID_ROWS = 5
export const GRID_WIDTH = CELL_SIZE * GRID_COLS   // 500
export const GRID_HEIGHT = CELL_SIZE * GRID_ROWS  // 500
export const HAND_GAP = 16                        // gap between grid and hand row
export const HAND_ROW_TOP = GRID_HEIGHT + HAND_GAP  // 516
export const CONTAINER_HEIGHT = HAND_ROW_TOP + CELL_SIZE + 4  // 620
export const CONTAINER_WIDTH = GRID_WIDTH  // 500

// Derive top-left position from a grid cell to place the token
export const getCellTopLeft = (row, col) => ({
  x: col * CELL_SIZE + (CELL_SIZE - TOKEN_SIZE) / 2,
  y: row * CELL_SIZE + (CELL_SIZE - TOKEN_SIZE) / 2,
})

// Derive top-left position for a hand slot
export const getHandTopLeft = (index) => ({
  x: index * CELL_SIZE + (CELL_SIZE - TOKEN_SIZE) / 2,
  y: HAND_ROW_TOP + (CELL_SIZE - TOKEN_SIZE) / 2,
})

export const SNAP_SPRING = { type: 'spring', stiffness: 700, damping: 45 }
