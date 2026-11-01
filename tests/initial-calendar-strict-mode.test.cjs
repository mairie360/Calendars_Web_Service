const assert = require('node:assert/strict');
const { test } = require('node:test');
const { calendarDom } = require('./support/calendar-dom.cjs');
const { bootstrap, calendarEvent } = require('./support/calendar-fixtures.cjs');

test('StrictMode effect replay retains the server period cache through navigation and return', async t => {
  const initial = { status: 'confirmed', query: { view: 'month', date: '2026-10-09', linkedDate: false, eventId: null }, data: bootstrap({ events: [calendarEvent(42, { date: '2026-10-09', title: 'Server-seeded October event' })] }) };
  const dom = await calendarDom(t, { initial, strict: true });
  assert.match(dom.document.body.textContent, /Server-seeded October event/);
  assert.equal(dom.front.calendarBff.requests.length, 0, 'StrictMode must not repeat the bootstrap');
  await dom.click(dom.button('Période suivante'));
  await dom.waitFor(() => dom.front.calendarBff.requests.length === 1 && !dom.document.querySelector('[role="status"]'));
  assert.match(dom.front.calendarBff.sequence()[0], /^GET \/calendar\/period\?/);
  await dom.click(dom.button('Période précédente'));
  await dom.waitFor(() => dom.document.body.textContent.includes('Server-seeded October event') && !dom.document.querySelector('[role="status"]'));
  assert.equal(dom.front.calendarBff.requests.length, 1, 'The disposed StrictMode effect must not erase the live seeded cache');
});
