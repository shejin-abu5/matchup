# Phase 2a — Discover Matches: A Beginner's Walkthrough

> Builds on `docs/04-phase-1-auth-notes.md`. Phase 1 was about *sending* data
> to a server (mutations). This phase is about *reading* data from one, and
> caching it well.
>
> Code lives in `src/features/matches/`.

---

## What we built

The home screen (`/`): a list of upcoming matches you can filter by format,
date, and a search box. Filters live in the URL, so they're shareable and the
back button works.

**Not** built yet (deliberately postponed):
- Pagination / infinite scroll — a focused follow-on, so query keys land first
- Map view — needs a map library; big dependency, no React lesson in it
- Distance filter — needs real coordinates and geolocation
- Creating a match (Phase 2b) and joining one (Phase 2c)

---

## Part 1 — `useQuery` vs `useMutation`

Phase 1 used `useMutation`. This phase uses `useQuery`. The difference matters.

| | `useQuery` | `useMutation` |
|---|---|---|
| Analogy | a fridge that restocks itself | a vending machine |
| Purpose | **reading** data | **changing** data |
| When it runs | automatically, on its own | only when you call `.mutate()` |
| Runs again? | yes — refetches when stale | no, once per press |
| Examples here | the match list | login, signup |

**Rule of thumb:** if the operation is safe to run twice by accident, it's
probably a query. If running it twice would create two accounts or two
matches, it's a mutation.

---

## Part 2 — Query keys (the important one)

TanStack Query keeps a **cache** — a box of data it already fetched. The
`queryKey` is the **label on the box**.

```ts
useQuery({
  queryKey: ['matches', 'list', { format: '5v5' }],
  queryFn: () => fetchMatches({ format: '5v5' }),
})
```

Different key = different box:

```
['matches','list',{format:'5v5'}]   → one cached list
['matches','list',{format:'7v7'}]   → a completely separate cached list
```

### What you'll actually see

1. Open the app, tap **5v5** → skeletons, then results (it fetched)
2. Tap **7v7** → skeletons, then results (different key, so it fetched again)
3. Tap **5v5** again → **results appear instantly**

Step 3 is the payoff. Query found that key already in the cache and rendered it
immediately, *then* quietly refetched in the background to check it's still
right. That pattern has a name: **stale-while-revalidate**.

Open the React Query Devtools (the floating button in the corner) and watch
cache entries pile up as you tap chips. That's the concept made visible.

### The rule you must not break

> **Every value the `queryFn` uses must appear in the `queryKey`.**

If `q` were missing from our key, then searching for "turf" would keep the same
key as the unsearched list — Query would think "I already have this" and show
you stale, unfiltered results. Searching would appear to do nothing.

This is a genuinely common bug and a very common interview question.

### Why the keys live in one object

```ts
export const matchKeys = {
  all: ['matches'] as const,
  list: (filters: MatchFilters) => ['matches', 'list', filters] as const,
}
```

If components typed key arrays inline, two of them could drift — one writing
`['matches', filters]`, another `['matches','list',filters]` — and silently
create two cache entries for the same data. One factory, one shape.

It also makes invalidation easy later: `queryClient.invalidateQueries({ queryKey: matchKeys.all })`
wipes *every* match list at once, whatever its filters. Phase 2b uses that after
creating a match.

---

## Part 3 — The four states of any list

Every list screen in every app has the same four states. Missing one is how you
get a blank screen users can't escape.

```
1. loading   first fetch, nothing yet      → skeletons
2. error     the request failed            → message + RETRY button
3. empty     it worked, zero results       → explain + a way out
4. success   real data                     → the list
```

`MatchList.tsx` handles them in exactly that order.

### Error ≠ empty

These are different and must read differently:

- **Empty**: "No matches found — try widening your filters" + Clear filters
- **Error**: "Couldn't load matches" + **Try again**

Showing "No matches found" when the server is actually down is actively
misleading — the user thinks there's no football on, when really your API is
broken.

The design brief insists errors always offer a way out, never a dead end. That's
what `refetch` (from `useQuery`) is wired to.

### Skeletons, not spinners

A spinner says "something is happening". A skeleton says "four cards are coming
and they'll look like this". Nothing jumps when real data lands, because the
placeholder already holds the space.

> The mock API has a deliberate 600ms delay so you can actually see this.
> On localhost a real response is instant and you'd never notice the loading
> state you built.

---

## Part 4 — `placeholderData`: no flicker on filter change

```ts
placeholderData: (previousData) => previousData,
```

Without this, changing a filter blanks the whole list back to skeletons for a
moment. With it, the previous results **stay on screen** while the new ones
load, then swap in.

`isFetching` still tells us a request is in flight, so `MatchList` dims the list
slightly (`opacity-60`) as a subtle "this is about to update" hint.

### `isPending` vs `isFetching` — easy to confuse

| | Means |
|---|---|
| `isPending` | **no data at all yet** — first ever load for this key |
| `isFetching` | **a request is in flight**, including background refetches |

