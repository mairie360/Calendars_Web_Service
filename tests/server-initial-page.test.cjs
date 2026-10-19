const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { loadTs } = require('./support/load-ts.cjs');
const { loadRootLayout } = require('./support/root-layout.cjs');
const { bootstrap, calendarEvent } = require('./support/calendar-fixtures.cjs');
const bag = {};
const { default: Page } = loadRootLayout(() => loadTs('app/page'), bag);
const originalFetch = global.fetch;
const keys = ['CALENDAR_FRONT_URL', 'BFF_CALENDAR_BASE_URL', 'LOGIN_FRONT_URL'];
const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
let calls;
beforeEach(() => {
  process.env.CALENDAR_FRONT_URL = 'https://calendar.mairie.test';
  process.env.BFF_CALENDAR_BASE_URL = 'https://calendar-bff.mairie.test';
  process.env.LOGIN_FRONT_URL = 'https://login.mairie.test';
  for (const key of Object.keys(bag)) delete bag[key];
  bag.accessToken = 'e30.' + Buffer.from(JSON.stringify({ exp: Math.floor(Date.now()/1000) + 600 })).toString('base64url') + '.signature';
  calls = [];
});
afterEach(() => {
  global.fetch = originalFetch;
  for (const [key, value] of Object.entries(previous)) value === undefined ? delete process.env[key] : process.env[key] = value;
});
function transport(body, status = 200) {
  global.fetch = async (url, init) => {
    calls.push({ url: new URL(url), init });
    return Response.json(body, { status, headers: { 'Set-Cookie': 'privateSession=must-not-cross-server-boundary' } });
  };
}
async function initialPage(params = {}) {
  const tree = await Page({ searchParams: Promise.resolve(params) });
  return { tree, html: renderToStaticMarkup(tree) };
}
test('the real server page renders a confirmed civil-date calendar without effects or a browser', async () => {
  transport({ ...bootstrap({ events: [calendarEvent(42, { title: 'Server confirmed calendar event', date: '2026-11-17' })] }), privateToken: 'must-not-serialize' });
  const { html, tree } = await initialPage({ view: 'day', date: '2026-11-17' });
  assert.match(html, /Server confirmed calendar event/);
  assert.doesNotMatch(JSON.stringify(tree.props), /must-not-serialize|signature|privateSession/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.origin, 'https://calendar-bff.mairie.test');
  assert.equal(calls[0].url.pathname, '/calendar/bootstrap');
  assert.equal(calls[0].url.searchParams.get('from'), '2026-11-17');
  assert.equal(calls[0].url.searchParams.get('to'), '2026-11-17');
  assert.equal(calls[0].init.method, 'GET');
  assert.equal(calls[0].init.cache, 'no-store');
  assert.equal(calls[0].init.headers.get('Authorization'), `Bearer ${bag.accessToken}`);
  assert.equal(calls[0].init.headers.get('Cookie'), null);
});
for (const status of [401, 503]) test(`a server ${status} is explicit and never becomes confirmed calendar content`, async () => {
  transport({ error: { message: 'Untrusted secret must-not-serialize' } }, status);
  const { html, tree } = await initialPage();
  assert.match(html, /premier chargement du calendrier est indisponible/);
  assert.doesNotMatch(JSON.stringify(tree.props), /must-not-serialize|signature/);
  assert.equal(calls.length, 1);
});
test('invalid calendar data is rejected rather than represented as a successful empty page', async () => {
  transport({ ...bootstrap(), events: 'invalid' });
  const { html } = await initialPage();
  assert.match(html, /premier chargement du calendrier est indisponible/);
  assert.equal(calls.length, 1);
});
for (const token of [undefined, 'opaque', 'e30.eyJleHAiOjF9.signature']) test(`a missing, opaque or expired access context makes no upstream request: ${token ?? 'missing'}`, async () => {
  bag.accessToken = token;
  transport(bootstrap());
  const { html } = await initialPage();
  assert.match(html, /premier chargement du calendrier est indisponible/);
  assert.equal(calls.length, 0);
});
test('invalid public frontend configuration cannot derive an origin or contact the BFF', async () => {
  process.env.CALENDAR_FRONT_URL = 'https://user:password@calendar.mairie.test';
  transport(bootstrap());
  const { html } = await initialPage();
  assert.match(html, /premier chargement du calendrier est indisponible/);
  assert.equal(calls.length, 0);
});

test('the route loading boundary has a persistent status and no animation dependency', () => {
  const Loading = loadTs('app/loading').default;
  const html = renderToStaticMarkup(React.createElement(Loading));
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /role="status"/);
  assert.match(html, /aria-hidden="true"/);
});

test('the server selects the instance civil day across UTC midnight and preserves a requested civil date', () => {
  const { serverCalendarQuery } = loadTs('app/calendar/page-query');
  const previous = { TZ: process.env.TZ, INSTANCE_TIMEZONE: process.env.INSTANCE_TIMEZONE };
  try {
    process.env.TZ = 'Pacific/Honolulu'; process.env.INSTANCE_TIMEZONE = 'Indian/Reunion';
    const instant = new Date('2026-10-15T22:30:00Z');
    assert.equal(serverCalendarQuery({}, instant).date, '2026-10-16');
    assert.equal(serverCalendarQuery({ date: '2026-10-15', view: 'day', event: '5' }, instant).date, '2026-10-15');
    assert.equal(serverCalendarQuery({ date: '2026-02-31', view: ['day', 'month'], event: ['5', '6'] }, instant).date, '2026-10-16');
    assert.equal(serverCalendarQuery({ date: '2026-10-15', event: ['5', '6'] }, instant).eventId, null);
  } finally { for (const [key, value] of Object.entries(previous)) value === undefined ? delete process.env[key] : process.env[key] = value; }
});

test('separate server renders reset the client lifetime with a fresh opaque key', async () => {
  transport(bootstrap());
  const first = await Page({ searchParams: Promise.resolve({}) });
  const second = await Page({ searchParams: Promise.resolve({}) });
  assert.equal(typeof first.key, 'string');
  assert.notEqual(first.key, second.key);
  assert.doesNotMatch(first.key, /signature|accessToken|refreshToken/);
});

test('a transport failure remains an explicit unavailable receipt without serializing its exception', async () => {
  global.fetch = async () => { throw new Error('transport-private-canary'); };
  const { tree } = await initialPage();
  assert.equal(tree.props.initial.status, 'unavailable');
  assert.doesNotMatch(JSON.stringify(tree.props), /transport-private-canary/);
});
