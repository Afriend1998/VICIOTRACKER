import type { AppData, Vice, Tap, Settings } from '../types'

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
  }
}

export function getData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultData()
    return JSON.parse(raw) as AppData
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

export function hasCompletedOnboarding(): boolean {
  return getData().vices.length > 0
}
