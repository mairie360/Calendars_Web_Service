const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs, stubModule } = require('./support/load-ts.cjs');
const { react, renderHook } = require('./support/hook-runner.cjs');
const { bootstrap, calendarEvent, installWindow, apiError } = require('./support/calendar-fixtures.cjs');

stubModule('react', react);
const { useCalendarPage } = loadTs('app/calendar/use-calendar-page');

test('calendar action feedback waits for its actual write and a new refused action clears the old receipt', async t => {
  const previousWindow = global.window;
  const previousFetch = global.fetch;
  installWindow();
  const writes = [];
  let settle;
  global.fetch = async (url, options = {}) => {
    assert.equal(String(url), '/calendar/events');
    assert.equal(options.method, 'POST');
    writes.push(JSON.parse(options.body));
    return new Promise(resolve => { settle = resolve; });
  };
  const event = calendarEvent(42, { title: 'Réunion confirmée' });
  const initial = { status: 'confirmed', data: bootstrap(), query: { view: 'month', date: event.date, linkedDate: false, eventId: null } };
  const page = renderHook(() => useCalendarPage(initial));
  t.after(() => { page.unmount(); global.window = previousWindow; global.fetch = previousFetch; });
  const pending = page.result.current.handleCreateEvent(event);
  await page.waitFor(state => state.saving);
  assert.equal(page.result.current.feedback ?? null, null, 'A pending request is not a success');
  settle(Response.json(event));
  await pending;
  await page.waitFor(state => !state.saving);
  assert.equal(page.result.current.feedback, 'Événement « Réunion confirmée » créé.');
  assert.equal(page.result.current.events.filter(item => item.id === 42).length, 1);

  const refused = page.result.current.handleCreateEvent({ ...event, title: 'Brouillon conservé' });
  await page.waitFor(state => state.saving);
  assert.equal(page.result.current.feedback, null, 'A new action cannot retain a stale success');
  settle(Response.json(apiError('SERVICE_UNAVAILABLE', 'Création refusée'), { status: 503 }));
  await refused;
  await page.waitFor(state => !state.saving);
  assert.equal(page.result.current.feedback, null);
  assert.match(page.result.current.mutationError, /Création refusée/);
  assert.equal(writes.length, 2);
  assert.equal(page.result.current.events.some(item => item.title === 'Brouillon conservé'), false);
});
