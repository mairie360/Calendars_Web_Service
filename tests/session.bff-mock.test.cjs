const assert = require('node:assert/strict');
const { test, before, after, beforeEach, afterEach } = require('node:test');
const { FrontHarness, jwtFor } = require('./support/front-harness.cjs');
const { loadTs, stubModule } = require('./support/load-ts.cjs');
const { react, renderHook } = require('./support/hook-runner.cjs');
const { installWindow, sessionResponse } = require('./support/calendar-fixtures.cjs');

// Adaptateurs de session (src/app/api/**) et hook useAuthSession -> BFF User simulé depuis son contrat
// (copie locale ../../BFFs/BFF_user si présente, sinon déclaration des opérations consommées).

stubModule('react', react);
const session = loadTs('lib/auth-session');

const front = new FrontHarness();
let window;
let hook;

before(() => front.start());
after(() => front.stop());
beforeEach(() => {
  front.reset();
  front.cookies.set('accessToken', jwtFor(1));
  window = installWindow();
});
afterEach(() => {
  hook?.unmount();
  hook = undefined;
  delete global.window;
  assert.deepEqual(front.allViolations(), []);
});

test('BFF User contract used by the mock', (t) => {
  t.diagnostic(front.userContractSource
    ? `contrat : ${front.userContractSource}`
    : 'contrat BFF User absent : opérations consommées déclarées sans schéma (définir BFF_USER_CONTRACT_DIR pour valider les réponses)');
  for (const operation of ['GET /me', 'GET /session/me', 'POST /auth/logout']) {
    assert.ok(front.userBff.contract.operations().includes(operation), `${operation} absent du contrat BFF User`);
  }
});

for (const [route, method, upstream] of [
  ['/api/user/me', 'GET', ['get', '/me']],
  ['/api/auth/me', 'GET', ['get', '/me']],
  ['/api/auth/session', 'GET', ['get', '/session/me']],
]) {
  test(`${method} ${route} is forwarded to BFF User ${upstream[1]} with the cookie as Bearer`, async () => {
    front.userBff.on(...upstream, { body: sessionResponse() });

    const response = await fetch(route);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), sessionResponse());
    assert.deepEqual(front.userBff.sequence(), [`${upstream[0].toUpperCase()} ${upstream[1]}`]);
    assert.equal(front.userBff.requests[0].headers.authorization, `Bearer ${front.cookies.get('accessToken')}`);
    assert.equal(front.calendarBff.requests.length, 0);
  });
}

test('POST /api/auth/logout is forwarded to BFF User and keeps its Set-Cookie', async () => {
  front.userBff.on('post', '/auth/logout', { body: { message: 'Logged out successfully' }, headers: { 'Set-Cookie': 'accessToken=; Max-Age=0; Path=/; HttpOnly' } });

  const response = await fetch('/api/auth/logout', { method: 'POST' });

  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /accessToken=; Max-Age=0/);
  assert.deepEqual(front.userBff.sequence(), ['POST /auth/logout']);
});

test('session adapters only accept the methods they declare', async () => {
  const response = await fetch('/api/user/me', { method: 'DELETE' });

  assert.equal(response.status, 405);
  assert.equal(front.userBff.requests.length, 0);
});

test('useAuthSession resolves the user, groups and main role from GET /api/user/me', async () => {
  front.userBff.on('get', '/me', {
    body: sessionResponse({ user: { phone: ' 0102030405 ', status: 'active' }, roles: ['user', { id: 3, name: 'ROLE_Responsable' }], groups: [{ id: 1, name: ' Direction ', owner_id: 1 }, { id: 2, name: 'Culture', owner_id: 1 }] }),
  });

  hook = renderHook(() => session.useAuthSession());
  assert.equal(hook.result.current.user.name, 'Chargement…');
  const state = await hook.waitFor((current) => !current.loading);

  assert.deepEqual(front.browserRequests, [{ method: 'GET', path: '/api/user/me' }]);
  assert.deepEqual(state.user, {
    name: 'Admin Mairie', email: 'admin@mairie.test', phone: '0102030405', status: 'active', service: 'Direction, Culture',
    position: undefined, address: undefined, city: undefined, lastConnection: undefined, role: 'Responsable',
  });
  assert.deepEqual(state.roles, ['Responsable', 'User']);
  assert.equal(state.isAdmin, false);
  assert.equal(state.error, null);
});

test('useAuthSession prefers the explicit user role', async () => {
  front.userBff.on('get', '/me', { body: sessionResponse({ user: { role: 'Administrateur' }, roles: [] }) });

  hook = renderHook(() => session.useAuthSession());
  const state = await hook.waitFor((current) => !current.loading);

  assert.equal(state.role, 'Admin');
  assert.equal(state.isAdmin, true);
});

test('useAuthSession logs out and reloads on 401', async () => {
  front.userBff.on('get', '/me', { status: 401 });
  front.userBff.on('post', '/auth/logout', { body: { message: 'Logged out successfully' } });
  window.localStorage.setItem('mairie360.auth.jwt', 'stale');

  hook = renderHook(() => session.useAuthSession());
  await hook.waitFor(() => window.location.reloads === 1);

  assert.deepEqual(front.userBff.sequence(), ['GET /me', 'POST /auth/logout']);
  assert.equal(window.localStorage.getItem('mairie360.auth.jwt'), null);
  assert.equal(hook.result.current.loading, true);
});

test('useAuthSession reports an unavailable profile', async () => {
  front.userBff.on('get', '/me', { status: 502, body: { message: 'Core API indisponible' } });

  hook = renderHook(() => session.useAuthSession());
  const state = await hook.waitFor((current) => !current.loading);

  assert.equal(state.error, 'Les informations du profil sont indisponibles.');
  assert.equal(state.role, 'Guest');
});

test('useAuthSession reports an unreachable user service', async () => {
  const nativeFetch = global.fetch;
  global.fetch = async () => { throw new TypeError('Failed to fetch'); };
  try {
    hook = renderHook(() => session.useAuthSession());
    const state = await hook.waitFor((current) => !current.loading);
    assert.equal(state.error, 'Le service utilisateur est indisponible.');
  } finally {
    global.fetch = nativeFetch;
  }
});

test('role helpers normalise FR/EN aliases and fall back to Guest', () => {
  assert.equal(session.normalizeAppRole(' Maire '), 'Maire');
  assert.equal(session.normalizeAppRole('mayor'), 'Maire');
  assert.equal(session.normalizeAppRole('role_invité'), 'Guest');
  assert.equal(session.normalizeAppRole(42), null);
  assert.deepEqual(session.resolveAppRoles(['manager', { name: 'admin' }, 'unknown']), ['Admin', 'Responsable']);
  assert.deepEqual(session.resolveAppRoles([{ name: 7 }]), ['Guest']);
});
