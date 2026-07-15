import { NavLink } from 'react-router-dom'

const NAV = [
  { path: '/home',       icon: '🏠', label: 'Hoy' },
  { path: '/impact',     icon: '💸', label: 'Impacto' },
  { path: '/history',    icon: '📋', label: 'Historial' },
  { path: '/challenges', icon: '⚔️', label: 'Retos' },
  { path: '/settings',   icon: '⚙️', label: 'Config' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="screen-content">
        {children}
      </div>
      <nav className="bottom-nav">
        {NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-[#00c896]' : 'text-[#555]'
              }`
            }
          >
            <span className="text-[22px] leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
