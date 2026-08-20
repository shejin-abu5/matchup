import { LoginForm } from './LoginForm'

// Auth screens get NO <Layout>/bottom nav, per docs/03-uiux-design-brief.md
// ("full-screen focused flow") — that's why router.tsx mounts this OUTSIDE
// the <Layout> route tree, unlike every other page.
export function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Log in to MatchUp</h1>
      <LoginForm />
    </div>
  )
}
