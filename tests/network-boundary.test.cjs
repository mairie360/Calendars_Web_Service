const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, before, after, beforeEach, afterEach } = require('node:test');
const { APP_ROUTES, FrontHarness, jwtFor } = require('./support/front-harness.cjs');
const { SRC, loadTs } = require('./support/load-ts.cjs');
const policy = require('./support/source-policy.cjs');
const { admin, alice, apiError, bootstrap, calendarEvent } = require('./support/calendar-fixtures.cjs');

// Périmètre réseau du front : le code n'émet des requêtes que depuis les fichiers prévus, uniquement vers
// sa propre origine, et le proxy ne laisse passer vers BFF_Calendar que les opérations de contracts/openapi.json.
// Les derniers tests prouvent que le garde et les mocks détectent bien chaque type d'écart.

const front = new FrontHarness();
const contract = front.calendarBff.contract;

before(() => front.start());
after(() => front.stop());
beforeEach(() => {
  front.reset();
  front.cookies.set('accessToken', jwtFor(1));
});
afterEach(() => assert.deepEqual(front.allViolations(), []));

function sourceFiles(dir = SRC) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return file === path.join(SRC, 'contracts') ? [] : sourceFiles(file);
    return /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name) ? [file] : [];
  });
}
const relative = (file) => path.relative(SRC, file).split(path.sep).join('/');

test('only the BFF client, the session hook, the logout helper and the server proxy emit network requests', () => {
  const emitters = sourceFiles().filter(file => { const ast = policy.parse('src/' + relative(file)); return policy.calls(ast, 'fetch').length || policy.networkReferences(ast).length; }).map(relative).sort();

  assert.deepEqual(emitters, ['lib/auth-session.ts', 'lib/bff-client.ts', 'lib/logout.ts']);
});

test('no absolute BFF destination is hard-coded in frontend source', () => {
  const absolute = sourceFiles().flatMap(file => policy.absoluteUrls(policy.parse('src/' + relative(file))).map(url => `${relative(file)} ${url}`));

  assert.deepEqual(absolute.sort(), []);
});

test('requestBff is only used by the calendar client, whose endpoints are all declared in the contract', async () => {
  const callers = sourceFiles().filter(file => policy.requestOwners(policy.parse('src/' + relative(file)))).map(relative).sort();
  assert.deepEqual(callers, ['app/calendar/api.ts', 'lib/bff-client.ts']);
  assert.equal(policy.calls(policy.parse('src/app/calendar/api.ts'), 'requestBff').length, 5);
  // Exercise the actual five client operations through the existing contract-gated HTTP harness.
  const api = loadTs('app/calendar/api');
  front.calendarBff.on('get', '/calendar/bootstrap', { body: bootstrap() });
  front.calendarBff.on('post', '/calendar/events', { status: 201, body: calendarEvent(12) });
  front.calendarBff.on('patch', '/calendar/events/{id}', { body: calendarEvent(12) });
  front.calendarBff.on('delete', '/calendar/events/{id}', { status: 204 });
  front.calendarBff.on('patch', '/calendar/events/{id}/approval', { body: calendarEvent(12, { approvalStatus: 'approved' }) });
  await api.loadCalendarData({ from: '2026-09-01', to: '2026-09-30' });
  await api.createCalendarEvent(calendarEvent(12), [admin, alice]);
  await api.updateCalendarEvent(calendarEvent(12), [admin, alice]);
  await api.deleteCalendarEvent(12);
  await api.updateCalendarEventApproval(12, 'approved', [admin, alice]);
  assert.deepEqual(front.calendarBff.requests.map(call => `${call.method} ${call.template}`), ['GET /calendar/bootstrap', 'POST /calendar/events', 'PATCH /calendar/events/{id}', 'DELETE /calendar/events/{id}', 'PATCH /calendar/events/{id}/approval']);
});

test('the session hook and logout only call the dedicated /api routes, which exist in src/app/api', () => {
  const calls = ['src/lib/auth-session.ts', 'src/lib/logout.ts'].flatMap(file => policy.calls(policy.parse(file), 'fetch').map(node => { assert.ok(policy.ts.isStringLiteralLike(node.arguments[0])); return node.arguments[0].text; })).sort();
  assert.deepEqual(calls, ['/api/auth/logout', '/api/user/me']);
  calls.forEach((route) => assert.ok(APP_ROUTES[route], `${route} n'a pas de route dédiée`));

  const routeFiles = sourceFiles(path.join(SRC, 'app', 'api')).map((file) => `/${path.dirname(relative(file))}`.replace('/app', '')).sort();
  assert.deepEqual(routeFiles, [...Object.keys(APP_ROUTES), '/api/bff/[...path]'].sort());
  const entry=loadTs('app/api/bff/[...path]/route');
  const proxy=loadTs('lib/bff-proxy').proxyBffRequest;
  for(const method of ['GET','POST','PUT','PATCH','DELETE','HEAD'])assert.equal(entry[method],proxy);
});

