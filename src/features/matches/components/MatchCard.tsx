import { Link } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import { Badge } from '../../../shared/components/Badge'
import type { Match } from '../types'

interface MatchCardProps {
  match: Match
}

/**
 * Formats an ISO date string into something human, e.g. "Sat 22 Aug, 6:00 pm".
 *
 * Intl.DateTimeFormat is built into the browser — no date library needed for
 * something this simple. (Reach for date-fns only once you need real date
 * MATH, like "3 days ago" or timezone conversion.)
 *
 * Defined outside the component on purpose: if it were inside, a new copy of
 * this function would be created on every single render, for no benefit.
 */
function formatMatchDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function MatchCard({ match }: MatchCardProps) {
  // DERIVED state: calculated from props during render, NOT stored in useState.
  // Storing this would mean keeping it in sync with playerCount forever — a
  // classic source of bugs. If you can calculate it, calculate it.
  const spotsLeft = match.maxPlayers - match.playerCount
  const isFull = spotsLeft <= 0

  return (
    // The whole card is a link — bigger tap target than a small "view" button,
    // which matters on the mobile-first design this brief calls for.
    <Link to={`/matches/${match.id}`} className="block">
      <Card className="transition-colors hover:border-primary">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* truncate = cut long titles with "…" instead of wrapping and
                breaking the card's layout. Needs the min-w-0 above to work
                inside a flex row — a well-known flexbox gotcha. */}
            <h3 className="truncate font-medium text-gray-900">{match.title}</h3>
            <p className="truncate text-sm text-gray-500">{match.location}</p>
          </div>

          <Badge variant={isFull ? 'danger' : 'success'}>
            {isFull ? 'Full' : `${spotsLeft} left`}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge>{match.format}</Badge>
          <Badge>{match.skillLevel}</Badge>
          <span className="text-sm text-gray-500">{formatMatchDate(match.dateTime)}</span>
        </div>

        <p className="mt-2 text-xs text-gray-400">
          {match.playerCount} / {match.maxPlayers} joined
        </p>
      </Card>
    </Link>
  )
}
