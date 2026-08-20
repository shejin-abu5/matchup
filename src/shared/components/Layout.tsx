import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/authStore'
import { queryClient } from '../../app/queryClient'
import { Button } from './Button'

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
  // Selector goes INSIDE the parentheses — that's the part Zustand reads
  // to decide which components to re-render. Selecting `user?.name`
  // rather than `user` means an avatar change won't re-render this nav.
  const userName = useAuthStore((state) => state.user?.name)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  // Logging out clears TWO separate things, on purpose: Zustand's session
  // (who you are) and the Query cache (data you fetched while logged in —
  // your matches, your team roster). Skipping queryClient.clear() would
  // leave the next user who logs in on this device seeing stale cached
  // data from the previous session for a moment, until it refetches.
  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate('/login')
  }

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

        {userName && (
          <div className="flex items-center gap-2 px-3 py-1">
            <span className="text-sm text-gray-400">{userName}</span>
            <Button variant="ghost" className="px-2 py-0.5 text-xs" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        )}
      </nav>
    </div>
  )
}
