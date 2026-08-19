# Product Requirements Document — MatchUp

## 1. Overview

MatchUp is a football (soccer) match-organizing platform, inspired by Playo. Players find and join pickup matches near them. Beyond the core Playo flow, MatchUp adds a competitive layer: registered teams, a player transfer/bidding market, and organizer-run tournaments.

## 2. Problem statement

Casual football players struggle to find enough people for a game on short notice. Existing groups/teams have no lightweight way to schedule matches against other teams, recruit players, or run small tournaments without spreadsheets and WhatsApp chaos.

## 3. Target users / personas

| Persona | Description | Primary need |
|---|---|---|
| **Casual player (Pranav)** | Wants a pickup game this weekend | Find/join a nearby open match fast |
| **Team captain (Riya)** | Runs a regular 7-a-side team | Schedule matches vs other teams, manage roster, recruit players |
| **Free agent player (Aman)** | Skilled player without a fixed team | Get discovered and "bought" into a team via the player market |
| **Tournament organizer (Vikram)** | Runs a weekend 5-team tournament | Create bracket, invite teams, track results |

## 4. Goals & success metrics (for a learning project, these are illustrative — good to state in interviews as "how I'd measure it")

- Time to create a match < 60 seconds
- % of created matches that reach minimum player count
- Number of teams with 2+ completed matches
- Tournament completion rate (created → all matches played)

## 5. Scope

### MVP (Phase 1–2)
- Auth: signup, login, logout, JWT session
- User profile (name, position, skill level, avatar)
- Create a match (location, date/time, format e.g. 5v5/7v5, slots, skill level)
- Browse/search matches (filter by location, date, format)
- Join / leave a match
- Match detail page with joined players list

### Phase 3 — Teams
- Create a team (name, logo, home location)
- Invite/accept players into a team
- Team profile page (roster, match history, win/loss record)
- Team vs team match creation (captain challenges another team)

### Phase 4 — Player market (bidding)
- Free-agent players can list themselves on the market
- Teams can browse free agents and place bids
- Simple auction mechanics: bid, counter-bid, time-boxed auction window, winning bid = player joins team
- Notifications when outbid

### Phase 5 — Tournaments
- Organizer creates a tournament (name, format — knockout/round robin, team slots, dates)
- Organizer invites teams; teams accept/decline
- Bracket/schedule generation
- Match results feed into standings/bracket progression

### Explicitly out of scope (for now)
- Payments (entry fees, prize pools) — noted as a future extension
- Live video/streaming
- Native mobile apps (we build responsive web first)
- Real-money bidding (player market is a virtual/points-based mechanic, not real currency, unless you want to extend it later)

## 6. Functional requirements (representative user stories)

### Epic: Auth
- As a new user, I can sign up with email/password (or OAuth later) so I can create an account.
- As a user, I can log in and stay logged in across sessions (refresh token or persisted JWT).
- As a user, I can log out, which clears my session everywhere in the app.
- **Acceptance criteria:** invalid credentials show inline error; auth state is available app-wide via Zustand; protected routes redirect unauthenticated users to `/login`.

### Epic: Matches
- As a player, I can create a match with location, date/time, format, and max players.
- As a player, I can browse a list of upcoming matches filtered by location/date/format.
- As a player, I can join an open match if slots remain, and leave a match I've joined.
- **Acceptance criteria:** match list uses server-driven pagination; joining is optimistic in the UI but reconciled with the server response; a full match shows "Full" and disables joining.

### Epic: Teams
- As a captain, I can create a team and become its owner/captain role.
- As a captain, I can invite existing users to my team by search or link.
- As a captain, I can challenge another team to a match (creates a "team match" variant of a match).
- **Acceptance criteria:** only the captain role can invite/remove players or accept challenges; team match requires both captains to confirm.

### Epic: Player market
- As a free agent, I can list myself as available with a minimum bid.
- As a captain, I can browse free agents and place a bid on one.
- As a free agent, I can accept the winning/best bid, joining that team.
- **Acceptance criteria:** auction has a countdown; bids below the current highest are rejected client-side before hitting the server; outbid captains get a notification (poll or WebSocket).

### Epic: Tournaments
- As an organizer, I can create a tournament and set the format and team slots.
- As an organizer, I can invite specific teams; teams can accept/decline.
- As an organizer, once enough teams accept, I can generate the bracket/schedule.
- **Acceptance criteria:** bracket updates automatically as match results are entered; declined invites free up a slot.

## 7. Non-functional requirements

- **Performance:** match list should render meaningfully within ~1s on cached data (TanStack Query cache-first strategy).
- **Resilience:** network failures show retry UI, not blank screens (React Query's built-in retry + error boundaries).
- **Accessibility:** forms fully keyboard-navigable, proper labels, color contrast AA.
- **Security:** JWT stored appropriately (httpOnly cookie preferred over localStorage — worth a design discussion), role checks enforced server-side, not just hidden in UI.
- **Scalability (conceptual, for interview discussion):** match/team data is paginated and query-cached; bidding uses optimistic concurrency to handle race conditions on simultaneous bids.

## 8. Roles & permissions

| Action | Guest | Player | Team captain | Tournament organizer |
|---|---|---|---|---|
| Browse matches/teams | ✅ | ✅ | ✅ | ✅ |
| Create/join match | ❌ | ✅ | ✅ | ✅ |
| Create team | ❌ | ✅ (becomes captain) | ✅ | ✅ |
| Invite/remove team players | ❌ | ❌ | ✅ (own team) | — |
| Place bid on player | ❌ | ❌ | ✅ (own team) | — |
| Create tournament | ❌ | ✅ (becomes organizer) | ✅ | ✅ |
| Invite teams to tournament | ❌ | ❌ | — | ✅ (own tournament) |

## 9. Core data entities (for API/schema design discussion)

```
User        { id, name, email, avatarUrl, position, skillLevel }
Match       { id, creatorId, location, dateTime, format, maxPlayers, players[], teamMatch: boolean, teamAId?, teamBId? }
Team        { id, name, logoUrl, captainId, members[], location }
TeamInvite  { id, teamId, userId, status }
MarketListing { id, playerId, minBid, status, closesAt }
Bid         { id, listingId, teamId, amount, createdAt }
Tournament  { id, organizerId, name, format, teamSlots, invitedTeams[], status }
TournamentTeam { id, tournamentId, teamId, status }
TournamentMatch { id, tournamentId, round, teamAId, teamBId, matchId, result }
```

## 10. Assumptions

- Single sport (football) for v1; entity model leaves room for multi-sport later.
- Backend can start as a mock (MSW or JSON Server) so frontend work isn't blocked.
- Real-time features (bidding, notifications) start with polling via TanStack Query's `refetchInterval`, and can be upgraded to WebSockets once the pattern is understood.

---
Next: `02-app-flow.md` for screen-by-screen flow through each epic above.
