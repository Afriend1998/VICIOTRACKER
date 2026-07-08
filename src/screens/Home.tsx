import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import Layout from '../components/Layout'
import ViceButton from '../components/ViceButton'
import { getData, addTap } from '../lib/storage'
import { getDailyTaps, getTotalSpent } from '../lib/finance'
import type { Tap } from '../types'

const TAP_MILESTONES = [10, 25, 50, 100, 250, 500]

export default function Home() {
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)

  const data = getData()
  const { vices, taps, settings } = data

  const totalToday = getTotalSpent(taps, 'today')

  const handleTap = useCallback((viceId: string, unitPrice: number) => {
    const tap: Tap = { viceId, timestamp: new Date().toISOString(), priceAtTap: unitPrice }
    addTap(tap)

    const newTaps = [...taps, tap]
    const viceTaps = newTaps.filter(t => t.viceId === viceId).length
    if (TAP_MILESTONES.includes(viceTaps)) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
    }

    setTick(t => t + 1)
  }, [taps])

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
              {settings.currency === 'EUR' ? '€' : '$'}
              {totalToday.toFixed(2)}
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
          const showAdd = vices.length < 3
          const total = vices.length + (showAdd ? 1 : 0)
          const cols = total === 1 ? 'grid-cols-1 place-items-center'
                     : total === 2 ? 'grid-cols-2'
                     : 'grid-cols-3'
          return (
            <div className={`grid gap-8 py-4 ${cols}`}>
              {vices.map(vice => {
                const dailyCount = getDailyTaps(taps, vice.id)
                const totalViceTaps = taps.filter(t => t.viceId === vice.id).length
                return (
                  <ViceButton
                    key={`${vice.id}-${tick}`}
                    vice={vice}
                    dailyCount={dailyCount}
                    totalTaps={totalViceTaps}
                    onTap={() => handleTap(vice.id, vice.unitPrice)}
                  />
                )
              })}

              {showAdd && (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-[60px]" />
                  <button
                    onClick={() => navigate('/settings', { state: { openAdd: true } })}
                    className="w-40 h-40 rounded-full border-2 border-dashed border-[#2a2a2a] flex flex-col items-center justify-center gap-1 text-[#444] hover:border-[#00c896] hover:text-[#00c896] transition-colors group"
                    aria-label="Añadir vicio"
                  >
                    <span className="text-4xl leading-none group-hover:scale-110 transition-transform">+</span>
                  </button>
                  <p className="text-sm font-semibold text-[#444] tracking-wide uppercase">Añadir</p>
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
                {settings.currency === 'EUR' ? '€' : '$'}{s.value.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#333] mt-6">
          Toca cada vez que consumas
        </p>
      </div>
    </Layout>
  )
}
