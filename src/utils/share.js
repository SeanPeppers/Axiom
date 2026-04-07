const STATUS_EMOJI = { satisfied: '🟩', violated: '🟥', pending: '⬜' }

/**
 * Generates the shareable text for a completed game.
 * @param {number} dayNumber  – daily puzzle number (#42, etc.)
 * @param {Array}  attempts   – array of { results: [{status}], correct: bool }
 * @param {boolean} won
 */
export function buildShareText(dayNumber, attempts, won) {
  const lines = [`AXIOM #${dayNumber}`]

  for (const attempt of attempts) {
    lines.push(attempt.results.map((r) => STATUS_EMOJI[r.status] ?? '⬜').join(''))
  }

  if (won) {
    lines.push(`Solved in ${attempts.length}/3 compiles`)
  } else {
    lines.push('System corrupted (0/3 remaining)')
  }

  return lines.join('\n')
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
