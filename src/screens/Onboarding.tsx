import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { addVice, updateSettings } from '../lib/storage'
import type { Vice, Category } from '../types'

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'energy-drink', label: 'Bebida energética', emoji: '⚡' },
  { value: 'coffee',       label: 'Café',              emoji: '☕' },
  { value: 'alcohol',      label: 'Alcohol',            emoji: '🍺' },
  { value: 'tobacco',      label: 'Tabaco',             emoji: '🚬' },
  { value: 'food',         label: 'Comida',             emoji: '🍔' },
]

const PRESETS: Partial<Record<Category, { caffeine?: number; calories?: number; sugar?: number }>> = {
  'energy-drink': { caffeine: 160, calories: 110, sugar: 27 },
  'coffee':       { caffeine: 80,  calories: 5   },
  'alcohol':      { calories: 150 },
  'tobacco':      {},
  'food':         { calories: 300, sugar: 15 },
}

interface ViceForm {
  name: string
  emoji: string
  unitPrice: string
  category: Category
  caffeine: string
  calories: string
  sugar: string
  dailyLimit: string
  showHealth: boolean
}

const emptyForm = (): ViceForm => ({
  name: '', emoji: '', unitPrice: '', category: 'energy-drink',
  caffeine: '', calories: '', sugar: '', dailyLimit: '', showHealth: false,
})

interface Props { onComplete: () => void }

