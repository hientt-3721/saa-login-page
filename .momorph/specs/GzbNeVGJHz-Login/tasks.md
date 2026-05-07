# Tasks: Login

**Frame**: `GzbNeVGJHz-Login`
**Date**: 2026-05-07
**Spec**: `.momorph/specs/GzbNeVGJHz-Login/spec.md`
**Plan**: `.momorph/specs/GzbNeVGJHz-Login/plan.md`

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (operates on a different file with no incomplete dependency)
- **[US1/US2/US3]**: User story label — present on Phase 3+ tasks only
- **|**: Exact file path affected by this task

---

## Phase 1: Setup

**Purpose**: Greenfield project initialization, tooling, and configurations.
No user story work begins until this phase is complete.

- [x] T001 Initialize Next.js 15 project with TypeScript strict mode (`"strict": true`) | `package.json`, `tsconfig.json`
- [x] T002 [P] Install all required dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `next-intl`, `zod`, `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, `vitest-localstorage-mock`, `playwright` | `package.json`
- [x] T003 [P] Configure ESLint and Prettier with TypeScript strict rules; enforce kebab-case modules, PascalCase components, ≤100-char line width | `.eslintrc.ts`, `.prettierrc`
- [x] T004 [P] Configure HTTP security headers (CSP, HSTS, X-Frame-Options) per OWASP A05 | `next.config.ts`
- [x] T005 [P] Configure TailwindCSS v4; define all CSS design tokens from `design-style.md` as CSS variables (colors, typography, spacing, radius) — no hard-coded values | `tailwind.config.ts`, `src/app/globals.css`
- [x] T006 [P] Configure Vitest: jsdom environment, coverage thresholds (≥80% service layer), path aliases | `vitest.config.ts`
- [x] T007 [P] Configure Playwright: base URL, browsers (Chromium/Firefox/WebKit), test isolation | `playwright.config.ts`
- [x] T008 [P] Create `.env.local.example` template with all required variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ALLOWED_EMAIL_DOMAIN` | `.env.local.example`

**Checkpoint**: Project scaffolding complete — linting, typing, and configs all pass.

---

## Phase 2: Foundation

**Purpose**: Core infrastructure required by ALL user stories.

⚠️ **CRITICAL**: No user story work begins until this phase is complete.

