/**
 * Pure presentational component – renders the correct SVG shape for an entity.
 * `size` is both width and height of the bounding box.
 */
export function TokenShape({ entity, size = 64, dimmed = false }) {
  const { shape, colors, abbr } = entity
  const s = size
  const cx = s / 2
  const cy = s / 2
  const opacity = dimmed ? 0.35 : 1
  const glowStrength = dimmed ? '4px' : '10px'
  const strokeWidth = dimmed ? 1.5 : 2

  const dropShadow = `drop-shadow(0 0 ${glowStrength} ${colors.glow}${dimmed ? '50' : '99'})`

  if (shape === 'square') {
    const pad = s * 0.1
    const w = s - pad * 2
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ opacity, filter: dropShadow, overflow: 'visible' }}>
        <rect
          x={pad} y={pad} width={w} height={w}
          rx={s * 0.06}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
        />
        <text
          x={cx} y={cy + 1}
          textAnchor="middle" dominantBaseline="middle"
          fill={colors.text}
          fontSize={s * 0.24}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="500"
        >
          {abbr}
        </text>
      </svg>
    )
  }

  if (shape === 'circle') {
    const r = s * 0.42
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ opacity, filter: dropShadow, overflow: 'visible' }}>
        <circle
          cx={cx} cy={cy} r={r}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
        />
        <text
          x={cx} y={cy + 1}
          textAnchor="middle" dominantBaseline="middle"
          fill={colors.text}
          fontSize={s * 0.24}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="500"
        >
          {abbr}
        </text>
      </svg>
    )
  }

  if (shape === 'hexagon') {
    const r = s * 0.44
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    }).join(' ')
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ opacity, filter: dropShadow, overflow: 'visible' }}>
        <polygon
          points={pts}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
        />
        <text
          x={cx} y={cy + 1}
          textAnchor="middle" dominantBaseline="middle"
          fill={colors.text}
          fontSize={s * 0.24}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="500"
        >
          {abbr}
        </text>
      </svg>
    )
  }

  if (shape === 'triangle') {
    const margin = s * 0.08
    const pts = [
      `${cx},${margin}`,
      `${s - margin},${s - margin}`,
      `${margin},${s - margin}`,
    ].join(' ')
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ opacity, filter: dropShadow, overflow: 'visible' }}>
        <polygon
          points={pts}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
        />
        <text
          x={cx} y={cy + s * 0.1}
          textAnchor="middle" dominantBaseline="middle"
          fill={colors.text}
          fontSize={s * 0.22}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="500"
        >
          {abbr}
        </text>
      </svg>
    )
  }

  if (shape === 'diamond') {
    const pad = s * 0.08
    const pts = [
      `${cx},${pad}`,
      `${s - pad},${cy}`,
      `${cx},${s - pad}`,
      `${pad},${cy}`,
    ].join(' ')
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ opacity, filter: dropShadow, overflow: 'visible' }}>
        <polygon
          points={pts}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
        />
        <text
          x={cx} y={cy + 1}
          textAnchor="middle" dominantBaseline="middle"
          fill={colors.text}
          fontSize={s * 0.22}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="500"
        >
          {abbr}
        </text>
      </svg>
    )
  }

  return null
}
