# UI/UX Design Brief — MatchUp

## 1. Design principles

- **Mobile-first.** Most users will discover/join matches on their phone between plans. Design at 375px width first, scale up.
- **Fast to scan.** Match cards, team cards, and player cards need to communicate status (open/full, live auction, upcoming) in under a second — use color and badges, not paragraphs.
- **Energetic but clean.** Sporty color accents on a mostly neutral/white base — avoid busy backgrounds that fight with content-dense list screens.
- **Trust and status clarity.** Since money-like mechanics exist (bidding), states like "highest bid," "you were outbid," "auction closing in 2m" must be unmistakable — never ambiguous.

## 2. Visual direction

| Token | Suggestion | Notes |
|---|---|---|
| Primary | Deep green (`#0F6E56`-ish) | Pitch/grass association, matches the sport |
| Accent | Warm coral/orange | CTAs, "live" badges, bid alerts |
| Neutral base | Off-white / light gray | Card backgrounds, page background |
| Success | Green | Match confirmed, bid won |
| Warning | Amber | Auction closing soon, invite pending |
| Danger | Red | Outbid, match cancelled |
| Font | A clean geometric sans (Inter, or similar) | Headings medium weight, body regular |
| Radius | 12px cards, 8px buttons/inputs | Consistent rounded, friendly feel |

Keep this as a real Tailwind `theme.extend.colors` config once we start building — I'll help you wire it up.

## 3. Navigation structure

- **Mobile:** bottom tab bar — Home, Teams, Market, Tournaments, Profile
- **Desktop/tablet:** left sidebar with the same 5 sections, top bar with search + notifications bell
- Auth screens (login/signup/onboarding) have no persistent nav — full-screen focused flow

## 4. Key screens (wireframe-level description)

### Home / Discover
- Top: search bar + filter chips (Format, Date, Distance)
- Toggle: List view / Map view
- Below: vertical list of `MatchCard`s
- Floating action button: "+ Create match"

### Match detail
- Hero block: format badge, date/time, location with mini-map
- Player avatars in a horizontal scroll, "X / Y joined"
- Sticky bottom bar: Join/Leave button (state-dependent: Join, Leave, Full, Cancelled)

### Team profile
- Header: team logo, name, W-L record badge
- Tabs: Roster | Upcoming matches | Match history
- Captain sees an extra "Manage" tab (invite/remove players)

### Player market
- Grid/list of `PlayerCard`s: avatar, position badge, skill rating, current highest bid, countdown chip
- Tapping a card opens detail with bid history (mini list) and a bid input
- "Closing soon" (< 5 min) listings get a subtle pulsing coral border — the one place we allow a bit of motion, since it signals genuine urgency

### Tournament bracket
- Horizontal scrollable bracket tree on mobile (rounds as columns)
- Each `TournamentMatch` node = mini match-card: two team names/logos, score once played, tap to open full match detail

### Notifications
- Simple list, unread items with a left accent bar and bold text, grouped by day

## 5. Component inventory (build these first — everything else composes from them)

| Component | Used in | Key states |
|---|---|---|
| `Button` | everywhere | primary, secondary, ghost, danger, loading, disabled |
| `Card` | base for Match/Team/Player cards | default, hover, disabled |
| `MatchCard` | Home, Team profile | open, full, live-team-match, cancelled |
| `TeamCard` | Teams list, Market context | — |
| `PlayerCard` | Player market | listed, bid-in-progress, closing-soon, sold |
| `Avatar` | everywhere | with fallback initials |
| `Badge` | status indicators | neutral, success, warning, danger |
| `Modal` | invites, confirmations, bid confirm | — |
| `Toast` | mutation success/error feedback | success, error, info |
| `BidTicker` | Market detail | live-updating current highest bid + countdown |
| `BracketNode` | Tournament bracket | pending, in-progress, completed |
| `FormField` | all forms | default, error, disabled — pairs with React Hook Form |
| `EmptyState` | any list with zero results | — |
| `Skeleton` | loading state for cards/lists while TanStack Query fetches | — |

## 6. Interaction notes worth building deliberately (good portfolio talking points)

- **Optimistic join/leave** on match cards — instant visual feedback, silently reconciled.
- **Skeleton loaders**, not spinners, for list screens — feels faster and is the modern convention.
- **Error states are recoverable**, not dead ends — every failed query shows a retry action (TanStack Query's `refetch` wired to a button), not just an error message.
- **Optimistic-but-honest bidding UI** — show your bid as "pending" with a subtle state until the server confirms, since money-adjacent flows shouldn't lie about certainty.

---
That's all three planning docs. When you're ready, we can start Phase 0: project scaffolding (Vite + TypeScript + Tailwind + Zustand + TanStack Query + router setup), and I'll explain each config choice as we go.
