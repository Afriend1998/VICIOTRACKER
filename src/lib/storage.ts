import type { AppData, Vice, Tap, Settings, Challenge } from '../types'

const KEY = 'vicio-tracker-v0.1'

function defaultData(): AppData {
  return {
    version: '0.1',
    vices: [],
    taps: [],
    settings: {
      currency: 'EUR',
      annualReturn: 0.08,
      startDate: new Date().toISOString(),
    },
    challenges: [],
    unlockedAchievements: [],
  }
}

export function getData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultData()
    const data = JSON.parse(raw) as AppData
    if (!data.challenges) data.challenges = []
    if (!data.unlockedAchievements) data.unlockedAchievements = []
    return data
  } catch {
    return defaultData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function addVice(vice: Vice): void {
  const data = getData()
  data.vices.push(vice)
  saveData(data)
}

export function removeVice(viceId: string): void {
  const data = getData()
  data.vices = data.vices.filter(v => v.id !== viceId)
  data.taps = data.taps.filter(t => t.viceId !== viceId)
  saveData(data)
}

export function addTap(tap: Tap): void {
  const data = getData()
  data.taps.push(tap)
  saveData(data)
}

export function updateVice(viceId: string, partial: Partial<Vice>): void {
  const data = getData()
  const idx = data.vices.findIndex(v => v.id === viceId)
  if (idx !== -1) {
    data.vices[idx] = { ...data.vices[idx], ...partial }
    saveData(data)
  }
}

export function removeLastTap(viceId: string): void {
  const data = getData()
  const idx = [...data.taps].map((t, i) => ({ t, i })).reverse().find(({ t }) => t.viceId === viceId)?.i
  if (idx !== undefined) {
    data.taps.splice(idx, 1)
    saveData(data)
  }
}

export function updateSettings(partial: Partial<Settings>): void {
  const data = getData()
  data.settings = { ...data.settings, ...partial }
  saveData(data)
}

export function resetData(): void {
  saveData(defaultData())
}

export function exportJSON(): void {
  const data = getData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vicio-tracker-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function addChallenge(challenge: Challenge): void {
  const data = getData()
  data.challenges.push(challenge)
  saveData(data)
}

export function updateChallenge(id: string, partial: Partial<Challenge>): void {
  const data = getData()
  const idx = data.challenges.findIndex(c => c.id === id)
  if (idx !== -1) {
    data.challenges[idx] = { ...data.challenges[idx], ...partial }
    saveData(data)
  }
}

export function unlockAchievement(id: string): void {
  const data = getData()
  if (!data.unlockedAchievements.includes(id)) {
    data.unlockedAchievements.push(id)
    saveData(data)
  }
}

export function hasCompletedOnboarding(): boolean {
  return getData().vices.length > 0
}
