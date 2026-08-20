# Phase 1 — Signup & Login: A Beginner's Walkthrough

> Written for someone learning React. It starts from the basics and builds up.
> The picture version of the flow is in `docs/Signup Request Trace.html` —
> open it in a browser alongside this.
>
> The code lives in `src/features/auth/`. That code has comments for
> line-by-line detail; this doc explains the *ideas*.

---

## Part 0 — React words you need first

If these are already familiar, skip to Part 1.

**Component**
A function that returns some HTML-looking stuff (JSX). That's it. `LoginForm`
is a component. You use it by writing `<LoginForm />`.

```tsx
function Hello() {
  return <p>Hi there</p>
}
```

**Props**
The values you pass *into* a component, like arguments to a function.

```tsx
<FormField label="Email" />     // "Email" is a prop called label
```

**State**
Facts that can change while the app is running. "Is the user logged in?" is
state. "What did they type in the email box?" is state.

**Re-render**
When state changes, React re-runs the component function and updates the screen.
You never manually update the page — you change state, React redraws.

Think of a whiteboard: you don't erase and redraw it yourself. You say "here's
what it should look like now," and React figures out what to change.

**Hook**
A special function starting with `use` that lets a component tap into React
features. `useState`, `useForm`, `useMutation` are all hooks.

Rule: hooks must be called at the top of a component, never inside an `if` or a
loop.

**Destructuring**
JavaScript shorthand for pulling values out of an object.

```js
const { register, handleSubmit } = useForm()
// same as:
// const result = useForm()
// const register = result.register
// const handleSubmit = result.handleSubmit
```

You'll see this everywhere in React code.

---

## Part 1 — What we actually built

Four things a user can now do:

1. Create an account (`/signup`)
2. Log in (`/login`)
3. Stay logged in after refreshing the page
4. Log out

And two things that had to exist to support that:

5. A fake backend, because there's no real server yet
6. Route protection — visiting `/profile` while logged out bounces you to `/login`

---

## Part 2 — The single most important idea: three kinds of state

Almost every React question a beginner gets stuck on is really "where should this
data live?" There are three answers.

Imagine a house.

**1. Server state — the library down the street**
Data that lives on a server. It can go out of date. You have to go fetch it.

*Examples:* the list of matches, a team's roster, login responses.
**Tool: TanStack Query.**

**2. Global client state — the whiteboard in the hallway**
Facts the whole house needs to see, that didn't come from a server.

*Examples:* who's logged in, is the dark-mode toggle on.
**Tool: Zustand.**

**3. Local state — a sticky note in one room**
Facts only one component cares about.

*Examples:* is this dropdown open, what's typed in this input right now.
**Tool: `useState`, or React Hook Form for form fields.**

### The rule this project follows

> **Data that came from a server goes in TanStack Query — never in Zustand.**

Our Zustand store holds `{ user, token, isAuthenticated }` — that's *who you
are*, which the whole app needs. It does **not** hold match lists or team data.
Those get fetched with Query.

Why it matters: if you copy server data into Zustand, you now own the problem of
keeping it fresh. Query already solves that. Two copies of the same data always
drift apart eventually.

---

## Part 3 — Where the files live, and why

```
src/
  app/
    router.tsx          which URL shows which screen
    queryClient.ts      settings for TanStack Query

  features/
    auth/                     ← everything about logging in
      authStore.ts              the hallway whiteboard (Zustand)
      schemas.ts                the validation rules (Zod)
      api/                      talking to the server (TanStack Query)
        authApi.ts                the raw fetch calls
        useLogin.ts               hook the login form uses
        useSignup.ts              hook the signup form uses
      components/               the actual screens
        LoginForm.tsx
        SignupForm.tsx
        LoginPage.tsx
        SignupPage.tsx

  shared/components/      stuff MANY features use
    Button.tsx
    FormField.tsx
    Layout.tsx
    ProtectedRoute.tsx

  mocks/                  the fake backend (dev only)
```

### Why grouped this way

Two ways to organise a house:

- **By room** ← what we do. Everything about the kitchen is in the kitchen.
  Everything about auth is in `features/auth/`.
- **By furniture type** ← what we avoid. One closet for every pan in the house,
  another for every light switch. That's a global `components/` + `hooks/` +
  `services/` layout.

Room-based wins as the app grows. When you later delete the player-market
feature, it's one folder. With the other layout its pieces are scattered across
five folders and you have to hunt.

`shared/` is the exception — genuinely reusable things only. Not a junk drawer.

