import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Impact from './screens/Impact'
import History from './screens/History'
import Quick from './screens/Quick'
import Health from './screens/Health'
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
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default function App() {
  const [onboarded, setOnboarded] = useState(hasCompletedOnboarding)

  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    </HashRouter>
  )
}
