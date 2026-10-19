import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Impact from './screens/Impact'
import History from './screens/History'
import Quick from './screens/Quick'
import Health from './screens/Health'
import Challenges from './screens/Challenges'
import Settings from './screens/Settings'
import { hasCompletedOnboarding } from './lib/storage'

function MainApp() {
  return (
    <Routes>
      <Route path="/quick" element={<Quick />} />
      <Route path="/home" element={<Home />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/history" element={<History />} />
      <Route path="/health" element={<Health />} />
      <Route path="/challenges" element={<Challenges />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

function Splash() {
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="app-shell flex flex-col items-center justify-center bg-[#0a0a0a]"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex flex-col items-center gap-4"
      >
        <span className="text-7xl">🎯</span>
        <p className="text-4xl font-black text-[#f0ece4] tracking-tight">VicioTracker</p>
      </motion.div>
    </motion.div>
  )
}

export default function App() {
  const [onboarded, setOnboarded] = useState(hasCompletedOnboarding)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <Splash key="splash" />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'contents' }}
          >
            <Routes>
              <Route
                path="/onboarding"
                element={
                  onboarded
                    ? <Navigate to="/home" replace />
                    : <Onboarding onComplete={() => setOnboarded(true)} />
                }
              />
              <Route
                path="/*"
                element={onboarded ? <MainApp /> : <Navigate to="/onboarding" replace />}
              />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </HashRouter>
  )
}