### One practical warning

Everything under `src/` is treated as **application source code**. Vite watches
it, TypeScript compiles it. Notes, saved web pages, and reference material belong
in `docs/`.

We learned this the hard way: a saved web page dropped into `src/` crashed the
dev server with a file-watcher error (`EBUSY: resource busy or locked`).

---

## Part 4 — The story of one signup click

Follow along in the files. This is what actually happens, in order.

### Before you type anything (page load)

1. `index.html` loads `src/main.tsx`.
2. `main.tsx` starts the fake backend and **waits** for it to be ready.
3. Only then does it draw the app on screen.
4. `router.tsx` looks at the URL. It's `/signup`, so it shows `<SignupPage />`.
5. `SignupPage` shows a heading and `<SignupForm />`.
6. `SignupForm` sets up its tools and then... sits there. Nothing else happens
   until you interact.

### You fill the form and click "Sign up"

7. The click fires the form's `onSubmit`, which is `handleSubmit(onSubmit)`.
8. **`handleSubmit` runs first** and does two jobs:
   - stops the browser from reloading the page (forms do that by default!)
   - runs your Zod rules against everything you typed

9. **Decision point one.**
   - **Something's wrong** (passwords don't match) → the error message appears
     under that input. **Your `onSubmit` never runs.** Nothing goes to the
     network. Story ends here.
   - **All good** → continue.

