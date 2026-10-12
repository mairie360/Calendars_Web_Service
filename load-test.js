import http from 'k6/http';
import { check, sleep, group } from 'k6';
import crypto from 'k6/crypto';
import encoding from 'k6/encoding';

// ---------------------------------------------------------------------------
// k6 load test of the Calendars front (Calendars_Web_Service).
// Two scenarios run side by side against the routes the Next.js server really serves:
//   * `reads`: the page (Next.js render behind the authentication middleware), the session
//     adapter /api/user/me (-> BFF User), /health, then the /api/bff/calendar/* reads the page
//     fetches, relayed by the same-origin proxy to BFF Calendar;
//   * `writes` (MAIR-516): the event creation and deletion a user performs from the page,
//     POST then DELETE /api/bff/calendar/events (-> BFF Calendar -> Calendar API).
// Authentication goes through the accessToken cookie, like in the browser: the proxy turns it
// into Authorization: Bearer for the BFF.
// ---------------------------------------------------------------------------

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5002';
// Must match the JWT_SECRET of the core-api / bff-user / API services of the test stack.
const JWT_SECRET = __ENV.JWT_SECRET || 'b"secret"';
// User inserted by init-test.sql (token `sub`).
const USER_ID = __ENV.PERF_USER_ID || '2';

const STAGES = [
  { duration: '30s', target: 20 }, // ramp up
  { duration: '1m', target: 20 }, // plateau
  { duration: '10s', target: 0 }, // ramp down
];

export const options = {
  scenarios: {
    reads: { executor: 'ramping-vus', startVUs: 0, stages: STAGES, exec: 'reads', gracefulRampDown: '5s' },
    // Few VUs on purpose: every iteration writes twice in the Calendar API database.
    writes: { executor: 'constant-vus', vus: 3, duration: '1m40s', exec: 'writes' },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // < 1% of HTTP errors
    checks: ['rate>0.99'], // a redirect (307) is not an HTTP error: the checks catch it
    'http_req_duration{endpoint:page}': ['p(95)<800'],     // Next.js page render
    'http_req_duration{endpoint:health}': ['p(95)<150'],   // same-origin proxy -> BFF /health
    'http_req_duration{endpoint:session}': ['p(95)<500'],  // /api/user/me -> BFF User -> Core
    'http_req_duration{endpoint:calendar}': ['p(95)<600'], // proxy + BFF aggregation + upstream
    'http_req_duration{endpoint:event-create}': ['p(95)<1000'], // proxy -> BFF Calendar -> Calendar API insert
    'http_req_duration{endpoint:event-delete}': ['p(95)<1000'], // proxy -> BFF Calendar -> Calendar API delete
  },
};

function b64url(value) {
  return encoding.b64encode(value, 'rawurl');
}

// JWT HS256 minimal accepté par Core API / BFF User (claims sub + role + exp).
function mintJwt() {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(JSON.stringify({ sub: USER_ID, role: 'user', exp: now + 3600 }));
  const signingInput = `${header}.${payload}`;
  const signature = crypto.hmac('sha256', JWT_SECRET, signingInput, 'base64rawurl');
  return `${signingInput}.${signature}`;
}

function monthRange() {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export function setup() {
  return { token: mintJwt() };
}

export function reads(data) {
  const cookie = { Cookie: `accessToken=${data.token}` };
  // redirects: 0 : a redirect (e.g. to the Login front when the cookie is refused)
  // must fail the check instead of being followed outside the stack.
  const pageParams = { headers: cookie, redirects: 0, tags: { endpoint: 'page' } };
  const dataParams = { headers: { ...cookie, Accept: 'application/json' }, redirects: 0, tags: { endpoint: 'calendar' } };
  const { from, to } = monthRange();

  group('pages', () => {
    const home = http.get(`${BASE_URL}/`, pageParams);
    check(home, { 'page / 200': (r) => r.status === 200 });
  });

  group('health', () => {
    const res = http.get(`${BASE_URL}/health`, { headers: cookie, redirects: 0, tags: { endpoint: 'health' } });
    check(res, { 'health 200': (r) => r.status === 200 });
  });

  group('session', () => {
    const me = http.get(`${BASE_URL}/api/user/me`, { headers: cookie, redirects: 0, tags: { endpoint: 'session' } });
    check(me, { '/api/user/me 200': (r) => r.status === 200 });
  });

  group('calendar reads', () => {
    // Browser paths of the page (src/lib/bff-client.ts prefixes /api/bff), not the root catch-all.
    const calendarBootstrap = http.get(`${BASE_URL}/api/bff/calendar/bootstrap?from=${from}&to=${to}`, dataParams);
    check(calendarBootstrap, { '/api/bff/calendar/bootstrap 200': (r) => r.status === 200 });

    const calendarEvents = http.get(`${BASE_URL}/api/bff/calendar/events?from=${from}&to=${to}`, dataParams);
    check(calendarEvents, { '/api/bff/calendar/events 200': (r) => r.status === 200 });

    const calendarCategories = http.get(`${BASE_URL}/api/bff/calendar/categories`, dataParams);
    check(calendarCategories, { '/api/bff/calendar/categories 200': (r) => r.status === 200 });

    const calendarServices = http.get(`${BASE_URL}/api/bff/calendar/services`, dataParams);
    check(calendarServices, { '/api/bff/calendar/services 200': (r) => r.status === 200 });
  });

  sleep(1);
}

export function writes(data) {
  const headers = { Cookie: `accessToken=${data.token}`, Accept: 'application/json', 'Content-Type': 'application/json' };

  group('event lifecycle', () => {
    const date = new Date().toISOString().slice(0, 10);
    const created = http.post(
      `${BASE_URL}/api/bff/calendar/events`,
      JSON.stringify({
        title: `k6 ${__VU}-${__ITER}-${Date.now()}`,
        date,
        startTime: '09:00',
        endTime: '10:00',
        category: 'meeting',
        description: 'Temporary event of the k6 load test',
      }),
      { headers, redirects: 0, tags: { endpoint: 'event-create' } },
    );
    let id = null;
    try {
      const body = created.json();
      id = body && body.id !== undefined && body.id !== null ? String(body.id) : null;
    } catch {
      id = null;
    }
    const ok = check(created, {
      'POST /api/bff/calendar/events 201': (r) => r.status === 201,
      'POST /api/bff/calendar/events returns the event id': () => id !== null,
    });
    if (!ok) return;

    const deleted = http.del(`${BASE_URL}/api/bff/calendar/events/${id}`, null, {
      headers: { Cookie: headers.Cookie, Accept: 'application/json' },
      redirects: 0,
      tags: { endpoint: 'event-delete' },
    });
    check(deleted, { 'DELETE /api/bff/calendar/events/{id} 204': (r) => r.status === 204 });
  });

  sleep(1);
}
