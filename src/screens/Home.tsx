import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import Layout from '../components/Layout'
import ViceButton from '../components/ViceButton'
import { getData, addTap, removeLastTap, updateChallenge, unlockAchievement } from '../lib/storage'
import { getDailyTaps, getTotalSpent, getMonthlySpend, calculateFV } from '../lib/finance'
import { getStreak } from '../lib/streaks'
import { checkAndUnlock } from '../lib/achievements'
import type { Tap } from '../types'

const TAP_MILESTONES = [10, 25, 50, 100, 250, 500]

export default function Home() {
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)
  const [undo, setUndo] = useState<{ viceId: string; name: string; emoji: string } | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [lostChallenge, setLostChallenge] = useState<{ description: string; penalty: number } | null>(null)
  const lostTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const data = getData()
  const { vices, taps, settings } = data

  const totalToday = getTotalSpent(taps, 'today')
  const monthly = getMonthlySpend(taps)
  const threshold = settings.investmentThreshold ?? 0
  const showInvestAlert = !alertDismissed && threshold > 0 && monthly >= threshold
  const investSuggest = monthly * 0.5
  const projected20y = calculateFV(investSuggest, 0.08, 240)
  const cur = settings.currency === 'EUR' ? '€' : '$'

  useEffect(() => {
    const current = getData()
    const newOnes = checkAndUnlock(current)
    newOnes.forEach(id => unlockAchievement(id))
    // evaluate active challenges
    current.challenges.filter(c => c.status === 'active').forEach(c => {
      const failed = current.taps.some(t => t.viceId === c.viceId && new Date(t.timestamp) >= new Date(c.startDate))
      if (failed) { updateChallenge(c.id, { status: 'lost' }) }
      else {
        const end = new Date(c.startDate); end.setDate(end.getDate() + c.daysTarget)
        if (new Date() >= end) { updateChallenge(c.id, { status: 'won' }); unlockAchievement('challenge-won') }
      }
    })
  }, [tick])

  const handleTap = useCallback((viceId: string, unitPrice: number, viceName: string, viceEmoji: string) => {
    const current = getData()
    const activeChallengeForVice = current.challenges.find(
      c => c.status === 'active' && c.viceId === viceId
    )

    const tap: Tap = { viceId, timestamp: new Date().toISOString(), priceAtTap: unitPrice }
    addTap(tap)

    if (activeChallengeForVice) {
      updateChallenge(activeChallengeForVice.id, { status: 'lost' })
      if (lostTimer.current) clearTimeout(lostTimer.current)
      setLostChallenge({ description: activeChallengeForVice.description, penalty: activeChallengeForVice.penalty })
      lostTimer.current = setTimeout(() => setLostChallenge(null), 8000)
    }

    const newTaps = [...taps, tap]
    const viceTaps = newTaps.filter(t => t.viceId === viceId).length
    if (TAP_MILESTONES.includes(viceTaps)) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
    }

    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndo({ viceId, name: viceName, emoji: viceEmoji })
    undoTimer.current = setTimeout(() => setUndo(null), 10000)

    setTick(t => t + 1)
  }, [taps])

  function handleUndo() {
    if (!undo) return
    if (undoTimer.current) clearTimeout(undoTimer.current)
    removeLastTap(undo.viceId)
    setUndo(null)
    setTick(t => t + 1)
  }

  if (vices.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-8 text-center">
          <p className="text-5xl">🎯</p>
          <p className="text-[#f0ece4] font-semibold">No tienes vicios configurados</p>
          <button
            onClick={() => navigate('/settings')}
            className="px-6 py-3 rounded-2xl bg-[#00c896] text-black font-bold"
          >
            Ir a configuración
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-5 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-[#555] uppercase tracking-widest font-medium">Hoy</p>
            <p className="text-3xl font-black text-[#f0ece4]">
              {cur}{totalToday.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#555]">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Vice buttons */}
        {(() => {
          const showAdd = vices.length < 5
          const total = vices.length + (showAdd ? 1 : 0)

          type Size = 'large' | 'medium' | 'small'
          let cols: string, size: Size, gap: string
          if (total <= 2) {
            cols = total === 1 ? 'grid-cols-1 place-items-center' : 'grid-cols-2'
            size = 'large'; gap = 'gap-8'
          } else if (total <= 4) {
            cols = 'grid-cols-2'; size = 'medium'; gap = 'gap-4'
          } else {
            cols = 'grid-cols-3'; size = 'small'; gap = 'gap-3'
          }

          const btnSize = { large: 'w-40 h-40', medium: 'w-32 h-32', small: 'w-24 h-24' }[size]
          const plusSize = { large: 'text-4xl', medium: 'text-3xl', small: 'text-2xl' }[size]
          const spacer  = { large: 'h-[60px]', medium: 'h-[52px]', small: 'h-[42px]' }[size]

          return (
            <div className={`grid py-4 ${cols} ${gap}`}>
              {vices.map(vice => {
                const dailyCount = getDailyTaps(taps, vice.id)
                const totalViceTaps = taps.filter(t => t.viceId === vice.id).length
                const streak = getStreak(vice, taps)
                return (
                  <div key={`${vice.id}-${tick}`} className="flex flex-col items-center">
                    <ViceButton
                      vice={vice}
                      dailyCount={dailyCount}
                      totalTaps={totalViceTaps}
                      onTap={() => handleTap(vice.id, vice.unitPrice, vice.name, vice.emoji)}
                      size={size}
                    />
                    {streak >= 2 && vice.dailyLimit && (
                      <p className="text-[10px] text-[#00c896] font-bold mt-1">🔥 {streak}d</p>
                    )}
                  </div>
                )
              })}

              {showAdd && (
                <div className="flex flex-col items-center gap-2">
                  <div className={spacer} />
                  <button
                    onClick={() => navigate('/settings', { state: { openAdd: true } })}
                    className={`${btnSize} rounded-full border-2 border-dashed border-[#2a2a2a] flex flex-col items-center justify-center text-[#444] hover:border-[#00c896] hover:text-[#00c896] transition-colors group`}
                    aria-label="Añadir vicio"
                  >
                    <span className={`${plusSize} leading-none group-hover:scale-110 transition-transform`}>+</span>
                  </button>
                  <p className="text-xs font-semibold text-[#444] tracking-wide uppercase">Añadir</p>
                </div>
              )}
            </div>
          )
        })()}

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          {[
            { label: 'Esta semana', value: getTotalSpent(taps, 'week') },
            { label: 'Este mes',    value: getTotalSpent(taps, 'month') },
            { label: 'Total',       value: getTotalSpent(taps, 'all') },
          ].map(s => (
            <div key={s.label} className="bg-[#111] rounded-xl p-3 text-center border border-[#1a1a1a]">
              <p className="text-xs text-[#555] mb-1">{s.label}</p>
              <p className="text-sm font-bold text-[#f0ece4]">
                {cur}{s.value.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#333] mt-6">
          Toca cada vez que consumas
        </p>

        {/* Alerta de inversión */}
        {showInvestAlert && (
          <div className="mt-4 bg-[#00c896]/10 border border-[#00c896]/30 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-bold text-[#00c896] mb-1">💡 ¿Y si lo invirtieras?</p>
                <p className="text-xs text-[#888] leading-relaxed">
                  Gastas {cur}{monthly.toFixed(0)}/mes en vicios. Si invirtieras el 50% ({cur}{investSuggest.toFixed(0)}/mes), en 20 años tendrías{' '}
                  <span className="text-[#00c896] font-bold">{cur}{(projected20y / 1000).toFixed(1)}k</span>.
                </p>
                <a
                  href="https://afriend1998.github.io/break_even/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-bold text-[#00c896] underline underline-offset-2"
                >
                  ¿Dónde invertir? →
                </a>
              </div>
              <button onClick={() => setAlertDismissed(true)} className="text-[#444] text-xs shrink-0 mt-0.5">✕</button>
            </div>
          </div>
        )}
      </div>

      {/* Toast reto perdido */}
      {lostChallenge && (
        <div className="fixed top-1/3 -translate-y-1/2 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-40px)] max-w-[390px]">
          <div className="bg-[#1a1a1a] border border-[#ff3b30]/50 rounded-2xl px-4 py-3 shadow-xl">
            <p className="text-sm font-bold text-[#ff3b30] mb-1">💸 Reto perdido</p>
            <p className="text-xs text-[#888] mb-2">{lostChallenge.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#f0ece4]">Invierte <span className="font-bold text-[#00c896]">{data.settings.currency === 'EUR' ? '€' : '$'}{lostChallenge.penalty}</span></p>
              <a
                href="https://afriend1998.github.io/break_even/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#00c896] underline"
              >
                Break Even →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Toast deshacer */}
      {undo && (
        <div className="fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-40px)] max-w-[390px]">
          <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#333] rounded-2xl px-4 py-3 shadow-xl">
            <p className="text-sm text-[#f0ece4]">
              {undo.emoji} <span className="font-semibold">{undo.name}</span> registrado
            </p>
            <button
              onClick={handleUndo}
              className="text-sm font-bold text-[#00c896] ml-4 shrink-0"
            >
              ↩ Deshacer
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
