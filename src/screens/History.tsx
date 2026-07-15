import Layout from '../components/Layout'
import { getData } from '../lib/storage'

export default function History() {
  const { taps, vices, settings } = getData()
  const cur = settings.currency === 'EUR' ? '€' : '$'
  const viceMap = Object.fromEntries(vices.map(v => [v.id, v]))

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

        {Object.entries(groups).map(([date, dayTaps]) => {
          const dayTotal = dayTaps.reduce((s, t) => s + t.priceAtTap, 0)
          return (
            <div key={date} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#555] uppercase tracking-widest font-medium capitalize">{date}</p>
                <p className="text-xs font-bold text-[#00c896]">{cur}{dayTotal.toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-2">
                {dayTaps.map((tap, i) => {
                  const vice = viceMap[tap.viceId]
                  if (!vice) return null
                  const time = new Date(tap.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                  return (
                    <div key={i} className="flex items-center gap-3 bg-[#111] border border-[#1a1a1a] rounded-xl p-3">
                      <span className="text-xl">{vice.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#f0ece4]">{vice.name}</p>
                        <p className="text-xs text-[#555]">{time}</p>
                      </div>
                      <p className="text-sm font-bold text-[#f0ece4]">{cur}{tap.priceAtTap.toFixed(2)}</p>
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
