import Layout from '../components/Layout'
import HealthCard from '../components/HealthCard'
import StreakBadge from '../components/StreakBadge'
import { getData } from '../lib/storage'
import { getWeeklyHealth, getDailyHealth, getStreak, THRESHOLDS } from '../lib/health'
import type { HealthKey } from '../types'

export default function Health() {
  const { vices, taps } = getData()

  const weekly = getWeeklyHealth(taps, vices)
  const daily  = getDailyHealth(taps, vices)

  const KEYS: HealthKey[] = ['caffeine', 'calories', 'sugar']
  const hasAnyMetric = vices.some(v =>
    v.healthMetrics.caffeine || v.healthMetrics.calories || v.healthMetrics.sugar
  )

  return (
    <Layout>
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-black text-[#f0ece4] mb-1">Salud</h1>
        <p className="text-xs text-[#555] mb-5">Umbrales según la OMS</p>

        {/* Daily health */}
        {hasAnyMetric && (
          <>
            <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">Hoy</p>
            <div className="flex flex-col gap-3 mb-6">
              {KEYS.map(key => {
                const t = THRESHOLDS[key]
                if (daily[key] === 0 && !vices.some(v => v.healthMetrics[key])) return null
                return (
                  <HealthCard
                    key={key}
                    label={t.label}
                    value={daily[key]}
                    dailyThreshold={t.daily}
                    unit={t.unit}
                    color={t.color}
                    period="diario"
                  />
                )
              })}
            </div>

            <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">Esta semana</p>
            <div className="flex flex-col gap-3 mb-6">
              {KEYS.map(key => {
                const t = THRESHOLDS[key]
                if (weekly[key] === 0 && !vices.some(v => v.healthMetrics[key])) return null
                return (
                  <HealthCard
                    key={key}
                    label={t.label}
                    value={weekly[key]}
                    dailyThreshold={t.daily}
                    unit={t.unit}
                    color={t.color}
                    period="semanal"
                  />
                )
              })}
            </div>
          </>
        )}

        {!hasAnyMetric && (
          <div className="bg-[#111] border border-[#222] rounded-2xl p-4 mb-6 text-center">
            <p className="text-sm text-[#555]">
              Añade métricas de salud a tus vicios en la pantalla de configuración para ver este panel.
            </p>
          </div>
        )}

        {/* Streaks */}
        <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">Rachas sin consumir</p>
        {vices.length === 0 ? (
          <p className="text-sm text-[#555]">No hay vicios configurados.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {vices.map(v => (
              <StreakBadge
                key={v.id}
                viceName={v.name}
                viceEmoji={v.emoji}
                streak={getStreak(taps, v.id)}
              />
            ))}
          </div>
        )}

        {/* OMS note */}
        <p className="text-xs text-[#333] mt-6 text-center leading-relaxed">
          Umbrales: cafeína 400mg/día · azúcar 25g/día (OMS).
          Calorías: 200kcal/día de consumo extra como referencia informal.
        </p>
      </div>
    </Layout>
  )
}
