import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSizes } from '../contexts/SizeContext'

const TICK_MS  = 340
const PAUSE_MS = 1400

export function SimulationLayer({ simulation, onComplete }) {
  const { CELL_SIZE } = useSizes()
  const [frameIdx, setFrameIdx] = useState(0)
  const [phase,    setPhase]    = useState('ready')

  useEffect(() => {
    if (!simulation) return
    setFrameIdx(0)
    setPhase('ready')
    const startT = setTimeout(() => setPhase('running'), 300)
    return () => clearTimeout(startT)
  }, [simulation])

  useEffect(() => {
    if (phase !== 'running' || !simulation) return
    if (frameIdx >= simulation.frames.length) {
      setPhase('done')
      const t = setTimeout(() => onComplete?.(), PAUSE_MS)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setFrameIdx((f) => f + 1), TICK_MS)
    return () => clearTimeout(t)
  }, [phase, frameIdx, simulation, onComplete])

  if (!simulation || phase === 'ready') return null

  const frameData = simulation.frames[Math.min(frameIdx, simulation.frames.length - 1)]
  if (!frameData) return null

  const { packets, infected, tick } = frameData

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      {[...infected].map((k) => {
        const [r, c] = k.split(',').map(Number)
        return (
          <motion.div key={`inf-${k}`} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ duration: 0.18 }}
            style={{ position: 'absolute', top: r * CELL_SIZE + 1, left: c * CELL_SIZE + 1, width: CELL_SIZE - 2, height: CELL_SIZE - 2, background: 'radial-gradient(circle at center, rgba(239,68,68,0.65) 0%, rgba(239,68,68,0.25) 100%)', borderRadius: 3 }}
          />
        )
      })}

      {[...packets].map((k) => {
        const [r, c] = k.split(',').map(Number)
        if (infected.has(k)) return null
        return (
          <motion.div key={`pkt-${k}`} initial={{ opacity: 0 }} animate={{ opacity: 0.42 }} transition={{ duration: 0.18 }}
            style={{ position: 'absolute', top: r * CELL_SIZE + 1, left: c * CELL_SIZE + 1, width: CELL_SIZE - 2, height: CELL_SIZE - 2, background: 'radial-gradient(circle at center, rgba(99,102,241,0.7) 0%, rgba(99,102,241,0.2) 100%)', borderRadius: 3 }}
          />
        )
      })}

      {phase === 'running' && (
        <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(148,163,184,0.5)', letterSpacing: '0.14em' }}>
          T+{tick}
        </div>
      )}

      <AnimatePresence>
        {phase === 'done' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: simulation.success ? 'rgba(16,185,129,0.13)' : 'rgba(239,68,68,0.13)', backdropFilter: 'blur(2px)' }}
          >
            <motion.span initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              style={{ fontSize: 15, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: simulation.success ? '#10b981' : '#ef4444' }}>
              {simulation.success ? 'ROUTING COMPLETE' : 'ROUTING FAILED'}
            </motion.span>
            <motion.span initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.22 }}
              style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.14em', marginTop: 7, color: simulation.success ? 'rgba(110,231,183,0.65)' : 'rgba(252,165,165,0.65)' }}>
              {simulation.success ? 'ALL NODES ONLINE' : 'PACKET LOSS DETECTED — REROUTE REQUIRED'}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
