import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getData, addTap } from '../lib/storage'
import type { Tap } from '../types'

export default function Quick() {
  const navigate = useNavigate()
  const [done, setDone] = useState<string | null>(null)
  const { vices } = getData()

  function handleTap(viceId: string, unitPrice: number, emoji: string) {
    const tap: Tap = { viceId, timestamp: new Date().toISOString(), priceAtTap: unitPrice }
    addTap(tap)
    if (navigator.vibrate) navigator.vibrate(40)
    setDone(emoji)
    setTimeout(() => navigate('/home'), 1200)
  }

  return (
    <div className="app-shell flex flex-col items-center justify-center px-6 gap-8 bg-[#0a0a0a]">

      <AnimatePresence>
        {done ? (
          <motion.div
            key="done"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <span className="text-8xl">{done}</span>
            <p className="text-[#00c896] font-bold text-xl">¡Registrado!</p>
          </motion.div>
        ) : (
          <motion.div key="buttons" className="w-full flex flex-col gap-6 items-center">
            <p className="text-xs text-[#555] uppercase tracking-widest">¿Qué has consumido?</p>
            {vices.map(vice => (
              <motion.button
                key={vice.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleTap(vice.id, vice.unitPrice, vice.emoji)}
                className="w-full max-w-xs py-5 rounded-2xl bg-[#111] border border-[#222] flex items-center gap-4 px-6 active:bg-[#1a1a1a]"
              >
                <span className="text-4xl">{vice.emoji}</span>
                <div className="text-left">
                  <p className="text-[#f0ece4] font-bold text-lg">{vice.name}</p>
                  <p className="text-[#555] text-sm">{vice.unitPrice.toFixed(2)}€</p>
                </div>
              </motion.button>
            ))}
            <button
              onClick={() => navigate('/home')}
              className="text-[#444] text-sm mt-2"
            >
              Cancelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
