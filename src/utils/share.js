const CONSTRAINT_EMOJI = { satisfied: '🟩', violated: '🟥', pending: '⬜', evaluating: '⬜' }

/**
 * Generates the shareable text for a completed game.
 *
 * Format (inspired by Wordle / Connections):
 *   AXIOM #42  2/3 ⚡
 *
 *   🟥🟩🟩🟩🟥
 *   🟩🟩🟩🟩🟩  🔗
 *
 *   axiom.game
 *
 * Routing result appended to the row when simulation ran:
 *   🔗 = routing passed   🔴 = routing failed (constraints passed but path broken)
 *
 * @param {number}  dayNumber
 * @param {Array}   attempts   – [{ results: [{status}], correct, routingPassed }]
 * @param {boolean} won
 * @param {boolean} isRandom   – true for random-mode games
 */
export function buildShareText(dayNumber, attempts, won, isRandom = false) {
  const label  = isRandom ? 'AXIOM RANDOM' : `AXIOM #${dayNumber}`
  const score  = won ? `${attempts.length}/3 ⚡` : 'X/3'
  const header = `${label}  ${score}`

  const rows = attempts.map((attempt) => {
    const squares = attempt.results.map((r) => CONSTRAINT_EMOJI[r.status] ?? '⬜').join('')
    if (attempt.routingPassed === true)  return `${squares}  🔗`
    if (attempt.routingPassed === false) return `${squares}  🔴`
    return squares
  })

  return [header, '', ...rows, '', 'axiom.game'].join('\n')
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers / non-HTTPS
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}
