import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '../shared/components/Layout'
import { ProtectedRoute } from '../shared/components/ProtectedRoute'
import { PagePlaceholder } from '../shared/components/PagePlaceholder'
import { LoginPage } from '../features/auth/components/LoginPage'
import { SignupPage } from '../features/auth/components/SignupPage'
import { DiscoverPage } from '../features/matches/components/DiscoverPage'

/**
 * Route tree, matching docs/02-app-flow.md.
 *
 * Auth screens (login/signup) sit OUTSIDE <Layout> — no bottom nav,
 * per the design brief. Everything else sits inside <Layout>, and the
 * routes that require a session are further wrapped in <ProtectedRoute>.
 *
 * As we build each feature we'll swap PagePlaceholder for the real
 * page component (e.g. HomePage, MatchDetailPage) — the route
 * structure itself won't need to change.
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <DiscoverPage /> },
      { path: '/matches/:id', element: <PagePlaceholder title="Match detail" description="Phase 2" /> },
      { path: '/teams', element: <PagePlaceholder title="Teams" description="Phase 3" /> },
      { path: '/teams/:id', element: <PagePlaceholder title="Team profile" description="Phase 3" /> },
      { path: '/market', element: <PagePlaceholder title="Player market" description="Phase 4" /> },
      { path: '/tournaments', element: <PagePlaceholder title="Tournaments" description="Phase 5" /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/profile', element: <PagePlaceholder title="Profile" description="Phase 1" /> },
          { path: '/matches/new', element: <PagePlaceholder title="Create match" description="Phase 2" /> },
        ],
      },
    ],
  },
])
