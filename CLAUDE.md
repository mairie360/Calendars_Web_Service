# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Next.js 15 (App Router, React 19, TypeScript, Tailwind 4) web service for Mairie360 hosting the municipal calendar (events, assignments, approvals). The browser only talks to this app's own origin; the Next.js server forwards data calls to **BFF_Calendar**. UI building blocks come from the private package `@mairie360/lib-components`. Docs are bilingual: `docs/en|fr/module.md` (functional) and `docs/en|fr/technical.md` (routes, config, troubleshooting) — update both languages together. `BFF.md` / `BACKEND.md` contain *proposed* backend needs; the OpenAPI snapshot is the source of truth for implemented behaviour.

## Commands

Private `@mairie360/*` packages come from GitHub Packages: `.npmrc` reads `NODE_AUTH_TOKEN`, so export a token with `read:packages` before installing or building images.

```bash
npm ci
npm run dev -- --port 5002         # needs the BFF(s) reachable, see "BFF URL" below
npm run build && npm run start -- --port 5002
npm run lint                             # next lint (next/core-web-vitals + next/typescript)
npm test                                 # node:test on tests/*.test.cjs + lcov in coverage/lcov.info (what CI runs)
npm run test:contracts                   # same tests, no coverage
node --test --test-name-pattern="<name>" tests/calendar-api.bff-mock.test.cjs   # single test
```

Tests are plain CommonJS `node:test` files (`tests/*.test.cjs`, one process per file). No Jest/Vitest, no DOM, no extra dependencies. Shared helpers live in `tests/support/*.cjs` (not matched by the glob):

- `load-ts.cjs` — `loadTs('lib/bff-client')` transpiles `src/**/*.ts` on the fly, resolves the `@/*` alias and emits inline source maps (`npm test` passes `--enable-source-maps`, so coverage lines are TS lines). Use it rather than a hand-rolled `require.extensions` hook: every test must transpile a given file the same way or merged coverage is wrong. `stubModule('react', …)` swaps a package before loading.
- The harness browser `fetch` sends `Sec-Fetch-Site: same-origin` like a real browser; pass another value to exercise the CSRF refusal. `logoutAndReload` memoises its promise per process, so only one 401→logout per test file observes a new logout call.
- `openapi-contract.cjs` + `contract-mock-server.cjs` — CJS port of the BFFs' contract validator and `ContractMockServer` (real HTTP server; validates path, method, path/query params, undeclared query, JSON body and every mocked response against the contract; `on()` refuses undeclared operations; unmocked calls are violations).
- `front-harness.cjs` — `FrontHarness` starts BFF_Calendar (from `contracts/openapi.json`) and BFF User mocks plus a local HTTP "front" that dispatches to the real route handlers (`APP_ROUTES`, else the catch-all), and replaces `fetch` with a guard: client code may only call the front origin (cookies from `front.cookies` are attached), server code only the mocks (`allowServerOrigin()` for deliberate exceptions), anything else is a violation. Check `front.allViolations()` is empty in `afterEach`. The middleware is not run by the harness (covered by `security-headers.test.cjs`). BFF User's contract comes from `../../BFFs/BFF_user/contracts` / `BFF_USER_CONTRACT_DIR` when present, otherwise from a schema-less declaration of `/me`, `/session/me`, `/auth/logout` (CI).
- `hook-runner.cjs` — `renderHook()` runs React hooks without a DOM on a minimal useState/useMemo/useCallback/useEffect implementation (install with `stubModule('react', react)`); `waitFor(predicate)` lets real network I/O settle.
- `server-view.cjs` — renders the real page (`src/app/page.tsx`, shell and `@mairie360/lib-components` included) with `react-dom/server` while keeping hook state between passes, so the HTML reflects what the mocked BFFs answered. `calendar-page-html.bff-mock.test.cjs` uses it (`installReactRuntime()` before loading the page, `mount`, `view.waitFor`, `view.props('MonthGrid')`, `view.click('Réessayer')`). Same file in every front: see `../CLAUDE.md`. Loading the page puts `page.tsx` and `app-shell.tsx` in the coverage total.

