import type { Tap, Vice } from '../types'

export function getStreak(vice: Vice, taps: Tap[]): number {
  const viceTaps = taps.filter(t => t.viceId === vice.id)
  const limit = vice.dailyLimit ?? Infinity
  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toDateString()
    const dayCount = viceTaps.filter(t => new Date(t.timestamp).toDateString() === dateStr).length
    if (dayCount <= limit) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function getBestStreak(vice: Vice, taps: Tap[]): number {
  const viceTaps = taps.filter(t => t.viceId === vice.id)
  if (viceTaps.length === 0) return 0
  const limit = vice.dailyLimit ?? Infinity
  const sorted = [...viceTaps].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  const firstDate = new Date(sorted[0].timestamp)
  const today = new Date()
  const daysDiff = Math.ceil((today.getTime() - firstDate.getTime()) / 86400000) + 1
  let best = 0
  let current = 0
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(firstDate)
    date.setDate(firstDate.getDate() + i)
    const dayCount = viceTaps.filter(t => new Date(t.timestamp).toDateString() === date.toDateString()).length
    if (dayCount <= limit) { current++; best = Math.max(best, current) }
    else { current = 0 }
  }
  return best
}

export function evaluateChallenge(challenge: { viceId: string; startDate: string; daysTarget: number }, taps: Tap[]): 'active' | 'won' | 'lost' {
  const start = new Date(challenge.startDate)
  const end = new Date(start)
  end.setDate(start.getDate() + challenge.daysTarget)
  const now = new Date()
  const failed = taps.some(t =>
    t.viceId === challenge.viceId &&
    new Date(t.timestamp) >= start &&
    new Date(t.timestamp) <= (now < end ? now : end)
  )
  if (failed) return 'lost'
  if (now >= end) return 'won'
  return 'active'
}
