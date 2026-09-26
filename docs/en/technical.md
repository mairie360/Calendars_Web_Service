# Calendars_Web_Service — Technical documentation

## Explicit frontend destinations (MAIR-177)

Frontend redirects use only explicitly configured HTTP(S) URLs without embedded
credentials. There is no implicit localhost destination. Set the existing
`LOGIN_FRONT_URL` (protected fronts) and `PROJECT_FRONT_URL` (Login default)
at runtime, including local development. A valid configured return destination
may still be used by Login when its default is absent. Invalid or missing
Login destinations produce an uncached HTTP 503 message in the middleware;
Login itself displays an unavailable state without a form when no destination
can be resolved. No BFF/API contract or deployment variable is added.


[Module overview](module.md) · [Français](../fr/technical.md) · [README](../../README.md)

## Architecture and request handling

Next.js 15.5.25, React 19 and TypeScript application using the App Router. The browser calls same-origin routes; the Next.js server forwards data to **BFF_Calendar**.

```mermaid
flowchart LR
  Browser --> Next["Calendars_Web_Service"]
  Next --> BFF["BFF_Calendar"]
```

The page combines calendar components with `useCalendarPage`. The hook loads bootstrap and manages the date range and mutations; data routes retain the `/calendar` prefix. The shell and profile page use separate session adapters.

On first mount, the hook reads optional `date` (`YYYY-MM-DD`) and `event` (ID) query parameters. A valid date selects its month before the first `/calendar/bootstrap` request, avoiding an unnecessary request for the current month. After a successful bootstrap, a matching event opens in the existing details modal. An invalid date falls back to the current month; a missing event leaves the selected date visible without opening a modal. The link does not grant access beyond what the BFF returns.

The generic proxy reads the versioned OpenAPI contract to allow paths and methods. It forwards an allowlist of request headers (`Accept`, `Accept-Language`, `Content-Type`, conditional headers, `User-Agent`, `X-Request-Id`), forwards a body only when the operation declares one and in a declared content type (otherwise 415), limits bodies to 1 MiB (413), preserves query parameters, statuses and BFF responses, disables caching and does not automatically follow redirects. Its timeout is 15 seconds.

## Data and persistence

The following sources and limitations describe the associated BFF, which determines persistence for the displayed data.

Calendar API supplies event operations. `calendarAccessRepository.ts` accesses PostgreSQL directly for the directory, assignments, some updates and metadata. The `calendar_event_metadata` table, created by the BFF when needed, references `events.id` and stores category, service, location and recurrence. Categories and services include reference lists defined in the helpers.

Operation depends on consistent user identifiers between Core and Calendar and the expected SQL schema. The Docker stack uses the database shared with BFF User; start that stack first. Metadata and direct SQL access remain current BFF responsibilities.

React state manages display and pending operations. This repository defines no business database of its own; save guarantees come from the BFF and its sources described above.

## Installation and local startup

Use Node.js 22 to reproduce the contract job and npm with the committed lockfile. Other job and Docker versions are detailed below.

Private `@mairie360/*` dependencies require GitHub Packages access. Set `NODE_AUTH_TOKEN` in the environment to a token allowed to read these packages, as configured in `.npmrc`. Do not commit its value.

```bash
npm ci
```

Create `.env.local` in the repository root. Example for BFFs running on the same machine:

```dotenv
BFF_CALENDAR_BASE_URL=http://localhost:4002
USER_BFF_URL=http://localhost:4000
```

Start the associated BFF and BFF User for session flows, then start the web service. Port `5002` below is an explicit local choice to avoid collisions; it is not a claim about ports in every Compose file.

```bash
npm run dev -- --port 5002
```

Open `http://localhost:5002`. To run the build with the Next.js script:

```bash
npm run build
npm run start -- --port 5002
```

## Configuration

On a missing or expired session, the middleware sends `redirect` to Login. It builds the destination from the runtime `CALENDAR_FRONT_URL` plus the requested path and query, never from the internal ingress host. Without a valid public URL, Login uses its default Projects destination.

Values below are local examples or explicitly described behavior, not production credentials.

