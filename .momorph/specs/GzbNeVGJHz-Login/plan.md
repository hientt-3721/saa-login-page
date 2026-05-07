# Implementation Plan: Login

**Frame**: `GzbNeVGJHz-Login`
**Date**: 2026-05-07
**Spec**: `specs/GzbNeVGJHz-Login/spec.md`

---

## Summary

The Login screen is the sole authentication entry point for SAA 2025 platform. It delegates
authentication 100% to Google OAuth via the **Supabase Auth SDK** (`signInWithOAuth`).
Session tokens are managed by `@supabase/ssr` as httpOnly cookies, enabling server-side session
reads via Next.js App Router middleware and server components. There is no custom backend: a
single Next.js Route Handler at `/auth/callback` exchanges the OAuth code for a session and
validates the Google Workspace email domain.

Three user stories are covered in priority order: US1 (Google OAuth login, P1), US2
(authenticated-user redirect, P2), US3 (language selection, P3).

---

## Technical Context

| Property           | Value                                                                  |
|--------------------|------------------------------------------------------------------------|
| Language/Framework | TypeScript / Next.js 15 (App Router)                                   |
| Styling            | TailwindCSS v4 + CSS variables (design tokens from `design-style.md`)  |
| Auth               | Supabase Auth SDK (`@supabase/supabase-js`) + `@supabase/ssr`          |
| Validation         | Zod                                                                    |
| i18n               | `next-intl` (App Router–native)                                        |
| Testing (unit/int) | Vitest + React Testing Library                                         |
| Testing (E2E)      | Playwright                                                             |
| State Management   | React local state + Server Components session (no global store needed) |

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin. See `.momorph/constitution.md`.*

- [ ] **I – Clean Code**: Single-responsibility files/functions, kebab-case modules, PascalCase components, ≤40-line functions, ≤300-line files, no circular imports
- [ ] **II – Test-First / TDD**: Failing tests written and reviewed before any implementation code
- [ ] **III – Tech Stack**: Next.js · TypeScript strict · TailwindCSS v4 · Supabase Auth SDK + `@supabase/ssr`. All Supabase calls behind `auth-service.ts`. Service-role key server-side only. Design tokens in CSS variables only
- [ ] **IV – Platform UI**: Mobile-first responsive (Tailwind `sm`/`md`/`lg`). WCAG 2.1 AA. Routes from `SCREENFLOW.md` only. Min 44×44 touch targets. No hard-coded values in component files
- [ ] **V – Security-First (OWASP)**: Zod validation on callback inputs, CSRF `state` check, email domain validation, httpOnly cookie storage, open-redirect allowlist, HTTP security headers in `next.config.ts`

**Violations (if any)**:

| Principle | Violation | Justification | Alternative Rejected |
|-----------|-----------|---------------|----------------------|
| — | — | — | — |

---

## Architecture Decisions

### Frontend Approach

- **Component Structure**: Feature-based under `src/components/login/`. Server component at
  `src/app/login/page.tsx` handles US2 redirect (no client bundle for auth check). Client
  boundary only where interactivity is needed (login button loading state, language dropdown).
- **Styling Strategy**: TailwindCSS utilities only; all values driven by CSS variables defined
  in `src/app/globals.css`. No inline styles or hard-coded hex values.
- **Data Fetching**: `supabase.auth.getUser()` in server component/middleware; no client-side
  auth polling. `signInWithOAuth` triggered client-side only on button click.
- **i18n**: `next-intl` **without** locale-prefix route segments (no `[locale]` folder).
  Locale is determined at runtime: middleware reads the `NEXT_LOCALE` cookie (written by
  `use-language.ts`) and sets it on the request; `next-intl` `getRequestConfig` reads it
  server-side. On first visit with no cookie, default locale is `'vi'`. This avoids routing
  conflicts with `/login` and `/auth/callback` paths.

### Auth Flow

```
[User opens /login]
       │
       ├─ Middleware (server): supabase.auth.getUser() via createServerClient()
       │     └─ session valid → redirect to / (Homepage SAA)  [US2]
       │     └─ no session  → continue to /login page
       │
[Login page renders]
       │
[User clicks "LOGIN With Google"]
       │
       └─ LoginButton (client): supabase.auth.signInWithOAuth({
               provider: 'google',
               options: { redirectTo: `${origin}/auth/callback` }
            })  → browser redirects to Google  [US1]
               │
       [Google OAuth completes → redirect to /auth/callback?code=...]
               │
       Route Handler GET /auth/callback (server):
         1. createServerClient() → exchangeCodeForSession(code)
         2. Validate session.user.email ends with @sun-asterisk.com  [SR-002]
         3. Validate redirectTo against allowlist  [SR-004]
         4. Set cookies (handled by @supabase/ssr)
         5. redirect(returnUrl || '/')
```

