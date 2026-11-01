const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');

test('logout failure preserves session data and allows an explicit retry', async () => {
  const originalFetch = global.fetch;
  const store = new Map([
    ['mairie360.auth.jwt', 'stale'],
    ['mairie360.projects.jwt', 'legacy'],
    ['unrelated.preference', 'keep'],
  ]);
  const location = { reloads: 0, reload() { this.reloads += 1; } };
  global.window = {
    localStorage: {
      getItem: (key) => store.get(key) ?? null,
      removeItem: (key) => store.delete(key),
      clear: () => assert.fail('logout must not clear origin-wide storage'),
    },
    location,
  };
  global.fetch = async () => { throw new TypeError('offline'); };

  try {
    const { logoutAndReload } = loadTs('lib/logout');
    await assert.rejects(logoutAndReload(), /La déconnexion n’a pas abouti/);
    assert.equal(store.has('mairie360.auth.jwt'), true);
    assert.equal(store.has('mairie360.projects.jwt'), true);
    assert.equal(store.get('unrelated.preference'), 'keep');
    assert.equal(location.reloads, 0);
    global.fetch=async()=>Response.json({message:'Closed',session_revoked:true});
    const {setBrowserFrontUrls}=loadTs('lib/front-urls');
    setBrowserFrontUrls({LOGIN_FRONT_URL:'https://login.mairie.test'});
    location.assign=href=>location.assigned=href;
    await logoutAndReload();
    assert.equal(location.assigned,'https://login.mairie.test/');
    assert.equal(store.has('mairie360.auth.jwt'),false);
    assert.equal(store.has('mairie360.projects.jwt'),false);
    assert.equal(store.get('unrelated.preference'),'keep');
  } finally {
    global.fetch = originalFetch;
    delete global.window;
  }
});
