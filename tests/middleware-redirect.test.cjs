const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const { NextRequest } = require('next/server');
const { loadTs } = require('./support/load-ts.cjs');

const { middleware } = loadTs('middleware');
const previous = {
  LOGIN_FRONT_URL: process.env.LOGIN_FRONT_URL,
  CALENDAR_FRONT_URL: process.env.CALENDAR_FRONT_URL,
};

afterEach(() => {
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('an unauthenticated visit returns to the public Calendar URL, not the ingress host', () => {
  process.env.LOGIN_FRONT_URL = 'https://login.mairie.test/';
  process.env.CALENDAR_FRONT_URL = 'https://calendar.mairie.test/';

  const response = middleware(new NextRequest('http://internal:3000/profile?day=2026-09-25'));
  const login = new URL(response.headers.get('location'));

  assert.equal(response.status, 307);
  assert.equal(login.origin, 'https://login.mairie.test');
  assert.equal(login.searchParams.get('redirect'), 'https://calendar.mairie.test/profile?day=2026-09-25');
  assert.doesNotMatch(login.href, /internal:3000/);
});
