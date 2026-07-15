import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'
import { getData, addChallenge, updateChallenge, unlockAchievement } from '../lib/storage'
import { evaluateChallenge } from '../lib/streaks'
import { ACHIEVEMENTS, checkAndUnlock } from '../lib/achievements'
import type { Challenge } from '../types'

type Tab = 'retos' | 'logros'

export default function Challenges() {
  const [tab, setTab] = useState<Tab>('retos')
  const [showForm, setShowForm] = useState(false)
  const [tick, setTick] = useState(0)

  const [form, setForm] = useState({ viceId: '', days: '7', penalty: '20' })

  const data = getData()
  const { vices, taps, challenges, unlockedAchievements } = data
  const cur = data.settings.currency === 'EUR' ? '€' : '$'

  useEffect(() => {
    const updated = checkAndUnlock(data)
    updated.forEach(id => unlockAchievement(id))

    challenges.filter(c => c.status === 'active').forEach(c => {
      const status = evaluateChallenge(c, taps)
      if (status !== 'active') {
        updateChallenge(c.id, { status })
        if (status === 'won') unlockAchievement('challenge-won')
        setTick(t => t + 1)
      }
    })
  }, [tick])

  const activeChallenges = challenges.filter(c => c.status === 'active')
  const pastChallenges = challenges.filter(c => c.status !== 'active')

  function daysLeft(c: Challenge): number {
    const end = new Date(c.startDate)
    end.setDate(end.getDate() + c.daysTarget)
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000))
  }

  function handleCreate() {
    if (!form.viceId || !form.days || !form.penalty) return
    const vice = vices.find(v => v.id === form.viceId)!
    const challenge: Challenge = {
      id: crypto.randomUUID(),
      viceId: form.viceId,
      description: `Sin ${vice.name} durante ${form.days} días`,
      daysTarget: parseInt(form.days),
      startDate: new Date().toISOString(),
      penalty: parseFloat(form.penalty),
      status: 'active',
    }
    addChallenge(challenge)
    setShowForm(false)
    setForm({ viceId: '', days: '7', penalty: '20' })
    setTick(t => t + 1)
  }

  return (
    <Layout>
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-black text-[#f0ece4] mb-1">Retos & Logros</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 mt-3">
          {(['retos', 'logros'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                tab === t ? 'bg-[#00c896] text-black' : 'bg-[#111] text-[#555] border border-[#222]'
              }`}
            >
              {t === 'retos' ? '⚔️ Retos' : '🏆 Logros'}
            </button>
          ))}
        </div>

        {tab === 'retos' && (
          <div>
            {/* Active challenges */}
            {activeChallenges.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">En curso</p>
                {activeChallenges.map(c => {
                  const vice = vices.find(v => v.id === c.viceId)
                  const left = daysLeft(c)
                  const progress = Math.max(0, Math.min(1, 1 - left / c.daysTarget))
                  return (
                    <div key={c.id} className="bg-[#111] border border-[#222] rounded-2xl p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{vice?.emoji}</span>
                          <div>
                            <p className="text-sm font-bold text-[#f0ece4]">{c.description}</p>
                            <p className="text-xs text-[#555]">Penalización: {cur}{c.penalty}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-[#00c896]">{left}</p>
                          <p className="text-[10px] text-[#555]">días</p>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00c896] rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Past challenges */}
            {pastChallenges.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-3">Historial</p>
                {pastChallenges.map(c => {
                  const vice = vices.find(v => v.id === c.viceId)
                  const won = c.status === 'won'
                  return (
                    <div key={c.id} className={`border rounded-2xl p-4 mb-3 ${won ? 'bg-[#00c896]/10 border-[#00c896]/30' : 'bg-[#ff3b30]/10 border-[#ff3b30]/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{vice?.emoji}</span>
                          <div>
                            <p className="text-sm font-semibold text-[#f0ece4]">{c.description}</p>
                            {!won && (
                              <p className="text-xs text-[#ff3b30] mt-0.5">
                                Deberías invertir {cur}{c.penalty} →{' '}
                                <a href="https://afriend1998.github.io/break_even/" target="_blank" rel="noopener noreferrer" className="underline">Break Even</a>
                              </p>
                            )}
                            {won && (
                              <p className="text-xs text-[#00c896] mt-0.5">
                                Ahorraste {cur}{(vice?.unitPrice ?? 0) * c.daysTarget} en {c.daysTarget} días 💰
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-2xl">{won ? '🏆' : '💸'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {activeChallenges.length === 0 && pastChallenges.length === 0 && (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">⚔️</p>
                <p className="text-[#555] text-sm">Sin retos activos.<br />Pon a prueba tu fuerza de voluntad.</p>
              </div>
            )}

            {/* Create button */}
            {vices.length > 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 rounded-2xl bg-[#00c896] text-black font-bold text-sm mt-2"
              >
                + Nuevo reto
              </button>
            )}
          </div>
        )}

        {tab === 'logros' && (
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map(ach => {
              const unlocked = unlockedAchievements.includes(ach.id)
              return (
                <motion.div
                  key={ach.id}
                  initial={false}
                  animate={{ opacity: unlocked ? 1 : 0.35 }}
                  className={`bg-[#111] border rounded-2xl p-4 text-center ${unlocked ? 'border-[#00c896]/40' : 'border-[#222]'}`}
                >
                  <p className={`text-3xl mb-1 ${!unlocked ? 'grayscale' : ''}`}>{ach.emoji}</p>
                  <p className="text-xs font-bold text-[#f0ece4]">{ach.name}</p>
                  <p className="text-[10px] text-[#555] mt-0.5 leading-snug">{ach.desc}</p>
                  {unlocked && <p className="text-[10px] text-[#00c896] mt-1 font-bold">✓ Desbloqueado</p>}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create challenge modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full bg-[#111] rounded-t-3xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-lg font-black text-[#f0ece4] mb-4">Nuevo reto</p>

              <label className="block text-xs text-[#555] mb-1">Vicio</label>
              <select
                value={form.viceId}
                onChange={e => setForm(f => ({ ...f, viceId: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2.5 text-[#f0ece4] text-sm mb-3"
              >
                <option value="">Elige un vicio…</option>
                {vices.map(v => <option key={v.id} value={v.id}>{v.emoji} {v.name}</option>)}
              </select>

              <label className="block text-xs text-[#555] mb-1">Días sin consumirlo</label>
              <input
                type="number"
                min="1"
                max="365"
                value={form.days}
                onChange={e => setForm(f => ({ ...f, days: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2.5 text-[#f0ece4] text-sm mb-3"
              />

              <label className="block text-xs text-[#555] mb-1">Si pierdes, inviertes… ({cur})</label>
              <input
                type="number"
                min="1"
                value={form.penalty}
                onChange={e => setForm(f => ({ ...f, penalty: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-2.5 text-[#f0ece4] text-sm mb-4"
              />

              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-[#333] text-[#555] text-sm">Cancelar</button>
                <button onClick={handleCreate} className="flex-1 py-3 rounded-xl bg-[#00c896] text-black font-bold text-sm">Crear reto</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}
