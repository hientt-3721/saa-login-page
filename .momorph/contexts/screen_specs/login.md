# Screen: Login

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | GzbNeVGJHz |
| **Figma Link** | https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C?node-id=662:14387 |
| **Screen Group** | Authentication |
| **Status** | discovered |
| **Discovered At** | 2026-05-07 |
| **Last Updated** | 2026-05-07 |

---

## Description

The Login screen is the application entry point for SAA (Sun* Asterisk Awards). It provides a single sign-on flow via Google OAuth. The screen features a full-screen key visual background, a branded header with logo and language switcher, a central content area with the app logo and a "Login with Google" button, and a copyright footer.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| App launch / Root | Auto-redirect | User is not authenticated |
| Any protected screen | Auto-redirect | Session expired or unauthenticated |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Homepage SAA | Button-IC About (Login with Google) | I662:14426;186:1935 | High | Google OAuth callback redirects to homepage after success |
| Language Dropdown | Language Button (mms_A.2_Language) | I662:14391;186:1601 | High | Opens language selector overlay (VN/EN switch) |

### Navigation Rules
- **Back behavior**: N/A — this is the root unauthenticated screen
- **Deep link support**: Yes — `/login`
- **Auth required**: No

---

## Component Schema

### Layout Structure

```
┌─────────────────────────────────────┐
│  mms_A_Header                        │
│  [Logo]                [Language]   │
├─────────────────────────────────────┤
│                                      │
│  mms_C_Keyvisual (background image) │
│                                      │
│  ┌─────────────────────────────┐    │
│  │  mms_B_Bìa                  │    │
│  │  mms_B.1_Key Visual (logo)  │    │
│  │  mms_B.2_content (text)     │    │
│  │  mms_B.3_Login              │    │
│  │  [Login with Google Button] │    │
│  └─────────────────────────────┘    │
│                                      │
├─────────────────────────────────────┤
│  mms_D_Footer                        │
│  "Bản quyền thuộc về Sun* © 2025"  │
└─────────────────────────────────────┘
```

### Component Hierarchy

```
Login (FRAME: 662:14387)
├── mms_C_Keyvisual (GROUP: 662:14388)
│   └── image 1 (RECTANGLE: 662:14389) — background image
├── mms_A_Header (INSTANCE: 662:14391)
│   ├── mms_A.1_Logo (FRAME)
│   │   └── LOGO (INSTANCE)
│   │       └── MM_MEDIA_Logo (RECTANGLE)
│   └── mms_A.2_Language (FRAME)
│       └── Language (INSTANCE)
│           └── Button (INSTANCE)
│               ├── Frame 485 (FRAME)
│               │   ├── MM_MEDIA_VN (INSTANCE) — VN flag icon
│               │   └── Awards Information Navigation Links (TEXT) — language label
│               └── MM_MEDIA_Down (INSTANCE) — chevron icon
├── Rectangle 57 (RECTANGLE: 662:14392) — decorative overlay
├── mms_B_Bìa (FRAME: 662:14393)
│   └── Frame 487 (FRAME: 662:14394)
│       ├── mms_B.1_Key Visual (FRAME: 662:14395)
│       │   └── MM_MEDIA_Root Further Logo (RECTANGLE: 2939:9548)
│       └── Frame 550 (FRAME: 662:14755)
│           ├── mms_B.2_content (TEXT: 662:14753) — descriptive text
│           └── mms_B.3_Login (FRAME: 662:14425)
│               └── Button-IC About (INSTANCE: 662:14426)
│                   ├── Frame 483 — button content
│                   │   └── Awards Information Navigation Links (TEXT) — button label
│                   └── MM_MEDIA_Google (INSTANCE) — Google logo
├── Cover (RECTANGLE: 662:14390) — overlay
└── mms_D_Footer (INSTANCE: 662:14447)
    └── "Bản quyền thuộc về Sun* © 2025" (TEXT)
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| mms_A_Header | Organism | 662:14391 | App-wide header: logo + language switcher | Yes |
| mms_C_Keyvisual | Group | 662:14388 | Full-screen background image | Yes |
| mms_B_Bìa | Organism | 662:14393 | Central branding + login action area | No |
| Button-IC About | Molecule | 662:14426 | "Login with Google" CTA button (Google icon + label) | Yes |
| mms_D_Footer | Organism | 662:14447 | Global copyright footer | Yes |

---

## Form Fields (If Applicable)

No input form fields — authentication is handled entirely via Google OAuth redirect. No email/password fields on this screen.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| /auth/status | GET | Check current session | Redirect to home if already authenticated |

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click "Login with Google" | /auth/google | GET | — (OAuth redirect) | Redirects to Google consent screen |
| Google OAuth callback | /auth/google/callback | GET | `?code=...&state=...` | `{token, user}` → redirect to home |
| Click Language button | — | — | Navigation only (UI state change) | Language dropdown opens |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| 401 | OAuth failed / access denied | Show error state |
| 403 | Account not authorized (non-Sun* domain) | Show access denied message |
| 500 | Server error | Show retry option |

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| isLoading | boolean | false | Show loading indicator during OAuth redirect |
| selectedLanguage | string | "vi" | Currently selected UI language (VN/EN) |

### Global State (If Applicable)

| State | Store | Read/Write | Purpose |
|-------|-------|------------|---------|
| user | authStore | Write | Save user profile after login |
| token | authStore | Write | Save JWT/session token after login |
| language | appStore | Read/Write | Persist language preference |

---

## UI States

### Loading State
- Show spinner overlay when Google OAuth redirect is initiated
- Disable the "Login with Google" button during loading

### Error State
- Toast notification or inline error message for OAuth failure
- Retry button to restart the OAuth flow

### Success State
- Auto-redirect to Homepage SAA after successful authentication

### Empty State
- N/A — this screen has no data to display

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Tab to language button, then to login button |
| Screen reader | ARIA label on "Login with Google" button |
| Error announcement | Live region for OAuth error messages |
| Color contrast | WCAG AA compliant on button and text overlays |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<768px) | Centered card layout, full-width button |
| Tablet (768-1024px) | Centered form, max-width 480px |
| Desktop (>1024px) | Centered branding + login card over key visual |

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| screen_view | On mount | `{screen: "login"}` |
| login_initiated | Click "Login with Google" | `{method: "google_oauth"}` |
| login_success | OAuth callback success | `{user_id}` |
| login_error | OAuth callback error | `{error_code}` |
| language_switched | Click language button | `{from, to}` |

---

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| --color-primary | Brand color | Login button background |
| --color-footer-text | Muted | Copyright footer text |
| --font-brand | Brand font | mms_B.2_content text |
| --border-radius-btn | Rounded | Login button corners |

---

## Implementation Notes

### Dependencies
- OAuth library: Google OAuth 2.0 / Firebase Auth / NextAuth.js
- HTTP client: axios/fetch
- State management: Zustand / Redux

### Special Considerations
- Google OAuth requires redirect_uri whitelisting in Google Cloud Console
- Language preference should persist across sessions (localStorage/cookie)
- The "Login with Google" button label text appears to be using component name "Awards Information Navigation Links" — the actual displayed text should be confirmed from the rendered design
- Only Sun* (sun-asterisk.com) domain accounts should be allowed to authenticate

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery |
| Analysis Date | 2026-05-07 |
| Needs Deep Analysis | No |
| Confidence Score | High |

### Next Steps
- [ ] Confirm actual button label text via rendered image
- [ ] Confirm Google OAuth provider configuration
- [ ] Define language options available (VN / EN confirmed from flag icon)
- [ ] Review API contract with backend team for `/auth/google` endpoint
