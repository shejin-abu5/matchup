import { Card } from '../../../shared/components/Card'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EmptyState } from '../../../shared/components/EmptyState'
import { Button } from '../../../shared/components/Button'
import { MatchCard } from './MatchCard'
import type { Match } from '../types'

interface MatchListProps {
  matches: Match[] | undefined
  isPending: boolean
  isError: boolean
  /** True while ANY fetch is in flight, including a background refetch. */
  isFetching: boolean
  onRetry: () => void
  onClearFilters: () => void
  hasFilters: boolean
}

/** One grey placeholder card, shaped roughly like a real MatchCard. */
function MatchCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-20" />
      </div>
    </Card>
  )
}

/**
 * FOUR STATES, handled explicitly and in this order. Every list screen in
 * every app has these same four, and forgetting one is how you get a blank
 * white screen users can't recover from:
 *
 *   1. loading  — first fetch, nothing to show yet   → skeletons
 *   2. error    — request failed                     → message + RETRY button
 *   3. empty    — request worked, zero results       → explain + a way out
 *   4. success  — actual data                        → the list
 *
 * Note 2 and 3 are different! "It broke" and "there's nothing here" need
 * different words and different escape routes. Merging them ("No matches
 * found" when the server is actually down) actively misleads people.
 *
 * This component takes plain props rather than calling useMatches itself.
 * That keeps it dumb and reusable — the team profile screen can render the
 * same list later without inheriting Discover's filtering logic.
 */
export function MatchList({
  matches,
  isPending,
  isError,
  isFetching,
  onRetry,
  onClearFilters,
  hasFilters,
}: MatchListProps) {
  // 1. LOADING
  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        {/* Array.from({ length: 4 }) makes an array of 4 empty slots to map
            over — a compact way to repeat something a fixed number of times. */}
        {Array.from({ length: 4 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // 2. ERROR — the design brief insists errors are recoverable, not dead ends,
  // so this always offers a retry rather than only stating the problem.
  if (isError) {
    return (
      <EmptyState
        title="Couldn't load matches"
        description="Something went wrong on our end."
        action={
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    )
  }

  // 3. EMPTY
  if (!matches || matches.length === 0) {
    return (
      <EmptyState
        title="No matches found"
        description={
          hasFilters
            ? 'Try widening your filters.'
            : 'There are no upcoming matches right now.'
        }
        action={
          hasFilters ? (
            <Button variant="secondary" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    )
  }

  // 4. SUCCESS
  return (
    // While a background refetch runs (e.g. you just changed a filter), dim
    // the list slightly. `placeholderData` in useMatches keeps the OLD results
    // on screen during that moment, and this is the subtle hint that what
    // you're looking at is about to update.
    <div
      className={`flex flex-col gap-3 transition-opacity ${
        isFetching ? 'opacity-60' : 'opacity-100'
      }`}
    >
      {matches.map((match) => (
        // `key` lets React track which item is which across re-renders, so it
        // can move/reuse DOM nodes instead of rebuilding the list. Always use
        // a stable ID — using the array index breaks when items reorder.
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  )
}
