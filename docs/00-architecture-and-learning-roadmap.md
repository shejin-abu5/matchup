# MatchUp — Architecture & Learning Roadmap

> Working name: **MatchUp** (rename freely — update in `package.json` and here when you do).
> A Playo-style match/team/tournament platform for football, built to learn React + Zustand + TanStack, and to be interview-ready afterward.

## How we'll work

You're the student, I'm the teacher. That means:

1. **We build feature by feature**, not everything at once. Each feature maps to specific React/Zustand/TanStack concepts.
2. **Before each feature**, I'll explain the concept (with diagrams where useful), then we write code together — I'll explain *why*, not just hand you finished code.
3. **After each feature**, I'll give you 2-3 interview questions tied to what we just built, because "I built X" is a weak interview answer but "I built X, and here's the tradeoff I chose between Zustand and Context for it" is a strong one.
4. **Everything gets committed to your GitHub repo** with meaningful commit messages — we'll treat commit history as part of the portfolio.

## Tech stack and why

| Layer | Choice | Why (the interview-ready answer) |
|---|---|---|
| UI library | React 18+ (Vite) | Vite gives instant HMR and a much simpler config than CRA (which is deprecated). |
| Routing | React Router (or TanStack Router — we'll pick together) | Client-side routing; TanStack Router adds type-safe params/search, worth learning since it's newer and interviewers ask about it. |
| Server state | **TanStack Query (React Query)** | Handles fetching, caching, background refetch, retries, and stale-while-revalidate — the stuff people used to hand-roll in `useEffect` + manual loading/error state. |
| Global client state | **Zustand** | Auth session, UI state, cross-cutting concerns like notifications and live bidding state. A `create()` call and a hook — no provider, no action types, minimal ceremony compared to Redux. |
| Forms | React Hook Form + Zod | Uncontrolled-by-default forms (fewer re-renders) + schema validation — very common in real teams. |
| Styling | Tailwind CSS | Fast to build with, easy to keep consistent, widely used in job listings. |
| API layer | REST (mock first with a JSON server or MSW, real backend later if you want) | You can build the entire frontend against fake data before a backend exists — a real skill. |
| Testing | Vitest + React Testing Library | Standard modern pairing with Vite. |

## Why this stack split matters (interview gold)

The #1 mistake junior devs make in interviews: treating whatever client-state library they know as "the place all state goes." Modern teams split state into three buckets (see the diagram above):

1. **Server state** (TanStack Query) — data that lives on a server, can be stale, can be shared/cached across components. Matches, teams, bids, tournaments.
2. **Global client state** (Zustand) — UI/app state that many components need and that doesn't come from an API directly. Current user session, active filters, modal/toast state, and — importantly for us — **live bidding state** during a player auction (this is a great "why not just Query" case study we'll dig into in Phase 3).

> **Note on Redux:** this project started with Redux Toolkit for this layer and migrated to Zustand once the pattern was clear — see the `redux-toolkit-version` git branch for the original implementation, and `src/features/auth/authStore.ts` for a comment-by-comment comparison. Being able to explain *both* and why we switched is stronger interview material than only knowing one.
3. **Local state** (`useState`) — everything scoped to one component. Form input value, "is the dropdown open."

Being able to explain *why* a specific piece of data lives where it does is one of the most reliable signals of frontend seniority in an interview.

## Suggested folder structure (feature-based, not type-based)

```
src/
  app/
    queryClient.ts         # TanStack Query client config
    router.tsx              # Route definitions
  features/
    auth/
      components/
      api/                # TanStack Query hooks (useLogin, useSignup)
      authStore.ts        # Zustand store (session, tokens)
    matches/
      components/
      api/                # useMatches, useCreateMatch, useJoinMatch
    teams/
      components/
      api/
    playerMarket/
      components/
      api/
      biddingStore.ts     # Zustand store for live auction UI state
    tournaments/
      components/
      api/
  shared/
    components/           # Button, Card, Modal, Avatar, etc.
    hooks/
    utils/
    types/
  main.tsx
```

We use **feature-based** structure (group by domain: `matches/`, `teams/`) rather than **type-based** (`components/`, `reducers/`, `services/` folders each holding everything). Feature-based is what most mid-to-large React codebases use in practice, and interviewers notice when a candidate defaults to it.

## Learning phases (mapped to app features)

| Phase | Feature | Concepts you'll learn |
|---|---|---|
| **0** | Project setup, routing, layout shell | Vite, React Router/TanStack Router, folder architecture, environment config |
| **1** | Signup / Login | Forms (React Hook Form + Zod), Zustand slice for auth, protected routes, JWT storage strategy, `useMutation` |
| **2** | Create match / Browse & join match | `useQuery`, `useMutation`, query keys & caching, pagination/infinite scroll, optimistic updates |
| **3** | Team creation, team profile, team vs team match | Nested data modeling, role-based UI (captain vs member), derived/selector state |
| **4** | Player market (bidding) | Real-time-ish UI patterns, Zustand for ephemeral live state, WebSocket integration (or polling), optimistic UI, race-condition handling |
| **5** | Tournament creation & invites | Complex forms, multi-step wizards, bracket data structures, notifications |
| **6** | Polish: error boundaries, loading skeletons, testing, deployment | Error boundaries, Suspense, RTL tests, CI, deploying to Vercel/Netlify |

We'll do a deep-dive teaching session at the start of each phase, then build it together.

## What "done" looks like for your GitHub repo

- Clean commit history (one logical change per commit, present-tense messages)
- A `docs/` folder with these planning documents
- A root `README.md` with setup instructions, screenshots, and the tech stack table above
- At least one written ADR (Architecture Decision Record) for the Zustand-vs-Query split — great interview talking point, I'll help you write it once Phase 1 is done

---
Next docs: `01-PRD.md` (what we're building and why), `02-app-flow.md` (screen-by-screen flows), `03-uiux-design-brief.md` (visual direction and component inventory).
