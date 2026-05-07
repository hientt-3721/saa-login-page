# Feature Specification: Login

**Frame ID**: `GzbNeVGJHz`
**Frame Name**: `Login`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-05-07
**Status**: Draft (reviewed 2026-05-07)

---

## Overview

The Login screen is the sole entry point for all users of the SAA (Sun* Annual Awards) 2025
platform. It presents a full-screen hero layout with branding, a short call-to-action, and a
single "LOGIN With Google" button that initiates a Google OAuth 2.0 flow. No username/password
form exists; authentication is 100% delegated to Google Identity.

The screen also exposes a language selector (VN/EN) in the header that allows users to change
the UI language before authenticating.

**Target users**: All Sun* employees attempting to access the platform for the first time or
after logging out.

**Business context**: SAA 2025 requires a frictionless, company-wide login backed by corporate
Google Workspace accounts. SSO eliminates credential management and reduces support burden.

---

## User Scenarios & Testing *(mandatory)*

<!--
  Priorities:
  P1 — Google OAuth Login (core; without it the app is unusable)
  P2 — Authenticated-user redirect (access-control; security-critical guard)
  P3 — Language selection (enhancement; usable without it)
-->

### US1: Google OAuth Login [P1]

**As an** unauthenticated Sun* employee
**I want to** click "LOGIN With Google" and complete Google OAuth
**So that** I am granted access to the SAA platform and redirected to the main application

**Why this priority**: Without this story the application has zero entry point; it is the MVP.

**Independent Test**: Open the login page as an unauthenticated user, click the button,
complete Google OAuth with a valid corporate account — the user should land on the homepage.

#### Acceptance Scenarios

**Scenario 1: Successful Google login**
- Given: The user is unauthenticated and on the Login screen
- When: The user clicks "LOGIN With Google" and completes Google OAuth with a valid Google account
- Then: The Google OAuth flow starts (new tab or popup), the callback returns user info, the
  session is established, and the user is redirected to the main application (Homepage SAA)

**Scenario 2: Button loading state during authentication**
- Given: The user has clicked "LOGIN With Google"
- When: The OAuth flow is in progress
- Then: The login button is disabled and displays a loading indicator until the flow resolves

**Scenario 3: Hover effect on login button**
- Given: The user is on the Login screen
- When: The user hovers over the "LOGIN With Google" button
- Then: The button displays a shadow or elevated visual effect and the cursor changes to pointer

**Scenario 4: OAuth failure / cancellation**
- Given: The user has clicked "LOGIN With Google"
- When: The user cancels the Google OAuth popup or an error occurs
- Then: The loading indicator is removed, the button returns to its default enabled state, and an
  inline error message (or toast) informs the user of the failure; the user can retry

---

### US2: Authenticated-User Redirect [P2]

**As an** already-authenticated user
**I want to** be automatically redirected away from the Login screen
**So that** I do not see a screen intended for unauthenticated users

**Why this priority**: Security and UX gate; an authenticated user landing on the Login screen
creates session confusion and a potential re-authentication risk.

**Independent Test**: Navigate directly to `/login` while holding a valid session — the system
must redirect to the main application without rendering the Login page.

#### Acceptance Scenarios

**Scenario 1: Redirect on direct navigation**
- Given: The user holds a valid, non-expired session
- When: The user navigates to the Login screen URL directly
- Then: The system redirects the user to the main application page before the Login screen
  is rendered

**Scenario 2: Session check on mount**
- Given: The Login screen component mounts
- When: The auth-status check resolves with an active session
- Then: The router replaces the current URL with the main application route immediately

---

### US3: Language Selection [P3]

**As a** user on the Login screen
**I want to** click the language selector and choose a language
**So that** the UI is displayed in my preferred language

**Why this priority**: Enhances accessibility for non-Vietnamese users; not blocking for MVP.

**Independent Test**: Open the Login screen, click the language selector, choose a different
language — all visible text on the page must update to the selected locale.

#### Acceptance Scenarios