test('no JavaScript-readable credential is used: no token storage and no client-side Authorization header', () => {
  const offenders = sourceFiles().filter(file => policy.credentialReferences(policy.parse('src/' + relative(file))).length).map(relative).sort();
  // The verified published server entry owns cookie-to-bearer conversion.
  assert.deepEqual(offenders, []);
  const proxy=policy.parse('src/lib/bff-proxy.ts');
  assert.equal(policy.calls(proxy,'proxyPublishedBffRequest').length,1);
  assert.ok(policy.imports(proxy).includes('@mairie360/lib-components/next'));
  const owner=policy.parse('src/app/api/auth/logout/route.ts');
  assert.equal(policy.calls(owner,'createSessionLogoutProxy').length,1);
  assert.ok(policy.imports(owner).includes('@mairie360/lib-components/next'));
});

// Réponse conforme pour chaque opération du contrat : le proxy doit toutes les relayer.
const OPERATION_FIXTURES = {
  'GET /health': { path: '/health', reply: { status: 200 } },
  'GET /check_apis': { path: '/check_apis', reply: { status: 200, body: { status: 'OK', core_api: 'Connected', calendar_api: 'Connected' } } },
  'GET /calendar/bootstrap': { path: '/calendar/bootstrap?from=2026-09-01&to=2026-09-30', reply: { body: bootstrap() } },
  'GET /calendar/events': { path: '/calendar/events?from=2026-09-01&to=2026-09-30', reply: { body: [calendarEvent(1)] } },
  'POST /calendar/events': { path: '/calendar/events', body: { title: 'Conseil', date: '2026-09-16' }, reply: { status: 201, body: calendarEvent(2) } },
  'PATCH /calendar/events/{id}': { path: '/calendar/events/2', body: { title: 'Conseil' }, reply: { body: calendarEvent(2) } },
  'DELETE /calendar/events/{id}': { path: '/calendar/events/2', reply: { status: 204 } },
  'PATCH /calendar/events/{id}/approval': { path: '/calendar/events/2/approval', body: { approvalStatus: 'approved' }, reply: { body: calendarEvent(2, { approvalStatus: 'approved' }) } },
  'GET /calendar/assignees': { path: '/calendar/assignees', reply: { body: [admin, alice] } },
  'GET /calendar/categories': { path: '/calendar/categories', reply: { body: [{ label: 'Réunion', value: 'meeting' }] } },
  'GET /calendar/services': { path: '/calendar/services', reply: { body: [{ label: 'Direction générale', value: 'direction' }] } },
};

test('every contract operation has a conforming fixture', () => {
  assert.deepEqual(Object.keys(OPERATION_FIXTURES).sort(), contract.operations().sort());
});

for (const [operation, fixture] of Object.entries(OPERATION_FIXTURES)) {
  test(`the proxy forwards ${operation} unchanged to BFF_Calendar`, async () => {
    const [method, template] = operation.split(' ');
    front.calendarBff.on(method, template, fixture.reply);

    const response = await fetch(fixture.path, {
      method,
      ...(fixture.body ? { body: JSON.stringify(fixture.body), headers: { 'Content-Type': 'application/json' } } : {}),
    });

    assert.equal(response.status, fixture.reply.status ?? 200);
    assert.deepEqual(front.calendarBff.sequence(), [`${method} ${fixture.path}`]);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    if (fixture.reply.body) assert.deepEqual(await response.json(), fixture.reply.body);
  });
}

test('the proxy answers routes and methods outside the contract without contacting any BFF', async () => {
  for (const [method, url, status] of [
    ['GET', '/calendar/unknown', 404],
    ['GET', '/calendar/events/2', 405],
    ['PUT', '/calendar/events/2', 405],
    ['POST', '/calendar/bootstrap', 405],
    ['GET', '/api/unknown', 404],
    ['GET', '/openapi.json', 404],
    ['GET', '/swagger.json', 404],
  ]) {
    const response = await fetch(url, { method });
    assert.equal(response.status, status, `${method} ${url}`);
  }

  assert.equal(front.calendarBff.requests.length + front.userBff.requests.length, 0);
});