`*.bff-mock.test.cjs` drive `api.ts`, `useCalendarPage` and `useAuthSession` through that chain; `network-boundary.test.cjs` pins which source files may emit requests, the absolute URLs allowed in `src`, that every calendar endpoint exists in the contract, and that each contract operation is forwarded. A new BFF call therefore needs the contract synced first, a fixture in `OPERATION_FIXTURES` for a new operation, and an update of those allowlists if it adds a network emitter. Coverage only counts files a test loads; thresholds (60% lines/branches/functions) apply to that total. Tests that depend on "today" derive dates at the tested mount time (`new Date()`), never from a production module-level timestamp. `calendar-initial-date.test.cjs` controls the clock for cached-module mounts and midnight/year rollover.

### OpenAPI contract

`contracts/openapi.json` is a committed copy of BFF_Calendar's contract and `src/contracts/bff.d.ts` is generated from it (`openapi-typescript@7.10.1`, pinned in `scripts/contracts.mjs`). Never hand-edit either file. Since MAIR-509 the copy is the contract of the BFF_Calendar `main` commit whose dev package is pinned in `package.json` (`@mairie360/bff-calendar-openapi@0.0.0-dev.<sha40>`, informative pin: the code imports no type from it): copy it from that commit (`git -C ../../BFFs/BFF_Calendar show <sha>:contracts/openapi.json > contracts/openapi.json`, or `contracts:sync` from a checkout at that commit), and run the stacks with `bff-calendar:dev-<sha7>`. A release `X.Y.Z` of BFF_Calendar replaces both with the release version. BFF errors use the shared `ErrorResponse` envelope (`{ error: { code, message, details } }`).

```bash
BFF_CONTRACT_DIR=../../BFFs/BFF_Calendar/contracts npm run contracts:sync   # copy the BFF contract and regenerate types
npm run contracts:generate  # regenerate types from the local snapshot
npm run contracts:check     # fail if types are stale, or if the BFF checkout at $BFF_CONTRACT_DIR has a different contract
```

The script's default source `../BFF_Calendar/contracts` resolves to `Fronts/BFF_Calendar`, which does not exist in the EIP checkout, so always set `BFF_CONTRACT_DIR` (without it, `check` silently skips the BFF comparison), and make sure that checkout is at the pinned commit, not on a feature branch. The stacks pin dev images of BFF User, Core API, Calendar API and the database: the dev Liquibase needs `-Dallow_template_admin=true`, the database enforces argon2id hashes in `init-test.sql`, the dev APIs need `JWT_ALLOW_WEAK_SECRET` for the shared test secret and `RATE_LIMIT_ENABLED=false` (plus `RATE_LIMIT_PER_SECOND=0` on Calendar API, whose per-IP token bucket otherwise answers 429 under the k6 load), BFF_Calendar needs `JWT_SECRET` at startup and BFF User `AUTH_RATE_LIMIT_ENABLED=false` for the ZAP scan. All three commands `npm exec` `openapi-typescript`, so they need network access. The `@mairie360/bff-calendar-openapi` dependency is not imported anywhere; the code uses the committed snapshot and generated types.

## Figma mockup