**Scenario 1: Default language displayed**
- Given: The user opens the Login screen with no prior language preference stored
- When: The page loads
- Then: The language selector shows the Vietnam SVG flag icon + "VN" label + down chevron

**Scenario 2: Dropdown opens on click and lists two options**
- Given: The language selector is in its default state
- When: The user clicks the language selector
- Then: A dropdown menu opens with exactly two items:
  - Item 1: Vietnam SVG flag icon + "VN" label
  - Item 2: English SVG flag icon + "EN" label

**Scenario 3: Hover state on language selector**
- Given: The user is on the Login screen
- When: The user hovers over the language selector
- Then: The selector is visually highlighted and the cursor changes to a pointer

**Scenario 4: Language preference persisted**
- Given: The user selects a language from the dropdown
- When: The selection is confirmed
- Then: The UI text updates to the chosen language and the preference is persisted (localStorage
  or cookie) so subsequent visits default to the selected language

**Scenario 5: Trigger button updates to reflect selected language**
- Given: The dropdown is open and the user clicks a language item (e.g., "EN")
- When: The selection is confirmed
- Then: The dropdown closes, the trigger button updates its displayed flag to the selected
  language's SVG flag and its label to the selected language code (e.g., "EN")

**Scenario 6: Dropdown closes on outside click**
- Given: The language dropdown is open
- When: The user clicks anywhere outside the dropdown
- Then: The dropdown closes and the trigger button returns to its default state; no language change occurs

---

### Edge Cases

- **Expired session mid-flow**: If the session token expires after the OAuth callback but before
  redirect, the system must redirect to Login and display a session-expired message.
- **Popup blocked**: If the browser blocks the OAuth popup, display a user-visible message
  instructing the user to allow popups and a fallback redirect-flow option.
- **Network unavailable**: If the auth-status check fails due to network error, the Login screen
  is shown in its default state (do not assume logged-in).
- **No Google Workspace account**: If the Google account used is not a corporate Workspace
  account, the backend must reject the token and return a clear error; the Login screen must
  surface this error.
- **Invalid return URL**: If the stored return URL is external or not in the route allowlist,
  the system MUST fall back to Homepage SAA to prevent open-redirect (OWASP A10).
- **Language key not translated**: If a translation key is missing for the selected locale, the
  system MUST fall back to the Vietnamese (default) string rather than displaying a blank or key name.

---

## Component Behavior

### A — Header (`mms_A_Header` · Node ID: `662:14391`)

Container for Logo and Language selector; spans full width at the top of the screen.

#### A.1 — Logo (`mms_A.1_Logo` · Node ID: `I662:14391;186:2166`)

| Attribute   | Value                                |
|-------------|--------------------------------------|
| Asset       | `MM_MEDIA_Logo` (RECTANGLE child)    |
| Interaction | **None** — non-interactive           |
| Navigation  | None                                 |
| Position    | Top-left of header                   |
| Responsive  | Maintains top-left position at all breakpoints |

#### A.2 — Language Selector (`mms_A.2_Language` · Node ID: `I662:14391;186:1601`)

| Attribute       | Value                                                        |
|-----------------|--------------------------------------------------------------|
| Component type  | `button` (dropdown trigger)                                  |
| Default display | Vietnam SVG flag + "VN" label + down chevron                 |
| Hover state     | Visual highlight; cursor: pointer                            |
| Click action    | Opens language dropdown menu                                 |
| Position        | Top-right of header                                          |
| Default value   | Vietnamese ("VN")                                            |

**Dropdown items** (exactly 2, in order):

| # | Flag asset  | Label | Locale value |
|---|-------------|-------|--------------|
| 1 | `MM_MEDIA_VN` (SVG — Vietnam flag) | `VN` | `'vi'` |
| 2 | `MM_MEDIA_EN` (SVG — England/UK flag) | `EN` | `'en'` |

**State transitions**:
- `closed` → `open`: user clicks selector
- `open` → `closed`: user clicks outside or selects a language
- Language change: trigger button label and flag update to reflect selection; UI locale updates; preference stored in `localStorage`

---

### B — Hero Content Area (`mms_B_Bìa` · Node ID: `662:14393`)

