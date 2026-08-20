import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { queryClient } from './app/queryClient'
import { router } from './app/router'


/**
 * Compare this to `main.tsx` on the `redux-toolkit-version` branch:
 * the Redux `<Provider store={store}>` wrapper is gone entirely.
 * Zustand stores (see features/auth/authStore.ts) are just hooks —
 * any component can call `useAuthStore()` directly with no ancestor
 * provider required. One fewer layer to reason about, and one fewer
 * thing to remember to wire up when a new store is added.
 *
 * TanStack Query still needs QueryClientProvider — that's unrelated
 * to the Redux/Zustand question, it's providing the query CACHE, a
 * different concern from client state.
 */
/**
 * Dev-only: put the fake pizza guy (MSW) in position before we open the
 * front door (render). Skipped entirely in production — import.meta.env.DEV
 * is false there, so this whole branch (and MSW itself) is dropped from
 * the build.
 */
async function enableMocking() {
  if (!import.meta.env.DEV) return

  const { worker } = await import('./mocks/browser')
  await worker.start()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  )
})