- [x] T009 Create TypeScript auth types: `Session`, `UserProfile` | `src/types/auth.ts`
- [x] T010 [P] Create typed `env.ts` module — Zod-validated schema for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ALLOWED_EMAIL_DOMAIN`; `process.env.*` MUST NOT be used elsewhere | `src/lib/env.ts`
- [x] T011 [P] Create Supabase server client (`createServerClient`) for Route Handlers, middleware, and server components | `src/lib/supabase/server.ts`
- [x] T012 [P] Create Supabase browser client (`createBrowserClient`) for client components | `src/lib/supabase/client.ts`
- [x] T013 [P] Create `next-intl` runtime config (locale detection, messages path, no locale-prefix routes) | `next-intl.config.ts`
- [x] T014 [P] Create stub i18n message files with all Login screen string keys: `login.heroLine1`, `login.heroLine2`, `login.buttonLabel`, `login.footer`, `login.error.unauthorized`, `login.error.sessionExpired`, `login.error.oauthFailed`, `login.error.popupBlocked`, `login.lang.vi`, `login.lang.en` | `messages/vi.json`, `messages/en.json`
- [x] T015 [P] Create root app layout with `NextIntlClientProvider` | `src/app/layout.tsx`

**Checkpoint**: Foundation complete — Supabase clients, env module, i18n scaffolding, and root layout ready. User stories can now begin.

---

## Phase 3: User Story 1 — Google OAuth Login (Priority: P1) 🎯 MVP

**Goal**: An unauthenticated Sun* employee can click "LOGIN With Google", complete Google OAuth with a corporate `@sun-asterisk.com` account, and land on Homepage SAA with an active session stored in cookies.

**Independent Test**: Open `/login` as an unauthenticated user, click the button, complete OAuth with a valid corporate account → user lands on `/` (Homepage SAA). Then navigate back to `/login` → middleware redirects back to `/`.

### Tests (US1) ← Write BEFORE implementation

- [x] T016 [P] [US1] Write `auth-service` unit tests: `signInWithGoogle()` calls `signInWithOAuth` with correct params; `getSession()` returns session or null; `validateEmailDomain()` accepts `@sun-asterisk.com` and rejects others | `tests/unit/services/auth-service.test.ts`
- [x] T017 [P] [US1] Write middleware unit tests: (a) protected route without session → redirects to `/login`; (b) `/login` with valid session → redirects to `/`; (c) `/auth/callback` always passes through; (d) `updateSession()` is called on every request | `tests/unit/middleware.test.ts`
- [x] T018 [P] [US1] Write `/auth/callback` integration tests: (a) valid code + corporate email → session set + redirect to `/`; (b) valid code + non-corporate email → redirect to `/login?error=unauthorized`; (c) invalid/expired code → redirect to `/login?error=session_expired`; (d) `next` param outside allowlist → fallback redirect to `/` | `tests/integration/auth/callback.test.ts`
- [x] T019 [P] [US1] Write `LoginButton` unit tests: renders label + Google icon; loading state on click; re-enables on error; calls `signInWithGoogle()` on click; shows popup-blocked message when `window.open` returns null; renders `initialError` prop as error on mount | `tests/unit/components/login/login-button.test.tsx`

### Implementation (US1) ← After tests are written

- [x] T020 [US1] Implement `auth-service.ts`: `signInWithGoogle(client)`, `getSession(client)`, `validateEmailDomain(email, allowedDomain)` — methods accept pre-created client as parameter; no internal Supabase client creation | `src/services/auth-service.ts`
- [x] T021 [US1] Implement `/auth/callback` route handler: Zod-validate `code` + `next` query params → `exchangeCodeForSession(code)` → validate email domain → validate `next` against allowlist → `redirect(next \|\| '/')` → on error `redirect('/login?error=...')` | `src/app/auth/callback/route.ts`
- [x] T022 [US1] Implement Next.js middleware: `createServerClient()` + `updateSession()` to refresh cookies on every request; unauthenticated requests to protected routes redirect to `/login?next={returnUrl}`; `/auth/callback` and `/login` routes bypass session check | `middleware.ts`
- [x] T023 [P] [US1] Implement `LoginButton` client component: idle/loading/error state machine; calls `auth-service.signInWithGoogle()`; popup-blocked detection (`window.open` null check + `flowType: 'implicit'` fallback); `initialError` prop pre-populates error; all styling via CSS variables only (`var(--color-btn-login-bg)` etc.) | `src/components/login/login-button.tsx`

**Checkpoint**: US1 complete — OAuth login, session creation, callback validation, and middleware session guard all independently testable.

---

## Phase 4: User Story 2 — Authenticated-User Redirect (Priority: P2)

**Goal**: An already-authenticated user who navigates to `/login` is redirected to the main application before the Login screen renders.

**Independent Test**: Set a valid session cookie, navigate directly to `/login` → browser lands on `/` (Homepage SAA) without the Login screen flashing.

### Tests (US2) ← Write BEFORE implementation

- [x] T024 [P] [US2] Write login page server component tests: (a) valid session → `redirect('/')` called, login UI not rendered; (b) no session → `LoginPage` rendered; (c) `?error=unauthorized` in URL → `LoginPage` receives `initialError='unauthorized'`; (d) `?error=session_expired` in URL → `LoginPage` receives `initialError='session_expired'` | `tests/unit/app/login/page.test.tsx`

### Implementation (US2) ← After tests are written

- [x] T025 [US2] Implement login page server component: call `auth-service.getSession()`; if authenticated → `redirect('/')`; read `?error` search param → pass as `initialError` prop to `LoginPage` | `src/app/login/page.tsx`

**Checkpoint**: US2 complete — authenticated users never see the login screen; error messages from callback route are surfaced correctly.

---

## Phase 5: User Story 3 — Language Selection (Priority: P3)

**Goal**: A user on the Login screen can open the language dropdown, select VN or EN, see all Login screen text update to the chosen locale, and have the preference persist across page reloads.

**Independent Test**: Open `/login`, click the language selector, choose "EN" → all visible text switches to English, preference is saved in `localStorage`, page reload shows EN text.

### Tests (US3) ← Write BEFORE implementation

- [x] T026 [P] [US3] Write `use-language` hook tests: (a) reads from `localStorage` on mount; (b) defaults to `'vi'` when no stored value; (c) writes `NEXT_LOCALE` cookie and `localStorage` on change; (d) falling back if `localStorage` throws | `tests/unit/hooks/use-language.test.ts`
- [x] T027 [P] [US3] Write `LanguageSelector` unit tests: (a) default state shows VN flag + "VN" label + chevron; (b) click opens dropdown with exactly 2 items; (c) selecting EN closes dropdown + updates trigger flag + label + calls `setLanguage('en')`; (d) outside click closes without change; (e) keyboard nav: Tab, Enter/Space opens, ArrowDown/ArrowUp moves, Enter selects, Escape closes; (f) min touch target 44×44 | `tests/unit/components/login/language-selector.test.tsx`

### Implementation (US3) ← After tests are written

- [x] T028 [US3] Implement `use-language` hook: reads `localStorage` (`NEXT_LOCALE`) on mount, defaults to `'vi'`; on change writes `localStorage` + `NEXT_LOCALE` cookie (so middleware can read it for server-side i18n) | `src/hooks/use-language.ts`
- [x] T029 [US3] Implement `src/i18n/request.ts`: `getRequestConfig` reads `NEXT_LOCALE` cookie, loads matching message file, sets `onError` to silently fall back to `'vi'` for missing keys | `src/i18n/request.ts`
- [x] T030 [US3] Populate i18n message files with complete Login screen strings in both languages (all 10 keys from Foundation stub) | `messages/vi.json`, `messages/en.json`
- [x] T031 [P] [US3] Implement `LanguageSelector` client component: trigger button (VN/EN SVG flag + label + chevron), dropdown with 2 items, full keyboard navigation (WCAG 2.1 AA), outside-click close via `useRef` + document event listener; CSS variables for spacing/radius | `src/components/login/language-selector.tsx`

**Checkpoint**: US3 complete — language selector fully functional, persists, updates all Login screen text, keyboard-navigable.

---

## Phase 6: Full Login Page Assembly

**Goal**: All Login screen components assembled into the final full-screen layout matching Figma design exactly: 3-layer background, fixed header, hero section, footer; responsive at mobile/tablet/desktop.

**Independent Test**: Load `/login` in a browser → visually matches Figma (`GzbNeVGJHz`); resize to mobile → layout adapts; all assets render; no hard-coded hex/px values in component code.

### Tests ← Write BEFORE implementation

- [x] T032 [P] Write `Header` unit tests: Logo `<img>` renders with correct `src` (`/assets/login/icons/logo.png`) and `alt` text; `LanguageSelector` is rendered | `tests/unit/components/login/header.test.tsx`
- [x] T033 [P] Write `LoginPage` unit tests: all 4 sections present in DOM (header, background layers, hero, footer); 3 background divs rendered (photo, horizontal gradient, vertical fade); `initialError` prop forwarded to `LoginButton` | `tests/unit/components/login/login-page.test.tsx`

### Implementation ← After tests are written

- [x] T034 [P] Implement `Header` server component: SAA Logo (`/assets/login/icons/logo.png`, 52×48px, `object-fit: cover`) top-left; `LanguageSelector` top-right; `position: absolute; top: 0`; padding via `var(--spacing-page-padding-x)` | `src/components/login/header.tsx`
- [x] T035 Implement `LoginPage` server component: 3-layer background (photo + horizontal gradient overlay + vertical bottom-fade overlay, all `position: absolute`); `<Header />`; hero section with Key Visual (`/assets/login/images/root-further-logo.png`, Next.js `<Image fill priority sizes>`) + Hero Description (i18n) + `<LoginButton initialError={error} />`; Footer (Montserrat Alternates, border-top `var(--border-footer-top)`); spacing via CSS variables (`var(--spacing-hero-stack-gap)`, `var(--spacing-hero-content-gap)`); mobile-first responsive (`px-6` → `md:px-16` → `lg:px-[144px]`) | `src/components/login/login-page.tsx`

**Checkpoint**: Full Login screen assembled — pixel-accurate layout, responsive, all assets loaded, Server Component boundary preserved.

---

## Phase 7: E2E Tests

**Purpose**: Cover all critical user journeys and edge cases end-to-end with Playwright.

- [x] T036 [P] Write E2E login test suite covering all acceptance scenarios and edge cases:
  - US1: unauthenticated user sees Login at `/login`; button click initiates OAuth (Playwright route intercept); successful login redirects to `/`
  - US2: authenticated user navigates to `/login` → immediately redirected to `/` (no login flash)
  - US1 error: `?error=unauthorized` URL → error message visible, button re-enabled
  - US1 error: `?error=session_expired` URL → session-expired message visible
  - US1 edge: non-corporate email rejected at `/auth/callback` → `?error=unauthorized` → error on Login
  - US1 edge: external/invalid return URL → post-login redirect falls back to `/`
  - US1 edge: valid return URL (`/dashboard`) → post-login redirects to `/dashboard`
  - US3: language selector changes all visible text; preference persists across reload | `tests/e2e/login.spec.ts`

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T037 [P] WCAG 2.1 AA audit: verify `aria-label` on Google icon and flag images, visible focus rings on all interactive elements, min 44×44pt touch targets on `LoginButton` and `LanguageSelector` at all breakpoints | `src/components/login/`
- [x] T038 [P] Core Web Vitals: verify `hero-background.png` uses Next.js `<Image>` with `priority` (LCP), correct `sizes` attribute for responsive optimization, lazy loading for non-critical images | `src/components/login/login-page.tsx`
- [x] T039 [P] Security hardening: verify `next.config.ts` headers (CSP, HSTS, X-Frame-Options) are present; verify `ALLOWED_EMAIL_DOMAIN` is read only from `env.ts`; run `npm audit --audit-level=high` | `next.config.ts`
- [x] T040 Code cleanup: verify zero hard-coded hex/px values in all component files (grep for `#[0-9a-fA-F]` and `px-\d`); verify no direct `supabase.*` calls outside `src/lib/supabase/` and `src/services/`; verify all files ≤300 lines | `src/`