Full-bleed section combining branding, descriptive copy, and the primary CTA.

#### B.1 — Key Visual (`mms_B.1_Key Visual` · Node ID: `662:14395`)

| Attribute   | Value                                    |
|-------------|------------------------------------------|
| Asset       | `MM_MEDIA_Root Further Logo` (RECTANGLE) |
| Interaction | **None** — non-interactive               |
| Purpose     | Brand mark / hero image "ROOT FURTHER"   |

#### B.2 — Hero Description (`mms_B.2_content` · Node ID: `662:14753`)

| Attribute   | Value                                                                     |
|-------------|---------------------------------------------------------------------------|
| Component   | `label` (static text)                                                     |
| Content     | "Bắt đầu hành trình của bạn cùng SAA 2025." + "Đăng nhập để khám phá!"  |
| Interaction | **None** — non-interactive, non-selectable                                |

#### B.3 — Login Button (`mms_B.3_Login` · Node ID: `662:14425`)

| Attribute       | Value                                                         |
|-----------------|---------------------------------------------------------------|
| Component type  | `button`                                                      |
| Label           | "LOGIN With Google"                                           |
| Icon            | Google icon (`MM_MEDIA_Google`, positioned **right** of label) |
| Position        | Centered below hero description text                          |
| Default state   | Enabled                                                       |
| Hover state     | Shadow / elevated effect; cursor: pointer                     |
| Click action    | Initiates Google OAuth flow (new tab or popup)                |
| Loading state   | `disabled` + loading spinner; replaces icon during processing |
| Success outcome | Session established → redirect to Homepage SAA                |
| Error outcome   | Button re-enabled; error message surfaced to user             |
| Navigation      | On success → Homepage SAA (`i87tDx10uM`)                      |

**State machine**:
```
idle → loading (on click)
loading → idle (on error or cancel)
loading → redirect (on success)
```

---

### C — Background Key Visual (`mms_C_Keyvisual` · Node ID: `662:14388`)

| Attribute   | Value                                        |
|-------------|----------------------------------------------|
| Asset       | `image 1` (RECTANGLE child)                  |
| Interaction | **None**                                     |
| Purpose     | Full-screen decorative background; no action |

---

### D — Footer (`mms_D_Footer` · Node ID: `662:14447`)

| Attribute   | Value                                          |
|-------------|------------------------------------------------|
| Component   | `label` (static text)                          |
| Content     | "Bản quyền thuộc về Sun* © 2025"               |
| Interaction | **None** — non-interactive                     |
| Position    | Fixed at bottom of page                        |
| Scroll      | Remains visible regardless of scroll position  |

---

## Data Requirements

### User Session (returned by OAuth callback)

| Field          | Type     | Validation            | Notes                                 |
|----------------|----------|-----------------------|---------------------------------------|
| `userId`       | `string` | Required, non-empty   | Supabase Auth UID                     |
| `email`        | `string` | Required, valid email | Must end in corporate domain (validated server-side) |
| `name`         | `string` | Required, non-empty   | Full display name                     |
| `avatarUrl`    | `string` | Optional, valid URL   | Google profile picture URL            |
| `accessToken`  | `string` | Required              | Short-lived JWT; managed automatically by Supabase Auth SDK + `@supabase/ssr`; stored as httpOnly cookie; never logged |
| `refreshToken` | `string` | Required              | Managed by `@supabase/ssr`; stored as httpOnly cookie via `createServerClient()`; never directly accessed in application code |

### Language Preference

| Field      | Type     | Validation      | Storage     |
|------------|----------|-----------------|-------------|
| `language` | `string` | `'vi' \| 'en'` | localStorage |

---

## State Management

### Local component state

| State              | Type                           | Component               | Description                               |
|--------------------|--------------------------------|-------------------------|-------------------------------------------|
| `isLoggingIn`      | `boolean`                      | Login button            | True while OAuth flow is in progress      |
| `loginError`       | `string \| null`               | Login screen            | Error message to display on auth failure  |
| `languageMenuOpen` | `boolean`                      | Language selector       | Controls dropdown open/closed             |

