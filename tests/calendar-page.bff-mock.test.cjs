const assert = require('node:assert/strict');
const { test, before, after, beforeEach, afterEach } = require('node:test');
const { FrontHarness, jwtFor } = require('./support/front-harness.cjs');
const { loadTs, stubModule } = require('./support/load-ts.cjs');
const { react, renderHook } = require('./support/hook-runner.cjs');
const { alice, apiError, bootstrap, calendarEvent, installWindow } = require('./support/calendar-fixtures.cjs');

// Hook de la page calendrier (src/app/calendar/use-calendar-page.ts) rendu sans DOM : chaque action
// utilisateur doit se traduire par les seules opérations BFF_Calendar déclarées dans le contrat.

stubModule('react', react);
const { useCalendarPage } = loadTs('app/calendar/use-calendar-page');
const { formatDateForQuery, getCalendarPeriodRange } = loadTs('app/calendar/date-utils');
const { initialDate } = loadTs('app/calendar/constants');

const front = new FrontHarness();
let page;

before(() => front.start());
after(() => front.stop());
beforeEach(() => {
  front.reset();
  front.cookies.set('accessToken', jwtFor(1));
});
afterEach(() => {
  page?.unmount();
  page = undefined;
  assert.deepEqual(front.allViolations(), []);
});

function rangeQuery(view, date) {
  const { from, to } = getCalendarPeriodRange(view, date);
  return `from=${formatDateForQuery(from)}&to=${formatDateForQuery(to)}`;
}

async function renderLoadedPage(body = bootstrap()) {
  front.calendarBff.on('get', '/calendar/bootstrap', { body });
  page = renderHook(useCalendarPage);
  return page.waitFor((state) => !state.loading);
}

test('the first render loads the visible month through GET /calendar/bootstrap only', async () => {
  const state = await renderLoadedPage();

  assert.deepEqual(front.calendarBff.sequence(), [`GET /calendar/bootstrap?${rangeQuery('month', initialDate)}`]);
  assert.deepEqual(front.browserRequests, [{ method: 'GET', path: `/calendar/bootstrap?${rangeQuery('month', initialDate)}` }]);
  assert.equal(state.error, null);
  assert.deepEqual(state.events.map((event) => event.id), [5, 6]);
  assert.equal(state.people.length, 3);
  assert.equal(state.categories.length, 2);
  assert.equal(state.services.length, 1);
  assert.equal(state.stats.length, 3);
  assert.match(state.periodTitle, /\d{4}$/);
});

test('changing view or period reloads bootstrap with the new range', async () => {
  await renderLoadedPage();

  page.result.current.setView('week');
  await page.waitFor(() => front.calendarBff.requests.length === 2);
  page.result.current.handleNext();
  await page.waitFor(() => front.calendarBff.requests.length === 3);
  const weekDate = page.result.current.currentDate;
  page.result.current.handlePrevious();
  await page.waitFor(() => front.calendarBff.requests.length === 4);
  page.result.current.setView('day');
  await page.waitFor(() => front.calendarBff.requests.length === 5);
  const dayDate = page.result.current.currentDate;
  page.result.current.handleNext();
  await page.waitFor(() => front.calendarBff.requests.length === 6);
  page.result.current.handlePrevious();
  page.result.current.setView('month');
  page.result.current.handleNext();
  const state = await page.waitFor((current) => !current.loading && front.calendarBff.requests.length === 7);

  const sequence = front.calendarBff.sequence();
  assert.equal(sequence[1], `GET /calendar/bootstrap?${rangeQuery('week', initialDate)}`);
  assert.equal(sequence[2], `GET /calendar/bootstrap?${rangeQuery('week', weekDate)}`);
  assert.equal(sequence[4], `GET /calendar/bootstrap?${rangeQuery('day', dayDate)}`);
  assert.equal(sequence[6], `GET /calendar/bootstrap?${rangeQuery('month', state.currentDate)}`);
  assert.ok(sequence.every((call) => call.startsWith('GET /calendar/bootstrap?')));
  assert.match(state.periodTitle, /\d{4}$/);
});

test('refreshData and date selection do not call anything outside the contract', async () => {
  await renderLoadedPage();

  await page.result.current.refreshData();
  page.result.current.handleSelectSlot(new Date(2026, 8, 17), '14:30');
  const state = await page.waitFor((current) => current.createModalOpen);

  assert.deepEqual(state.createInitialValues, { date: '17-09-2026', endDate: '', startTime: '14:30', endTime: '15:30' });
  state.openCreateModal();
  state.setCreateModalOpen(false);
  state.handleEventClick(state.events[0]);
  state.setSelectedEvent(null);
  await page.waitFor((current) => !current.createModalOpen && current.selectedEvent === null);
  assert.ok(front.calendarBff.sequence().every((call) => call.startsWith('GET /calendar/bootstrap?')));
});

test('a BFF error on load is shown to the user', async () => {
  front.calendarBff.on('get', '/calendar/bootstrap', { status: 502, body: apiError('BAD_GATEWAY', 'Le service Calendar est indisponible.') });
  page = renderHook(useCalendarPage);

  const state = await page.waitFor((current) => !current.loading);

  assert.equal(state.error, 'Le service Calendar est indisponible.');
  assert.deepEqual(state.events, []);
});

