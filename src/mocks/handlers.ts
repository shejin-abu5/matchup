import { http, HttpResponse } from 'msw'
import { matches } from './matchData'

/**
 * In-memory "database" for the mock backend. Resets on every page reload
 * (module re-evaluates), which is fine for Phase 1 — we're testing the
 * request/response contract, not building persistence.
 */
interface MockUser {
  id: string
  name: string
  email: string
  password: string
}

const users: MockUser[] = [
  { id: 'u1', name: 'Test User', email: 'test@matchup.dev', password: 'password123' },
]

export const handlers = [
  http.post('/api/auth/signup', async ({ request }) => {
    const body = (await request.json()) as { name: string; email: string; password: string }

    if (users.some((u) => u.email === body.email)) {
      return HttpResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    const newUser: MockUser = {
      id: `u${users.length + 1}`,
      name: body.name,
      email: body.email,
      password: body.password,
    }
    users.push(newUser)

    return HttpResponse.json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      token: `mock-jwt-${newUser.id}`,
    })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    const user = users.find((u) => u.email === body.email && u.password === body.password)

    if (!user) {
      return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    return HttpResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      token: `mock-jwt-${user.id}`,
    })
  }),

  /**
   * GET /api/matches?format=5v5&date=week&q=turf
   *
   * IMPORTANT: the filtering happens HERE, on the "server", not in the browser.
   * That's deliberate and it's the whole point of the query-key lesson:
   * because each filter combination is a different REQUEST, TanStack Query
   * stores each one as a separate cache entry. If we returned all matches and
   * filtered them in React instead, there'd be exactly one cache entry and
   * query keys would teach you nothing.
   *
   * A real backend would do this in SQL. Same idea, different tool.
   */
  http.get('/api/matches', ({ request }) => {
    // request.url is a full string; the URL class gives us a searchParams
    // helper so we don't have to parse "?format=5v5&q=turf" by hand.
    const url = new URL(request.url)
    const format = url.searchParams.get('format')
    const date = url.searchParams.get('date')
    const q = url.searchParams.get('q')?.trim().toLowerCase()

    const now = new Date()

    // Start from all matches, then narrow step by step. Each .filter() returns
    // a NEW array rather than modifying the original — important, because
    // `matches` is our pretend database and must not be mutated by a read.
    let results = matches.filter((m) => new Date(m.dateTime) >= now)

    if (format) {
      results = results.filter((m) => m.format === format)
    }

    if (date === 'today') {
      results = results.filter(
        (m) => new Date(m.dateTime).toDateString() === now.toDateString()
      )
    } else if (date === 'week') {
      const weekFromNow = new Date(now)
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      results = results.filter((m) => new Date(m.dateTime) <= weekFromNow)
    }

    if (q) {
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(q) || m.location.toLowerCase().includes(q)
      )
    }

    // Soonest first — a list of upcoming matches in random order would be useless.
    results.sort((a, b) => a.dateTime.localeCompare(b.dateTime))

    // A deliberate delay so you can actually SEE the loading skeletons.
    // Real networks are slow; localhost is not. Remove this and the loading
    // state flashes by too fast to notice you built it.
    return new Promise((resolve) =>
      setTimeout(() => resolve(HttpResponse.json(results)), 600)
    )
  }),
]