type Step = 'welcome' | 'form' | 'done'

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('welcome')
  const [vices, setVices] = useState<Vice[]>([])
  const [form, setForm] = useState<ViceForm>(emptyForm())
  const [errors, setErrors] = useState<Partial<ViceForm>>({})

  function set(key: keyof ViceForm, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
    if (key === 'category') {
      const preset = PRESETS[value as Category] ?? {}
      setForm(f => ({
        ...f,
        category: value as Category,
        caffeine: preset.caffeine?.toString() ?? '',
        calories: preset.calories?.toString() ?? '',
        sugar:    preset.sugar?.toString() ?? '',
      }))
    }
  }

  function validate(): boolean {
    const e: Partial<ViceForm> = {}
    if (!form.name.trim())    e.name = 'Obligatorio'
    if (!form.emoji.trim())   e.emoji = 'Obligatorio'
    if (!form.unitPrice || isNaN(+form.unitPrice) || +form.unitPrice <= 0)
      e.unitPrice = 'Precio inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function saveVice() {
    if (!validate()) return
    const vice: Vice = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      emoji: form.emoji.trim(),
      unitPrice: parseFloat(form.unitPrice),
      category: form.category,
      healthMetrics: {
        caffeine: form.caffeine ? parseFloat(form.caffeine) : undefined,
        calories: form.calories ? parseFloat(form.calories) : undefined,
        sugar:    form.sugar    ? parseFloat(form.sugar)    : undefined,
      },
      dailyLimit: form.dailyLimit ? parseInt(form.dailyLimit) : undefined,
      createdAt: new Date().toISOString(),
    }
    addVice(vice)
    setVices(prev => [...prev, vice])
    setForm(emptyForm())
    setErrors({})

    if (vices.length + 1 >= 3) {
      finalise()
    }
  }

  function finalise() {
    updateSettings({ startDate: new Date().toISOString() })
    setStep('done')
  }

  const slide = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit:    { x: -40, opacity: 0 },
    transition: { duration: 0.25 },
  }

  return (
    <div className="app-shell">
      <div className="screen-content">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div key="welcome" {...slide} className="flex flex-col items-center justify-center min-h-screen px-8 text-center gap-6">
              <div className="text-7xl mb-2">🎯</div>
              <h1 className="text-4xl font-black text-[#f0ece4]">VicioTracker</h1>
              <p className="text-[#666] text-base leading-relaxed">
                Registra tus hábitos de consumo y descubre cuánto valen si los inviertes en lugar de gastarlos.
              </p>
              <div className="flex flex-col gap-2 text-sm text-[#555] text-left w-full max-w-xs">
                <div className="flex items-center gap-2"><span className="text-[#00c896]">✓</span> Hasta 3 vicios en el tier gratuito</div>
                <div className="flex items-center gap-2"><span className="text-[#00c896]">✓</span> 100% offline · sin cuenta</div>
                <div className="flex items-center gap-2"><span className="text-[#00c896]">✓</span> Simulación de inversión real</div>
              </div>
              <button
                onClick={() => setStep('form')}
                className="w-full max-w-xs py-4 rounded-2xl bg-[#00c896] text-black font-bold text-base mt-2"
              >
                Empezar →
              </button>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div key="form" {...slide} className="px-5 pt-8 pb-4 flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-black text-[#f0ece4]">
                  {vices.length === 0 ? 'Tu primer vicio' : `Vicio #${vices.length + 1}`}
                </h2>
                <p className="text-sm text-[#555] mt-1">
                  {vices.length > 0 && `Ya tienes: ${vices.map(v => v.emoji).join(' ')} · `}
                  Puedes añadir hasta {3 - vices.length} más
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="label">Categoría</label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      onClick={() => set('category', c.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        form.category === c.value
                          ? 'bg-[#00c896]/20 border-[#00c896] text-[#00c896]'
                          : 'bg-[#111] border-[#222] text-[#555]'
                      }`}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji + Name */}
              <div className="flex gap-3">
                <div className="w-20">
                  <label className="label">Emoji</label>
                  <input
                    className={`input text-center text-2xl ${errors.emoji ? 'border-[#ff3b30]' : ''}`}
                    value={form.emoji}
                    onChange={e => set('emoji', e.target.value)}
                    placeholder="☕"
                    maxLength={4}
                  />
                  {errors.emoji && <p className="err">{errors.emoji}</p>}
                </div>
                <div className="flex-1">
                  <label className="label">Nombre</label>
                  <input
                    className={`input ${errors.name ? 'border-[#ff3b30]' : ''}`}
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Monster Ultra"
                  />
                  {errors.name && <p className="err">{errors.name}</p>}
                </div>
              </div>

              {/* Price + Limit */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="label">Precio por unidad (€)</label>
                  <input
                    className={`input ${errors.unitPrice ? 'border-[#ff3b30]' : ''}`}
                    type="number"
                    inputMode="decimal"
                    value={form.unitPrice}
                    onChange={e => set('unitPrice', e.target.value)}
                    placeholder="1.95"
                    min="0"
                    step="0.01"
                  />
                  {errors.unitPrice && <p className="err">{errors.unitPrice}</p>}
                </div>
                <div className="flex-1">
                  <label className="label">Límite diario (opcional)</label>
                  <input
                    className="input"
                    type="number"
                    inputMode="numeric"
                    value={form.dailyLimit}
                    onChange={e => set('dailyLimit', e.target.value)}
                    placeholder="2"
                    min="1"
                  />
                </div>
              </div>

              {/* Health metrics toggle */}
              <button
                onClick={() => set('showHealth', !form.showHealth)}
                className="text-sm text-[#00c896] font-medium text-left"
              >
                {form.showHealth ? '▲ Ocultar' : '▼ Añadir'} métricas de salud (opcional)
              </button>

              {form.showHealth && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="flex gap-3 flex-wrap"
                >
                  {[
                    { key: 'caffeine', label: 'Cafeína (mg)', ph: '160' },
                    { key: 'calories', label: 'Calorías (kcal)', ph: '110' },
                    { key: 'sugar',    label: 'Azúcar (g)',     ph: '27' },
                  ].map(f => (
                    <div key={f.key} className="flex-1 min-w-[100px]">
                      <label className="label">{f.label}</label>
                      <input
                        className="input"
                        type="number"
                        inputMode="decimal"
                        value={form[f.key as keyof ViceForm] as string}
                        onChange={e => set(f.key as keyof ViceForm, e.target.value)}
                        placeholder={f.ph}
                      />
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={saveVice}
                  className="w-full py-4 rounded-2xl bg-[#00c896] text-black font-bold text-base"
                >
                  {vices.length < 2 ? 'Guardar y añadir otro +'  : 'Guardar →'}
                </button>
                {vices.length > 0 && (
                  <button
                    onClick={finalise}
                    className="w-full py-3 rounded-2xl border border-[#333] text-[#888] text-sm"
                  >
                    Listo, ya tengo mis vicios ({vices.length})
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" {...slide} className="flex flex-col items-center justify-center min-h-screen px-8 text-center gap-6">
              <div className="text-7xl">🎉</div>
              <h2 className="text-3xl font-black text-[#f0ece4]">¡Todo listo!</h2>
              <div className="flex gap-3 flex-wrap justify-center">
                {vices.map(v => (
                  <div key={v.id} className="flex flex-col items-center gap-1 bg-[#111] border border-[#222] rounded-2xl p-3">
                    <span className="text-3xl">{v.emoji}</span>
                    <span className="text-xs text-[#888]">{v.name}</span>
                    <span className="text-sm font-bold text-[#f0ece4]">{v.unitPrice.toFixed(2)}€</span>
                  </div>
                ))}
              </div>
              <p className="text-[#555] text-sm">Pulsa el botón cada vez que consumas. El dinero se registra solo.</p>
              <button
                onClick={onComplete}
                className="w-full max-w-xs py-4 rounded-2xl bg-[#00c896] text-black font-bold text-base"
              >
                Empezar a trackear →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .label { display: block; font-size: 0.75rem; color: #555; margin-bottom: 0.375rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
        .input { width: 100%; background: #111; border: 1px solid #222; border-radius: 0.75rem; padding: 0.75rem; color: #f0ece4; font-size: 0.9375rem; outline: none; transition: border-color 0.15s; }
        .input:focus { border-color: #00c896; }
        .err { font-size: 0.75rem; color: #ff3b30; margin-top: 0.25rem; }
      `}</style>
    </div>
  )
}