Figma is the source of truth: design and agree any UI change on **Mairie360 – Calendars_Web_Service** (https://www.figma.com/design/TaP7bHBB2E4uyTEJ5wg6Df) first, then code it. Shared components come from the lib mockup https://www.figma.com/design/T7vetUfuzPEXk5TxjHRiO2 and are instantiated, never redrawn.

## Component tree convention

Every component under `src/components/` is a **folder named after it**, and the folder tree
mirrors the composition tree:

```
Name/
  index.ts          # exports the component (and the helpers it owns)
  Name.tsx          # imports ONLY its direct sub-components, through their index.ts
  Name.test.tsx     # its tests, co-located (vitest + jsdom)
  components/       # one such folder per direct sub-component, recursively
```

- A component needs nothing but the `index.ts` of its direct sub-components: `Name.tsx` imports
  `./components/Sub`, never `./components/Sub/Sub` nor a sub-sub-component. Leaves are folders
  too (without `components/`).
- Helpers a component owns (models, hooks, `*.ts`) sit beside it and are exported by its
  `index.ts`; a helper shared by two siblings sits in their closest common ancestor.
- A big component is acceptable only for a technical reason stated in a comment; otherwise
  split it so that each visible part is a component and what composes it a sub-component.
- Page and journey tests stay in `tests/`; per-component tests are the co-located
  `Name.test.tsx`. `tests/component-tree-convention.test.cjs` enforces the folder, the index,
  the co-located test and the index-only imports.

## Front tickets and the Figma mockup

A front ticket (Jira + GitHub issue + PR) **must link the Figma frame that serves as the
example** of what is being built or changed. Without that link the ticket cannot be worked
on, unless the change does not affect the display (tooling, tests, proxy, contracts…). Update
and agree the mockup first, then code it: the sync direction is Figma → code.

## Architecture

- **On the normalised lib 1.0.3 (MAIR-608)** — the event dialogs use the lib `Modal` (focus trap, Escape, title + description). `src/components/CalendarPage/components/CalendarModals/components/CreateEventModal/components/EventFormFields/components/` splits the form into `EventTitleFields` / `EventLocationField` (lib `TextField`, `TextArea`), `EventDateRange` (local `CalendarDateField`), `EventTimeRange`, `EventCategoryField`, `EventRecurrenceFields` + `RecurrenceDayPicker` (lib `SelectField`, `NumberField`), composed by `EventFormFields`; `event-form-values.ts` holds the draft, submit and category helpers. `event-details/` holds `EventDetailRow`, `EventFacts`, `EventAssigneesList` and `EventDetailsActions` (lib button presets). From the details editor, Escape / backdrop / close dismiss the whole dialog (`onDismiss`), « Annuler » returns to the details. The page is composed in `src/app/calendar/_page/` (`CalendarHeader` on the lib `PageHeader`, `CalendarStatusBar`, `CalendarLoadingCard`, `CalendarViews`, `CalendarModals`). Field ids (`event-title`, `event-date`…) are kept: the validated wrapper reads the form by id. Tests per level: `tests/component/calendar/units/*.test.tsx`. Lib pin `1.0.1`, recorded in `tests/fixtures/shared-ui-releases.json`.
- **Calendar components owned here (MAIR-607) and laid out as a component tree (MAIR-608)** — `src/components/CalendarPage/` is the single root (see *Component tree convention*): `CalendarPage.tsx` (the former `app/calendar-client.tsx`, imported by `src/app/page.tsx`) owns `use-calendar-today-marker.ts`, `today-marker.ts`, `upcoming-scroll-region.ts` and the shared `calendar-types.ts`, `calendar-date.ts`, `calendar-constants.ts`, `calendar-style.ts`; its `components/` holds `AppShell/`, `CalendarHeader/`, `CalendarStatusBar/`, `CalendarLoadingCard/`, `CalendarSidebar/components/{StatsPanel,UpcomingEventsPanel}/`, `CalendarViews/` (+ `layout.ts`; `components/{CalendarToolbar/components/ViewSwitcher,MonthGrid,WeekGrid,DaySchedule,CalendarCell,EventPill}/`) and `CalendarModals/` (+ `form-categories.ts`; `components/{ValidatedModal (+ validation.ts),ModalFeedback,ValidatedCreateEventModal,ValidatedEventDetailsModal/components/EventTrainingLink,CreateEventModal (+ event-form-values.ts; components/EventFormFields/components/{EventTitleFields,EventLocationField,EventDateRange,EventTimeRange,EventCategoryField,EventRecurrenceFields/components/RecurrenceDayPicker,CalendarDateField,EventAssigneeSelect}),EventDetailsModal/components/{EventFacts/components/EventDetailRow,EventAssigneesList,EventDetailsActions}}/`). The page data layer stays in `src/app/calendar/` (`use-calendar-page.ts`, `api.ts`, `date-utils.ts`, `stats.ts`, `types.ts`, `page-query.ts`, `data-cache.ts`). Every component has its co-located `Name.test.tsx`; `tests/component-tree-convention.test.cjs` checks the tree.
- **Shell from the lib (MAIR-578)** — `src/components/CalendarPage/components/AppShell/AppShell.tsx` wraps the lib `AccessibleShell` (`@mairie360/lib-components/shell`) with the session/logout binding; `src/lib/front-urls-provider.tsx` uses the lib `configureSidebarCookieDomain`. No local `accessible-shell.tsx`, `desktop-navigation.tsx` or `sidebar-preference.ts` (pinned by `tests/lib-shell-adoption.test.cjs`; `tests/network-boundary.test.cjs` expects no credential reference left in `src`).

- **Profile routing (MAIR-180 partial delivery)** — `src/app/profile/[[...path]]/page.tsx`
  is now a dynamic Server Component redirecting old profile URLs to the existing
  runtime `SETTINGS_FRONT_URL`. It does not load a local user/profile; absent,
  invalid or looping destinations render an unavailable state with a return link.
  The sidebar no longer duplicates Settings with a Profile item. Earlier profile
  page descriptions below are superseded by this route; the shared AppShell
  migration and BFF session contracts are unchanged.

- **Contract-gated catch-all proxy** — `src/app/[...path]/route.ts` exports `proxyBffRequest` (`src/lib/bff-proxy.ts`) for every method. It matches the path against `contracts/openapi.json` `paths` (brace segments are wildcards): unknown path → 404, method not declared → 405 with `Allow`, `.`/`..` segments → 400; BFF docs (`/openapi.json`, `/swagger.json`) are not forwarded. Matching lives in `src/lib/bff-contract.ts` (literal paths win over `{param}` ones), shared with the middleware. A body is forwarded only if the operation declares a `requestBody`, in a declared media type (else 415), up to `MAX_REQUEST_BODY_BYTES` (1 MiB, else 413); schema validation is left to the BFF. **A BFF route is therefore reachable from the browser only once the synced contract declares it.**
- **`forwardToBff`** first refuses cross-site unsafe methods with 403 (`isCrossSiteRequest`: `Sec-Fetch-Site` must be `same-origin`/`none`, else `Origin` host must equal `x-forwarded-host`/`host`; requests with neither, like k6/curl, pass). It forwards only an allowlist of request headers, and sets `Authorization: Bearer` **only from the HttpOnly `accessToken` cookie** (a browser-sent Authorization is dropped). Keeps the query string, uses `redirect: 'manual'`, a 15 s timeout and `Cache-Control: no-store`, preserves upstream status/headers (including `Set-Cookie`, empty 204/205/304 bodies) and returns a controlled 502 JSON error when the BFF is unreachable. `tests/proxy.test.cjs` pins this behaviour.
- **BFF URL** — `BFF_CALENDAR_BASE_URL` → `CALENDAR_BFF_URL` → `NEXT_PUBLIC_BFF_CALENDAR_BASE_URL`; resolved at request time on the server. Explicit HTTP(S) configuration is required; missing or invalid values return an uncached 503 without an upstream call.
- **Session adapters** — `src/app/api/{user/me,auth/me,auth/session,auth/logout}/route.ts` call `userBffRequest` (`src/lib/user-bff-proxy.ts`), which reuses `forwardToBff` against BFF User (`USER_BFF_URL` → `BFF_USER_API_URL`, also explicitly required). `src/lib/auth-session.ts` (`useAuthSession`) loads `/api/user/me`, normalises roles (`Admin`/`Responsable`/`Maire`/`User`/`Guest`, with FR/EN aliases) and on 401 calls `logoutAndReload()`.
- **Auth gate** — `src/middleware.ts` redirects page requests (matcher excludes paths starting with `api`, `_next/static`, `_next/image` and any path containing a dot) to `LOGIN_FRONT_URL` when the `accessToken` cookie is missing or its JWT `exp` is past, clearing the cookie on `COOKIE_DOMAIN`. It only decodes the payload; signature validation is the BFF/Core's job. Paths declared in the contract (`isContractDataPath`) are passed straight through: the BFF decides and answers 401 JSON. For pages it also sets a per-request nonce `Content-Security-Policy` (built in `src/lib/content-security-policy.ts`, forwarded to Next.js via request headers), which is why `src/app/layout.tsx` forces dynamic rendering: a prerendered page would carry no nonce and its scripts would be blocked. Any new external origin (images, fonts, browser-side API calls) must be added to that policy.
- **Client calls / trust the BFF** — `requestBff` (`src/lib/bff-client.ts`) calls same-origin paths with the cookie only (no token in JS storage), turns `ApiError` `{ code, message }` / proxy `{ error: { message } }` bodies into `BffRequestError`, and on 401 calls `logoutAndReload()` (`src/lib/logout.ts`, deduplicated; BFF User clears the cookie, the reload hits the middleware). `src/app/calendar/api.ts` never builds a path: it calls the operations of the generated client (`bffCalendar`, `getBffCalendar` of `@mairie360/bff-calendar-openapi`, wrapped in `bff-client.ts` by an axios adapter that delegates to `requestBff`), and types responses with `src/contracts/bff.d.ts` and uses them as returned: permissions (`canEdit`/`canDelete`/`canValidate`), assignable people and validation are BFF decisions; the front only adds `colorClassName` and rebuilds `assignees` from `assigneeIds` when absent. Dates picked as `Date` are sent as local `YYYY-MM-DD`. BFF-side gaps to fix later are listed at the end of `BFF.md`.
- `src/app/page.tsx` composes calendar components around the `useCalendarPage` hook (`src/app/calendar/use-calendar-page.ts`), which loads `/calendar/bootstrap`, owns the visible date range and runs mutations. `api.ts`, `date-utils.ts`, `stats.ts`, `types.ts` in the same folder hold the client, date maths and derived stats.
- `src/app/_components/app-shell.tsx` + `src/app/navigation.ts` provide the shared shell/sidebar; the profile page uses the session adapters.
- `next.config.ts` sets `output: 'standalone'` (required by the Dockerfile), `poweredByHeader: false` and static security headers on every route (`tests/security-headers.test.cjs` pins them, and the ZAP baseline fails without them), and inlines the `*_FRONT_URL` values at **build time** (defaults `https://<module>.dev.mairie360-eip.fr/`), so changing them requires a rebuild.
- **Text constraints of the contract (MAIR-514)** — the published contract refuses `<` and `>` in every event text (`title`, `description`, `location`, `service`). The fields belong to the lib-components modals, so `validated-event-modals.tsx` checks them on the captured submit (`validateEventTexts` in `_components/validation.ts`, read from `#event-title`, `#event-description`, `#event-location`) before the chronology and before any request, with a French message per field. `formatCalendarApiError` (`calendar/api.ts`) lists the `error.details[]` of a BFF 400 per field (`describeValidationDetail`: `body.recurrence.endsOn` → `Récurrence › Fin de récurrence : …`) and keeps the BFF message otherwise.

## CI/CD

- `.github/workflows/cicd.yml` calls `mairie360/CICD/.github/workflows/frontend-cicd.yml@<sha>` pinned to a CICD commit (`package_name: calendar-front`, `node_version: "24.21.0"`, `cicd_version` = the same sha, each followed by a `# vX.Y.Z` comment so Renovate bumps them together with `dev-dependency-exception.yml`; `tests/cicd-pin.test.cjs` checks they agree) and passes only the `CODECOV_TOKEN` and `N8N_WEBHOOK_SECRET` secrets plus the release-journal ones (`ANTHROPIC_API_KEY`, `RELEASE_APP_ID`, `RELEASE_APP_PK`, org secrets used by CICD to commit `RELEASE_JOURNAL.md` on `main` after each release). It runs on `pull_request`, `workflow_dispatch` and on `push` to `main` only, so a PR branch no longer runs the pipeline twice (MAIR-436). The workflow token is read-only by default (`permissions: contents: read`); only the `CICD` job gets `contents`/`packages`/`id-token: write`, the cap the reusable workflow needs for its release jobs (dev image push + cosign signature, prod tag). `tests/workflow-permissions.test.cjs` (identical in the eight fronts) pins both rules. A separate read-only `required_security_scan` job runs Semgrep and Gitleaks under the legacy required check name. The reusable pipeline runs `npm ci` → `npm run lint` + `npm audit --omit=dev --audit-level=high` (blocking; the full audit is report-only) + Semgrep/Gitleaks → `npm run build` + `npm test` (Codecov) → on `main`, builds `Dockerfile` with the token as the BuildKit secret `node_auth_token` (never a build arg), scans it with Trivy, signs it with cosign and pushes `ghcr.io/mairie360/calendar-front:dev-<sha>`. Some jobs set up Node without a registry, so the committed `.npmrc` must keep the `@mairie360` registry + `${NODE_AUTH_TOKEN}` lines.
- `.github/workflows/contracts.yml` (exact Node 24.21.0) runs `contracts:check` and `test:contracts` on every PR and on pushes to `main`.
- `Dockerfile`: two-stage `node:<ver>-bookworm-slim` build, standalone output, non-root `nextjs` user, `PORT=5002`, `CMD node server.js`.

## Docker dev stack

`docker compose watch` (with `NODE_AUTH_TOKEN` exported, passed as a build secret) runs `docker-compose.yml`: Postgres + Liquibase + Redis, `calendar-api` and `bff-calendar` from `dev-latest` GHCR images, and this front built from `development.Dockerfile` (`npm run dev`, `./src` synced into the container, host `5002` → container `3000`). The `core` service is commented out and there is no BFF User, so the session adapters (`/api/user/me`…) and anything the BFF resolves against Core do not work in this stack. `nginx.conf` is not referenced by any compose file.

## Isolated security & performance tests

Same pattern as the APIs/BFFs, adapted to a web front. Not part of `npm test`; they need Docker and `NODE_AUTH_TOKEN` (the front image is built from the production `Dockerfile`).

- `./security_test.sh` → `docker-compose-security.yml`: full isolated upstream stack (Postgres + Liquibase + `init-test.sql` seed, Redis, Core API, BFF User, BFF_Calendar and its dependencies; published GHCR images, versions overridable via `*_IMAGE` env vars) + this front, then `zap-baseline.py` (classic spider + AJAX spider `-j`, which renders the page in a headless browser so the BFF contract routes fetched by the bundle are scanned too, + passive scan) authenticated with a static `accessToken` cookie. Any WARN/FAIL alert not set to IGNORE in `.zap/rules.tsv` fails the run; since MAIR-516 the server-error rule (100000) is no longer ignored, so a 5xx relayed by the proxy fails the scan.
- `./performance_test.sh` → `docker-compose-performance.yml`: same stack + k6 running `load-test.js`: a `reads` scenario (pages, `/health`, `/api/user/me`, `/calendar/*` through the proxy, the paths the page uses) and a `writes` scenario (MAIR-516, `POST` then `DELETE /calendar/events`), both with a JWT minted from `JWT_SECRET`; strict status checks and per-endpoint thresholds fail the run.
- Test user is id 2 (seeded in `init-test.sql`); every service shares `JWT_SECRET=b"secret"`. `TARGET_IMAGE` lets the stacks reuse a pre-built front image. These files are excluded from the image by `.dockerignore`.

## Pull request reviewers

Every PR requests a review from the whole team, minus its author: `CarolinHugo`, `LAURETbenjamin`, `MathTek` and `Quentintnrl` (`gh pr create … --reviewer CarolinHugo,LAURETbenjamin,MathTek`). `.github/CODEOWNERS` makes GitHub request them automatically as well.

## Promotion to staging and prod (MAIR-494)

A push to `main` only releases dev (`cicd.yml` stops at `release-dev`). Staging and prod are manual:
`gh workflow run promote-staging.yml -R mairie360/Calendars_Web_Service` (main's newest commit) or `gh workflow run promote-staging.yml -R mairie360/Calendars_Web_Service -f sha="$SHA"` (a given commit, `SHA` holding its full sha), then the same with `promote-prod.yml`
(environments `Staging` / `Prod`). Staging refuses a commit without `dev-<sha>` and a green main run, and runs
the ZAP and k6 stacks on that image; prod refuses one without `staging-<sha>` and tags the version semantic-release computes
for that commit. `cicd.yml`, `promote-staging.yml` and `promote-prod.yml` pin the same mairie360/CICD release.
