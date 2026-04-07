import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, RotateCcw, Eye, Check } from 'lucide-react'
import { buildShareText, copyToClipboard } from '../utils/share'

export function ResultCard({ dayNumber, attempts, gameStatus, onReset, onShowSolution }) {
  const [copied, setCopied] = useState(false)
  const won = gameStatus === 'won'

  const handleShare = async () => {
    const text = buildShareText(dayNumber, attempts, won)
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28, delay: 0.1 }}
      style={{
        padding: '20px 22px',
        borderRadius: 10,
        border: `1px solid ${won ? 'rgba(16,185,129,0.45)' : 'rgba(239,68,68,0.35)'}`,
        background: won ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer on win */}
      {won && (
        <motion.div
          initial={{ x: '-110%' }} animate={{ x: '110%' }}
          transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.2 }}
          style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.1), transparent)', pointerEvents: 'none' }}
        />
      )}

      {/* Status heading */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 22, marginBottom: 4 }}>{won ? '✓' : '✗'}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: won ? '#6ee7b7' : '#fca5a5', letterSpacing: '0.03em' }}>
          {won ? 'All axioms satisfied' : 'System corrupted'}
        </div>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: won ? 'rgba(110,231,183,0.55)' : 'rgba(252,165,165,0.5)', marginTop: 3, letterSpacing: '0.1em' }}>
          {won ? `AXIOM #${dayNumber} · Compiled in ${attempts.length}/3` : `AXIOM #${dayNumber} · 0 compiles remaining`}
        </div>
      </div>

      {/* Attempt history */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
        {attempts.map((attempt, i) => (
          <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(148,163,184,0.4)', width: 18 }}>
              #{i + 1}
            </span>
            {attempt.results.map((r, j) => (
              <span key={j} style={{ fontSize: 15 }}>
                {r.status === 'satisfied' ? '🟩' : '🟥'}
              </span>
            ))}
            {attempt.correct && (
              <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#6ee7b7', marginLeft: 4 }}>✓ PASS</span>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={handleShare}
          style={btnStyle(won ? '#10b981' : '#ef4444', copied)}
        >
          {copied ? <Check size={12} /> : <Share2 size={12} />}
          {copied ? 'COPIED!' : 'SHARE'}
        </button>

        {!won && (
          <button onClick={onShowSolution} style={btnStyle('#6366f1', false)}>
            <Eye size={12} />
            SOLUTION
          </button>
        )}

        <button onClick={onReset} style={btnStyle('#64748b', false)}>
          <RotateCcw size={12} />
          RETRY
        </button>
      </div>
    </motion.div>
  )
}

function btnStyle(accent, active) {
  return {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 6,
    border: `1px solid ${accent}${active ? 'cc' : '40'}`,
    background: `${accent}${active ? '22' : '0d'}`,
    color: active ? '#fff' : `${accent}cc`,
    cursor: 'pointer', fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.1em', fontWeight: 500,
    transition: 'all 0.15s',
  }
}
