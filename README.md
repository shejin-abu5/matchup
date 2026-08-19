# MatchUp

A football match/team/tournament platform, built as a learning project to master React, Zustand, and TanStack Query — inspired by [Playo](https://playo.co/).

Full planning docs are in [`/docs`](./docs):

- [`00-architecture-and-learning-roadmap.md`](./docs/00-architecture-and-learning-roadmap.md) — tech stack rationale, folder structure, phased build plan
- [`01-PRD.md`](./docs/01-PRD.md) — product scope and requirements
- [`02-app-flow.md`](./docs/02-app-flow.md) — screen-by-screen user flows
- [`03-uiux-design-brief.md`](./docs/03-uiux-design-brief.md) — visual direction and component inventory

## Tech stack

| Layer | Choice |
|---|---|
| Build tool | Vite |
| Language | TypeScript |
| UI | React 19 |
| Routing | React Router |
| Server state | TanStack Query |
| Global client state | Zustand |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v4 |

## Getting started

```bash
npm install
npm run dev
```

Type-check and build:

```bash
npx tsc --noEmit
npm run build
```

## Project structure

```
src/
  app/            # query client, router — app-wide wiring
  features/       # one folder per domain (auth, matches, teams, playerMarket, tournaments)
    <feature>/
      components/
      api/        # TanStack Query hooks live here
      <feature>Store.ts   # only if the feature needs global client state (Zustand)
  shared/         # reusable components, hooks, utils, types
```

## Status

Phase 0 complete: project scaffolding, routing skeleton, Zustand auth store (with `persist` middleware), Query client all wired and building cleanly. See the roadmap doc for what's next.