### Global state

| State        | Type             | Store          | Description                        |
|--------------|------------------|----------------|------------------------------------|
| `session`    | `Session \| null` | Auth context   | Supabase session read from cookies via `createServerClient()` (server components) or `createBrowserClient()` (client components); drives middleware redirect for US2 |
| `locale`     | `'vi' \| 'en'`   | i18n context   | Current UI language                |

### Cache / Invalidation

- Auth status is checked once on screen mount; no polling.
- On successful login, auth context updates globally — no additional fetch needed.
- Language preference is read from `localStorage` on first render and written on change.

### Optimistic updates

- None required for this screen.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Node ID                   | Component Name     | Description                       | Interactions                         |
|---------------------------|--------------------|-----------------------------------|--------------------------------------|
| `662:14391`               | Header             | Logo + Language selector bar      | Language click opens dropdown         |
| `I662:14391;186:2166`     | Logo               | Sun Annual Awards 2025 brand mark | None                                 |
| `I662:14391;186:1601`     | Language Selector  | VN/EN items (SVG flag + label); default VN | Click → dropdown; hover → highlight  |
| `662:14388`               | Background         | Full-screen hero artwork          | None                                 |
| `662:14395`               | Key Visual         | "ROOT FURTHER" brand image        | None                                 |
| `662:14753`               | Hero Description   | SAA 2025 welcome text             | None                                 |
| `662:14425`               | Login Button       | "LOGIN With Google"               | Click → OAuth; hover → elevation     |
| `662:14447`               | Footer             | Copyright text                    | None                                 |

### Navigation Flow

- **From**: Any protected route (unauthenticated guard redirects here)
- **From**: Logout action (any screen)
- **To**: Homepage SAA (`i87tDx10uM`) — on successful Google OAuth
- **Trigger**: Login button click → OAuth completion

### Visual Requirements

- Responsive breakpoints: mobile, tablet, desktop (Tailwind: `sm`, `md`, `lg`)
- Animations/Transitions: login button hover elevation; dropdown open/close transition
- Accessibility: WCAG 2.1 AA — minimum touch target 44×44 pt; keyboard-navigable login button;
  `aria-label` on icon-only elements; focus ring visible
- Keyboard navigation for language dropdown: `Tab` focuses trigger; `Enter`/`Space` opens
  dropdown; `Arrow Down`/`Arrow Up` moves between items; `Enter` selects; `Escape` closes

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the Login screen at route `/login` for any unauthenticated request to a protected route, and directly when navigating to `/login`.
- **FR-002**: System MUST redirect authenticated users away from the Login screen to the main application.
- **FR-003**: Users MUST be able to initiate Google OAuth by clicking the "LOGIN With Google" button.
- **FR-004**: System MUST disable the login button and show a loading indicator while OAuth is in progress.
- **FR-005**: System MUST establish a Supabase session and redirect the user to the main application upon successful OAuth.
- **FR-006**: System MUST surface an error message when OAuth fails or is cancelled, and re-enable the login button.
- **FR-007**: Users MUST be able to open the language selector and switch the UI language between Vietnamese and English.
- **FR-008**: System MUST persist the selected language preference across sessions.
- **FR-009**: System MUST store the originally requested URL (return URL) when redirecting an unauthenticated user to `/login`, and redirect to that URL (if valid and in the allowlist) after successful OAuth login instead of always going to Homepage SAA.

### Technical Requirements

- **TR-001**: Auth-status check MUST complete and redirect within 300 ms on a standard connection to avoid login-screen flash.
- **TR-002**: Language preference MUST survive a browser refresh (localStorage).
- **TR-003**: Platform UI pattern MUST be followed — Responsive Web (mobile-first, WCAG 2.1 AA).

### Security Requirements (OWASP — mandatory)