test('cross-site mutations are refused before reaching BFF_Calendar or BFF User (CSRF)', async () => {
  for (const [url, method, headers] of [
    ['/calendar/events', 'POST', { 'sec-fetch-site': 'cross-site', 'content-type': 'application/json' }],
    ['/calendar/events/2', 'DELETE', { 'sec-fetch-site': 'same-site' }],
    ['/calendar/events/2/approval', 'PATCH', { 'sec-fetch-site': 'cross-site', 'content-type': 'application/json' }],
    ['/api/auth/logout', 'POST', { 'sec-fetch-site': 'cross-site' }],
  ]) {
    const response = await fetch(url, { method, headers, ...(method === 'DELETE' || url.startsWith('/api') ? {} : { body: '{"approvalStatus":"approved"}' }) });
    assert.equal(response.status, 403, `${method} ${url}`);
  }

  assert.equal(front.calendarBff.requests.length + front.userBff.requests.length, 0);
});

test('the guard rejects client requests to another origin', async () => {
  await assert.rejects(fetch('https://bff-calendar.example/calendar/bootstrap'), /Failed to fetch/);

  assert.deepEqual(front.allViolations(), ['[FRONT client] appel réseau vers une autre origine : https://bff-calendar.example/calendar/bootstrap']);
  front.violations.length = 0;
});

test('the guard rejects server requests to anything but the mocked BFFs', async () => {
  process.env.BFF_CALENDAR_BASE_URL = 'http://127.0.0.1:1';
  try {
    const response = await fetch('/health');
    assert.equal(response.status, 502);
    assert.deepEqual(front.allViolations(), ['[FRONT serveur] appel réseau hors BFF simulés : http://127.0.0.1:1/health (pendant GET /health)']);
    front.violations.length = 0;
  } finally {
    process.env.BFF_CALENDAR_BASE_URL = front.calendarBff.url;
  }
});

test('the BFF mock reports requests that the contract does not allow', async () => {
  front.calendarBff
    .on('get', '/calendar/events', { body: [] })
    .on('patch', '/calendar/events/{id}', { body: calendarEvent(2) })
    .on('post', '/calendar/events', { status: 200, body: { title: 7 } })
    .on('patch', '/calendar/events/{id}/approval', { status: 403, body: apiError('FORBIDDEN', 'Refus') });

  await fetch('/calendar/events?from=01-09-2026&page=2');
  const json = { 'content-type': 'application/json' };
  await fetch('/calendar/events/abc', { method: 'PATCH', headers: json, body: '{"category":"party"}' });
  await fetch('/calendar/events', { method: 'POST' });
  await fetch('/calendar/events/2/approval', { method: 'PATCH', headers: json, body: '{bad json' });

  // Le contrat ne marque aucun requestBody `required` et un statut non documenté n'a pas de schéma à valider.
  assert.deepEqual(front.calendarBff.violations, [
    '[BFF_CALENDAR] requête GET /calendar/events?from=01-09-2026&page=2 : query.from: "01-09-2026" n\'est pas au format date',
    '[BFF_CALENDAR] requête GET /calendar/events?from=01-09-2026&page=2 : paramètre query "to" requis manquant',
    '[BFF_CALENDAR] requête GET /calendar/events?from=01-09-2026&page=2 : paramètre query "page" non déclaré',
    '[BFF_CALENDAR] requête PATCH /calendar/events/abc : path.id: "abc" ne respecte pas ^[0-9]+$',
    '[BFF_CALENDAR] requête PATCH /calendar/events/{id} $body.category: valeur "party" hors enum ["meeting","activity","ceremony","other"]',
    '[BFF_CALENDAR] POST /calendar/events : statut 200 non documenté',
    '[BFF_CALENDAR] requête PATCH /calendar/events/{id}/approval : corps JSON invalide',
  ]);
  front.calendarBff.violations.length = 0;
});

test('the BFF mock reports calls that a test did not mock', async () => {
  const response = await fetch('/check_apis');

  assert.equal(response.status, 500);
  assert.deepEqual(front.calendarBff.violations, ['[BFF_CALENDAR] appel non mocké : GET /check_apis']);
  assert.throws(() => front.calendarBff.on('get', '/calendar/everything', {}), /n'est pas déclaré dans le contrat/);
  front.calendarBff.violations.length = 0;
});
