import { useDeferredValue, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MatchFilters } from './MatchFilters'
import { MatchList } from './MatchList'
import { useMatches } from '../api/useMatches'
import type { MatchFilters as Filters, MatchFormat } from '../types'

/**
 * ============================================================
 *  THE URL IS THE STATE CONTAINER
 * ============================================================
 *
 * Filters live in the address bar: /?format=5v5&q=turf
 *
 * We could have used useState. Putting them in the URL instead buys three
 * things for free, with no extra code:
 *
 *   1. The back button steps through filter changes, like users expect.
 *   2. A filtered view is a shareable link — send someone "5v5 matches
 *      this week" and they see exactly what you see.
 *   3. Refreshing the page keeps your filters.
 *
 * useSearchParams is React Router's hook for this. It works like useState:
 * you get the current value and a setter, and changing it re-renders.
 * The difference is that the value lives in the URL, not in memory.
 */
export function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read the URL into a plain object our query layer understands.
  // `?? undefined` because searchParams.get() returns null when a param is
  // absent, and our MatchFilters type expects undefined for "not set".
  const filters: Filters = {
    format: (searchParams.get('format') as MatchFormat | null) ?? undefined,
    date: (searchParams.get('date') as 'today' | 'week' | null) ?? undefined,
    q: searchParams.get('q') ?? undefined,
  }

  /**
   * SEARCH INPUT: local state, not the URL.
   *
   * Why the exception? Writing to the URL on every keystroke would push a
   * history entry per letter — the back button would then walk backwards
   * through "tur", "tu", "t". So the input is local, and we sync it to the
   * URL after a short pause (see the useEffect below).
   */
  const [searchValue, setSearchValue] = useState(filters.q ?? '')

  /**
   * useDeferredValue (React 19) hands back a "lagging" copy of a value.
   * The input stays perfectly responsive because `searchValue` updates
   * immediately, while `deferredSearch` trails slightly behind — and it's
   * the deferred one we use for the expensive work (a network request).
   *
   * Result: typing feels instant, but we don't fire a request per keystroke.
   */
  const deferredSearch = useDeferredValue(searchValue)

  /**
   * Sync the deferred search value into the URL.
   *
   * useEffect = "run this AFTER rendering, when these values changed".
   * We need it here because we're synchronising with something OUTSIDE
   * React (the browser's address bar) — that's exactly what effects are for.
   */
  useEffect(() => {
    const trimmed = deferredSearch.trim()
    const current = searchParams.get('q') ?? ''

    // Guard: without this, setting the params would re-render, which would
    // run this effect again, forever. Only write when something CHANGED.
    if (trimmed === current) return

    const next = new URLSearchParams(searchParams)
    if (trimmed) {
      next.set('q', trimmed)
    } else {
      next.delete('q')
    }

    // replace: true overwrites the current history entry instead of adding
    // one, so searching doesn't flood the back button.
    setSearchParams(next, { replace: true })
  }, [deferredSearch, searchParams, setSearchParams])

  /** Write chip selections into the URL. */
  const handleFilterChange = (nextFilters: Filters) => {
    const next = new URLSearchParams(searchParams)

    // Object.entries turns { format: '5v5', date: undefined } into
    // [['format','5v5'], ['date', undefined]] so we can loop over it.
    for (const [key, value] of Object.entries(nextFilters)) {
      if (value) {
        next.set(key, value)
      } else {
        // Deleting rather than setting "" keeps the URL clean: /?format=5v5
        // instead of /?format=5v5&date=&q=
        next.delete(key)
      }
    }

    setSearchParams(next)
  }

  const handleClearFilters = () => {
    setSearchValue('')
    setSearchParams(new URLSearchParams())
  }

  /**
   * THE HOOK. Note what's passed: `filters`, read from the URL. So the URL
   * drives the query key, which drives the cache. Change the URL → new key
   * → Query either serves a cached result instantly or fetches a new one.
   */
  const { data, isPending, isError, isFetching, refetch } = useMatches(filters)

  const hasFilters = Boolean(filters.format || filters.date || filters.q)

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Discover matches</h1>
        <p className="text-sm text-gray-500">Find a game near you</p>
      </div>

      <MatchFilters
        filters={filters}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onFilterChange={handleFilterChange}
      />

      <MatchList
        matches={data}
        isPending={isPending}
        isError={isError}
        isFetching={isFetching}
        onRetry={refetch}
        onClearFilters={handleClearFilters}
        hasFilters={hasFilters}
      />
    </div>
  )
}
