import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Terminal, Shuffle } from 'lucide-react'
import { useSizes } from '../contexts/SizeContext'

const DIFF_COLORS = {
  BASIC:    { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.28)', text: '#a5b4fc' },
  STANDARD: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.28)', text: '#fcd34d' },
  ADVANCED: { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.28)',  text: '#fca5a5' },
}

export function GameHeader({ puzzle, dayNumber, gameStatus, mode, onModeChange, onNewRandom, onReset }) {
  const diff    = DIFF_COLORS[puzzle.difficulty] ?? DIFF_COLORS.BASIC
  const isDaily = mode === 'daily'
  const { isMobile } = useSizes()

  return (
    <header style={{
      borderBottom: '1px solid rgba(99,102,241,0.12)',
      background: 'rgba(6,11,24,0.97)',
      backdropFilter: 'blur(8px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 960, margin: '0 auto', padding: isMobile ? '0 12px' : '0 24px',
        height: isMobile ? 46 : 54, display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Terminal size={isMobile ? 13 : 15} color="#6366f1" />
          <span style={{ fontSize: isMobile ? 13 : 15, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: '#e2e8f0', letterSpacing: '0.14em' }}>
            AXIOM
          </span>
        </div>

        <div style={{ width: 1, height: 16, background: 'rgba(99,102,241,0.2)' }} />

        {/* Daily number / RANDOM label */}
        {isDaily ? (
          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(148,163,184,0.5)', letterSpacing: '0.1em' }}>
            #{dayNumber}
          </span>
        ) : (
          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(245,158,11,0.6)', letterSpacing: '0.1em' }}>
            RAND
          </span>
        )}

        {/* Puzzle title – hidden on mobile */}
        {!isMobile && (
          <span style={{ fontSize: 13, color: 'rgba(226,232,240,0.85)', fontWeight: 500 }}>
            {puzzle.title}
          </span>
        )}

        {/* Difficulty – hidden on mobile */}
        {!isMobile && (
          <div style={{ padding: '3px 9px', borderRadius: 20, background: diff.bg, border: `1px solid ${diff.border}` }}>
            <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: diff.text, letterSpacing: '0.14em' }}>
              {puzzle.difficulty}
            </span>
          </div>
        )}

        {/* Status badge – hidden on mobile to save space */}
        <AnimatePresence>
          {gameStatus !== 'playing' && !isMobile && (
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

        {/* Mode toggle */}
        <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.22)' }}>
          {['daily', 'random'].map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              style={{
                padding: isMobile ? '4px 8px' : '4px 10px',
                background: mode === m ? 'rgba(99,102,241,0.18)' : 'transparent',
                color: mode === m ? '#a5b4fc' : 'rgba(148,163,184,0.45)',
                border: 'none', cursor: 'pointer',
                fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.12em', fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              {m === 'daily' ? 'DAILY' : (isMobile ? 'RNG' : 'RANDOM')}
            </button>
          ))}
        </div>

        {/* New Random button – only in random mode */}
        {!isDaily && (
          <button
            onClick={onNewRandom}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: isMobile ? '5px 8px' : '5px 11px', borderRadius: 6,
              border: '1px solid rgba(245,158,11,0.28)', background: 'rgba(245,158,11,0.06)',
              color: 'rgba(253,211,77,0.75)', cursor: 'pointer',
              fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.14)'; e.currentTarget.style.color = '#fcd34d' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; e.currentTarget.style.color = 'rgba(253,211,77,0.75)' }}
          >
            <Shuffle size={11} />
            {!isMobile && 'NEW'}
          </button>
        )}

        {/* Reset — hidden when game is over (ResultCard has its own RETRY) */}
        {gameStatus === 'playing' && (
          <button
            onClick={onReset}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: isMobile ? '5px 8px' : '5px 12px', borderRadius: 6,
              border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)',
              color: 'rgba(165,180,252,0.7)', cursor: 'pointer',
              fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.14)'; e.currentTarget.style.color = '#a5b4fc' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.color = 'rgba(165,180,252,0.7)' }}
          >
            <RotateCcw size={11} />
            {!isMobile && 'RESET'}
          </button>
        )}
      </div>
    </header>
  )
}
