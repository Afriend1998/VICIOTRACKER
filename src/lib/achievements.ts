import type { AppData } from '../types'
import { getStreak } from './streaks'

export interface AchievementDef {
  id: string
  emoji: string
  name: string
  desc: string
  check: (data: AppData) => boolean
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-tap',    emoji: '🎯', name: 'Primer registro',   desc: 'Registraste tu primer consumo',          check: d => d.taps.length >= 1 },
  { id: 'taps-50',      emoji: '📊', name: '50 registros',      desc: 'Llevas 50 consumos anotados',            check: d => d.taps.length >= 50 },
  { id: 'taps-100',     emoji: '💯', name: '100 registros',     desc: '100 consumos. Empieza a contar.',        check: d => d.taps.length >= 100 },
  { id: 'spend-10',     emoji: '💸', name: '10€ registrados',   desc: 'Tu primer décimo en vicios',             check: d => d.taps.reduce((s, t) => s + t.priceAtTap, 0) >= 10 },
  { id: 'spend-100',    emoji: '💰', name: '100€ registrados',  desc: '¿Ya te lo estás pensando?',             check: d => d.taps.reduce((s, t) => s + t.priceAtTap, 0) >= 100 },
  { id: 'spend-500',    emoji: '🤑', name: '500€ registrados',  desc: 'Eso es una tablet nueva',               check: d => d.taps.reduce((s, t) => s + t.priceAtTap, 0) >= 500 },
  { id: 'streak-3',     emoji: '🔥', name: 'Racha de 3 días',   desc: '3 días seguidos bajo el límite',        check: d => d.vices.some(v => getStreak(v, d.taps) >= 3) },
  { id: 'streak-7',     emoji: '⚡', name: 'Racha de 7 días',   desc: 'Una semana bajo control',               check: d => d.vices.some(v => getStreak(v, d.taps) >= 7) },
  { id: 'streak-30',    emoji: '🏆', name: 'Racha de 30 días',  desc: 'Un mes bajo el límite. Brutal.',        check: d => d.vices.some(v => getStreak(v, d.taps) >= 30) },
  { id: 'challenge-won',emoji: '⚔️', name: 'Reto superado',     desc: 'Ganaste tu primer reto',                check: d => d.challenges.some(c => c.status === 'won') },
  { id: '5-vices',      emoji: '🎪', name: 'Coleccionista',     desc: '5 vicios configurados a la vez',        check: d => d.vices.length >= 5 },
  { id: 'investor',     emoji: '📈', name: 'Mentalidad inversora', desc: 'Configuraste una alerta de inversión', check: d => (d.settings.investmentThreshold ?? 0) > 0 },
]

export function checkAndUnlock(data: AppData): string[] {
  const unlocked = data.unlockedAchievements ?? []
  const newOnes: string[] = []
  for (const ach of ACHIEVEMENTS) {
    if (!unlocked.includes(ach.id) && ach.check(data)) {
      newOnes.push(ach.id)
    }
  }
  return newOnes
}
