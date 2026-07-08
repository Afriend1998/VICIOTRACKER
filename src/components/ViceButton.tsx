import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Vice } from '../types'

type Size = 'large' | 'medium' | 'small'

interface Props {
  vice: Vice
  dailyCount: number
  totalTaps: number
  onTap: () => void
  size?: Size
}

const SIZES: Record<Size, { btn: string; emoji: string; counter: string; limit: string; bar: string; spacer: string }> = {
  large:  { btn: 'w-40 h-40', emoji: 'text-7xl', counter: 'text-5xl', limit: 'text-xl',  bar: 'w-40', spacer: 'h-[60px]' },
  medium: { btn: 'w-32 h-32', emoji: 'text-5xl', counter: 'text-4xl', limit: 'text-lg',  bar: 'w-32', spacer: 'h-[52px]' },
  small:  { btn: 'w-24 h-24', emoji: 'text-4xl', counter: 'text-3xl', limit: 'text-base', bar: 'w-24', spacer: 'h-[42px]' },
}

export default function ViceButton({ vice, dailyCount, totalTaps, onTap, size = 'large' }: Props) {
  const [tapping, setTapping] = useState(false)
  const s = SIZES[size]

  const atLimit = vice.dailyLimit != null && dailyCount >= vice.dailyLimit
  const progress = vice.dailyLimit ? Math.min(dailyCount / vice.dailyLimit, 1) : null

  function handleTap() {
    if (navigator.vibrate) navigator.vibrate(atLimit ? [30, 50, 30] : 40)
    setTapping(true)
    setTimeout(() => setTapping(false), 200)
    onTap()
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Daily counter */}
      <div className="text-center">
        <span key={totalTaps} className={`roll-anim font-black text-[#f0ece4] ${s.counter}`}>
          {dailyCount}
        </span>
        {vice.dailyLimit && (
          <span className={`text-[#444] font-medium ${s.limit}`}> / {vice.dailyLimit}</span>
        )}
      </div>

      {/* Tap button */}
      <motion.button
        onClick={handleTap}
        animate={tapping ? { scale: [1, 0.92, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`
          ${s.btn} ${s.emoji} rounded-full
          flex items-center justify-center select-none
          bg-[#1a1a1a] border border-[#2a2a2a] active:bg-[#222]
          ${atLimit ? 'pulse-danger' : ''}
          transition-opacity
        `}
        aria-label={`Registrar ${vice.name}`}
      >
        {vice.emoji}
      </motion.button>

      <p className="text-xs font-semibold text-[#888] tracking-wide uppercase text-center truncate max-w-full px-1">
        {vice.name}
      </p>

      {/* Progress bar */}
      {progress !== null && (
        <div className={`${s.bar} h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden`}>
          <motion.div
            className={`h-full rounded-full ${atLimit ? 'bg-[#ff3b30]' : 'bg-[#00c896]'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 120 }}
          />
        </div>
      )}

      {atLimit && (
        <p className="text-[10px] text-[#ff3b30] font-medium text-center">⚠ Límite superado</p>
      )}
    </div>
  )
}