---

## Post-Implementation Bug Fixes

- [x] BUG-01 `ALLOWED_EMAIL_DOMAIN: Required` client crash — `src/lib/supabase/client.ts` imported `env.ts` (which validates server-only `ALLOWED_EMAIL_DOMAIN`); fix: replaced `env.NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` with direct `process.env['NEXT_PUBLIC_...']` calls | `src/lib/supabase/client.ts`
- [x] BUG-02 Next.js 15 `searchParams should be awaited` error — `src/app/login/page.tsx` used synchronous `searchParams`; fix: typed as `Promise<{error?: string}>` and awaited before use | `src/app/login/page.tsx`
- [x] BUG-03 Security: login page used `getSession()` (reads cookie without JWT revalidation); fix: added `getUser()` to auth-service (calls `client.auth.getUser()` validating JWT with Supabase server), login page now uses `getUser()` | `src/services/auth-service.ts`, `src/app/login/page.tsx`
- [x] BUG-04 Hero layout is `flex-row` instead of `flex-col`: `Frame 487` container in `login-page.tsx` uses `flexDirection: 'row'`, placing the KV image and text+button side-by-side. Per Figma design `Frame 487` must be `flex-col` (gap: 80px); B.1 Key Visual container must be `w=1152px, h=200px` with the 451×200 image inside; `Frame 550` (text+button wrapper) must be `w=496px, flex-col, gap=24px, pl=16px` positioned below the KV image. | `src/components/login/login-page.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └─► Phase 2 (Foundation)  ◄─ BLOCKS all user stories
         └─► Phase 3 (US1 — P1)  ◄─ MVP; must be complete before US2 and US3 can start
                └─► Phase 4 (US2 — P2)  ┐ can run in parallel after US1
                └─► Phase 5 (US3 — P3)  ┘ (different files, no shared dependency)
                       └─► Phase 6 (Assembly)  ◄─ requires US1 + US3 components
                              └─► Phase 7 (E2E)
                                     └─► Phase 8 (Polish)
```

