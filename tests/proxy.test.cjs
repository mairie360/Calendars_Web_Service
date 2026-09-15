const assert = require('node:assert/strict');
const { test, afterEach } = require('node:test');
const { NextRequest } = require('next/server');
const { loadTs } = require('./support/load-ts.cjs');
const { proxyBffRequest, forwardToBff, isCrossSiteRequest, MAX_REQUEST_BODY_BYTES } = loadTs('lib/bff-proxy');
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

const context = (...path) => ({ params: Promise.resolve({ path }) });
const neverCalled = async () => { throw new Error('must not be called'); };

test('proxy preserves query, data and upstream status, and authenticates with the cookie only', async () => {
  let called;
  global.fetch = async (url, init) => { called = { url: String(url), init }; return Response.json({ id: '42', value: null }, { status: 201 }); };
  const request = new NextRequest('http://localhost/health?q=a%26b', { headers: { cookie: 'accessToken=test-session', Authorization: 'Bearer forged-by-client' } });
  const response = await proxyBffRequest(request, context('health'));
  assert.equal(response.status, 201); assert.deepEqual(await response.json(), { id: '42', value: null });
  assert.equal(new URL(called.url).search, '?q=a%26b'); assert.equal(called.init.headers.get('Authorization'), 'Bearer test-session');
  assert.equal(called.init.headers.get('cookie'), null); assert.equal(called.init.redirect, 'manual');
});

test('without the session cookie no Authorization reaches the BFF, even if the client sends one', async () => {
  let headers;
  global.fetch = async (_url, init) => { headers = init.headers; return Response.json({ code: 'UNAUTHORIZED', message: 'Session invalide.' }, { status: 401 }); };
  const response = await proxyBffRequest(new NextRequest('http://localhost/health', { headers: { Authorization: 'Bearer forged' } }), context('health'));
  assert.equal(response.status, 401);
  assert.equal(headers.get('Authorization'), null);
});

test('only allowlisted request headers are forwarded', async () => {
  let headers;
  global.fetch = async (_url, init) => { headers = init.headers; return new Response(null, { status: 204 }); };
  await forwardToBff(new NextRequest('http://localhost/health', { headers: {
    Accept: 'application/json', 'Accept-Language': 'fr', 'X-Request-Id': 'r1',
    'X-Forwarded-For': '10.0.0.1', 'X-Forwarded-Host': 'evil.example', Origin: 'http://localhost', 'x-nonce': 'n', 'content-security-policy': 'x', Host: 'localhost',
  } }), 'http://bff.example', '/health');
  assert.deepEqual([...headers.keys()].sort(), ['accept', 'accept-language', 'x-request-id']);
});

