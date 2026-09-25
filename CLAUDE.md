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

`*.bff-mock.test.cjs` drive `api.ts`, `useCalendarPage` and `useAuthSession` through that chain; `network-boundary.test.cjs` pins which source files may emit requests, the absolute URLs allowed in `src`, that every calendar endpoint exists in the contract, and that each contract operation is forwarded. A new BFF call therefore needs the contract synced first, a fixture in `OPERATION_FIXTURES` for a new operation, and an update of those allowlists if it adds a network emitter. Coverage only counts files a test loads; thresholds (60% lines/branches/functions) apply to that total. Tests that depend on "today" must derive dates from `initialDate` (`src/app/calendar/constants.ts`).

### OpenAPI contract

`contracts/openapi.json` is a committed copy of BFF_Calendar's contract and `src/contracts/bff.d.ts` is generated from it (`openapi-typescript@7.10.1`, pinned in `scripts/contracts.mjs`). Never hand-edit either file.

```bash
BFF_CONTRACT_DIR=../../BFFs/BFF_Calendar/contracts npm run contracts:sync   # copy the BFF contract and regenerate types
npm run contracts:generate  # regenerate types from the local snapshot
npm run contracts:check     # fail if types are stale, or if the BFF checkout at $BFF_CONTRACT_DIR has a different contract
```

The script's default source `../BFF_Calendar/contracts` resolves to `Fronts/BFF_Calendar`, which does not exist in the EIP checkout, so always set `BFF_CONTRACT_DIR` (without it, `check` silently skips the BFF comparison). All three commands `npm exec` `openapi-typescript`, so they need network access. The `@mairie360/bff-calendar-openapi` dependency is not imported anywhere; the code uses the committed snapshot and generated types.

## Architecture

- **Contract-gated catch-all proxy** — `src/app/[...path]/route.ts` exports `proxyBffRequest` (`src/lib/bff-proxy.ts`) for every method. It matches the path against `contracts/openapi.json` `paths` (brace segments are wildcards): unknown path → 404, method not declared → 405 with `Allow`, `.`/`..` segments → 400; BFF docs (`/openapi.json`, `/swagger.json`) are not forwarded. Matching lives in `src/lib/bff-contract.ts` (literal paths win over `{param}` ones), shared with the middleware. A body is forwarded only if the operation declares a `requestBody`, in a declared media type (else 415), up to `MAX_REQUEST_BODY_BYTES` (1 MiB, else 413); schema validation is left to the BFF. **A BFF route is therefore reachable from the browser only once the synced contract declares it.**
- **`forwardToBff`** first refuses cross-site unsafe methods with 403 (`isCrossSiteRequest`: `Sec-Fetch-Site` must be `same-origin`/`none`, else `Origin` host must equal `x-forwarded-host`/`host`; requests with neither, like k6/curl, pass). It forwards only an allowlist of request headers, and sets `Authorization: Bearer` **only from the HttpOnly `accessToken` cookie** (a browser-sent Authorization is dropped). Keeps the query string, uses `redirect: 'manual'`, a 15 s timeout and `Cache-Control: no-store`, preserves upstream status/headers (including `Set-Cookie`, empty 204/205/304 bodies) and returns a controlled 502 JSON error when the BFF is unreachable. `tests/proxy.test.cjs` pins this behaviour.
- **BFF URL** — `BFF_CALENDAR_BASE_URL` → `CALENDAR_BFF_URL` → `NEXT_PUBLIC_BFF_CALENDAR_BASE_URL` (fallback `http://localhost:4002`); resolved at request time on the server.
- **Session adapters** — `src/app/api/{user/me,auth/me,auth/session,auth/logout}/route.ts` call `userBffRequest` (`src/lib/user-bff-proxy.ts`), which reuses `forwardToBff` against BFF User (`USER_BFF_URL` → `BFF_USER_API_URL`, fallback `http://localhost:4000`). `src/lib/auth-session.ts` (`useAuthSession`) loads `/api/user/me`, normalises roles (`Admin`/`Responsable`/`Maire`/`User`/`Guest`, with FR/EN aliases) and on 401 calls `logoutAndReload()`.
- **Auth gate** — `src/middleware.ts` redirects page requests (matcher excludes paths starting with `api`, `_next/static`, `_next/image` and any path containing a dot) to `LOGIN_FRONT_URL` when the `accessToken` cookie is missing or its JWT `exp` is past, clearing the cookie on `COOKIE_DOMAIN`. It only decodes the payload; signature validation is the BFF/Core's job. Paths declared in the contract (`isContractDataPath`) are passed straight through: the BFF decides and answers 401 JSON. For pages it also sets a per-request nonce `Content-Security-Policy` (built in `src/lib/content-security-policy.ts`, forwarded to Next.js via request headers), which is why `src/app/layout.tsx` forces dynamic rendering: a prerendered page would carry no nonce and its scripts would be blocked. Any new external origin (images, fonts, browser-side API calls) must be added to that policy.
- **Client calls / trust the BFF** — `requestBff` (`src/lib/bff-client.ts`) calls same-origin paths with the cookie only (no token in JS storage), turns `ApiError` `{ code, message }` / proxy `{ error: { message } }` bodies into `BffRequestError`, and on 401 calls `logoutAndReload()` (`src/lib/logout.ts`, deduplicated; BFF User clears the cookie, the reload hits the middleware). `src/app/calendar/api.ts` types responses with `src/contracts/bff.d.ts` and uses them as returned: permissions (`canEdit`/`canDelete`/`canValidate`), assignable people and validation are BFF decisions; the front only adds `colorClassName` and rebuilds `assignees` from `assigneeIds` when absent. Dates picked as `Date` are sent as local `YYYY-MM-DD`. BFF-side gaps to fix later are listed at the end of `BFF.md`.
- `src/app/page.tsx` composes calendar components around the `useCalendarPage` hook (`src/app/calendar/use-calendar-page.ts`), which loads `/calendar/bootstrap`, owns the visible date range and runs mutations. `api.ts`, `date-utils.ts`, `stats.ts`, `types.ts` in the same folder hold the client, date maths and derived stats.
- `src/app/_components/app-shell.tsx` + `src/app/navigation.ts` provide the shared shell/sidebar; the profile page uses the session adapters.
- `next.config.ts` sets `output: 'standalone'` (required by the Dockerfile), `poweredByHeader: false` and static security headers on every route (`tests/security-headers.test.cjs` pins them, and the ZAP baseline fails without them), and inlines the `*_FRONT_URL` values at **build time** (defaults `https://<module>.dev.mairie360-eip.fr/`), so changing them requires a rebuild.

