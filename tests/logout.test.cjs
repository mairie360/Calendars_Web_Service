const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');

test('logout reloads after a request failure without clearing unrelated browser data', async () => {
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
    await assert.rejects(logoutAndReload(), /offline/);
    assert.equal(store.has('mairie360.auth.jwt'), false);
    assert.equal(store.has('mairie360.projects.jwt'), false);
    assert.equal(store.get('unrelated.preference'), 'keep');
    assert.equal(location.reloads, 1);
  } finally {
    global.fetch = originalFetch;
    delete global.window;
  }
});