| Variable or precedence | Example / stated fallback | Purpose |
| --- | --- | --- |
| `BFF_CALENDAR_BASE_URL` → `CALENDAR_BFF_URL` → `NEXT_PUBLIC_BFF_CALENDAR_BASE_URL` | http://localhost:4002 | Left-to-right proxy precedence; explicitly configure an HTTP(S) URL. Missing or invalid configuration returns an uncached 503 without an upstream call. |
| `USER_BFF_URL` → `BFF_USER_API_URL` | http://localhost:4000 | Separate precedence for BFF User session adapters; also requires an explicit HTTP(S) URL. |
| `BFF_CONTRACT_DIR` | ../BFF_Calendar/contracts | BFF contract directory for synchronization and checking scripts. |
| `COOKIE_DOMAIN` | — | Cookie domain; keep it consistent with Login and BFF User. |
| `ADMINISTRATION_FRONT_URL` | — | Navigation destination; see the source file that reads it. Variables injected by `next.config.ts` or prefixed `NEXT_PUBLIC_` are public and consumed at build time. |
| `CALENDAR_FRONT_URL` | — | Navigation destination; see the source file that reads it. Variables injected by `next.config.ts` or prefixed `NEXT_PUBLIC_` are public and consumed at build time. |
| `ELEARNING_FRONT_URL` | — | Navigation destination; see the source file that reads it. Variables injected by `next.config.ts` or prefixed `NEXT_PUBLIC_` are public and consumed at build time. |
| `EMAIL_FRONT_URL` | — | Navigation destination; see the source file that reads it. Variables injected by `next.config.ts` or prefixed `NEXT_PUBLIC_` are public and consumed at build time. |
| `FILES_FRONT_URL` | — | Navigation destination; see the source file that reads it. Variables injected by `next.config.ts` or prefixed `NEXT_PUBLIC_` are public and consumed at build time. |
| `LOGIN_FRONT_URL` | — | Navigation destination; see the source file that reads it. Variables injected by `next.config.ts` or prefixed `NEXT_PUBLIC_` are public and consumed at build time. |
| `MESSAGE_FRONT_URL` | — | Navigation destination; see the source file that reads it. Variables injected by `next.config.ts` or prefixed `NEXT_PUBLIC_` are public and consumed at build time. |
| `PROJECT_FRONT_URL` | — | Navigation destination; see the source file that reads it. Variables injected by `next.config.ts` or prefixed `NEXT_PUBLIC_` are public and consumed at build time. |

Inside a container, `localhost` refers to that container. Use the BFF service DNS name on the Docker network or a reachable host address. Compose files sometimes include other services and legacy settings; check effective URLs and ports before using them.

## Routes and data contract

Inventory extracted from `contracts/openapi.json`. Replace brace parameters with real identifiers. Detailed types, required fields, responses and any examples are defined in that contract; table statuses are the declared statuses, not an exhaustive list of transport or validation errors.

These data paths are exposed at the same origin through the proxy; Next.js pages are separate. The BFF documentation (`/openapi.json`, `/swagger.json`, `/docs`) is not forwarded.

| Method | Path | Declared parameters or body | Declared statuses |
| --- | --- | --- | --- |
| GET | `/health` | — | 200 |
| GET | `/check_apis` | — | 200, 502 |
| GET | `/calendar/bootstrap` | `from`, `to` query (optional) | 200, 400, 401, 500, 502 |
| GET | `/calendar/events` | `from`, `to` query | 200, 400, 401, 500, 502 |
| POST | `/calendar/events` | application/json | 201, 400, 401, 403, 500, 502 |
| PATCH | `/calendar/events/{id}` | application/json | 200, 400, 401, 403, 404, 500, 502 |
| DELETE | `/calendar/events/{id}` | — | 204, 400, 401, 403, 404, 500, 502 |
| PATCH | `/calendar/events/{id}/approval` | application/json | 200, 400, 401, 403, 404, 500, 502 |
| GET | `/calendar/assignees` | `from`, `to` query (optional) | 200, 400, 401, 500, 502 |
| GET | `/calendar/categories` | — | 200, 500 |
| GET | `/calendar/services` | — | 200, 500 |

### Pages and local adapters

| Page | Source |
| --- | --- |
| `/` | [src/app/page.tsx](../../src/app/page.tsx) |
| `/profile` | [src/app/profile/page.tsx](../../src/app/profile/page.tsx) |

| Method | Local route | Source |
| --- | --- | --- |
| GET | `/api/user/me` | [src/app/api/user/me/route.ts](../../src/app/api/user/me/route.ts) |
| POST | `/api/auth/logout` | [src/app/api/auth/logout/route.ts](../../src/app/api/auth/logout/route.ts) |
| GET | `/api/auth/me` | [src/app/api/auth/me/route.ts](../../src/app/api/auth/me/route.ts) |
| GET | `/api/auth/session` | [src/app/api/auth/session/route.ts](../../src/app/api/auth/session/route.ts) |

## Session, permissions and errors

The `/api/auth/me`, `/api/auth/session` and `/api/user/me` adapters use BFF User for session access; `/api/auth/logout` forwards logout. Both proxies authenticate only with the HttpOnly `accessToken` cookie set by Login, turned into `Authorization: Bearer`; an `Authorization` header sent by the browser is ignored and no token is stored in `localStorage`. Unsafe methods (POST, PUT, PATCH, DELETE) are refused with 403 when `Sec-Fetch-Site` is not `same-origin`, or, without it, when `Origin` does not match the served host (CSRF protection on top of `SameSite=Strict`).

The front trusts the BFF: permissions (`canEdit`, `canDelete`, `canValidate`), assignable people, payload validation and error messages come from BFF_Calendar and are used as returned. The middleware does not redirect data paths declared in the contract: the BFF answers 401, and the client then logs out through BFF User and reloads the page, which the middleware sends to Login. BFF-side gaps are listed in [BFF.md](../../BFF.md).

The generic proxy returns 400 for an invalid path, 404 for a path outside the contract, 405 for a disallowed method and 502 when the service is unreachable or times out. Upstream responses are preserved, including empty 204/205/304 bodies.

