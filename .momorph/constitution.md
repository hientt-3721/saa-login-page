<!--
SYNC IMPACT REPORT
==================
Version change:    N/A → 1.0.0 (initial ratification)
Modified principles: N/A (first version)
Added sections:
  - I.  Clean Code & Code Organization
  - II. Test-First / TDD (NON-NEGOTIABLE)
  - III. Tech Stack Best Practices (Next.js · TypeScript · TailwindCSS · Supabase)
  - IV. Platform UI Patterns & Guidelines
  - V.  Security-First (OWASP)
  - Development Workflow
  - Governance
Removed sections:   N/A
Templates requiring updates:
  ✅ .momorph/templates/plan-template.md    — Constitution Compliance Check aligned
  ✅ .momorph/templates/tasks-template.md  — Phase categories reflect all 5 principles
  ✅ .momorph/templates/spec-template.md   — Security + platform notes in scope section
Follow-up TODOs:
  - TODO(PROJECT_NAME): Confirm final product name if different from "SAA Project".
  - TODO(RATIFICATION_DATE): If this date is not the intended official adoption date, update.
-->

# SAA Project Constitution

## Core Principles

### I. Clean Code & Code Organization

Every file, module, and function MUST serve a single, clearly stated purpose.

**Rules**:
- Files MUST use kebab-case for non-component modules (`user-service.ts`) and
  PascalCase for React components and classes (`UserCard.tsx`, `AuthService.ts`).
- Functions MUST be ≤ 40 lines; files MUST be ≤ 300 lines. Violations require
  explicit justification in a PR description.
- Indentation: 2 spaces. Line width: ≤ 100 characters. Single quotes for strings;
  template literals for interpolation.
- `const` and immutable patterns MUST be preferred over `let`/mutation.
- No barrel (`index.ts`) re-export files unless limited to types or constants.
- Business logic MUST live in service-layer classes; controllers/route handlers MUST
  remain thin (input/output mapping only).
- No circular imports. Dependency direction: route handlers → controllers → services
  → repositories/utilities.
- DTOs MUST describe shapes only — no business logic inside DTOs.
- Sensitive fields (passwords, tokens, secrets) MUST be excluded from serialized
  responses via `@Exclude()` or equivalent.

**Rationale**: Readable, consistently structured code reduces onboarding time,
prevents defect accumulation, and makes AI-assisted development reliable and
deterministic.

### II. Test-First / TDD (NON-NEGOTIABLE)

Tests MUST be written and reviewed before implementation code is written.

**Rules**:
- Mandatory Red-Green-Refactor cycle: write a failing test → get approval → make it
  pass → refactor.
- Unit tests MUST cover all service-layer methods and utility functions.
- Integration tests MUST cover: new API contracts, contract changes,
  inter-service communication, and shared schemas.
- E2E tests (Playwright) MUST cover all critical user journeys defined in
  `SCREENFLOW.md`.
- Test files MUST mirror source file structure under a `tests/` or `__tests__/`
  directory.
- Coverage gate: ≥ 80 % statement coverage on the service layer; enforced in CI.
- No production code is merged unless its tests pass in CI.

**Rationale**: TDD produces a living specification, prevents regression, and gives
the team confidence to refactor. Skipping tests is never acceptable as a time-saving
measure.

### III. Tech Stack Best Practices (Next.js · TypeScript · TailwindCSS · Supabase)

The approved technology stack MUST be used as prescribed; deviations require
explicit constitution amendment.

**Approved stack**:
| Layer          | Technology                        |
|----------------|-----------------------------------|
| Framework      | Next.js (App Router, TypeScript)  |
| Styling        | TailwindCSS v4 + CSS variables    |
| Database/Auth  | Supabase (PostgreSQL + Auth + Storage) |
| ORM / queries  | Supabase JS Client (`@supabase/supabase-js`) |
| Validation     | Zod                               |
| Testing        | Vitest (unit/integration), Playwright (E2E) |

**Rules**:
- TypeScript strict mode (`"strict": true`) MUST be enabled at all times.
- Design tokens (colors, spacing, radii, typography) MUST be defined as CSS variables
  in the global stylesheet and consumed via Tailwind utilities — never hard-coded in
  component files.
- All Supabase interactions MUST go through a dedicated data-access layer; direct
  Supabase client calls from UI components or route handlers are forbidden.
- Row-Level Security (RLS) MUST be enabled on every Supabase table that contains
  user data.
- Environment variables (Supabase URL, anon key, service-role key) MUST be accessed
  only via a typed `env.ts` module; `process.env.*` MUST NOT be scattered across the
  codebase.
- The Supabase service-role key MUST only be used in server-side contexts
  (Next.js Route Handlers, server actions); it MUST never be exposed to the client.
- Image and file uploads MUST use Supabase Storage with signed URLs for private
  assets.
- Assets MUST be named in kebab-case and placed under
  `public/assets/{group}/{icons|images|logos}/`.

**Rationale**: A consistent, well-defined stack eliminates "decision fatigue" and
enables agents and team members to apply patterns predictably. Supabase RLS and
server-side key restriction are the primary defence-in-depth layers.

