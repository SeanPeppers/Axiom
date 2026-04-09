import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Share2, RotateCcw, Eye, Check } from 'lucide-react'
import { buildShareText, copyToClipboard } from '../utils/share'

export function ResultCard({ dayNumber, attempts, gameStatus, onReset, onShowSolution, isRandom }) {
  const [copied, setCopied] = useState(false)
  const cardRef = useRef(null)
  const won = gameStatus === 'won'

  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const shareText = buildShareText(dayNumber, attempts, won, isRandom)

  const handleShare = async () => {
    const ok = await copyToClipboard(shareText)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <motion.div
      ref={cardRef}
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
          {isRandom
            ? (won ? `AXIOM RANDOM · ${attempts.length}/3 compiles` : 'AXIOM RANDOM · 0/3 remaining')
            : (won ? `AXIOM #${dayNumber} · Compiled in ${attempts.length}/3` : `AXIOM #${dayNumber} · 0 compiles remaining`)}
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
            {attempt.routingPassed === true  && <span style={{ fontSize: 12, marginLeft: 4 }}>🔗</span>}
            {attempt.routingPassed === false && <span style={{ fontSize: 12, marginLeft: 4 }}>🔴</span>}
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

      {/* Share text — always visible */}
      <div style={{ marginTop: 14 }}>
        <div style={{
          fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
          color: 'rgba(148,163,184,0.4)', letterSpacing: '0.14em', marginBottom: 5,
        }}>
          {copied ? '✓ COPIED TO CLIPBOARD' : 'SHARE TEXT'}
        </div>
        <pre style={{
          margin: 0,
          padding: '10px 12px',
          borderRadius: 6,
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(99,102,241,0.15)',
          fontSize: 14,
          lineHeight: 1.7,
          color: 'rgba(226,232,240,0.85)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          userSelect: 'all',
          cursor: 'text',
        }}>
          {shareText}
        </pre>
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