### Within Each Phase

- **TDD gate**: All `[P]` test tasks in a phase MUST be written and confirmed failing before ANY implementation task in the same phase begins.
- **Dependency direction**: types (`auth.ts`) → services (`auth-service.ts`) → route handlers / components.
- Within a phase, tasks marked `[P]` operate on different files and can run in parallel; unlabelled tasks in the same phase have an implicit sequence.

### Parallel Opportunities

**Phase 1** — after T001 completes: T002, T003, T004, T005, T006, T007, T008 all parallel.

**Phase 2** — after T009 completes: T010, T011, T012, T013, T014, T015 all parallel.

**Phase 3 tests** — all 4 test tasks (T016–T019) parallel (different test files).
**Phase 3 impl** — T020 → T021 → T022 (sequential; each builds on the previous); T023 parallel with T022.

**Phase 4** — T024 (test) parallel with Phase 3 impl after Foundation; T025 after T024.

**Phase 5** — T026 and T027 (tests) parallel; T028 → T029 → T030 (sequential); T031 parallel with T029.

**Phase 6** — T032 and T033 (tests) parallel; T034 parallel with T035 (different components, no dependency between Header and LoginPage impl); T035 must import T034 result so T034 finishes first in practice.

**Phase 7** — T036 can run in parallel with Phase 8 audits (different concerns).

