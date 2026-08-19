# App Flow — MatchUp

Each flow below lists: entry point → steps → screens → what state is involved (server state via TanStack Query vs global client state via Zustand vs local state), so you can see the architecture decisions in context as you build.

## 1. Auth flow

**Entry point:** app load, or any protected action while logged out.

1. `/signup` — name, email, password, confirm password (React Hook Form + Zod validation)
2. On submit → `useMutation(signup)` → on success, store JWT + user in Zustand `authStore`, redirect to `/onboarding`
3. `/onboarding` — pick position (GK/DEF/MID/FWD), skill level, home location, avatar
4. `/login` — email + password → `useMutation(login)` → same Zustand update → redirect to `/home`
5. Logout — clears Zustand auth state + TanStack Query cache (`queryClient.clear()`) → redirect to `/login`

**State:** Zustand owns `{ user, token, isAuthenticated }`. A `ProtectedRoute` wrapper reads this and redirects if false.

## 2. Home / discover matches flow

**Entry point:** `/home` after login (or public browse for guests, join disabled).

1. Home shows: nearby open matches (list/map toggle), filters (date, format, distance), a "Create match" CTA
2. Filters change → triggers a new `useQuery(['matches', filters])` — this is where you learn **query keys**: changing filters changes the key, which changes the cache entry
3. Tap a match card → `/matches/:id`

**State:** Filters are **local component state** (or lifted to a small Zustand store if shared across routes) driving the TanStack Query key. Match list itself is pure server state — never duplicated into Zustand.

## 3. Create match flow

1. `/matches/new` — multi-step or single form: location (map picker), date/time, format, max players, skill level, notes
2. Submit → `useMutation(createMatch)` → on success, invalidate `['matches']` query so lists refresh, then redirect to the new match's detail page
3. Toast notification "Match created" (a Zustand `uiStore` or a lightweight toast library)

**State:** Form fields = local state (React Hook Form). Submission = TanStack `useMutation`. Success toast = Zustand/UI state.

## 4. Match detail & join flow

1. `/matches/:id` — shows match info, joined players (avatars + count/max), a Join or Leave button depending on membership + auth state
2. Tap Join → `useMutation(joinMatch)` with **optimistic update**: immediately show yourself as joined, roll back if the server rejects (e.g. match filled in a race condition)
3. If match is a team match, show both team rosters and a "Team A vs Team B" header instead of an individual roster

**State:** This is your first real optimistic-update lesson — a core TanStack Query interview topic (`onMutate`, `onError` rollback, `onSettled` refetch).

## 5. Team creation & management flow

1. `/teams/new` — name, logo upload, home location → `useMutation(createTeam)` → you become captain
2. `/teams/:id` — roster, win/loss record, upcoming team matches, "Invite player" (captain only — UI check backed by a server-side role check)
3. Invite player → search users by name → send invite → invited user sees it in a "Invitations" inbox screen, accept/decline → `useMutation`, invalidates team roster query
4. Captain-only: "Challenge a team" → pick opposing team → creates a proposed team match → opposing captain must accept before it appears on both team calendars

**State:** Roster = server state. "Am I the captain of this team" = derived from server state (`team.captainId === currentUser.id` from Zustand), not duplicated state.

## 6. Player market (bidding) flow

This is the most architecturally interesting flow — good to walk through in an interview.

1. `/market` — free agent players listed, each with current highest bid + countdown timer
2. Free agent opts in: `/profile` → "List me on the market" → sets `minBid`, `closesAt`
3. Captain browses `/market`, taps a listing → `/market/:id` — detail + bid form
4. Captain places a bid → client-side check: bid must exceed current highest (fast feedback before hitting the server) → `useMutation(placeBid)`
5. **Live updates while viewing a listing:** other captains' bids should appear without a manual refresh. Two implementation options to discuss/build:
   - Simple version: `useQuery` with `refetchInterval` (polling every few seconds) — good enough to learn the pattern
   - Advanced version: WebSocket subscription that dispatches into a Zustand store (`biddingStore`) holding `{ listingId, currentHighBid, timeRemaining }` for the currently-open auction, since this is truly ephemeral, fast-changing UI state that doesn't belong in the Query cache
6. Auction closes (`closesAt` passed) → server marks winner → player's `teamId` updates → both parties notified

**State:** This flow is the textbook case for "why not put everything in Query." The historical bid list is server state (Query). The live "auction room" countdown + current bid ticking down in real time is **Zustand**, because it's high-frequency, UI-only, and multiple components (bid form, header ticker, notification badge) need to read it synchronously.

## 7. Tournament creation & invite flow

1. `/tournaments/new` — name, format (knockout/round robin), number of team slots, date range → `useMutation(createTournament)`
2. `/tournaments/:id/invite` — organizer searches/selects teams to invite → sends `TournamentTeam` invites
3. Invited captains see a "Tournament invites" inbox item → accept/decline → `useMutation`, invalidates `['tournament', id, 'teams']`
4. Once enough teams accept (or organizer manually starts), "Generate bracket" button appears → server generates `TournamentMatch` records → bracket view renders
5. `/tournaments/:id` — bracket visualization, click into any `TournamentMatch` → same match detail component reused from flow 4, but scoped to tournament context
6. As results are entered, bracket auto-advances winners to the next round

**State:** Bracket structure = server state (refetch after each result). Which round the organizer is currently viewing/editing = local state.

## 8. Notifications flow (cross-cutting)

- Sources: team invites, tournament invites, outbid alerts, match reminders
- `/notifications` — list, powered by `useQuery(['notifications'])` with polling
- Unread count badge in the nav = derived from that same query's data — a good lesson in **not duplicating server data into Zustand just to show a badge**; select/derive it instead

---
Next: `03-uiux-design-brief.md` for the visual direction and component inventory these flows will need.
