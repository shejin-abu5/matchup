import type { Match, MatchFilters } from '../types'

/**
 * The raw fetch call. Same job as authApi.ts: turn a network response into
 * either data or a thrown Error, and know nothing about React.
 *
 * Keeping this separate from the useQuery hook means the hook stays about
 * CACHING and this file stays about HTTP. Two small things you can read in
 * one sitting, instead of one file doing both.
 */
export async function fetchMatches(filters: MatchFilters): Promise<Match[]> {
  /**
   * URLSearchParams builds "?format=5v5&q=turf" for us, and — importantly —
   * escapes special characters. If someone searches for "R&B Turf", the raw
   * "&" would otherwise look like the start of a new parameter and break the
   * request. Never hand-glue query strings together.
   */
  const params = new URLSearchParams()

  // Only add a param if it actually has a value. Sending "?format=" (empty)
  // would make the server think you filtered by a format called "".
  if (filters.format) params.set('format', filters.format)
  if (filters.date) params.set('date', filters.date)
  if (filters.q) params.set('q', filters.q)

  const queryString = params.toString()
  const url = queryString ? `/api/matches?${queryString}` : '/api/matches'

  const response = await fetch(url)

  // Same trap as in authApi.ts: fetch does NOT throw on a 404 or 500.
  // Without this check, a failed request would look like a successful one
  // returning undefined, and useQuery would report success.
  if (!response.ok) {
    throw new Error('Could not load matches. Please try again.')
  }

  return response.json()
}
