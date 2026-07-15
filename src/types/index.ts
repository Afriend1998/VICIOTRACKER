export type Category = 'energy-drink' | 'coffee' | 'alcohol' | 'tobacco' | 'food'

export interface HealthMetrics {
  caffeine?: number  // mg por unidad
  calories?: number  // kcal por unidad
  sugar?: number     // g por unidad
}

export interface Vice {
  id: string
  name: string
  emoji: string
  unitPrice: number
  category: Category
  healthMetrics: HealthMetrics
  dailyLimit?: number
  createdAt: string
}

export interface Tap {
  viceId: string
  timestamp: string
  priceAtTap: number
}

export interface Settings {
  currency: string
  annualReturn: number
  startDate: string
  notificationsEnabled?: boolean
}

export interface AppData {
  version: string
  vices: Vice[]
  taps: Tap[]
  settings: Settings
}

export type Period = 'today' | 'week' | 'month' | 'year' | 'all'

export type HealthKey = 'caffeine' | 'calories' | 'sugar'