### IV. Platform UI Patterns & Guidelines

UI MUST conform to the design conventions of the target platform.

**Rules**:
- **Web**: Implement responsive design using a mobile-first approach with Tailwind
  breakpoints (`sm`, `md`, `lg`, `xl`). Follow WCAG 2.1 AA accessibility standards.
  Navigation, spacing, and typography MUST adhere to responsive web design
  best practices.
- **Android** (if applicable): UI components MUST follow
  [Material Design 3](https://m3.material.io/) specifications — elevation, motion,
  colour roles, and component variants as defined by Google.
- **iOS** (if applicable): UI components MUST follow
  [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
  — navigation patterns, typography scale, touch targets, and system colour usage.
- Navigation flows MUST be derived from `SCREENFLOW.md`; no hard-coded URLs or
  assumed routes are permitted.
- Design tokens from Figma MUST be translated to CSS variables before use in code.
  No value is hard-coded into component files.
- All interactive elements MUST meet a minimum touch/click target size of 44×44 pt.

**Rationale**: Platform-native patterns reduce user cognitive load, improve
retention, and align the product with user expectations established by platform
ecosystem conventions.

### V. Security-First (OWASP)

Security MUST be treated as a first-class requirement, not an afterthought.

**Rules** (mapped to OWASP Top 10):
- **A01 – Broken Access Control**: Every API route MUST be protected by
  authentication middleware. RLS policies MUST be verified in code review.
- **A02 – Cryptographic Failures**: Passwords MUST be hashed with bcrypt/argon2
  via Supabase Auth; no plain-text secrets in code or logs.
- **A03 – Injection**: All external input MUST be validated with Zod schemas before
  use. Parameterised queries (via Supabase client) MUST be used exclusively; raw SQL
  string concatenation is forbidden.
- **A04 – Insecure Design**: Threat modelling MUST be part of the spec review for
  any feature that handles PII, payments, or privileged operations.
- **A05 – Security Misconfiguration**: CORS MUST be explicitly configured; default
  permissive settings are forbidden. HTTP security headers (CSP, HSTS, X-Frame-Options)
  MUST be set in `next.config.ts`.
- **A06 – Vulnerable & Outdated Components**: Dependencies MUST be audited monthly
  with `npm audit`; critical/high findings MUST be resolved before release.
- **A07 – Auth & Session Failures**: Supabase Auth JWTs MUST be validated server-
  side; sessions MUST expire within 24 hours with refresh token rotation enabled.
- **A09 – Logging & Monitoring**: All authentication events, errors, and privileged
  actions MUST be logged (without PII). Logs MUST never contain passwords, tokens,
  or personal data.
- **A10 – SSRF**: External URL inputs MUST be validated against an allowlist;
  arbitrary URL fetching is forbidden.
- Secrets MUST be stored in environment variables only; `.env.local` MUST be in
  `.gitignore` and MUST never be committed.

**Rationale**: Security vulnerabilities erode user trust irreversibly. Encoding
OWASP controls at the constitution level ensures they are enforced by design, not
discovered by incident.

## Development Workflow

1. **Spec → Plan → Tasks → Implement** is the mandatory delivery sequence. No
   implementation begins without an approved spec and plan.
2. **Feature branches** MUST be created from `main`; direct commits to `main` are
   forbidden.
3. **Pull Requests** MUST include a Constitution Compliance Check table (see
   `plan-template.md`). A PR is blocked until all checklist items pass or violations
   are explicitly justified.
4. **Code Review**: Every PR requires at least one human reviewer approval in
   addition to CI passing.
5. **CI gates** (all MUST pass before merge):
   - TypeScript type-check (`tsc --noEmit`)
   - Lint (`eslint`)
   - Unit + integration tests with ≥ 80 % service-layer coverage
   - Security audit (`npm audit --audit-level=high`)
6. **Secrets management**: `.env.local` stores secrets locally; production secrets
   are stored in the deployment platform's secret manager (never in the repo).
7. **Database migrations**: All schema changes MUST be applied via Supabase
   migration files tracked in version control.

## Governance

- This constitution supersedes all other practices, guidelines, and verbal agreements.
- **Amendments** require:
  1. A written proposal describing the change and rationale.
  2. Team consensus (≥ 2 approvals).
  3. A version bump following semantic versioning rules defined in this document.
  4. An updated Sync Impact Report prepended to this file.
- **Versioning policy**:
  - MAJOR: Backward-incompatible principle removal or redefinition.
  - MINOR: New principle or section added, or material expansion of existing guidance.
  - PATCH: Clarifications, wording fixes, non-semantic refinements.
- **Compliance review**: Constitution compliance MUST be verified on every PR via
  the checklist in `plan-template.md`. Quarterly audits MUST review coverage reports
  and security findings.
- All agents and automated prompts MUST read and apply this constitution before
  generating or modifying any artifact in this repository.
- Refer to `.momorph/guidelines/frontend.md` and `.momorph/guidelines/backend.md`
  for runtime development guidance; those files elaborate on but do not override
  this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-05-07 | **Last Amended**: 2026-05-07