Every response carries `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Resource-Policy`, `Cross-Origin-Embedder-Policy` and `Cross-Origin-Opener-Policy` (`next.config.ts`), and `X-Powered-By` is disabled. For authenticated requests, [src/middleware.ts](../../src/middleware.ts) adds a `Content-Security-Policy` with a per-request nonce, which Next.js applies to its scripts. Pages are therefore rendered on demand (`dynamic = "force-dynamic"` in the layout). Stylesheets are limited to the origin and the nonce; only `style` attributes rendered by components are allowed through `style-src-attr 'unsafe-inline'`, and `next dev` also allows `'unsafe-eval'`. Any new external resource (image, font, API called from the browser) must be added to the policy in `src/lib/content-security-policy.ts`.

## Synchronization and verification

After changing routes or schemas, export the contract in **BFF_Calendar** using `npm run contracts:generate`, then run in this repository:

```bash
npm run contracts:sync
npm run contracts:check
npm run test:contracts
npm run lint
npm run build
```

`contracts:sync` copies the BFF contract and regenerates `src/contracts/bff.d.ts`. `contracts:check` also compares a neighboring BFF when present; in an isolated checkout, it checks types against the local committed snapshot. `test:contracts` runs the Node tests without coverage; `npm test` runs them with the 60% line, branch and function coverage thresholds.

The `tests/*.bff-mock.test.cjs` tests run the real client code (`src/app/calendar/api.ts`, the `useCalendarPage` hook, `useAuthSession`) against a local HTTP server that routes to the real Next.js route handlers, which forward to local BFF mocks. The BFF_Calendar mock is driven by `contracts/openapi.json`: every request (path, method, path and query parameters, undeclared query, JSON body) and every mocked response is validated against the contract, and any deviation fails the test. A guard replaces `fetch`: client code may only call its own origin and the server may only reach the mocked BFFs. The BFF User mock uses `../../BFFs/BFF_user/contracts/openapi.json` (or `BFF_USER_CONTRACT_DIR`) when that checkout exists; otherwise it only declares the three consumed operations, without response schemas. `tests/network-boundary.test.cjs` also checks statically that only `bff-client.ts`, `auth-session.ts`, `logout.ts` and `bff-proxy.ts` emit requests, that no JavaScript-readable credential is used, and that every endpoint used by the calendar client is declared in the contract.

The type generator is pinned to `openapi-typescript@7.10.1` in `scripts/contracts.mjs` and runs through npm. For documentation-only changes, check links, accuracy in both languages and `git diff --check`; do not regenerate contracts without changing their source.

## CI/CD and Docker execution

The `contracts.yml` job uses Node.js 22, `actions/checkout@v7` and `actions/setup-node@v7`. It runs on pushes, pull requests and manual dispatch; it installs with `npm ci`, checks contracts and runs the associated tests.

`cicd.yml` calls `mairie360/CICD/.github/workflows/frontend-cicd.yml@v2.3.1`, with `cicd_version: v2.3.1` and `node_version: "23"`. Reusable steps and GitHub environments determine actual checks, publications and deployments.

The Dockerfile defaults to `NODE_VERSION=23.10.0` and the Next.js `standalone` build; the image command is `["node", "server.js"]`. Image ports and Compose mappings can differ from the local port suggested above.

Before running Docker, check service variables, build secrets and networks in the repository files. Green CI validates its jobs; it does not prove business-service availability in a remote environment.

## Troubleshooting

Associated BFF diagnostics: For missing events or rejected assignments, check the user, group membership and shared database. A `calendar_event_metadata` error requires checking the schema and SQL account permissions. `/check_apis` and the business client use different variables.

For a proxy error, compare the path and method with the inventory, then check the BFF URL and session. For a 401 after navigating between modules, check the `accessToken` cookie, its domain and BFF User. A 404 for a requirement described in `BACKEND.md` may refer to a feature that is only proposed.

## Repository reference

- [src/app/page.tsx](../../src/app/page.tsx)
- [src/app/calendar/use-calendar-page.ts](../../src/app/calendar/use-calendar-page.ts)
- [src/app/_components/app-shell.tsx](../../src/app/_components/app-shell.tsx)
- [src/middleware.ts](../../src/middleware.ts)
- [src/lib/bff-proxy.ts](../../src/lib/bff-proxy.ts)
- [src/app/[...path]/route.ts](../../src/app/%5B...path%5D/route.ts)
- [src/lib/user-bff-proxy.ts](../../src/lib/user-bff-proxy.ts)
- [contracts/openapi.json](../../contracts/openapi.json)
- [src/contracts/bff.d.ts](../../src/contracts/bff.d.ts)
- [scripts/contracts.mjs](../../scripts/contracts.mjs)
- [package.json](../../package.json)
- [.github/workflows/contracts.yml](../../.github/workflows/contracts.yml)
- [.github/workflows/cicd.yml](../../.github/workflows/cicd.yml)
- [Dockerfile](../../Dockerfile)
- [docker-compose.yml](../../docker-compose.yml)

Historical supplements: [BFF.md](../../BFF.md), [BACKEND.md](../../BACKEND.md). Proposed requirements must remain distinct from implemented behavior.
