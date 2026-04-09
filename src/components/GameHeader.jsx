import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Terminal } from 'lucide-react'

const DIFF_COLORS = {
  BASIC:    { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.28)', text: '#a5b4fc' },
  STANDARD: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.28)', text: '#fcd34d' },
  ADVANCED: { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.28)',  text: '#fca5a5' },
}

export function GameHeader({ puzzle, dayNumber, gameStatus, onReset }) {
  const diff = DIFF_COLORS[puzzle.difficulty] ?? DIFF_COLORS.BASIC

  return (
    <header style={{
      borderBottom: '1px solid rgba(99,102,241,0.12)',
      background: 'rgba(6,11,24,0.97)',
      backdropFilter: 'blur(8px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 960, margin: '0 auto', padding: '0 24px',
        height: 54, display: 'flex', alignItems: 'center', gap: 14,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={15} color="#6366f1" />
          <span style={{ fontSize: 15, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: '#e2e8f0', letterSpacing: '0.14em' }}>
            AXIOM
          </span>
        </div>

        <div style={{ width: 1, height: 18, background: 'rgba(99,102,241,0.2)' }} />

        {/* Daily number */}
        <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(148,163,184,0.5)', letterSpacing: '0.1em' }}>
          #{dayNumber}
        </span>

        {/* Puzzle title */}
        <span style={{ fontSize: 13, color: 'rgba(226,232,240,0.85)', fontWeight: 500 }}>
          {puzzle.title}
        </span>

        {/* Difficulty */}
        <div style={{ padding: '3px 9px', borderRadius: 20, background: diff.bg, border: `1px solid ${diff.border}` }}>
          <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: diff.text, letterSpacing: '0.14em' }}>
            {puzzle.difficulty}
          </span>
        </div>

        {/* Status badge */}
        <AnimatePresence>
          {gameStatus !== 'playing' && (
            <motion.div
              key="status"
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              style={{
                padding: '3px 9px', borderRadius: 20,
                background: gameStatus === 'won'
                  ? 'rgba(16,185,129,0.1)'
                  : gameStatus === 'simulating'
                  ? 'rgba(99,102,241,0.1)'
                  : 'rgba(239,68,68,0.1)',
                border: `1px solid ${gameStatus === 'won'
                  ? 'rgba(16,185,129,0.38)'
                  : gameStatus === 'simulating'
                  ? 'rgba(99,102,241,0.38)'
                  : 'rgba(239,68,68,0.38)'}`,
              }}
            >
              <span style={{
                fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.14em',
                color: gameStatus === 'won' ? '#6ee7b7' : gameStatus === 'simulating' ? '#a5b4fc' : '#fca5a5',
              }}>
                {gameStatus === 'won' ? 'SOLVED ✓' : gameStatus === 'simulating' ? 'ROUTING...' : 'CORRUPTED'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ flex: 1 }} />

        {/* Reset */}
        <button
          onClick={onReset}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 6,
            border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)',
            color: 'rgba(165,180,252,0.7)', cursor: 'pointer',
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.14)'; e.currentTarget.style.color = '#a5b4fc' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.color = 'rgba(165,180,252,0.7)' }}
        >
          <RotateCcw size={11} />
          RESET
        </button>
      </div>
    </header>
  )
}
