import type { Vice, Tap, Settings } from '../types'

export function getMonthCount(taps: Tap[], viceId: string, monthOffset = 0): number {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const nextMonth = new Date(target.getFullYear(), target.getMonth() + 1, 1)
  return taps.filter(t => {
    const d = new Date(t.timestamp)
    return t.viceId === viceId && d >= target && d < nextMonth
  }).length
}

export interface GoalProgress {
  current: number
  previous: number
  goal: number | null
  improved: boolean
  percentToGoal: number | null
}

export function getGoalProgress(vice: Vice, taps: Tap[]): GoalProgress {
  const current = getMonthCount(taps, vice.id, 0)
  const previous = getMonthCount(taps, vice.id, -1)
  const goal = vice.monthlyGoal ?? null
  const improved = current <= previous
  const percentToGoal = goal != null && previous > 0
    ? Math.max(0, Math.min(100, Math.round(((previous - current) / (previous - goal)) * 100)))
    : goal != null
    ? current <= goal ? 100 : 0
    : null
  return { current, previous, goal, improved, percentToGoal }
}

// Score 0–100 por vicio individual: 0 = muy enganchado, 100 = genial
export function getAddictionScore(vice: Vice, taps: Tap[]): number {
  const current = getMonthCount(taps, vice.id, 0)
  const previous = getMonthCount(taps, vice.id, -1)

  if (vice.monthlyGoal != null && vice.monthlyGoal > 0) {
    return Math.max(0, Math.min(100, Math.round(100 - (current / vice.monthlyGoal) * 50)))
  }
  if (previous > 0) {
    return Math.max(0, Math.min(100, Math.round(100 - (current / previous) * 50)))
  }
  return current === 0 ? 80 : 50
}

// Returns 0–100: 100 = perfectamente bien, 0 = muy mal
export function getProgressScore(vices: Vice[], taps: Tap[], settings: Settings): number {
  if (settings.hideMode === 'manual') return Math.min(100, Math.max(0, settings.manualProgress ?? 50))

  const scores = vices.map(vice => {
    const current = getMonthCount(taps, vice.id, 0)
    const ref = vice.monthlyGoal ?? getMonthCount(taps, vice.id, -1)
    if (ref === 0) return current === 0 ? 100 : 30
    return Math.max(0, Math.min(100, Math.round(100 - (current / ref) * 50)))
  })

  if (scores.length === 0) return 50
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

export function getQualitativeStatus(taps: Tap[]): 'bien' | 'mal' | 'neutral' {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)

  const thisSpend = taps
    .filter(t => new Date(t.timestamp) >= thisMonth)
    .reduce((s, t) => s + (t.priceAtTap ?? 0), 0)
  const prevSpend = taps
    .filter(t => { const d = new Date(t.timestamp); return d >= lastMonth && d < lastMonthEnd })
    .reduce((s, t) => s + (t.priceAtTap ?? 0), 0)

  if (prevSpend === 0) return 'neutral'
  return thisSpend <= prevSpend ? 'bien' : 'mal'
}
