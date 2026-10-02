const assert = require('node:assert/strict');
const path = require('node:path');
const { afterEach, beforeEach, test } = require('node:test');
const { loadTs, stubModule, SRC } = require('./support/load-ts.cjs');
const { react, renderHook } = require('./support/hook-runner.cjs');

const RealDate = Date;
let clock = new RealDate(2026, 8, 30, 23, 59).getTime();
class ClockDate extends RealDate {
  constructor(...args) { super(...(args.length ? args : [clock])); }
  static now() { return clock; }
}
// Load once before the tested mount dates, as a long-lived server/tab would.
global.Date = ClockDate;
stubModule('react', react);
loadTs('app/calendar/date-utils');
const loads = [];
stubModule(path.join(SRC, 'app/calendar/api.ts'), {
  loadCalendarData: async (range) => {
    loads.push({ from: range.from, to: range.to });
    return { events: [], people: [], categories: [], services: [] };
  },
});
const { useCalendarPage } = loadTs('app/calendar/use-calendar-page');
const { formatDateForQuery } = loadTs('app/calendar/date-utils');
global.Date = RealDate;
let page;

beforeEach(() => {
  global.Date = ClockDate;
  clock = new RealDate(2026, 9, 1, 10).getTime();
  global.window = { location: { search: '' } };
  loads.length = 0;
});
afterEach(() => {
  page?.unmount();
  page = undefined;
  global.Date = RealDate;
  delete global.window;
});
const at = (...parts) => { clock = new RealDate(...parts).getTime(); };
async function mountPage() {
  page = renderHook(useCalendarPage);
  return page.waitFor((state) => !state.loading);
}

test('cached module initializes each mount from the current browser date/month', async () => {
  let state = await mountPage();
  assert.equal(formatDateForQuery(state.currentDate), '2026-10-01');
  assert.equal(formatDateForQuery(state.selectedDate), '2026-10-01');
  assert.deepEqual(loads, [{ from: '2026-09-28', to: '2026-11-01' }]);
  page.unmount();
  at(2026, 10, 1, 10);
  state = await mountPage();
  assert.equal(formatDateForQuery(state.currentDate), '2026-11-01');
  assert.equal(formatDateForQuery(state.selectedDate), '2026-11-01');
  assert.equal(loads.length, 2, 'one bootstrap per mount, no stale-month request');
});

test('an unselected creation default refreshes after midnight and year rollover', async () => {
  at(2026, 11, 31, 23, 59);
  await mountPage();
  at(2027, 0, 1, 0, 1);
  page.result.current.openCreateModal();
  const state = await page.waitFor((current) => current.createModalOpen);
  assert.equal(state.createInitialValues.date, '01-01-2027');
  assert.equal(formatDateForQuery(state.currentDate), '2026-12-31', 'do not force the browsed period');
  assert.equal(loads.length, 1, 'opening a draft performs no data request');
});

test('a deliberately selected date survives midnight instead of becoming today', async () => {
  await mountPage();
  page.result.current.handleSelectDate(new ClockDate(2026, 8, 17));
  await page.waitFor((state) => formatDateForQuery(state.selectedDate) === '2026-09-17' && !state.loading);
  at(2026, 9, 2, 0, 1);
  page.result.current.openCreateModal();
  const state = await page.waitFor((current) => current.createModalOpen);
  assert.equal(state.createInitialValues.date, '17-09-2026');
});

test('valid deep links and explicit time slots keep their own dates', async () => {
  window.location.search = '?date=2026-12-04';
  let state = await mountPage();
  assert.equal(formatDateForQuery(state.currentDate), '2026-12-04');
  at(2027, 0, 1, 0, 1);
  state.openCreateModal();
  state = await page.waitFor((current) => current.createModalOpen);
  assert.equal(state.createInitialValues.date, '04-12-2026');
  state.setCreateModalOpen(false);
  state.handleSelectSlot(new ClockDate(2027, 1, 5), '14:30');
  state = await page.waitFor((current) => current.createInitialValues.startTime === '14:30');
  assert.deepEqual(state.createInitialValues, { date: '05-02-2027', endDate: '', startTime: '14:30', endTime: '15:30' });
});

test('invalid links initialize today, never the module loading day', async () => {
  window.location.search = '?date=2026-02-31&event=missing';
  const state = await mountPage();
  assert.equal(formatDateForQuery(state.currentDate), '2026-10-01');
  assert.equal(state.selectedEvent, null);
  assert.equal(loads.length, 1);
});

test('an explicit creation date wins without changing the selected day', async () => {
  await mountPage();
  page.result.current.openCreateModal(new ClockDate(2026, 9, 14), '11:00');
  const state = await page.waitFor((current) => current.createModalOpen);
  assert.equal(state.createInitialValues.date, '14-10-2026');
  assert.equal(state.createInitialValues.startTime, '11:00');
  assert.equal(formatDateForQuery(state.selectedDate), '2026-10-01');
});
