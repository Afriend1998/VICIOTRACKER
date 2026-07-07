import type { Tap } from '../types'

export type Period = 'today' | 'week' | 'month' | 'year' | 'all'

/** Valor futuro con DCA mensual e interés compuesto */
export function calculateFV(pmt: number, annualRate: number, months: number): number {
  if (pmt <= 0 || months <= 0) return 0
  if (annualRate === 0) return pmt * months
  const r = annualRate / 12
  return pmt * ((Math.pow(1 + r, months) - 1) / r)
}

/** Gasto mensual promedio desde el primer tap */
export function getMonthlySpend(taps: Tap[], viceId?: string): number {
  const filtered = viceId ? taps.filter(t => t.viceId === viceId) : taps
  if (filtered.length === 0) return 0
  const sorted = [...filtered].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const diffMs = Date.now() - new Date(sorted[0].timestamp).getTime()
  const diffMonths = Math.max(diffMs / (1000 * 60 * 60 * 24 * 30.44), 1)
  const total = filtered.reduce((s, t) => s + t.priceAtTap, 0)
  return total / diffMonths
}

export function getTotalSpent(taps: Tap[], period: Period, viceId?: string): number {
  const filtered = viceId ? taps.filter(t => t.viceId === viceId) : taps
  const now = new Date()
  return filtered
    .filter(t => {
      const d = new Date(t.timestamp)
      switch (period) {
        case 'today': return d.toDateString() === now.toDateString()
        case 'week': { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w }
        case 'month': { const m = new Date(now); m.setMonth(now.getMonth() - 1); return d >= m }
        case 'year': { const y = new Date(now); y.setFullYear(now.getFullYear() - 1); return d >= y }
        default: return true
      }
    })
    .reduce((s, t) => s + t.priceAtTap, 0)
}

export function getDailyTaps(taps: Tap[], viceId: string): number {
  const today = new Date().toDateString()
  return taps.filter(t => t.viceId === viceId && new Date(t.timestamp).toDateString() === today).length
}

export interface Projection {
  y1: number; y5: number; y10: number; y20: number
}

export function getProjections(monthlySpend: number): {
  conservative: Projection
  medium: Projection
  aggressive: Projection
} {
  const proj = (rate: number): Projection => ({
    y1: calculateFV(monthlySpend, rate, 12),
    y5: calculateFV(monthlySpend, rate, 60),
    y10: calculateFV(monthlySpend, rate, 120),
    y20: calculateFV(monthlySpend, rate, 240),
  })
  return {
    conservative: proj(0.05),
    medium: proj(0.08),
    aggressive: proj(0.12),
  }
}

export interface ChartPoint {
  date: string
  spent: number
  invested: number
}

export function getChartData(taps: Tap[], annualRate: number): ChartPoint[] {
  if (taps.length === 0) return []
  const sorted = [...taps].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const firstDate = new Date(sorted[0].timestamp)
  const now = new Date()
  const points: ChartPoint[] = []

  for (let m = 0; m <= 48; m++) {
    const date = new Date(firstDate)
    date.setMonth(date.getMonth() + m)
    if (date > now) break

    const spentSoFar = sorted
      .filter(t => new Date(t.timestamp) <= date)
      .reduce((s, t) => s + t.priceAtTap, 0)

    const months = Math.max(m, 1)
    const monthly = spentSoFar / months
    points.push({
      date: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
      spent: Math.round(spentSoFar * 100) / 100,
      invested: Math.round(calculateFV(monthly, annualRate, months) * 100) / 100,
    })
  }
  return points
}