### Data Access Layer

All Supabase interactions go through `src/lib/supabase/`:
- `server.ts` — `createServerClient()` for Route Handlers, middleware, server components
- `client.ts` — `createBrowserClient()` for client components (login button)
- `src/services/auth-service.ts` — business logic wrapper (OAuth initiation, session read,
  email domain validation). Components call `auth-service.ts`, never the Supabase client directly.

> **Note on `login-page.tsx` Server Component boundary**: `src/app/login/page.tsx` and
> `src/components/login/login-page.tsx` MUST be Server Components. `loginError` state lives
> exclusively inside `login-button.tsx` (client component) — it is NOT lifted to the page level.
> Only `login-button.tsx` and `language-selector.tsx` carry `'use client'` directives.
> This preserves server-side rendering for the page shell and avoids sending unnecessary
> client bundles for static sections (background, key visual, footer).

> **Note on CSRF / PKCE (SR-001)**: Supabase Auth SDK automatically handles the OAuth `state`
> parameter and PKCE code verifier when calling `signInWithOAuth`. The `/auth/callback` route
> handler does NOT need to manually validate `state` — `exchangeCodeForSession(code)` performs
> this verification internally. Do NOT add manual state checking; it will break the flow.

> **Note on SR-005 / No database migration for this feature**: SR-005 requires RLS on any
> table that stores user data. The Login screen creates only a Supabase Auth session (managed
> by Supabase Auth internals — no separate `profiles` table is created as part of this feature).
> SR-005 therefore applies at the Supabase Auth policy level only, which Supabase Auth configures
> automatically. **No database migration file is required for the Login screen.** A `profiles`
> table with RLS policies is a future concern scoped to the user profile feature, not this screen.

> **Note on auth-service / route handler relationship (Constitution III)**: `auth-service.ts`
> methods (`signInWithGoogle`, `getSession`, `validateEmailDomain`) accept a pre-created
> Supabase client as a parameter — they do NOT create the client internally. The route handler
> (`/auth/callback/route.ts`) creates the server client once via `createServerClient()` and
> passes it to `auth-service` methods. This is the only place in the codebase that touches the
> Supabase client directly; all other call sites go through `auth-service.ts`.

### Integration Points

- **Supabase Auth**: External — mocked in unit tests, real in integration/E2E
- **Google OAuth**: External — E2E tests use a pre-authenticated test account or mock server
- **next-intl**: Locale detection + translations (depends on `messages/vi.json`, `messages/en.json`)

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/GzbNeVGJHz-Login/
├── spec.md              # Feature specification
├── plan.md              # This file
├── design-style.md      # Design tokens and asset catalog
└── tasks.md             # Task breakdown (next step)
```

### New Files to Create

```text
# Project foundation (Next.js app does not yet exist)
package.json
tsconfig.json
next.config.ts                          # HTTP security headers (OWASP A05)
tailwind.config.ts
.env.local.example                      # Template for required env vars

# Design tokens + global styles
src/app/globals.css                     # CSS variables from design-style.md

# Typed env access
src/lib/env.ts                          # process.env wrapper (typed, validated by Zod)

# Supabase clients
src/lib/supabase/server.ts              # createServerClient() — middleware, server components
src/lib/supabase/client.ts              # createBrowserClient() — client components

# Auth service (data access layer)
src/services/auth-service.ts            # signInWithGoogle(), getSession(), validateEmailDomain()

# TypeScript types
src/types/auth.ts                       # Session, UserProfile types

# App Router structure
src/app/layout.tsx                      # Root layout with next-intl NextIntlClientProvider
src/app/login/page.tsx                  # Server component: session check → US2 redirect
src/app/auth/callback/route.ts          # Route Handler: exchangeCodeForSession + email validation

# Next.js middleware
middleware.ts                           # @supabase/ssr session guard; redirect to /login if unauth

