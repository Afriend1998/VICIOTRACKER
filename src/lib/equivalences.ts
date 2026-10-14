export interface Equivalence {
  name: string
  emoji: string
  price: number
}

export const EQUIVALENCES: Equivalence[] = [
  { name: 'libro',              emoji: '📚', price: 15 },
  { name: 'entrada de cine',    emoji: '🎬', price: 9  },
  { name: 'menú de restaurante',emoji: '🍽️', price: 12 },
  { name: 'billete de tren',    emoji: '🚆', price: 30 },
  { name: 'mes de Netflix',     emoji: '📺', price: 13 },
  { name: 'café al día',        emoji: '☕', price: 1.5},
]

export function getBestEquivalence(amount: number): { eq: Equivalence; count: number } | null {
  if (amount <= 0) return null
  let best: { eq: Equivalence; count: number } | null = null
  for (const eq of EQUIVALENCES) {
    const count = Math.floor(amount / eq.price)
    if (count >= 1 && (!best || count > best.count)) {
      best = { eq, count }
    }
  }
  return best
}
