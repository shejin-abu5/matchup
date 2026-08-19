import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Home' },
  { to: '/teams', label: 'Teams' },
  { to: '/market', label: 'Market' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/profile', label: 'Profile' },
]

/**
 * docs/03-uiux-design-brief.md calls for a bottom tab bar on mobile
 * and a sidebar on desktop. We start with the mobile version — the
 * `md:` prefixed classes below are where we'll add the sidebar layout
 * once you're comfortable with Tailwind's responsive prefixes.
 */
export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-around py-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `text-sm px-3 py-1 rounded-md ${
                isActive ? 'text-[var(--color-primary)] font-medium' : 'text-gray-500'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