Skeletons use `isPending` (we have nothing to show). Dimming uses `isFetching`
(we have something, it's just refreshing).

---

## Part 5 — The URL as your state container

Filters live in the address bar: `/?format=5v5&q=turf`

```ts
const [searchParams, setSearchParams] = useSearchParams()
```

`useSearchParams` (React Router) works just like `useState` — a value and a
setter — except the value lives in the URL instead of memory.

**Three things this buys for free:**

1. The back button steps through filter changes
2. A filtered view is a shareable link
3. Refreshing keeps your filters

**Interview framing:** "Where does filter state belong?" A strong answer is
"in the URL, because filters describe *what you're looking at* — that's
navigation state, and navigation state belongs in the address bar." `useState`
is fine but throws away shareability and history for nothing.

### Why the search box is the exception

The search input uses `useState`, not the URL. Writing to the URL on every
keystroke would push a history entry per letter — the back button would walk
backwards through `tur`, `tu`, `t`. So it's local, and synced to the URL after
a pause with `{ replace: true }` (overwrite the entry rather than add one).

---

## Part 6 — `useDeferredValue` for search

```ts
const [searchValue, setSearchValue] = useState('')
const deferredSearch = useDeferredValue(searchValue)
```

`useDeferredValue` hands back a **lagging copy** of a value.

- `searchValue` updates instantly → the input never feels sluggish
- `deferredSearch` trails behind → used for the expensive work (the request)

So typing stays smooth, but we don't fire a network request per keystroke.

This is React 19's answer to "how do you handle search-as-you-type?" — the older
answer was a hand-rolled `setTimeout` debounce. Worth knowing both, since
interviewers still ask about debouncing.

---

## Part 7 — Smaller React lessons in this code

### Derived state — don't store what you can calculate

```ts
const spotsLeft = match.maxPlayers - match.playerCount
const isFull = spotsLeft <= 0
```

Calculated during render, **not** kept in `useState`. Storing it would mean
keeping it in sync with `playerCount` forever, and it *will* drift eventually.

**If you can calculate it from props or existing state, calculate it.**

### The `key` prop

```tsx
{matches.map((match) => <MatchCard key={match.id} match={match} />)}
```

`key` lets React track which item is which between renders, so it can move and
reuse DOM nodes instead of rebuilding the list.

Always a **stable ID**. Using the array index breaks the moment items reorder —
React reuses the wrong node and you get mismatched content.

### `children`

```tsx
<Card>  <p>hello</p>  </Card>
```

That `<p>` arrives inside `Card` as the special `children` prop. It's what makes
a component a *container*.

### Filtering never mutates

```ts
let results = matches.filter(...)   // returns a NEW array
```

`.filter()` doesn't touch the original. That matters in `handlers.ts` because
`matches` is our pretend database — a GET request must never modify it.

---

## Part 8 — `shared/` vs `features/`, in practice

This phase added components to both, which makes the line concrete:

| Component | Where | Why |
|---|---|---|
| `Card`, `Badge`, `Skeleton`, `EmptyState` | `shared/components/` | know nothing about matches; teams and tournaments will reuse them |
| `MatchCard`, `MatchList`, `MatchFilters` | `features/matches/components/` | understand what a match *is* |

**The test:** does this component understand our domain? If yes → `features/`.
If it would make just as much sense in a completely different app → `shared/`.

`MatchCard` is *built from* `Card` + `Badge`. That's the intended direction:
feature components compose shared ones, never the reverse.

---

## Part 9 — Why filtering happens on the "server"

The MSW handler does the filtering, not React. That's deliberate.

If we fetched all matches once and filtered them in the browser, there'd be
exactly **one** cache entry and query keys would teach you nothing. Because each
filter combination is a different *request*, each gets its own cache entry —
which is the whole lesson.

It's also how a real app works: you don't ship 50,000 matches to a phone and
filter them there. The server does it in SQL.

---

## Part 10 — Interview questions

**1. What is a query key and why does it matter?**
It's the cache address for a piece of server data. Different keys are cached
separately, so returning to a previous filter renders instantly from cache while
revalidating in the background. Every value the fetch depends on must be in the
key, or you'll serve stale data for a different request.

**2. `useQuery` or `useMutation` — how do you choose?**
Queries read and run automatically; mutations change things and only run when
triggered. If accidentally running it twice would be harmless, it's a query.

**3. Difference between `isPending` and `isFetching`?**
`isPending` means there's no data yet at all (first load). `isFetching` means a
request is in flight, including background refetches when data already exists.

**4. Where should filter state live?**
The URL. Filters describe what you're looking at, which is navigation state —
so you get shareable links, working back button, and refresh persistence for
free. `useState` works but discards all three.

**5. Why skeletons instead of a spinner?**
They communicate the shape of what's coming, prevent layout shift when data
lands, and measurably feel faster.

**6. How do you stop search-as-you-type firing a request per keystroke?**
`useDeferredValue` (React 19) — the input updates immediately while a lagging
copy drives the expensive work. Older approach: a `setTimeout` debounce.

---

## Part 11 — Files added

```
src/features/matches/
  types.ts                      Match + MatchFilters shapes
  api/
    matchesApi.ts               the fetch call
    useMatches.ts               useQuery + the key factory  ← core of this phase
  components/
    DiscoverPage.tsx            URL state, wires everything together
    MatchFilters.tsx            search box + chips
    MatchList.tsx               the four states
    MatchCard.tsx               one match

src/shared/components/
  Card.tsx  Badge.tsx  Skeleton.tsx  EmptyState.tsx

src/mocks/
  matchData.ts                  16 seeded matches, dates relative to now
  handlers.ts                   + GET /api/matches with server-side filtering

src/app/router.tsx              '/' now renders DiscoverPage
```

---

## Part 12 — Status

- [x] Match list fetched with `useQuery`
- [x] Filters in the URL driving the query key
- [x] Loading / error / empty / success states
- [x] Search with `useDeferredValue`
- [x] TypeScript and linter clean
- [ ] **Clicked through in a browser** — still unverified, same as Phase 1
- [ ] Committed

**Next:** Phase 2b — creating a match (`useMutation` again, plus **cache
invalidation**: telling Query "the match list just changed, throw it away and
refetch"). Then Phase 2c — joining a match with **optimistic updates**, the most
interview-relevant piece of the whole phase.
