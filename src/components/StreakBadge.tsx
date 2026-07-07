import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { STREAK_MILESTONES } from '../lib/health'

interface Props {
  viceName: string
  viceEmoji: string
  streak: number
}

const LABELS: Record<number, string> = {
  3: '3 días', 7: '1 semana', 30: '1 mes', 90: '3 meses'
}

export default function StreakBadge({ viceName, viceEmoji, streak }: Props) {
  const milestone = STREAK_MILESTONES.find(m => streak >= m && streak < m * 2) ?? null
  const nextMilestone = STREAK_MILESTONES.find(m => streak < m) ?? null

  useEffect(() => {
    if (milestone && STREAK_MILESTONES.includes(streak as typeof STREAK_MILESTONES[number])) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
    }
  }, [streak, milestone])

  if (streak === 0) {
    return (
      <div className="rounded-2xl border border-[#222] bg-[#111] p-4 flex items-center gap-3">
        <span className="text-2xl grayscale opacity-40">{viceEmoji}</span>
        <div>
          <p className="text-sm font-semibold text-[#f0ece4]">{viceName}</p>
          <p className="text-xs text-[#555]">Registrado hoy · sin racha</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl p-4 border ${milestone ? 'border-[#00c896]/40 bg-[#00c896]/5' : 'border-[#222] bg-[#111]'} flex items-center gap-3`}>
      <div className="relative">
        <span className="text-3xl">{viceEmoji}</span>
        {milestone && (
          <span className="absolute -top-1 -right-1 text-xs">🏅</span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#f0ece4]">{viceName}</p>
        <p className={`text-xl font-black ${milestone ? 'text-[#00c896]' : 'text-[#f0ece4]'}`}>
          {streak} días sin vicios
        </p>
        {milestone && (
          <p className="text-xs text-[#00c896] font-medium">✓ Milestone {LABELS[milestone]}</p>
        )}
        {nextMilestone && !milestone && (
          <p className="text-xs text-[#555]">
            {nextMilestone - streak} días para el siguiente milestone
          </p>
        )}
      </div>
    </div>
  )
}