test('a session refused by the BFF logs out and reloads the page', async () => {
  const window = installWindow();
  front.calendarBff.on('get', '/calendar/bootstrap', { status: 401, body: apiError('UNAUTHORIZED', 'Session invalide.') });
  front.userBff.on('post', '/auth/logout', { body: { message: 'Logged out successfully' } });
  try {
    page = renderHook(useCalendarPage);
    await page.waitFor(() => window.location.reloads === 1);

    assert.deepEqual(front.userBff.sequence(), ['POST /auth/logout']);
    assert.deepEqual(page.result.current.events, []);
  } finally {
    delete global.window;
  }
});

test('handleCreateEvent posts the event, appends it and moves the calendar to its date', async () => {
  await renderLoadedPage();
  // Deux mois après la date initiale : la navigation vers l'événement recharge forcément le bootstrap.
  const eventDate = new Date(initialDate.getFullYear(), initialDate.getMonth() + 2, 4);
  front.calendarBff.on('post', '/calendar/events', ({ body }) => ({ status: 201, body: calendarEvent(42, body) }));

  await page.result.current.handleCreateEvent({
    title: 'Vœux du maire', description: '', date: formatDateForQuery(eventDate), endDate: '', category: 'ceremony', startTime: '18:00', endTime: '19:00',
    location: 'Mairie', assigneeIds: [alice.id], recurrence: { frequency: 'none' },
  });
  const state = await page.waitFor((current) => !current.saving && !current.loading);

  assert.deepEqual(front.calendarBff.calls('/calendar/events', 'POST').map((call) => call.body.title), ['Vœux du maire']);
  assert.equal(state.createModalOpen, false);
  assert.equal(state.error, null);
  assert.equal(formatDateForQuery(state.selectedDate), formatDateForQuery(eventDate));
  assert.equal(front.calendarBff.sequence().at(-1), `GET /calendar/bootstrap?${rangeQuery('month', eventDate)}`);
});

test('handleCreateEvent reports a refused creation', async () => {
  await renderLoadedPage();
  front.calendarBff.on('post', '/calendar/events', { status: 403, body: apiError('FORBIDDEN', 'Création interdite') });

  await page.result.current.handleCreateEvent({ title: 'X', description: '', date: '2026-09-16', endDate: '', category: 'other', startTime: '09:00', endTime: '10:00', location: '', assigneeIds: [], recurrence: { frequency: 'none' } });
  const state = await page.waitFor((current) => !current.saving);

  assert.equal(state.error, 'Création interdite');
  assert.deepEqual(state.events.map((event) => event.id), [5, 6]);
});

test('handleSaveEvent patches the event and merges the saved version', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('patch', '/calendar/events/{id}', ({ body, pathParams }) => ({ body: calendarEvent(Number(pathParams.id), { ...body, category: 'activity' }) }));

  state.handleEventClick(state.events[0]);
  await page.result.current.handleSaveEvent({ ...state.events[0], title: 'Conseil renommé' });
  const saved = await page.waitFor((current) => !current.saving);

  assert.deepEqual(front.calendarBff.calls('/calendar/events/{id}', 'PATCH').map((call) => [call.pathParams.id, call.body.title]), [['5', 'Conseil renommé']]);
  assert.equal(saved.events[0].title, 'Conseil renommé');
  assert.equal(saved.events[0].colorClassName, 'bg-[#eaf7ee] text-[#257444]');
  assert.equal(saved.selectedEvent, null);
});

test('handleSaveEvent reports a missing event', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('patch', '/calendar/events/{id}', { status: 404, body: apiError('NOT_FOUND', 'Événement introuvable') });

  await page.result.current.handleSaveEvent(state.events[1]);

  assert.equal((await page.waitFor((current) => !current.saving)).error, 'Événement introuvable');
});

test('handleDeleteEvent deletes the event and removes it locally', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('delete', '/calendar/events/{id}', { status: 204 });

  await page.result.current.handleDeleteEvent(state.events[1]);
  const after = await page.waitFor((current) => !current.saving);

  assert.deepEqual(front.calendarBff.calls('/calendar/events/{id}', 'DELETE').map((call) => call.pathParams.id), ['6']);
  assert.deepEqual(after.events.map((event) => event.id), [5]);
});

test('handleDeleteEvent reports a refused deletion', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('delete', '/calendar/events/{id}', { status: 403, body: apiError('FORBIDDEN', 'Suppression interdite') });

  await page.result.current.handleDeleteEvent(state.events[1]);

  const after = await page.waitFor((current) => !current.saving);
  assert.equal(after.error, 'Suppression interdite');
  assert.equal(after.events.length, 2);
});

test('handleValidateEvent sends the approval only for events the user can validate', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('patch', '/calendar/events/{id}/approval', ({ body, pathParams }) => ({
    body: calendarEvent(Number(pathParams.id), { approvalStatus: body.approvalStatus, canValidate: false }),
  }));

  await page.result.current.handleValidateEvent(state.events[1], 'approved');
  assert.equal(front.calendarBff.calls('/calendar/events/{id}/approval').length, 0);

  await page.result.current.handleValidateEvent(state.events[0], 'rejected');
  const after = await page.waitFor((current) => !current.saving);

  assert.deepEqual(front.calendarBff.calls('/calendar/events/{id}/approval').map((call) => call.body), [{ approvalStatus: 'rejected' }]);
  assert.equal(after.events[0].approvalStatus, 'rejected');
  assert.equal(after.selectedEvent.id, 5);
});

test('handleValidateEvent reports a refused approval', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('patch', '/calendar/events/{id}/approval', { status: 403, body: apiError('FORBIDDEN', 'Validation interdite') });

  await page.result.current.handleValidateEvent(state.events[0], 'approved');

  assert.equal((await page.waitFor((current) => !current.saving)).error, 'Validation interdite');
});
