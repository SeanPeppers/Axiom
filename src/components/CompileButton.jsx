import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Lock, AlertCircle } from 'lucide-react'

export function CompileButton({ allPlaced, compilesUsed, compilesLeft, gameStatus, onCompile }) {
  const [shake, setShake] = useState(false)
  const [label, setLabel] = useState('COMPILE')

  const isDisabled = !allPlaced || gameStatus !== 'playing'

  const handleClick = async () => {
    if (isDisabled) return
    const result = await onCompile()
    if (result === 'failed' || result === 'lost') {
      setShake(true)
      setLabel('VIOLATIONS FOUND')
      setTimeout(() => { setShake(false); setLabel('COMPILE') }, 1800)
    }
  }

  const dots = Array.from({ length: 3 }, (_, i) => ({
    used: i < compilesUsed,
    isLast: compilesLeft === 1 && i === compilesUsed,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 20 }}>
      {/* Attempt dots */}
      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(148,163,184,0.35)', letterSpacing: '0.14em', marginRight: 4 }}>
          COMPILES
        </span>
        {dots.map((dot, i) => (
          <motion.div
            key={i}
            animate={dot.isLast ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] } : {}}
            transition={dot.isLast ? { repeat: Infinity, duration: 1.4 } : {}}
            style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: dot.used
                ? 'rgba(239,68,68,0.8)'
                : 'rgba(99,102,241,0.35)',
              border: dot.used
                ? '1px solid rgba(239,68,68,0.5)'
                : '1px solid rgba(99,102,241,0.4)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Button */}
      <motion.button
        animate={shake ? { x: [-6, 6, -5, 5, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        onClick={handleClick}
        disabled={isDisabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '11px 32px',
          borderRadius: 8,
          border: isDisabled
            ? '1px solid rgba(99,102,241,0.15)'
            : '1px solid rgba(99,102,241,0.5)',
          background: isDisabled
            ? 'rgba(99,102,241,0.04)'
            : 'rgba(99,102,241,0.12)',
          color: isDisabled ? 'rgba(148,163,184,0.3)' : '#a5b4fc',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 500,
          letterSpacing: '0.14em',
          transition: 'background 0.2s, border-color 0.2s, color 0.2s',
          minWidth: 200,
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.background = 'rgba(99,102,241,0.2)'
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.7)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.background = 'rgba(99,102,241,0.12)'
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
          }
        }}
      >
        {isDisabled && gameStatus === 'playing' ? (
          <Lock size={13} />
        ) : (
          <Zap size={13} />
        )}
        <AnimatePresence mode="wait">
          <motion.span
            key={label}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {!allPlaced && gameStatus === 'playing' && (
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(148,163,184,0.35)', fontFamily: "'JetBrains Mono', monospace" }}>
          Place all entities to compile
        </p>
      )}
    </div>
  )
}
