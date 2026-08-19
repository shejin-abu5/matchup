import { QueryClient } from '@tanstack/react-query'

/**
 * Defaults worth understanding (interview-relevant):
 *
 * - staleTime: how long fetched data is considered "fresh." At 0
 *   (the QueryClient default), React Query refetches on every
 *   remount/window-refocus. For match lists that don't change every
 *   second, a short staleTime (e.g. 30s) avoids redundant network
 *   calls without meaningfully hurting freshness.
 * - retry: how many times a failed query auto-retries before showing
 *   an error state. 1 is a reasonable default for a learning project;
 *   production APIs often tune this per-query.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
