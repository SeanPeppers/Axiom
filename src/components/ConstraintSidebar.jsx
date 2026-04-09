import { useRef, useEffect, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Zap, GitBranch, Scan } from 'lucide-react'
import { ENTITIES, getEntity } from '../data/entities'
import { R } from '../engine/logicEngine'

// ── status display config ─────────────────────────────────────────────────────

const STATUS = {
  satisfied: {
    Icon: CheckCircle,
    iconColor: '#10b981',
    border: 'rgba(16,185,129,0.38)',
    bg: 'rgba(16,185,129,0.05)',
    label: 'PASS',
    labelColor: '#6ee7b7',
  },
  violated: {
    Icon: XCircle,
    iconColor: '#ef4444',
    border: 'rgba(239,68,68,0.42)',
    bg: 'rgba(239,68,68,0.05)',
    label: 'FAIL',
    labelColor: '#fca5a5',
  },
  pending: {
    Icon: Clock,
    iconColor: 'rgba(148,163,184,0.38)',
    border: 'rgba(99,102,241,0.16)',
    bg: 'transparent',
    label: '—',
    labelColor: 'rgba(148,163,184,0.3)',
  },
  // Hidden until COMPILE is pressed
  evaluating: {
    Icon: Scan,
    iconColor: 'rgba(99,102,241,0.45)',
    border: 'rgba(99,102,241,0.14)',
    bg: 'transparent',
    label: 'EVAL',
    labelColor: 'rgba(99,102,241,0.4)',
  },
}

// ── progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ constraints }) {
  const satisfied = constraints.filter((c) => c.status === 'satisfied').length
  const total = constraints.length
  const anyRevealed = constraints.some((c) => c.status !== 'evaluating')
  const pct = anyRevealed ? (satisfied / total) * 100 : 0
  const color = satisfied === total && anyRevealed ? '#10b981' : satisfied >= Math.ceil(total / 2) ? '#f59e0b' : '#6366f1'

  return (
    <div style={{ height: 3, background: 'rgba(99,102,241,0.1)', borderRadius: 99, overflow: 'hidden', marginTop: 10 }}>
      <motion.div
        style={{ height: '100%', borderRadius: 99, background: color }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      />
    </div>
  )
}

// ── sidebar ───────────────────────────────────────────────────────────────────

export function ConstraintSidebar({ constraints, revealKey, puzzle, hoveredEntityId, isMobile, mobileWidth }) {
  const satisfied = constraints.filter((c) => c.status === 'satisfied').length
  const total = constraints.length
  const anyRevealed = constraints.some((c) => c.status !== 'evaluating')

  return (
    <aside style={{ width: isMobile ? mobileWidth : 292, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>

      {/* Header */}
      <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(99,102,241,0.14)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={13} color="#6366f1" />
          <span style={{
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
            color: 'rgba(148,163,184,0.55)', letterSpacing: '0.16em',
          }}>
            AXIOM CONSTRAINTS
          </span>
          <div style={{ flex: 1 }} />
          <span style={{
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            color: !anyRevealed ? 'rgba(99,102,241,0.4)' : satisfied === total ? '#6ee7b7' : 'rgba(148,163,184,0.4)',
            transition: 'color 0.4s',
          }}>
            {anyRevealed ? `${satisfied}/${total}` : '?/?'}
          </span>
        </div>
        <ProgressBar constraints={constraints} />

        {/* Hint text before first compile */}
        {!anyRevealed && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{
              margin: '10px 0 0', fontSize: 11, lineHeight: 1.5,
              color: 'rgba(99,102,241,0.55)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.06em',
            }}
          >
            Results hidden until you COMPILE.
          </motion.p>
        )}
      </div>

      {/* Scenario */}
      {puzzle?.scenario && (
        <p style={{
          margin: 0, fontSize: 12, lineHeight: 1.6,
          color: 'rgba(148,163,184,0.48)', fontStyle: 'italic',
          paddingBottom: 6, borderBottom: '1px solid rgba(99,102,241,0.08)',
        }}>
          {puzzle.scenario}
        </p>
      )}

      {/* Constraint cards */}
      {constraints.map((c, i) => (
        <ConstraintCard
          key={`${c.id}-${revealKey}`}
          constraint={c}
          index={i}
          revealKey={revealKey}
          hoveredEntityId={hoveredEntityId}
        />
      ))}

      <EntityRegistry />
    </aside>
  )
}

// ── constraint card ───────────────────────────────────────────────────────────