**Phase 8** — T037, T038, T039 all parallel; T040 after all three.

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete **Phase 1** + **Phase 2** (setup + foundation)
2. Complete **Phase 3** (US1 — Google OAuth login end-to-end)
3. **STOP and VALIDATE**: E2E OAuth flow works locally against real Supabase
4. Deploy MVP — users can log in

### Incremental Delivery

1. Phase 1 + 2 → Phase 3 (US1) → deploy
2. Phase 4 (US2) → deploy (authenticated redirect guard)
3. Phase 5 (US3) → deploy (language selection)
4. Phase 6 (full assembly + polish)
5. Phase 7 (E2E) + Phase 8 (polish)

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 40 |
| Phase 1 (Setup) | 8 tasks (T001–T008) |
| Phase 2 (Foundation) | 7 tasks (T009–T015) |
| Phase 3 — US1 (P1 MVP) | 8 tasks (T016–T023) — 4 tests + 4 impl |
| Phase 4 — US2 (P2) | 2 tasks (T024–T025) — 1 test + 1 impl |
| Phase 5 — US3 (P3) | 6 tasks (T026–T031) — 2 tests + 4 impl |
| Phase 6 (Assembly) | 4 tasks (T032–T035) — 2 tests + 2 impl |
| Phase 7 (E2E) | 1 task (T036) |
| Phase 8 (Polish) | 4 tasks (T037–T040) |
| Parallelizable tasks | 28 of 40 marked [P] |
| Tasks with story labels | 16 (US1: 8, US2: 2, US3: 6) |

### Suggested MVP Scope

Complete **Phase 1 → Phase 2 → Phase 3** (T001–T023) for a deployable MVP:
- Unauthenticated users can log in via Google OAuth ✓
- Sessions stored securely as httpOnly cookies ✓
- Domain validation rejects non-corporate accounts ✓
- Open-redirect attack prevented ✓

US2 (T024–T025) and US3 (T026–T031) add security and usability on top of the working MVP.

---

## Notes

- Commit after each completed task or logical group of parallelizable tasks.
- Run `npm run typecheck && npm run lint && npm run test` before closing each phase.
- All component files MUST use CSS variables from `globals.css` — no raw hex or px values.
- `src/services/auth-service.ts` is the ONLY file that calls Supabase Auth SDK methods; route handlers and components pass a pre-created client to it.
- The `/auth/callback` route is public (no session guard in middleware) but validates everything server-side.
