import Layout from '../components/Layout'
import { getData } from '../lib/storage'

const VICE_COLORS = ['#00c896', '#f59e0b', '#818cf8']

export default function History() {
  const { taps, vices, settings } = getData()
  const cur = settings.currency === 'EUR' ? '€' : '$'
  const hide = settings.hideSpendAmounts ?? false
  const viceMap = Object.fromEntries(vices.map(v => [v.id, v]))
  const viceColorMap = Object.fromEntries(vices.map((v, i) => [v.id, VICE_COLORS[i % VICE_COLORS.length]]))

  // Últimos 14 días para el gráfico
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toDateString()
    const dayTaps = taps.filter(t => new Date(t.timestamp).toDateString() === dateStr)
    return {
      label: d.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 2),
      isToday: i === 13,
      total: dayTaps.length,
      byVice: vices.map((v, vi) => ({
        count: dayTaps.filter(t => t.viceId === v.id).length,
        color: VICE_COLORS[vi % VICE_COLORS.length],
      })),
    }
  })
  const maxTaps = Math.max(...last14.map(d => d.total), 1)

  // Totales históricos por vicio
  const totals = vices.map(v => {
    const viceTaps = taps.filter(t => t.viceId === v.id)
    return {
      vice: v,
      units: viceTaps.length,
      spent: viceTaps.reduce((s, t) => s + (t.priceAtTap ?? 0), 0),
    }
  }).filter(t => t.units > 0)

  // Agrupar por fecha, más reciente primero
  const groups: Record<string, typeof taps> = {}
  ;[...taps].reverse().forEach(tap => {
    const key = new Date(tap.timestamp).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
    if (!groups[key]) groups[key] = []
    groups[key].push(tap)
  })

  return (
    <Layout>
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-black text-[#f0ece4] mb-1">Historial</h1>
        <p className="text-xs text-[#555] mb-5">{taps.length} registro{taps.length !== 1 ? 's' : ''} en total</p>

        {taps.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-24 gap-3 text-center">
            <p className="text-4xl">📋</p>
            <p className="text-[#555] text-sm">Aún no hay registros.<br />Toca un botón en la pantalla principal.</p>
          </div>
        )}

        {/* Totales históricos */}
        {totals.length > 0 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {totals.map((t, i) => (
              <div key={t.vice.id} className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-3 shrink-0 min-w-[110px]">
                <p className="text-lg mb-1">{t.vice.emoji}</p>
                <p className="text-xl font-black text-[#f0ece4]">{t.units}</p>
                <p className="text-[10px] text-[#555]">{t.vice.name}</p>
                {!hide && t.spent > 0 && (
                  <p className="text-xs font-bold mt-1" style={{ color: VICE_COLORS[i % VICE_COLORS.length] }}>
                    {cur}{t.spent.toFixed(0)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Gráfico últimas 2 semanas */}
        {taps.length > 0 && (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-4 mb-6">
            <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3">Últimas 2 semanas</p>
            <div className="flex items-end justify-between gap-0.5 h-24">
              {last14.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {day.total > 0 && (
                    <p className="text-[8px] text-[#555]">{day.total}</p>
                  )}
                  <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden" style={{ height: `${Math.max((day.total / maxTaps) * 72, day.total > 0 ? 4 : 2)}px` }}>
                    {day.byVice.map((seg, si) =>
                      seg.count > 0 ? (
                        <div
                          key={si}
                          style={{
                            height: `${(seg.count / day.total) * 100}%`,
                            backgroundColor: day.isToday ? '#ffffff' : seg.color,
                            opacity: day.isToday ? 0.9 : 0.85,
                          }}
                        />
                      ) : null
                    )}
                    {day.total === 0 && (
                      <div style={{ height: '100%', backgroundColor: '#1a1a1a' }} />
                    )}
                  </div>
                  <p className="text-[8px] text-[#555]" style={{ color: day.isToday ? '#f0ece4' : undefined }}>
                    {day.label}
                  </p>
                </div>
              ))}
            </div>
            {vices.length > 1 && (
              <div className="flex gap-3 mt-2 justify-center flex-wrap">
                {vices.map((v, i) => (
                  <span key={v.id} className="text-[9px] flex items-center gap-1" style={{ color: VICE_COLORS[i % VICE_COLORS.length] }}>
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: VICE_COLORS[i % VICE_COLORS.length] }} />
                    {v.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lista de registros por día */}
        {Object.entries(groups).map(([date, dayTaps]) => {
          const dayTotal = dayTaps.reduce((s, t) => s + (t.priceAtTap ?? 0), 0)
          return (
            <div key={date} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#555] uppercase tracking-widest font-medium capitalize">{date}</p>
                {!hide && dayTotal > 0 && <p className="text-xs font-bold text-[#00c896]">{cur}{dayTotal.toFixed(2)}</p>}
              </div>
              <div className="flex flex-col gap-2">
                {dayTaps.map((tap, i) => {
                  const vice = viceMap[tap.viceId]
                  if (!vice) return null
                  const time = new Date(tap.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                  const color = viceColorMap[tap.viceId]
                  return (
                    <div key={i} className="flex items-center gap-3 bg-[#111] border border-[#1a1a1a] rounded-xl p-3">
                      <span className="text-xl">{vice.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#f0ece4]">{vice.name}</p>
                        <p className="text-xs text-[#555]">{time}</p>
                      </div>
                      {!hide && tap.priceAtTap != null && (
                        <p className="text-sm font-bold" style={{ color }}>{cur}{tap.priceAtTap.toFixed(2)}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
