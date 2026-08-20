import type { Match, MatchFormat, SkillLevel } from '../features/matches/types'

/**
 * Seed data for the fake backend.
 *
 * Dates are generated RELATIVE to right now (see daysFromNow below) rather
 * than hardcoded. If we hardcoded "2026-08-22", every match would silently
 * drift into the past and the "today"/"this week" filters would stop
 * returning anything a few days later.
 */

/** Returns an ISO date string N days from now, at the given hour (local time). */
function daysFromNow(days: number, hour: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

interface Seed {
  title: string
  location: string
  days: number
  hour: number
  format: MatchFormat
  playerCount: number
  skillLevel: SkillLevel
}

const seeds: Seed[] = [
  { title: 'Sunday Turf Kickabout', location: 'Greenfield Turf, Kakkanad', days: 0, hour: 18, format: '5v5', playerCount: 8, skillLevel: 'beginner' },
  { title: 'Evening 5s',            location: 'Sportz Arena, Edappally',   days: 0, hour: 20, format: '5v5', playerCount: 10, skillLevel: 'intermediate' },
  { title: 'Morning Warmup',        location: 'Marine Drive Ground',       days: 1, hour: 7,  format: '7v7', playerCount: 6,  skillLevel: 'beginner' },
  { title: 'Midweek 7s',            location: 'Panampilly Nagar Turf',     days: 2, hour: 19, format: '7v7', playerCount: 12, skillLevel: 'intermediate' },
  { title: 'Competitive 11s',       location: 'Maharajas College Ground',  days: 3, hour: 16, format: '11v11', playerCount: 18, skillLevel: 'advanced' },
  { title: 'Friday Night Lights',   location: 'Turf Park, Vyttila',        days: 4, hour: 21, format: '5v5', playerCount: 10, skillLevel: 'intermediate' },
  { title: 'Weekend Warmup 7s',     location: 'Kaloor Stadium Annexe',     days: 5, hour: 8,  format: '7v7', playerCount: 9,  skillLevel: 'beginner' },
  { title: 'Saturday Showdown',     location: 'Greenfield Turf, Kakkanad', days: 6, hour: 17, format: '11v11', playerCount: 22, skillLevel: 'advanced' },
  { title: 'Casual Sunday 5s',      location: 'Sportz Arena, Edappally',   days: 7, hour: 18, format: '5v5', playerCount: 4,  skillLevel: 'beginner' },
  { title: 'Rainy Day Indoor',      location: 'Indoor Arena, Palarivattom', days: 8, hour: 19, format: '5v5', playerCount: 7, skillLevel: 'intermediate' },
  { title: 'Next Week 7s',          location: 'Panampilly Nagar Turf',     days: 9, hour: 20, format: '7v7', playerCount: 11, skillLevel: 'intermediate' },
  { title: 'League Practice',       location: 'Maharajas College Ground',  days: 10, hour: 16, format: '11v11', playerCount: 20, skillLevel: 'advanced' },
  { title: 'Beginners Welcome',     location: 'Turf Park, Vyttila',        days: 11, hour: 18, format: '5v5', playerCount: 3,  skillLevel: 'beginner' },
  { title: 'Thursday Regulars',     location: 'Kaloor Stadium Annexe',     days: 12, hour: 19, format: '7v7', playerCount: 14, skillLevel: 'intermediate' },
  { title: 'Big Match Prep',        location: 'Greenfield Turf, Kakkanad', days: 13, hour: 17, format: '11v11', playerCount: 16, skillLevel: 'advanced' },
  { title: 'Chill 5s',              location: 'Indoor Arena, Palarivattom', days: 14, hour: 21, format: '5v5', playerCount: 10, skillLevel: 'beginner' },
]

/** How many players each format needs — used to derive maxPlayers. */
const maxPlayersByFormat: Record<MatchFormat, number> = {
  '5v5': 10,
  '7v7': 14,
  '11v11': 22,
}

export const matches: Match[] = seeds.map((seed, index) => ({
  id: `m${index + 1}`,
  title: seed.title,
  location: seed.location,
  dateTime: daysFromNow(seed.days, seed.hour),
  format: seed.format,
  maxPlayers: maxPlayersByFormat[seed.format],
  playerCount: seed.playerCount,
  skillLevel: seed.skillLevel,
  creatorId: 'u1',
}))
