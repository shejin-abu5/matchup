/**
 * The shape of a match, mirroring the data model in docs/01-PRD.md.
 *
 * This is a TYPE-ONLY file — it produces no JavaScript at all. Types are
 * erased when the code runs; they exist purely so your editor can catch
 * mistakes while you write (e.g. typing `match.lcoation`).
 *
 * Why a separate file: both the API layer (api/) and the components/ need
 * this shape. Putting it in either one would make the other import from a
 * weird place.
 */

// A "union type" — a Format can ONLY be one of these three strings.
// Typing '6v6' anywhere is now a compile error, which is much safer than
// using plain `string` and hoping everyone spells it the same way.
export type MatchFormat = '5v5' | '7v7' | '11v11'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Match {
  id: string
  title: string
  location: string
  /** ISO 8601 string, e.g. "2026-08-22T18:30:00.000Z" — JSON has no Date type,
   *  so dates always travel over HTTP as strings and get parsed on arrival. */
  dateTime: string
  format: MatchFormat
  maxPlayers: number
  /** How many have joined so far. When this equals maxPlayers the match is full. */
  playerCount: number
  skillLevel: SkillLevel
  creatorId: string
}

/**
 * The filters the Discover screen supports. These come from the URL
 * (see DiscoverPage.tsx) and become part of the TanStack Query cache key.
 *
 * All optional: no filter means "don't narrow by this".
 */
export interface MatchFilters {
  format?: MatchFormat
  /** 'today' = today only, 'week' = next 7 days, undefined = any upcoming date */
  date?: 'today' | 'week'
  /** free-text search across title and location */
  q?: string
}
