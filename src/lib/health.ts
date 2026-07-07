import type { Tap, Vice, HealthKey } from '../types'

export const THRESHOLDS: Record<HealthKey, { daily: number; label: string; unit: string; color: string }> = {
  caffeine: { daily: 400, label: 'Cafeína', unit: 'mg', color: '#f59e0b' },
  calories: { daily: 200, label: 'Calorías extra', unit: 'kcal', color: '#ef4444' },
  sugar: { daily: 25, label: 'Azúcar añadido', unit: 'g', color: '#ec4899' },
}

function sumHealth(taps: Tap[], vices: Vice[]): Record<HealthKey, number> {
  const totals: Record<HealthKey, number> = { caffeine: 0, calories: 0, sugar: 0 }
  for (const tap of taps) {
    const vice = vices.find(v => v.id === tap.viceId)
    if (!vice) continue
    totals.caffeine += vice.healthMetrics.caffeine ?? 0
    totals.calories += vice.healthMetrics.calories ?? 0
    totals.sugar += vice.healthMetrics.sugar ?? 0
  }
  return totals
}

export function getWeeklyHealth(taps: Tap[], vices: Vice[]): Record<HealthKey, number> {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return sumHealth(taps.filter(t => new Date(t.timestamp) >= weekAgo), vices)
}

export function getDailyHealth(taps: Tap[], vices: Vice[]): Record<HealthKey, number> {
  const today = new Date().toDateString()
  return sumHealth(taps.filter(t => new Date(t.timestamp).toDateString() === today), vices)
}

export function getStreak(taps: Tap[], viceId: string): number {
  const todayStr = new Date().toDateString()
  const tappedToday = taps.some(
    t => t.viceId === viceId && new Date(t.timestamp).toDateString() === todayStr
  )
  if (tappedToday) return 0

  let streak = 0
  const current = new Date()
  current.setHours(0, 0, 0, 0)

  for (let i = 1; i <= 365; i++) {
    current.setDate(current.getDate() - 1)
    const dayStr = current.toDateString()
    const tappedThatDay = taps.some(
      t => t.viceId === viceId && new Date(t.timestamp).toDateString() === dayStr
    )
    if (tappedThatDay) break
    streak++
  }
  return streak
}

export const STREAK_MILESTONES = [3, 7, 30, 90] as const
export type StreakMilestone = (typeof STREAK_MILESTONES)[number]