10. Your `onSubmit(data)` runs, and calls `signup.mutate(data)`.
11. That triggers `useSignup.ts`, which removes `confirmPassword` (the server
    doesn't need it) and calls `signup()` in `authApi.ts`.
12. `authApi.ts` does `fetch('/api/auth/signup', ...)`.
13. **The request never leaves your browser.** The fake backend (MSW) grabs it.
14. `mocks/handlers.ts` checks its pretend user list — is this email taken? —
    and sends back either a success or an error.

15. **Decision point two**, back in `authApi.ts`.
    - **Server said no** (email taken) → an error is thrown, and the message
      shows above the submit button. You stay on the page.
    - **Server said yes** → continue.

16. `useSignup.ts`'s `onSuccess` runs:
    - saves `{ user, token }` into the Zustand store
    - redirects to `/`
17. The URL change makes `router.tsx` show the home screen, and `Layout.tsx`
    now displays your name in the bottom nav.

**Login is the exact same story** with different names, minus the
`confirmPassword` step.

---

## Part 5 — The pieces, one at a time

### Zod — the bouncer

**Job:** check that what the user typed is acceptable.

Think of a bouncer with a clipboard. You write the rules once; they check anyone
against them and, when someone fails, say *specifically why*.

```ts
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
```

Read it as: "email must be text, and shaped like an email." Chaining `.email()`
onto `z.string()` just means "and also this."

#### The tricky one: checking two fields against each other

`confirmPassword` must equal `password`. But a rule attached to one field can't
see other fields. So Zod has `.refine()`, which runs on the **whole object** after
the individual rules pass:

```ts
.refine((data) => data.password === data.confirmPassword, {
  error: "Passwords don't match",
  path: ['confirmPassword'],
})
```

`path` says which input the error belongs to. Change it to `['password']` and the
red text jumps to the other box.

#### Getting a TypeScript type for free

```ts
export type SignupFormValues = z.infer<typeof signupSchema>
```

This reads the schema and generates the type `{ name: string, email: string, ... }`.

Why bother? Because you'd otherwise write the shape **twice** — once as rules,
once as a type — and one day change one and forget the other. This way there's
one source.

The schema then gets used in two different ways:

```ts
useForm<SignupFormValues>({          // the TYPE — helps you while writing code
  resolver: zodResolver(signupSchema), // the RULES — runs when the user clicks
})
```

The type disappears when the code runs. TypeScript types are only for your editor.

---

### React Hook Form — the form's brain

**Job:** track what's in the inputs, and run validation at the right moment.

```ts
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) })
```

Three things come out:

| | What it does |
|---|---|
| `register('email')` | connects an input to the form |
| `handleSubmit(fn)` | validates, then calls `fn` only if valid |
| `errors` | where error messages show up |

#### `register` and the spread

```tsx
<FormField label="Email" {...register('email')} />
```

`register('email')` returns an object: `{ name, onChange, onBlur, ref }`. The
`{...}` spread applies all four as props at once.

#### Why typing doesn't slow this form down

Most tutorials teach **controlled** inputs — every keystroke goes into `useState`,
so every keystroke re-renders the component.

React Hook Form is **uncontrolled**: it reads values straight off the real HTML
input elements using that `ref`. **Typing re-renders nothing.**

That's the whole reason RHF exists, and "controlled vs uncontrolled" is a very
common interview question.

---

### zodResolver — the translator

Here's the thing beginners miss:

> **React Hook Form has never heard of Zod. Zod has never heard of React Hook Form.**

They're unrelated libraries. RHF has its own rule syntax. `zodResolver` is a
bridge — notice it's imported from a *third* package:

```ts
import { zodResolver } from '@hookform/resolvers/zod'
```

Setting `resolver:` tells RHF: *"don't validate this yourself — hand the values to
this function and use whatever it gives back."*

The function returns an object with exactly two keys:

```js
// all good
{ errors: {}, values: <the values> }

// problems
{ values: {}, errors: { confirmPassword: { message: "Passwords don't match" } } }
```

Empty `errors` = proceed. Otherwise RHF fills `formState.errors` and skips your
`onSubmit` entirely.

#### Following one error all the way to the screen

You type mismatched passwords:

```
Zod produces:
  { path: ['confirmPassword'], message: "Passwords don't match" }
        ↓
zodResolver converts it (path array → key string):
  { confirmPassword: { message: "Passwords don't match" } }
        ↓
Your JSX reads it:
  error={errors.confirmPassword?.message}
        ↓
Screen: red text under the Confirm password box
```

The message you typed in `schemas.ts` travelled all the way to the screen. That's
the whole chain.

---

### TanStack Query — `useMutation`

TanStack Query has two main tools:

- **`useQuery` = a fridge that restocks itself.** For *reading* data. Fetches
  automatically, remembers the result, quietly refreshes it. (Phase 2 uses this.)
- **`useMutation` = a vending machine.** For *changing* things. Nothing happens
  until you press the button.

Signup and login are mutations — they only run when someone submits.

```ts
return useMutation({
  mutationFn: (credentials) => login(credentials),  // what the button does
  onSuccess: (data) => {                            // only if it worked
    setCredentials(data.user, data.token)
    navigate('/')
  },
})
```

The form uses three things it hands back:

| | Used for |
|---|---|
| `mutate(data)` | pressing the button |
| `isPending` | showing "Loading…" on the button |
| `error` | showing the server's error message |

#### Two kinds of errors, kept separate on purpose

| Kind | Comes from | Appears |
|---|---|---|
| **Your input is wrong** | Zod | under that specific input |
| **The server said no** | `mutation.error` | above the submit button |

Nothing reaches the network until the first kind is clean. That's why "Password
too short" sits under the password box, but "Email already registered" sits at
the bottom — one is about a field, the other is about the whole attempt.

---

### `fetch` — and a trap that catches everyone

```ts
const response = await fetch('/api/auth/login', { ... })
if (!response.ok) throw new Error(body.message)
```

That `if` looks unnecessary. It is essential.

> **`fetch` only fails when the network fails** — no internet, server unreachable.

A `401 Unauthorized` ("wrong password") is, as far as `fetch` is concerned, a
perfectly successful request. The server answered! It just said no.

Without that check, a wrong password would flow into `onSuccess`, and the app
would log you in with an undefined user.

This catches nearly every beginner, and it's a favourite interview question.

---

### Zustand — the hallway whiteboard

**Job:** hold facts the whole app needs.

```ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setCredentials: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'matchup-auth' }
  )
)
```

Notice there's **no `<Provider>` wrapper** anywhere in `main.tsx`. Zustand stores
are just hooks — any component calls them directly. (Redux requires a provider;
that's one of the differences worth being able to explain.)

#### Always read with a selector

```ts
// do this
const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

// not this
const { isAuthenticated } = useAuthStore()
```

The function inside the parentheses is a **selector** — it says "I only care about
this one field." Zustand then re-renders your component only when *that field*
changes.

Grab the whole store and your component re-renders on every change to anything.

`Layout.tsx` selects `state.user?.name` specifically, so if the user's avatar
changed, the nav wouldn't re-render.

#### `persist` — surviving a refresh

```ts
persist((set) => ({ ... }), { name: 'matchup-auth' })
```

This automatically saves the store to the browser's `localStorage` and reloads it
on startup.

Without it, refreshing the page logs you out — because normal JavaScript
variables die when the page reloads. This is true of Redux too; it's not a
Zustand weakness.

> **Worth knowing for interviews:** `localStorage` can be read by any malicious
> script that gets onto your page (an XSS attack). Real production apps often use
> an httpOnly cookie instead, which JavaScript can't read at all. Our PRD flags
> this on purpose as a discussion point.

#### Logout clears *two* things

```ts
logout()              // Zustand — forget who you are
queryClient.clear()   // TanStack Query — forget what you fetched
```

If you only did the first, the next person to log in on that laptop could briefly
see the previous user's cached data before it refreshed. Identity and data are
two separate stores, so both need clearing.

---

### MSW — the fake backend

There's no real server yet. MSW installs a **service worker** — a small script
the browser runs in the background that can intercept network requests.

So when your code does `fetch('/api/auth/login')`, MSW catches it and
`src/mocks/handlers.ts` answers, pretending to be a server.

#### Why the startup order matters

```ts
async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('./mocks/browser')
  await worker.start()          // ← must finish BEFORE the app draws
}

enableMocking().then(() => {
  createRoot(...).render(...)
})
```

If we drew the app first, a request could fire before the interceptor was ready,
and fail for no visible reason. So we wait.

`import.meta.env.DEV` is Vite's "are we in development?" flag. It's `false` in a
real build, so MSW is stripped out completely — it never ships to users.

**Why this approach is genuinely good practice:** you can build and demo the
entire frontend before any backend exists. And when the real API arrives, your
components don't change at all — only what answers the `fetch` does.

---

## Part 6 — React 19 note

You may see older tutorials wrap components in `forwardRef` to pass a `ref` down.
**React 19 removed that need** — `ref` is now a normal prop:

```tsx
interface FormFieldProps {
  ref?: Ref<HTMLInputElement>    // just declare it
}
```

That's what lets `{...register('email')}` spread onto `<FormField>` and have its
`ref` land on the real `<input>` inside.

Also: this project is a **Vite SPA**, not Next.js. Server Components, Server
Actions, and `"use client"` don't apply here. If a tutorial mentions those,
it's for a different setup.

---

## Part 7 — Interview questions

**1. Why is the auth token in Zustand instead of TanStack Query?**
Because it isn't server data that goes stale — it's who you are. Query's job is
caching fetched data and refreshing it. If your session lived in that cache, it
could get cleaned up or refetched and log you out unexpectedly.

**2. Are these forms controlled or uncontrolled? Why does it matter?**
Uncontrolled. React Hook Form reads values from the DOM using refs, so typing
causes no re-renders. A controlled form stores each keystroke in `useState` and
re-renders every time.

**3. A login request returns 401. Does `fetch` throw an error?**
No. `fetch` only rejects on network failure. A 401 is a successful request with a
rejection inside it, so you must check `response.ok` and throw yourself.

**4. You validate with Zod on the client. Is that enough?**
No. Client validation is for fast, friendly feedback. Anyone can bypass it with
browser devtools, so the server must validate again. Client validation is a
convenience, never a security boundary.

**5. Why clear the Query cache on logout?**
Zustand holds identity; Query holds data fetched as that identity. Clearing only
identity leaves the previous user's data sitting in the cache for the next user.

---

## Part 8 — Glossary

| Term | Plain meaning |
|---|---|
| **Component** | a function that returns JSX |
| **Props** | values passed into a component |
| **State** | data that changes while the app runs |
| **Re-render** | React re-running a component to update the screen |
| **Hook** | a `use...` function that taps into React features |
| **Selector** | a function picking one field out of a store |
| **Schema** | a description of what valid data looks like |
| **Resolver** | the adapter connecting a validation library to a form library |
| **Mutation** | an operation that changes data (vs a query, which reads) |
| **Optimistic update** | showing a change before the server confirms (Phase 2) |
| **Service worker** | background browser script that can intercept requests |
| **Uncontrolled input** | an input React doesn't track on every keystroke |

---

## Part 9 — Status

- [x] Signup and login forms with validation
- [x] Session saved in Zustand, survives refresh
- [x] Logout clears session and cache
- [x] Protected routes redirect when logged out
- [x] Fake backend answering `/api/auth/*`
- [x] TypeScript and linter both clean
- [ ] **Clicked through in a browser to confirm it works**
- [ ] Committed to git
- [ ] `/onboarding` screen — *deliberately postponed*; it's profile work, not auth
- [ ] Write the ADR comparing Zustand vs Query (roadmap deliverable)

**Next phase:** browsing and joining matches — where `useQuery`, caching, query
keys, and optimistic updates come in.
