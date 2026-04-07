import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { TokenShape } from './TokenShape'
import { CELL_SIZE, TOKEN_SIZE, GRID_WIDTH, GRID_HEIGHT, SNAP_SPRING, getCellTopLeft, getHandTopLeft } from '../config'

export function DraggableToken({
  entity,
  handIndex,
  placement,
  containerRef,
  onPlace,
  onRemove,
  onHoverCell,
  disabled,   // true when game is won/lost
}) {
  const [isDragging, setIsDragging] = useState(false)

  const init = placement ? getCellTopLeft(placement.row, placement.col) : getHandTopLeft(handIndex)
  const x = useMotionValue(init.x)
  const y = useMotionValue(init.y)
  const prevRef = useRef(JSON.stringify(placement))

  useEffect(() => {
    const next = JSON.stringify(placement)
    if (prevRef.current === next) return
    prevRef.current = next
    const pos = placement ? getCellTopLeft(placement.row, placement.col) : getHandTopLeft(handIndex)
    animate(x, pos.x, SNAP_SPRING)
    animate(y, pos.y, SNAP_SPRING)
  }, [placement, handIndex, x, y])

  const snapBack = useCallback(() => {
    const pos = placement ? getCellTopLeft(placement.row, placement.col) : getHandTopLeft(handIndex)
    animate(x, pos.x, SNAP_SPRING)
    animate(y, pos.y, SNAP_SPRING)
  }, [placement, handIndex, x, y])

  const getCell = useCallback((info) => {
    if (!containerRef.current) return null
    // containerRef starts exactly at grid top-left (labels are outside)
    const rect = containerRef.current.getBoundingClientRect()
    const relX = info.point.x - rect.left
    const relY = info.point.y - rect.top
    if (relX >= 0 && relX < GRID_WIDTH && relY >= 0 && relY < GRID_HEIGHT) {
      return {
        col: Math.min(Math.floor(relX / CELL_SIZE), 3),
        row: Math.min(Math.floor(relY / CELL_SIZE), 3),
      }
    }
    return null
  }, [containerRef])

  const handleDrag = useCallback((_, info) => {
    onHoverCell(getCell(info))
  }, [getCell, onHoverCell])

  const handleDragEnd = useCallback((_, info) => {
    setIsDragging(false)
    onHoverCell(null)
    const cell = getCell(info)
    if (cell) {
      const result = onPlace(entity.id, cell.row, cell.col)
      if (result !== 'placed') snapBack()
    } else {
      if (placement !== null) {
        onRemove(entity.id)
      } else {
        snapBack()
      }
    }
  }, [entity.id, placement, getCell, onPlace, onRemove, onHoverCell, snapBack])

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: 0, top: 0,
        width: TOKEN_SIZE, height: TOKEN_SIZE,
        x, y,
        cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 50 : 10,
        touchAction: 'none',
        userSelect: 'none',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.3s',
      }}
      drag={!disabled}
      dragMomentum={false}
      whileHover={!disabled && !isDragging ? { scale: 1.07 } : {}}
      whileDrag={!disabled ? { scale: 1.18 } : {}}
      onDragStart={() => !disabled && setIsDragging(true)}
      onDrag={!disabled ? handleDrag : undefined}
      onDragEnd={!disabled ? handleDragEnd : undefined}
    >
      <TokenShape entity={entity} size={TOKEN_SIZE} />
    </motion.div>
  )
}
