import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { TokenShape } from './TokenShape'
import { GRID_ROWS, GRID_COLS, SNAP_SPRING } from '../config'
import { useSizes } from '../contexts/SizeContext'

export function DraggableToken({
  entity,
  handIndex,
  placement,
  containerRef,
  onPlace,
  onRemove,
  onHoverCell,
  onHoverEntity,
  disabled,
}) {
  const { CELL_SIZE, TOKEN_SIZE, GRID_WIDTH, GRID_HEIGHT, getCellTopLeft, getHandTopLeft } = useSizes()
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
  }, [placement, handIndex, x, y, getCellTopLeft, getHandTopLeft])

  const snapBack = useCallback(() => {
    const pos = placement ? getCellTopLeft(placement.row, placement.col) : getHandTopLeft(handIndex)
    animate(x, pos.x, SNAP_SPRING)
    animate(y, pos.y, SNAP_SPRING)
  }, [placement, handIndex, x, y, getCellTopLeft, getHandTopLeft])

  const getCell = useCallback((info) => {
    if (!containerRef.current) return null
    const rect = containerRef.current.getBoundingClientRect()
    const relX = info.point.x - rect.left
    const relY = info.point.y - rect.top
    if (relX >= 0 && relX < GRID_WIDTH && relY >= 0 && relY < GRID_HEIGHT) {
      return {
        col: Math.min(Math.floor(relX / CELL_SIZE), GRID_COLS - 1),
        row: Math.min(Math.floor(relY / CELL_SIZE), GRID_ROWS - 1),
      }
    }
    return null
  }, [containerRef, CELL_SIZE, GRID_WIDTH, GRID_HEIGHT])

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
      if (placement !== null) onRemove(entity.id)
      else snapBack()
    }
  }, [entity.id, placement, getCell, onPlace, onRemove, onHoverCell, snapBack])

  return (
    <motion.div
      style={{
        position: 'absolute', left: 0, top: 0,
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
      onHoverStart={() => onHoverEntity?.(entity.id)}
      onHoverEnd={() => onHoverEntity?.(null)}
      onDragStart={() => !disabled && setIsDragging(true)}
      onDrag={!disabled ? handleDrag : undefined}
      onDragEnd={!disabled ? handleDragEnd : undefined}
    >
      <TokenShape entity={entity} size={TOKEN_SIZE} />
    </motion.div>
  )
}