# Login screen components
src/components/login/login-page.tsx     # Client boundary — assembles header + hero + footer
src/components/login/header.tsx         # Logo + LanguageSelector
src/components/login/login-button.tsx   # "LOGIN With Google" — idle/loading/error states
src/components/login/language-selector.tsx  # Dropdown trigger + items; localStorage persistence

# Custom hooks
src/hooks/use-language.ts               # Reads/writes language preference to localStorage

# i18n messages
messages/vi.json                        # Vietnamese strings (hero text, footer, button, errors)
messages/en.json                        # English strings

# i18n config
next-intl.config.ts                     # next-intl runtime config (locale detection, messages path)
src/i18n/request.ts                     # next-intl getRequestConfig — reads NEXT_LOCALE cookie, loads messages, sets onError fallback to 'vi'

# Test + E2E runner config
vitest.config.ts                        # Vitest config (jsdom environment, coverage thresholds, aliases)
playwright.config.ts                    # Playwright config (base URL, browsers, auth setup file)

# Tests (mirror source structure under tests/)
tests/unit/services/auth-service.test.ts
tests/unit/app/login/page.test.tsx          # Server component: session → redirect; no session → renders
tests/unit/middleware.test.ts               # Session guard: protected route → /login; /login with session → /
tests/unit/components/login/login-page.test.tsx     # Full layout renders all sections; background layers present
tests/unit/components/login/header.test.tsx         # Logo renders; language selector renders
tests/unit/components/login/login-button.test.tsx
tests/unit/components/login/language-selector.test.tsx
tests/unit/hooks/use-language.test.ts
tests/integration/auth/callback.test.ts
tests/e2e/login.spec.ts
```

### Modified Files

| File | Change |
|------|--------|
| `public/assets/login/` | Assets already downloaded ✅ — no changes needed |

### Dependencies to Add

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Supabase JS client |
| `@supabase/ssr` | Cookie-based session for Next.js App Router |
| `next-intl` | i18n for App Router |
| `zod` | Input validation at system boundaries |
| `vitest` | Unit + integration tests |
| `@vitejs/plugin-react` | Vitest React support |
| `@testing-library/react` | Component testing utilities |
| `@testing-library/user-event` | Realistic keyboard/pointer event simulation (required for Tab/Arrow/Escape nav tests) |
| `vitest-localstorage-mock` | `localStorage` stub for Node/jsdom test environment (used in `use-language` tests) |
| `playwright` | E2E tests |

---

## Implementation Strategy

### Phase 0: Asset Preparation ✅ Complete

All 7 Login screen assets already downloaded to `public/assets/login/`:

| Asset | Path | Status |
|-------|------|--------|
| SAA Logo | `public/assets/login/icons/logo.png` | ✅ |
| Root Further Logo | `public/assets/login/images/root-further-logo.png` | ✅ |
| Hero Background | `public/assets/login/images/hero-background.png` | ✅ |
| Vietnam Flag | `public/assets/login/icons/flag-vn.png` | ✅ |
| England Flag | `public/assets/login/icons/flag-en.svg` | ✅ |
| Chevron Down | `public/assets/login/icons/chevron-down.png` | ✅ |
| Google Icon | `public/assets/login/icons/google.png` | ✅ |

### Phase 1: Foundation (TDD Red phase setup)

1. Initialize Next.js 15 project with TypeScript strict mode
2. Configure TailwindCSS v4 + CSS variables from `design-style.md` in `globals.css`
3. Create `src/lib/env.ts` — Zod-validated env schema for Supabase URL + anon key
4. Create `src/lib/supabase/server.ts` and `client.ts` — `createServerClient` / `createBrowserClient`
5. Configure HTTP security headers in `next.config.ts` (OWASP A05)
6. Set up i18n scaffolding: `next-intl` config + `messages/vi.json` + `messages/en.json` stubs
7. Configure Vitest + React Testing Library + Playwright

> **TDD Gate**: Write failing tests for `auth-service.ts` before implementing it.

### Phase 2: Auth Service + Callback Route (US1, US2)

**Test-first:**
- Write `tests/unit/services/auth-service.test.ts` — test `signInWithGoogle()`, `getSession()`, `validateEmailDomain()`
- Write `tests/unit/middleware.test.ts` — session guard: (a) protected route without session → redirects to `/login`; (b) `/login` with valid session → redirects to `/`; (c) `/auth/callback` always passes through
- Write `tests/integration/auth/callback.test.ts` — test OAuth code exchange (success), domain rejection (returns `?error=unauthorized`), invalid redirect allowlist (falls back to `/`), expired/invalid code (returns `?error=session_expired`)

**Implement (make tests pass):**
- `src/services/auth-service.ts`
- `src/app/auth/callback/route.ts`:
  1. Zod-validate `code` and optional `next` query params
  2. `exchangeCodeForSession(code)` via `createServerClient()`
  3. Validate `session.user.email` domain → on failure: `redirect('/login?error=unauthorized')`
  4. Validate `next` param against allowlist → fall back to `/` if invalid (OWASP A10)
  5. `redirect(next || '/')`
  6. On `exchangeCodeForSession` failure: `redirect('/login?error=session_expired')`
- `middleware.ts` — session guard with `createServerClient()` + `updateSession()` to refresh cookies

### Phase 3: Login Page — US2 (Authenticated Redirect)

**Test-first:**
- Write unit test: `login/page.tsx` with valid session → `redirect()` called to Homepage SAA
- Write unit test: `login/page.tsx` with no session → renders login UI

**Implement:**
- `src/app/login/page.tsx` — server component; calls `auth-service.getSession()`; redirects if authenticated; reads `?error` query param and passes as prop to `login-page.tsx` for display
- `src/app/layout.tsx` — root layout with `next-intl` `NextIntlClientProvider`

### Phase 4: Login Button — US1 (Google OAuth)

**Test-first:**
- Write `tests/unit/components/login/login-button.test.tsx`:
  - Renders correct label and Google icon
  - Disables + shows loading state on click
  - Re-enables on error
  - Calls `signInWithGoogle()` on click
  - When `window.open` returns `null` (popup blocked), shows popup-blocked warning message and re-enables button
  - Renders `initialError` prop as error message on mount

**Implement:**
- `src/components/login/login-button.tsx` — client component with idle/loading/error states
- Styling via CSS variables: `var(--color-btn-login-bg)`, `var(--color-btn-login-text)`, `var(--radius-login-btn)`, `var(--spacing-btn-login-padding)`, `var(--spacing-btn-login-gap)` — **no raw hex or px values in the component file**
- Google icon (`/assets/login/icons/google.png`) rendered as last child in flex row (right of label), 24×24px
- Accepts optional `initialError` prop (string | null) — pre-populates `loginError` state on mount; used when redirected back with `?error=unauthorized` or `?error=session_expired` from the callback route
- **Popup-blocked detection**: `signInWithOAuth` with `skipBrowserRedirect: false` causes Supabase to call `window.open`. Wrap the call in a try/catch; if the OAuth window cannot open (returns null or throws), set `loginError` to the `'popupBlocked'` i18n key and re-enable the button. Also offer a fallback: call `signInWithOAuth({ ...options, flowType: 'implicit' })` to use a full-page redirect instead of a popup.

### Phase 5: Language Selector — US3

**Test-first:**
- Write `tests/unit/hooks/use-language.test.ts` — reads/writes `localStorage`, falls back to `'vi'`
- Write `tests/unit/components/login/language-selector.test.tsx`:
  - Default state shows VN flag + "VN" label
  - Click opens dropdown with 2 items
  - Selecting EN closes dropdown, updates trigger label+flag, persists preference
  - Escape/outside click closes without change
  - Keyboard navigation (Tab, Enter, Space, Arrow, Escape)

**Implement:**
- `src/hooks/use-language.ts`
- `src/components/login/language-selector.tsx` — dropdown with VN/EN SVG flags, WCAG 2.1 AA keyboard nav
- `src/i18n/request.ts` — configure `next-intl` `getRequestConfig`: reads `NEXT_LOCALE` cookie, loads the correct message file, sets `onError: (error) => { if (error.code !== 'MISSING_MESSAGE') throw error; }` so missing keys fall back silently to the default locale (`'vi'`)
- Update `messages/vi.json` and `messages/en.json` with all Login screen strings:
  ```
  keys needed: login.heroLine1, login.heroLine2, login.buttonLabel,
               login.footer, login.error.unauthorized, login.error.sessionExpired,
               login.error.oauthFailed, login.error.popupBlocked,
               login.lang.vi, login.lang.en
  ```

### Phase 6: Full Login Page Assembly + Polish

**Test-first:**
- Write `tests/unit/components/login/login-page.test.tsx`:
  - All 4 sections render (header, background, hero, footer)
  - Background photo layer, horizontal gradient overlay, and vertical bottom-fade overlay are all present in DOM
  - `initialError` prop is forwarded to `LoginButton`
- Write `tests/unit/components/login/header.test.tsx`:
  - Logo `<img>` renders with correct `src` and `alt`
  - `LanguageSelector` is rendered

**Implement:**
- `src/components/login/header.tsx` — Logo (`/assets/login/icons/logo.png`, 52×48) + `LanguageSelector`; Server Component (no client state needed)
- `src/components/login/login-page.tsx` — Server Component (NOT a client boundary); assembles all sections:
  - Background layer: 3 stacked `position: absolute` divs (`photo`, `horizontal-gradient`, `vertical-fade`) using CSS variables from `globals.css`
  - Header: `<Header />` — `position: absolute; top: 0`
  - Hero section: Key Visual (`/assets/login/images/root-further-logo.png`) + Hero Description + `<LoginButton initialError={error} />`
  - Footer: copyright text using `Montserrat Alternates` token
- **Spacing tokens to apply** (from `design-style.md`):
  - Page horizontal padding: `var(--spacing-page-padding-x)` (144px) — shared for header AND hero
  - Hero stack gap: `var(--spacing-hero-stack-gap)` (80px)
  - Hero content gap: `var(--spacing-hero-content-gap)` (24px)
- **Responsive strategy** (mobile-first):
  - Default (mobile): full-width, reduced padding (`px-6`), stacked layout, font scale reduced
  - `md:` (tablet): padding increases to `px-16`; Key Visual scales down
  - `lg:` (desktop): `px-[144px]` per Figma; Key Visual at full 451×200px; button at full 305×60px
  - Language selector: always top-right; min touch target 44×44 at all breakpoints
- Background: use Next.js `<Image>` with `fill` + `priority` for hero background (LCP asset); set `sizes` for responsive optimisation

### Phase 7: E2E Tests

- Write `tests/e2e/login.spec.ts`:
  - Unauthenticated user sees Login screen at `/login`
  - Authenticated user is redirected from `/login` to homepage
  - Login button click initiates OAuth (Playwright route intercept for Google OAuth)
  - Successful login redirects to Homepage SAA
  - Failed login (`?error=unauthorized`) shows error message, button re-enabled
  - Session expired redirect (`?error=session_expired`) shows session-expired message
  - Non-corporate email rejected at callback → `?error=unauthorized` → error visible on Login
  - Language selection persists across reload
  - Return URL respected (valid allowlisted URL) and rejected (external URL → falls back to `/`)

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/UI ↔ Service**: `LoginButton` → `auth-service.signInWithGoogle()` → Supabase client
- [x] **Route Handler**: `/auth/callback` → `exchangeCodeForSession()` → email domain check → redirect
- [x] **Middleware**: Session guard → protected route redirect → `/login` redirect
- [x] **Hooks**: `use-language` ↔ `localStorage` read/write

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Login button state machine; language selector open/close/select |
| App ↔ External API | Yes | Supabase Auth SDK calls; Google OAuth flow |
| App ↔ Data Layer | Yes | Cookie read/write via `@supabase/ssr`; `localStorage` for language |
| Cross-platform | Yes | Responsive breakpoints: mobile/tablet/desktop |

### Test Environment

- **Environment type**: Local (unit/integration); Staging (E2E)
- **Test data strategy**: Vitest mocks for Supabase client; MSW or Playwright route intercept for OAuth
- **Isolation approach**: Fresh state per test; `localStorage` cleared in `beforeEach`

### Mocking Strategy

| Dependency Type | Strategy | Rationale |
|-----------------|----------|-----------|
| Supabase Auth SDK (`signInWithOAuth`, `exchangeCodeForSession`, `getUser`) | Mock (Vitest `vi.mock`) | Cannot call real Supabase in unit/integration CI |
| `@supabase/ssr` cookies | Stub via in-memory cookie jar | Isolate from real browser cookie environment |
| `localStorage` | Stub via `vitest-localstorage-mock` or `jsdom` | Browser API not available in Node test environment |
| Google OAuth redirect | Playwright network intercept (E2E) | Avoid real Google login in automated tests |

### Test Scenarios Outline

1. **Happy Path**
   - [ ] Unauthenticated user clicks button → OAuth flow starts → callback receives code → session set → redirect to `/`
   - [ ] Authenticated user navigates to `/login` → immediately redirected to `/`
   - [ ] User selects EN language → page text updates → preference saved → persists on reload

2. **Error Handling**
   - [ ] OAuth cancelled/failed → error message shown → button re-enabled
   - [ ] Non-corporate email (`@gmail.com`) in callback → session rejected → redirect to `/login?error=unauthorized`
   - [ ] Network failure during auth-status check → Login screen shown (fail-open, not fail-closed)

3. **Edge Cases**
   - [ ] Valid return URL stored → post-login redirect to that URL
   - [ ] External/invalid return URL → fall back to Homepage SAA (open-redirect prevention)
   - [ ] Missing i18n key → falls back to Vietnamese string
   - [ ] Browser popup blocked → user-visible message + fallback redirect flow

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| `auth-service.ts` service layer | ≥ 80% statement coverage | High |
| Login UI components | ≥ 80% branch coverage | High |
| `/auth/callback` route handler | 100% (all branches: success, domain reject, invalid redirect) | High |
| E2E critical paths (US1, US2) | All acceptance scenarios covered | High |
| E2E language selection (US3) | Core scenarios covered | Medium |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| i18n message catalogue undefined | Medium | Medium | Stub `messages/vi.json` with all visible strings on Login screen; full catalogue deferred |
| Google Workspace domain validation config unknown | Low | High | Use env var `ALLOWED_EMAIL_DOMAIN=sun-asterisk.com`; fail closed if unset |
| `next-intl` locale routing | Low | Low | No locale-prefix routes used. Locale resolved via `NEXT_LOCALE` cookie in middleware + `getRequestConfig`. Architecture section is the authoritative decision; no `[locale]` folder needed. |
| Hero background image (9 MB) causing Core Web Vitals regression | Medium | Medium | Add `priority` prop to Next.js `<Image>` for LCP; set correct `sizes` attribute |
| Supabase cookie refresh race condition in middleware | Low | Medium | Follow official `@supabase/ssr` middleware pattern exactly; add `updateSession()` helper |
| Browser popup blocker prevents OAuth | Medium | Low | Detect blocked popup via `window.open` return value; show instructional error + redirect fallback |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed and understood
- [x] `spec.md` approved (reviewed 2026-05-07, Q1/Q2 tech decisions confirmed)
- [x] `design-style.md` complete with all design tokens and asset catalog
- [x] All UI assets downloaded to `public/assets/login/`
- [ ] `research.md` — minimal research needed; no existing codebase to analyse (greenfield)
- [ ] Supabase project created (URL + anon key available)
- [ ] Google OAuth credentials configured in Supabase dashboard
- [ ] Allowed callback URL `{APP_URL}/auth/callback` registered in Google Cloud Console

### External Dependencies

- **Supabase project**: Auth + RLS configuration required
- **Google Cloud Console**: OAuth 2.0 client credentials; redirect URI whitelist
- **`sun-asterisk.com` Google Workspace**: Domain for email validation (`@sun-asterisk.com`)

---

## Next Steps

After plan approval:

1. **Run** `momorph.tasks` to generate task breakdown in `tasks.md`
2. **Confirm** Supabase project credentials and Google OAuth client setup
3. **Clarify** `sun-asterisk.com` exact domain(s) for email allow-list (e.g. `sun-asterisk.com` only, or also `sun-asterisk.vn`)
4. **Define** full i18n message catalogue keys for Vietnamese + English (can stub initially)
5. **Begin** Phase 1 — project initialization, following TDD Red-Green-Refactor cycle

---

## Notes

- The Next.js application does not yet exist; Phase 1 includes project bootstrapping.
- `next-intl` is chosen for i18n because it has first-class App Router support (`useTranslations`,
  server component integration, `NextIntlClientProvider`). If the team prefers a different i18n
  library, this is the only decision that requires revisiting before Phase 5.
- The hero background image (`hero-background.png`) is ~9 MB; use Next.js `<Image>` with
  `fill` + `priority` and set appropriate `sizes` to trigger responsive image optimisation.
- `@supabase/ssr` requires updating cookies in both the request and response; follow the
  official middleware pattern from Supabase docs to avoid auth loop bugs.
- The spec covers the **web** screen only (`GzbNeVGJHz`). The iOS counterpart (`8HGlvYGJWq`)
  is out of scope for this plan.
- All CSS values in component files MUST reference CSS variables from `globals.css`, never raw
  hex/px values. Violations are caught in code review per Constitution Principle III.