test('forwardToBff preserves binary upload bytes and 204 responses', async () => {
  const bytes = Uint8Array.from([0, 255, 128, 13]);
  let init;
  global.fetch = async (_url, options) => { init = options; return new Response(null, { status: 204 }); };
  const request = new NextRequest('http://localhost/upload', { method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=test', cookie: 'accessToken=test-session' }, body: bytes });
  const response = await forwardToBff(request, 'http://bff.example', '/files');
  assert.equal(response.status, 204); assert.equal(await response.text(), '');
  assert.deepEqual(new Uint8Array(init.body), bytes); assert.equal(init.headers.get('Authorization'), 'Bearer test-session');
  assert.equal(init.headers.get('Content-Type'), 'multipart/form-data; boundary=test');
});

test('contract rejects unknown routes, undeclared methods and BFF documentation before contacting the BFF', async () => {
  global.fetch = neverCalled;
  assert.equal((await proxyBffRequest(new NextRequest('http://localhost/unknown'), context('unknown'))).status, 404);
  for (const doc of ['openapi.json', 'swagger.json']) {
    assert.equal((await proxyBffRequest(new NextRequest(`http://localhost/${doc}`), context(doc))).status, 404);
  }
  const wrongMethod = await proxyBffRequest(new NextRequest('http://localhost/health', { method: 'DELETE' }), context('health'));
  assert.equal(wrongMethod.status, 405); assert.equal(wrongMethod.headers.get('Allow'), 'GET, HEAD');
  assert.equal((await proxyBffRequest(new NextRequest('http://localhost/calendar/..'), context('calendar', '..'))).status, 400);
});

test('literal contract paths win over parameterised ones', async () => {
  let url;
  global.fetch = async (target) => { url = String(target); return Response.json([]); };
  const response = await proxyBffRequest(new NextRequest('http://localhost/calendar/events'), context('calendar', 'events'));
  assert.equal(response.status, 200);
  assert.equal(new URL(url).pathname, '/calendar/events');
});

test('cross-site unsafe requests are refused (CSRF), same-origin and non-browser clients are accepted', async () => {
  const request = (headers, method = 'POST') => new NextRequest('http://front.test/calendar/events', { method, headers: { host: 'front.test', ...headers } });
  assert.equal(isCrossSiteRequest(request({ 'sec-fetch-site': 'cross-site' })), true);
  assert.equal(isCrossSiteRequest(request({ 'sec-fetch-site': 'same-site' })), true);
  assert.equal(isCrossSiteRequest(request({ origin: 'https://evil.example' })), true);
  assert.equal(isCrossSiteRequest(request({ origin: 'null' })), true);
  assert.equal(isCrossSiteRequest(request({ 'sec-fetch-site': 'same-origin', origin: 'http://front.test' })), false);
  assert.equal(isCrossSiteRequest(request({ origin: 'https://front.test' })), false);
  assert.equal(isCrossSiteRequest(request({ origin: 'https://calendar.mairie.test', 'x-forwarded-host': 'calendar.mairie.test' })), false);
  assert.equal(isCrossSiteRequest(request({})), false);
  assert.equal(isCrossSiteRequest(request({ 'sec-fetch-site': 'cross-site' }, 'GET')), false);

  global.fetch = neverCalled;
  const refused = await proxyBffRequest(request({ 'sec-fetch-site': 'cross-site', cookie: 'accessToken=victim', 'content-type': 'application/json' }), context('calendar', 'events'));
  assert.equal(refused.status, 403);
  const refusedLogout = await forwardToBff(new NextRequest('http://front.test/api/auth/logout', { method: 'POST', headers: { origin: 'https://evil.example', host: 'front.test' } }), 'http://bff.example', '/auth/logout');
  assert.equal(refusedLogout.status, 403);
});

test('bodies must use a content type declared by the contract and stay under the size limit', async () => {
  global.fetch = neverCalled;
  const post = (body, headers) => proxyBffRequest(new NextRequest('http://localhost/calendar/events', { method: 'POST', headers, body }), context('calendar', 'events'));
  assert.equal((await post('title=x', { 'content-type': 'application/x-www-form-urlencoded' })).status, 415);
  assert.equal((await post('{"title":"x"}', {})).status, 415);
  assert.equal((await post('x'.repeat(MAX_REQUEST_BODY_BYTES + 1), { 'content-type': 'application/json' })).status, 413);
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(MAX_REQUEST_BODY_BYTES)); controller.enqueue(new Uint8Array(1)); controller.close(); } });
  const chunked = new NextRequest('http://localhost/calendar/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: stream, duplex: 'half' });
  assert.equal((await proxyBffRequest(chunked, context('calendar', 'events'))).status, 413);
  assert.equal((await forwardToBff(new NextRequest('http://localhost/x', { method: 'POST', body: 'x'.repeat(MAX_REQUEST_BODY_BYTES + 1) }), 'http://bff.example', '/x')).status, 413);

  let init;
  global.fetch = async (_url, options) => { init = options; return Response.json({ title: 'x', date: '2026-09-16' }, { status: 201 }); };
  assert.equal((await post('{"title":"x","date":"2026-09-16"}', { 'content-type': 'application/json; charset=utf-8' })).status, 201);
  assert.equal(new TextDecoder().decode(init.body), '{"title":"x","date":"2026-09-16"}');
});

test('a body sent to an operation without declared requestBody is not forwarded', async () => {
  let init;
  global.fetch = async (_url, options) => { init = options; return new Response(null, { status: 204 }); };
  const response = await proxyBffRequest(new NextRequest('http://localhost/calendar/events/2', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: '{"cascade":true}' }), context('calendar', 'events', '2'));
  assert.equal(response.status, 204);
  assert.equal(init.body, undefined);
});

test('BFF errors and cookie changes are preserved', async () => {
  global.fetch = async () => Response.json({ message: 'Denied' }, { status: 403, headers: { 'Set-Cookie': 'accessToken=; Max-Age=0; Path=/; HttpOnly' } });
  const result = await forwardToBff(new NextRequest('http://localhost/logout', { method: 'POST' }), 'http://bff.example', '/auth/logout');
  assert.equal(result.status, 403); assert.deepEqual(await result.json(), { message: 'Denied' }); assert.match(result.headers.get('Set-Cookie'), /Max-Age=0/);
});

test('unavailable BFF produces a controlled error', async () => {
  global.fetch = async () => { throw new Error('connection refused'); };
  const result = await forwardToBff(new NextRequest('http://localhost/health'), 'http://bff.example', '/health');
  assert.equal(result.status, 502); assert.equal(result.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await result.json(), { error: { message: 'Le service est indisponible.' } });
});
