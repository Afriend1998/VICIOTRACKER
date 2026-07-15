import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import EmojiPicker from '../components/EmojiPicker'
import { getData, updateSettings, resetData, exportJSON, addVice, removeVice, updateVice } from '../lib/storage'
import type { Vice, Category } from '../types'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'energy-drink', label: '⚡ Energética' },
  { value: 'coffee',       label: '☕ Café' },
  { value: 'alcohol',      label: '🍺 Alcohol' },
  { value: 'tobacco',      label: '🚬 Tabaco' },
  { value: 'food',         label: '🍔 Comida' },
]

function ViceRow({ vice, onDelete, onUpdate }: { vice: Vice; onDelete: () => void; onUpdate: (p: Partial<Vice>) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [form, setForm] = useState({
    name: vice.name, emoji: vice.emoji,
    unitPrice: String(vice.unitPrice), dailyLimit: vice.dailyLimit ? String(vice.dailyLimit) : ''
  })

  if (editing) {
    return (
      <div className="bg-[#111] border border-[#00c896]/30 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowEmojiPicker(v => !v)}
            className="w-10 h-10 rounded-xl text-xl flex items-center justify-center border border-[#333] bg-[#1a1a1a] shrink-0"
          >
            {form.emoji}
          </button>
          <input
            className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-[#f0ece4] text-sm"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nombre"
          />
        </div>
        {showEmojiPicker && (
          <EmojiPicker
            onSelect={e => { setForm(f => ({ ...f, emoji: e })); setShowEmojiPicker(false) }}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-[#f0ece4] text-sm pr-6"
              type="number" inputMode="decimal"
              value={form.unitPrice}
              onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))}
              placeholder="Precio"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] text-xs">€</span>
          </div>
          <div className="flex-1 relative">
            <input
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-[#f0ece4] text-sm pr-10"
              type="number" inputMode="numeric"
              value={form.dailyLimit}
              onChange={e => setForm(f => ({ ...f, dailyLimit: e.target.value }))}
              placeholder="Límite/día"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] text-[10px]">/día</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              onUpdate({
                name: form.name.trim() || vice.name,
                emoji: form.emoji || vice.emoji,
                unitPrice: parseFloat(form.unitPrice) || vice.unitPrice,
                dailyLimit: form.dailyLimit ? parseInt(form.dailyLimit) : undefined,
              })
              setEditing(false)
            }}
            className="flex-1 py-2 rounded-xl bg-[#00c896] text-black font-bold text-sm"
          >
            Guardar
          </button>
          <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl border border-[#333] text-[#555] text-sm">
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-[#111] border border-[#222] rounded-xl p-3">
      <span className="text-2xl">{vice.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#f0ece4] truncate">{vice.name}</p>
        <p className="text-xs text-[#555]">
          {vice.unitPrice.toFixed(2)}€ / unidad
          {vice.dailyLimit ? ` · límite ${vice.dailyLimit}/día` : ''}
        </p>
      </div>
      <button onClick={() => setEditing(true)} className="text-[#555] hover:text-[#f0ece4] px-1 py-1 transition-colors shrink-0 text-base">✏️</button>
      {confirming ? (
        <div className="flex gap-1 shrink-0">
          <button onClick={onDelete} className="text-xs font-bold px-2 py-1 rounded-lg bg-[#ff3b30] text-white">Borrar</button>
          <button onClick={() => setConfirming(false)} className="text-xs px-2 py-1 rounded-lg border border-[#333] text-[#555]">No</button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="text-[#ff3b30] text-sm font-medium px-2 py-1 shrink-0">✕</button>
      )}
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tick, setTick] = useState(0)
  const [showAddForm, setShowAddForm] = useState((location.state as { openAdd?: boolean } | null)?.openAdd === true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [newVice, setNewVice] = useState({ name: '', emoji: '', unitPrice: '', category: 'energy-drink' as Category, dailyLimit: '' })
  const [confirmReset, setConfirmReset] = useState(false)

  const data = getData()
  const { vices, settings } = data

  function saveSettings(partial: Parameters<typeof updateSettings>[0]) {
    updateSettings(partial)
    setTick(t => t + 1)
  }

  function handleAddVice() {
    if (!newVice.name || !newVice.emoji || !newVice.unitPrice) return
    addVice({
      id: crypto.randomUUID(),
      name: newVice.name.trim(),
      emoji: newVice.emoji.trim(),
      unitPrice: parseFloat(newVice.unitPrice),
      category: newVice.category,
      healthMetrics: {},
      dailyLimit: newVice.dailyLimit ? parseInt(newVice.dailyLimit) : undefined,
      createdAt: new Date().toISOString(),
    })
    setNewVice({ name: '', emoji: '', unitPrice: '', category: 'energy-drink', dailyLimit: '' })
    setShowAddForm(false)
    setTick(t => t + 1)
  }

  function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return }
    resetData()
    setConfirmReset(false)
    navigate('/onboarding', { replace: true })
    window.location.reload()
  }

  return (
    <Layout>
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-black text-[#f0ece4] mb-5">Configuración</h1>

        {/* Vices */}
        <section className="mb-6">
          <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">
            Mis vicios ({vices.length}/5)
          </p>
          <div className="flex flex-col gap-2">
            {vices.map(v => (
              <ViceRow
                key={v.id}
                vice={v}
                onDelete={() => { removeVice(v.id); setTick(t => t + 1) }}
                onUpdate={(p) => { updateVice(v.id, p); setTick(t => t + 1) }}
              />
            ))}
          </div>
          {vices.length < 5 && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 w-full py-3 rounded-xl border border-dashed border-[#333] text-[#555] text-sm"
            >
              + Añadir vicio
            </button>
          )}
          {showAddForm && (
            <div className="mt-3 bg-[#111] border border-[#222] rounded-2xl p-4 flex flex-col gap-4">

              {/* Emoji + Nombre */}
              <div>
                <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">Nombre y emoji</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEmojiPicker(v => !v)}
                    className="w-14 h-12 rounded-xl text-2xl flex items-center justify-center border border-[#333] bg-[#1a1a1a] shrink-0"
                  >
                    {newVice.emoji || '＋'}
                  </button>
                  <input
                    className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-[#f0ece4] text-sm"
                    value={newVice.name}
                    onChange={e => setNewVice(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ej: Monster, Café..."
                  />
                </div>
                {showEmojiPicker && (
                  <div className="mt-2">
                    <EmojiPicker
                      onSelect={e => { setNewVice(f => ({ ...f, emoji: e })); setShowEmojiPicker(false) }}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                )}
              </div>

              {/* Precio + Límite */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">Precio por unidad</p>
                  <div className="relative">
                    <input
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-[#f0ece4] text-sm pr-8"
                      type="number" inputMode="decimal"
                      value={newVice.unitPrice}
                      onChange={e => setNewVice(f => ({ ...f, unitPrice: e.target.value }))}
                      placeholder="1.95"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] text-xs">€</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">Aviso diario</p>
                  <div className="relative">
                    <input
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-[#f0ece4] text-sm pr-10"
                      type="number" inputMode="numeric"
                      value={newVice.dailyLimit}
                      onChange={e => setNewVice(f => ({ ...f, dailyLimit: e.target.value }))}
                      placeholder="2"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] text-xs">/día</span>
                  </div>
                </div>
              </div>

              {/* Categoría */}
              <div>
                <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">Categoría</p>
                <select
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-[#f0ece4] text-sm"
                  value={newVice.category}
                  onChange={e => setNewVice(f => ({ ...f, category: e.target.value as Category }))}
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-1">
                <button onClick={handleAddVice} className="flex-1 py-3 rounded-xl bg-[#00c896] text-black font-bold text-sm">Añadir</button>
                <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 rounded-xl border border-[#333] text-[#555] text-sm">Cancelar</button>
              </div>
            </div>
          )}
        </section>

        {/* Preferences */}
        <section className="mb-6">
          <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">Preferencias</p>
          <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">

            {/* Currency */}
            <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
              <p className="text-sm text-[#f0ece4]">Moneda</p>
              <div className="flex gap-1">
                {['EUR', 'USD'].map(c => (
                  <button
                    key={c}
                    onClick={() => saveSettings({ currency: c })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      settings.currency === c ? 'bg-[#00c896] text-black' : 'bg-[#1a1a1a] text-[#555]'
                    }`}
                  >
                    {c === 'EUR' ? '€ EUR' : '$ USD'}
                  </button>
                ))}
              </div>
            </div>

            {/* Annual return */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#f0ece4]">Rentabilidad anual asumida</p>
                <p className="text-sm font-bold text-[#00c896]">
                  {(settings.annualReturn * 100).toFixed(0)}%
                </p>
              </div>
              <input
                type="range" min="1" max="20" step="1"
                value={settings.annualReturn * 100}
                onChange={e => saveSettings({ annualReturn: parseInt(e.target.value) / 100 })}
                className="w-full accent-[#00c896]"
              />
              <div className="flex justify-between text-xs text-[#444] mt-1">
                <span>1%</span><span>S&P500 histórico ~10%</span><span>20%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Investment alert threshold */}
        <section className="mb-6">
          <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">Alerta de inversión</p>
          <div className="bg-[#111] border border-[#222] rounded-2xl p-4">
            <p className="text-sm text-[#f0ece4] mb-1">Avísame cuando gaste más de</p>
            <p className="text-xs text-[#555] mb-3">Aparece un consejo de inversión en la pantalla principal</p>
            <div className="relative">
              <input
                type="number" inputMode="decimal"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2 text-[#f0ece4] text-sm pr-12"
                value={settings.investmentThreshold ?? ''}
                onChange={e => saveSettings({ investmentThreshold: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Ej: 30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] text-sm">€/mes</span>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-6">
          <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">Notificaciones</p>
          <div className="bg-[#111] border border-[#222] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#f0ece4]">Recordatorio diario</p>
                <p className="text-xs text-[#555] mt-0.5">Aviso si no has registrado nada hoy</p>
              </div>
              <button
                onClick={async () => {
                  if (!('Notification' in window)) return
                  if (settings.notificationsEnabled) {
                    saveSettings({ notificationsEnabled: false })
                    return
                  }
                  const perm = await Notification.requestPermission()
                  if (perm === 'granted') {
                    saveSettings({ notificationsEnabled: true })
                    new Notification('VicioTracker 🎯', { body: '¡Notificaciones activadas! Te avisaremos si no registras nada.' })
                  }
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.notificationsEnabled ? 'bg-[#00c896]' : 'bg-[#333]'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="mb-6">
          <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">Datos</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={exportJSON}
              className="w-full py-3 rounded-2xl border border-[#222] text-[#f0ece4] text-sm font-medium"
            >
              📤 Exportar mis datos (JSON)
            </button>
            <button
              onClick={handleReset}
              className={`w-full py-3 rounded-2xl text-sm font-medium transition-colors ${
                confirmReset
                  ? 'bg-[#ff3b30] text-white'
                  : 'border border-[#ff3b30]/40 text-[#ff3b30]'
              }`}
            >
              {confirmReset ? '⚠ Toca de nuevo para confirmar el reset' : '🗑 Borrar todos los datos'}
            </button>
            {confirmReset && (
              <button onClick={() => setConfirmReset(false)} className="text-xs text-[#555]">
                Cancelar
              </button>
            )}
          </div>
        </section>

        {/* Premium */}
        <section className="mb-6">
          <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">VicioTracker Pro</p>
          <div className="bg-gradient-to-br from-[#1a1400] to-[#111] border border-[#f59e0b]/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⭐</span>
              <p className="text-sm font-bold text-[#f59e0b]">Próximamente</p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                '🔓 Vicios ilimitados',
                '📱 Widget en pantalla de inicio por cada vicio',
                '📊 Estadísticas avanzadas y exportar PDF',
                '🔔 Notificaciones personalizadas por vicio',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 opacity-60">
                  <span className="text-xs text-[#f59e0b]">🔒</span>
                  <p className="text-xs text-[#888]">{f}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-3 rounded-xl bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b] text-sm font-bold">
              Próximamente · Únete a la lista de espera
            </button>
          </div>
        </section>

        <p className="text-xs text-[#333] text-center mt-4">VicioTracker v0.1 · Todo local, sin servidor</p>
      </div>
    </Layout>
  )
}