- **SR-001**: The OAuth callback MUST validate the `state` parameter to prevent CSRF attacks (OWASP A01).
- **SR-002**: The Google account domain MUST be validated server-side; personal Gmail accounts MUST be rejected (OWASP A04).
- **SR-003**: Access tokens and refresh tokens MUST never be logged or included in error responses (OWASP A02, A09).
- **SR-004**: The `/auth/callback` route handler MUST be protected against open-redirect attacks — redirect target MUST be validated against an allowlist (OWASP A10).
- **SR-005**: Supabase RLS MUST be configured so only the authenticated user can read their own session/profile row.
- **SR-006**: Next.js middleware MUST use `@supabase/ssr` `createServerClient()` to check session from cookies on every protected route; unauthenticated requests redirect to `/login`. The `/auth/callback` route handler MUST use `createServerClient()` to call `exchangeCodeForSession(code)` server-side; the OAuth code MUST NOT be processed client-side.

### Key Entities

- **User session**: `{ userId, email, name, avatarUrl, accessToken, refreshToken }` — created on first login; refreshed on subsequent logins
- **Language preference**: `{ language: 'vi' | 'en' }` — stored in localStorage

---

## API Dependencies

Authentication uses the **Supabase Auth SDK** — no custom OAuth backend endpoints are required.

| SDK Call / Route | Purpose | Triggered by |
|---|---|---|
| `supabase.auth.getUser()` (server-side via `createServerClient()`) | Check active session to guard protected routes and drive US2 redirect | Next.js middleware + layout server component on every request |
| `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${origin}/auth/callback` } })` | Initiate Google OAuth flow; Supabase redirects user to Google | Login button click (US1) |
| Next.js Route Handler `GET /auth/callback` → `supabase.auth.exchangeCodeForSession(code)` | Exchange OAuth code for session tokens; store in cookies via `@supabase/ssr`; redirect to return URL or Homepage SAA | Google OAuth redirect back to app |

> Corporate Google Workspace domain restriction MUST be enforced in the `/auth/callback` handler by checking `session.user.email` domain before completing login (OWASP A04).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of unauthenticated users can successfully complete Google OAuth and reach the main application.
- **SC-002**: 100% of authenticated users are redirected away from `/login` without seeing the Login screen.
- **SC-003**: Login button loading state activates within 100 ms of click (perceived responsiveness).
- **SC-004**: Auth-status redirect check completes before first contentful paint of Login UI (no flash of login screen for authenticated users).
- **SC-005**: Language preference is applied on page load with zero visible text flicker.

---

## Out of Scope

- Username / password authentication form
- Email OTP or magic-link login
- Social login providers other than Google
- Account registration / sign-up flow
- Password reset
- Multi-factor authentication UI (handled by Google's OAuth flow)
- Admin-specific login path (Admin uses the same Login screen)

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [ ] API specifications available (`.momorph/API.yml`)
- [ ] Database design completed (`.momorph/database.sql`)
- [x] Screen flow documented (`.momorph/SCREENFLOW.md`)
- [ ] i18n message catalogue defined (Vietnamese + English keys for Login screen strings)

---

## Notes

- The app name is "SAA 2025" (Sun* Annual Awards 2025), also referenced as "SAA Project" internally.
- The hero text is in Vietnamese ("Bắt đầu hành trình của bạn cùng SAA 2025. Đăng nhập để khám phá!"); this MUST be driven by the i18n system, not hard-coded.
- The footer text "Bản quyền thuộc về Sun* © 2025" must also be localizable.
- The Google OAuth button text "LOGIN With Google" should follow Google's branding guidelines (consistent casing, Google logo spec).
- The Login screen has a web (`GzbNeVGJHz`) and an iOS counterpart (`8HGlvYGJWq`); this spec covers the **web** screen only.
- `SCREENFLOW.md` confirms the post-login destination is **Homepage SAA** (`i87tDx10uM`).
- Auth implementation uses **Supabase Auth SDK** (`supabase.auth.signInWithOAuth`) with `@supabase/ssr` for Next.js App Router. Session tokens are stored as httpOnly cookies (not localStorage, not server-side only). The OAuth callback route is `/auth/callback` (Next.js Route Handler). No custom `/auth/google` or `/auth/status` backend endpoints are needed.
