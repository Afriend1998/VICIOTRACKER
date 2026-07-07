import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Vice } from '../types'

interface Props {
  vice: Vice
  dailyCount: number
  totalTaps: number
  onTap: () => void
}

export default function ViceButton({ vice, dailyCount, totalTaps, onTap }: Props) {
  const [tapping, setTapping] = useState(false)

  const atLimit = vice.dailyLimit != null && dailyCount >= vice.dailyLimit
  const progress = vice.dailyLimit ? Math.min(dailyCount / vice.dailyLimit, 1) : null

  function handleTap() {
    if (navigator.vibrate) navigator.vibrate(atLimit ? [30, 50, 30] : 40)
    setTapping(true)
    setTimeout(() => setTapping(false), 200)
    onTap()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Daily counter */}
      <div className="text-center">
        <span key={totalTaps} className="roll-anim text-5xl font-black text-[#f0ece4]">
          {dailyCount}
        </span>
        {vice.dailyLimit && (
          <span className="text-xl text-[#444] font-medium"> / {vice.dailyLimit}</span>
        )}
      </div>

      {/* Big tap button */}
      <motion.button
        onClick={handleTap}
        animate={tapping ? { scale: [1, 0.92, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`
          w-40 h-40 rounded-full text-7xl
          flex items-center justify-center select-none
          bg-[#1a1a1a] border border-[#2a2a2a] active:bg-[#222]
          ${atLimit ? 'pulse-danger' : ''}
          transition-opacity
        `}
        aria-label={`Registrar ${vice.name}`}
      >
        {vice.emoji}
      </motion.button>

      <p className="text-sm font-semibold text-[#888] tracking-wide uppercase">
        {vice.name}
      </p>

      {/* Progress bar */}
      {progress !== null && (
        <div className="w-40 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${atLimit ? 'bg-[#ff3b30]' : 'bg-[#00c896]'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 120 }}
          />
        </div>
      )}

      {atLimit && (
        <p className="text-xs text-[#ff3b30] font-medium">⚠ Límite superado · sigue registrando</p>
      )}
    </div>
  )
}