function ConstraintCard({ constraint, index, revealKey, hoveredEntityId }) {
  const { status, type, text, entities } = constraint
  const cfg = STATUS[status] ?? STATUS.evaluating
  const { Icon } = cfg

  const isEvaluating = status === 'evaluating'

  // Gossip highlight – glow when a hovered entity is involved in this constraint
  const isGossip = hoveredEntityId != null && entities?.includes(hoveredEntityId)

  // Detect status changes (post-compile transitions) for flash effect
  const prevStatusRef = useRef(status)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (prevStatusRef.current !== status && prevStatusRef.current !== null) {
      prevStatusRef.current = status
      if (status !== 'evaluating') {
        setFlash(true)
        const t = setTimeout(() => setFlash(false), 500)
        return () => clearTimeout(t)
      }
    }
    prevStatusRef.current = status
  }, [status])

  // Pulsing glow for violated
  const pulseControls = useAnimationControls()
  useEffect(() => {
    if (status === 'violated') {
      pulseControls.start({
        boxShadow: ['0 0 0px rgba(239,68,68,0)', '0 0 18px rgba(239,68,68,0.32)', '0 0 0px rgba(239,68,68,0)'],
        transition: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' },
      })
    } else {
      pulseControls.start({
        boxShadow: status === 'satisfied' ? '0 0 8px rgba(16,185,129,0.1)' : '0 0 0px rgba(0,0,0,0)',
        transition: { duration: 0.35 },
      })
    }
  }, [status, pulseControls])

  return (
    <motion.div
      animate={pulseControls}
      // Staggered slide-in — re-triggers on each new compile via key change
      initial={{ opacity: 0, x: 14 }}
      whileInView={{
        opacity: 1, x: 0,
        transition: { delay: index * 0.07, type: 'spring', stiffness: 380, damping: 30 },
      }}
      viewport={{ once: false, amount: 0.1 }}
      style={{
        padding: '11px 13px', borderRadius: 8,
        border: isGossip
          ? '1px solid rgba(251,191,36,0.55)'
          : `1px solid ${cfg.border}`,
        background: flash
          ? (status === 'satisfied' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)')
          : isGossip
          ? 'rgba(251,191,36,0.05)'
          : cfg.bg,
        boxShadow: isGossip ? '0 0 12px rgba(251,191,36,0.15)' : undefined,
        display: 'flex', gap: 10, alignItems: 'flex-start',
        position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        borderRadius: '8px 0 0 8px',
        background: cfg.iconColor,
        opacity: isEvaluating ? 0.3 : status === 'pending' ? 0.2 : 0.7,
        transition: 'background 0.35s, opacity 0.35s',
      }} />

      {/* Status icon – re-mounts on each status change for the pop animation */}
      <motion.div
        key={status}
        initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 480, damping: 22 }}
        style={{ marginTop: 1, flexShrink: 0, paddingLeft: 4 }}
      >
        {isEvaluating ? (
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <Icon size={14} color={cfg.iconColor} />
          </motion.div>
        ) : (
          <Icon size={14} color={cfg.iconColor} />
        )}
      </motion.div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Conditional indicator */}
        {type === R.CONDITIONAL && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <GitBranch size={9} color="rgba(148,163,184,0.38)" />
          </div>
        )}

        {/* Constraint text */}
        <p style={{
          margin: 0, fontSize: 12.5, lineHeight: 1.55,
          color: isEvaluating
            ? 'rgba(148,163,184,0.55)'
            : status === 'satisfied'
            ? 'rgba(148,163,184,0.55)'
            : status === 'violated'
            ? 'rgba(226,232,240,0.92)'
            : 'rgba(148,163,184,0.65)',
          textDecoration: status === 'satisfied' ? 'line-through' : 'none',
          textDecorationColor: 'rgba(16,185,129,0.4)',
          textDecorationThickness: 1,
          transition: 'color 0.35s',
        }}>
          {text}
        </p>

        {/* Entity pills */}
        {entities?.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            {entities.map((id) => {
              const e = getEntity(id)
              if (!e) return null
              const dim = status === 'satisfied' || isEvaluating
              return (
                <span key={id} style={{
                  fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                  padding: '2px 7px', borderRadius: 4,
                  border: `1px solid ${e.colors.stroke}${dim ? '28' : '48'}`,
                  color: dim ? e.colors.dimText : e.colors.text,
                  background: e.colors.fill, letterSpacing: '0.08em',
                  transition: 'color 0.35s, border-color 0.35s',
                }}>
                  {e.abbr}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Status badge */}
      <span style={{
        fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.1em', color: cfg.labelColor,
        flexShrink: 0, marginTop: 1,
        transition: 'color 0.35s',
      }}>
        {cfg.label}
      </span>

      {/* Scan line that sweeps across on reveal (when revealKey changes) */}
      {!isEvaluating && revealKey > 0 && (
        <motion.div
          key={`scan-${revealKey}-${index}`}
          initial={{ x: '-110%' }}
          animate={{ x: '110%' }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: index * 0.09 }}
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `linear-gradient(90deg, transparent, ${cfg.iconColor}22, transparent)`,
          }}
        />
      )}
    </motion.div>
  )
}

// ── entity registry ───────────────────────────────────────────────────────────

function EntityRegistry() {
  return (
    <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
      <div style={{
        fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
        color: 'rgba(148,163,184,0.3)', letterSpacing: '0.16em', marginBottom: 8,
      }}>
        ENTITY REGISTRY
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ENTITIES.map((e) => (
          <div key={e.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '4px 10px', borderRadius: 6, background: 'rgba(13,21,38,0.5)',
          }}>
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: e.colors.stroke, width: 20 }}>
              {e.abbr}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)' }}>{e.label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(148,163,184,0.28)', textTransform: 'capitalize', fontFamily: "'JetBrains Mono', monospace" }}>
              {e.shape}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
