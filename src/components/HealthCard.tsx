import { motion } from 'framer-motion'

interface Props {
  label: string
  value: number
  dailyThreshold: number
  unit: string
  color: string
  period?: 'diario' | 'semanal'
}

export default function HealthCard({ label, value, dailyThreshold, unit, color, period = 'semanal' }: Props) {
  const weeklyThreshold = period === 'semanal' ? dailyThreshold * 7 : dailyThreshold
  const threshold = weeklyThreshold
  const pct = Math.min(value / threshold, 1)
  const over = value > threshold

  return (
    <div className={`rounded-2xl p-4 border ${over ? 'border-[#ff3b30]/40 bg-[#ff3b30]/5' : 'border-[#222] bg-[#111]'}`}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-sm font-semibold text-[#f0ece4]">{label}</p>
          <p className="text-xs text-[#555]">{period === 'semanal' ? 'Esta semana' : 'Hoy'}</p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-black ${over ? 'text-[#ff3b30]' : 'text-[#f0ece4]'}`}>
            {Math.round(value)}
            <span className="text-xs font-normal text-[#555] ml-0.5">{unit}</span>
          </p>
          <p className="text-xs text-[#555]">/ {Math.round(threshold)} {unit}</p>
        </div>
      </div>

      {/* Bar */}
      <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: over ? '#ff3b30' : color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />
      </div>

      {over && (
        <p className="text-xs text-[#ff3b30] mt-2 font-medium">
          ⚠ {Math.round(value - threshold)} {unit} sobre el umbral OMS
        </p>
      )}
    </div>
  )
}
