import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import Layout from '../components/Layout'
import ImpactCard from '../components/ImpactCard'
import { getData } from '../lib/storage'
import {
  getTotalSpent, getMonthlySpend, getProjections, getChartData
} from '../lib/finance'
import type { Period } from '../types'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: 'week',  label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'year',  label: 'Año' },
  { key: 'all',   label: 'Total' },
]

const SCENARIO_LABELS = {
  conservative: { label: 'Conservador', rate: '5%', color: '#6366f1' },
  medium:       { label: 'Moderado',    rate: '8%', color: '#00c896' },
  aggressive:   { label: 'Agresivo',    rate: '12%', color: '#f59e0b' },
}

export default function Impact() {
  const [period, setPeriod] = useState<Period>('month')
  const { taps, settings } = getData()
  const cur = settings.currency === 'EUR' ? '€' : '$'

  const spent = getTotalSpent(taps, period)
  const monthly = getMonthlySpend(taps)
  const projections = getProjections(monthly)
  const chartData = getChartData(taps, settings.annualReturn)

  return (
    <Layout>
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-black text-[#f0ece4] mb-1">Impacto financiero</h1>
        <p className="text-xs text-[#555] mb-5">Gasto real vs inversión alternativa</p>

        {/* Period selector */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                period === p.key
                  ? 'bg-[#00c896] text-black'
                  : 'bg-[#111] text-[#555] border border-[#222]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Main spend card */}
        <ImpactCard
          label={`Gastado · ${PERIODS.find(p => p.key === period)?.label}`}
          value={spent}
          currency={cur}
        />

        {/* Monthly spend */}
        <div className="mt-3">
          <ImpactCard
            label="Gasto mensual promedio"
            value={monthly}
            currency={cur}
            subtitle="Base para las proyecciones de inversión"
          />
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="mt-5">
            <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">
              Gasto acumulado vs inversión hipotética
            </p>
            <div className="bg-[#111] border border-[#222] rounded-2xl p-3">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#555', fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                    labelStyle={{ color: '#888', fontSize: 11 }}
                    formatter={(v: number, name: string) => [
                      `${cur}${v.toFixed(2)}`,
                      name === 'spent' ? 'Gastado' : 'Si hubieras invertido',
                    ]}
                  />
                  <Line dataKey="spent"    stroke="#ff3b30" dot={false} strokeWidth={2} />
                  <Line dataKey="invested" stroke="#00c896" dot={false} strokeWidth={2} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                <span className="text-xs text-[#ff3b30] font-medium">— Gastado</span>
                <span className="text-xs text-[#00c896] font-medium">- - Si hubieras invertido</span>
              </div>
            </div>
          </div>
        )}

        {/* Projections */}
        <div className="mt-5">
          <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">
            Si invirtieras {cur}{monthly.toFixed(0)}/mes desde ahora…
          </p>
          {(Object.entries(projections) as [keyof typeof projections, typeof projections['medium']][]).map(([key, proj]) => {
            const s = SCENARIO_LABELS[key]
            return (
              <div key={key} className="mb-3 bg-[#111] border border-[#222] rounded-2xl p-4">
                <p className="text-xs font-semibold mb-2" style={{ color: s.color }}>
                  {s.label} · {s.rate} anual
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '1 año', v: proj.y1 },
                    { label: '5 años', v: proj.y5 },
                    { label: '10 años', v: proj.y10 },
                    { label: '20 años', v: proj.y20 },
                  ].map(({ label, v }) => (
                    <div key={label} className="text-center">
                      <p className="text-xs text-[#555] mb-0.5">{label}</p>
                      <p className="text-sm font-bold text-[#f0ece4]">
                        {v >= 1000 ? `${cur}${(v / 1000).toFixed(1)}k` : `${cur}${v.toFixed(0)}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {taps.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-[#555] text-sm">Registra tu primer consumo en la pantalla principal para ver el impacto.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