## CI/CD

- `.github/workflows/cicd.yml` calls `mairie360/CICD/.github/workflows/frontend-cicd.yml@<tag>` (`package_name: calendar-front`, `node_version: "23"`, `cicd_version: <same tag>`, `secrets: inherit`). Renovate bumps the `@<tag>` pin and `cicd_version` together; keep them identical when editing by hand. semantic-release (`.releaserc.json`) only creates GitHub releases on `main`. Up to the dev release it runs: `npm ci` → `npm run lint` + `npm audit --audit-level=high` (high/critical advisories block) → `npm run build` → `npm test --if-present` (uploads `coverage/lcov.info` to Codecov) → on `main`, builds `Dockerfile` with `NODE_AUTH_TOKEN` as build-arg and pushes `ghcr.io/mairie360/calendar-front:dev-<sha>` / `dev-latest`. Some jobs set up Node without a registry, so the committed `.npmrc` must keep the `@mairie360` registry + `${NODE_AUTH_TOKEN}` lines.
- `.github/workflows/contracts.yml` (Node 22) runs `contracts:check` and `test:contracts` on every push/PR.
- `Dockerfile`: two-stage `node:<ver>-bookworm-slim` build, standalone output, non-root `nextjs` user, `PORT=5002`, `CMD node server.js`.

## Docker dev stack

`docker compose watch` (with `NODE_AUTH_TOKEN` exported, passed as a build secret) runs `docker-compose.yml`: Postgres + Liquibase + Redis, `calendar-api` and `bff-calendar` from `dev-latest` GHCR images, and this front built from `development.Dockerfile` (`npm run dev`, `./src` synced into the container, host `5002` → container `3000`). The `core` service is commented out and there is no BFF User, so the session adapters (`/api/user/me`…) and anything the BFF resolves against Core do not work in this stack. `nginx.conf` is not referenced by any compose file.

## Isolated security & performance tests

Same pattern as the APIs/BFFs, adapted to a web front. Not part of `npm test`; they need Docker and `NODE_AUTH_TOKEN` (the front image is built from the production `Dockerfile`).

- `./security_test.sh` → `docker-compose-security.yml`: full isolated upstream stack (Postgres + Liquibase + `init-test.sql` seed, Redis, Core API, BFF User, BFF_Calendar and its dependencies; published GHCR images, versions overridable via `*_IMAGE` env vars) + this front, then `zap-baseline.py` (spider + passive scan) authenticated with a static `accessToken` cookie. Any WARN/FAIL alert not set to IGNORE in `.zap/rules.tsv` fails the run.
- `./performance_test.sh` → `docker-compose-performance.yml`: same stack + k6 running `load-test.js` (pages, `/health`, `/api/user/me`, `/calendar/*` through the proxy) with a JWT minted from `JWT_SECRET`; thresholds fail the run.
- Test user is id 2 (seeded in `init-test.sql`); every service shares `JWT_SECRET=b"secret"`. `TARGET_IMAGE` lets the stacks reuse a pre-built front image. These files are excluded from the image by `.dockerignore`.

## Pull request reviewers

Every PR requests a review from the whole team, minus its author: `CarolinHugo`, `LAURETbenjamin`, `MathTek` and `Quentintnrl` (`gh pr create … --reviewer CarolinHugo,LAURETbenjamin,MathTek`). `.github/CODEOWNERS` makes GitHub request them automatically as well.
