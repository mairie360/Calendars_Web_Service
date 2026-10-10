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
const initialDate = new Date();

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
  assert.deepEqual(front.browserRequests, [{ method: 'GET', path: `/api/bff/calendar/bootstrap?${rangeQuery('month', initialDate)}` }]);
  assert.equal(state.error, null);
  assert.deepEqual(state.events.map((event) => event.id), [5, 6]);
  assert.equal(state.people.length, 3);
  assert.equal(state.categories.length, 2);
  assert.equal(state.services.length, 1);
  assert.equal(state.stats.length, 3);
  assert.match(state.periodTitle, /\d{4}$/);
});

test('a dashboard link loads the linked month and opens its event after bootstrap', async () => {
  const linkedDate = new Date(initialDate.getFullYear(), initialDate.getMonth() + 2, 4);
  const date = formatDateForQuery(linkedDate);
  const window = installWindow();
  window.location.search = `?date=${date}&event=42`;
  try {
    await renderLoadedPage(bootstrap({ events: [calendarEvent(42, { date })] }));
    const state = await page.waitFor((current) => current.selectedEvent?.id === 42);

    assert.equal(formatDateForQuery(state.currentDate), date);
    assert.equal(formatDateForQuery(state.selectedDate), date);
    assert.equal(state.selectedEvent.title, 'Événement 42');
    assert.deepEqual(front.calendarBff.sequence(), [`GET /calendar/bootstrap?${rangeQuery('month', linkedDate)}`]);
  } finally {
    delete global.window;
  }
});

test('a valid linked date still navigates when the event is absent', async () => {
  const linkedDate = new Date(initialDate.getFullYear(), initialDate.getMonth() + 1, 7);
  const date = formatDateForQuery(linkedDate);
  const window = installWindow();
  window.location.search = `?date=${date}&event=missing`;
  try {
    const state = await renderLoadedPage(bootstrap({ events: [] }));
    assert.equal(formatDateForQuery(state.selectedDate), date);
    assert.equal(state.selectedEvent, null);
    assert.deepEqual(front.calendarBff.sequence(), [`GET /calendar/bootstrap?${rangeQuery('month', linkedDate)}`]);
  } finally {
    delete global.window;
  }
});

test('an invalid linked date falls back to the current month without opening an event', async () => {
  const window = installWindow();
  window.location.search = '?date=2026-02-31&event=5';
  try {
    const state = await renderLoadedPage();
    assert.equal(formatDateForQuery(state.selectedDate), formatDateForQuery(initialDate));
    assert.equal(state.selectedEvent, null);
    assert.deepEqual(front.calendarBff.sequence(), [`GET /calendar/bootstrap?${rangeQuery('month', initialDate)}`]);
  } finally {
    delete global.window;
  }
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

test('day navigation keeps the selected day, statistics, read range and creation date aligned across the year boundary', async () => {
  const window = installWindow();
  window.location.search = '?date=2026-12-31';
  try {
    await renderLoadedPage(bootstrap({ events: [calendarEvent(42, { date: '2027-01-01' })] }));
    const initialRequests = front.calendarBff.requests.length;
    page.result.current.setView('day');
    await page.waitFor((state) => !state.loading && front.calendarBff.requests.length === initialRequests + 1);
    page.result.current.handleNext();
    let state = await page.waitFor((current) => !current.loading && front.calendarBff.requests.length === initialRequests + 2);
    assert.equal(formatDateForQuery(state.currentDate), '2027-01-01');
    assert.equal(formatDateForQuery(state.selectedDate), '2027-01-01');
    assert.equal(state.stats[2].value, '1 événement');
    assert.equal(front.calendarBff.sequence().at(-1), 'GET /calendar/bootstrap?from=2027-01-01&to=2027-01-01');
    state.openCreateModal();
    state = await page.waitFor((current) => current.createModalOpen);
    assert.equal(state.createInitialValues.date, '01-01-2027');
    state.setCreateModalOpen(false);
    page.result.current.handlePrevious();
    state = await page.waitFor((current) => !current.loading && front.calendarBff.requests.length === initialRequests + 3);
    assert.equal(formatDateForQuery(state.selectedDate), '2026-12-31');
    assert.equal(state.stats[2].value, '0 événement');
    assert.ok(front.calendarBff.sequence().every((call) => call.startsWith('GET /calendar/bootstrap?')));
  } finally {
    delete global.window;
  }
});

for (const [mode, afterTwo, afterPrevious] of [
  ['month', '2026-03-01', '2026-02-01'],
  ['week', '2026-02-14', '2026-02-07'],
]) {
  test(`${mode} arrows preserve consecutive navigation and its deliberately selected creation date when switching to day`, async () => {
    const window = installWindow();
    window.location.search = '?date=2026-01-31';
    try {
      await renderLoadedPage(bootstrap({ events: [] }));
      page.result.current.setView(mode);
      await page.waitFor((state) => !state.loading && state.view === mode);
      const sameRenderNext = page.result.current.handleNext;
      sameRenderNext();
      sameRenderNext();
      let state = await page.waitFor((current) => !current.loading && formatDateForQuery(current.currentDate) === afterTwo);
      assert.equal(formatDateForQuery(state.selectedDate), afterTwo);
      state.handlePrevious();
      state = await page.waitFor((current) => !current.loading && formatDateForQuery(current.currentDate) === afterPrevious);
      assert.equal(formatDateForQuery(state.selectedDate), afterPrevious);
      state.setView('day');
      state = await page.waitFor((current) => !current.loading && current.view === 'day');
      assert.equal(formatDateForQuery(state.selectedDate), afterPrevious);
      state.openCreateModal();
      state = await page.waitFor((current) => current.createModalOpen);
      assert.equal(formatDateForQuery(state.createInitialValues.date), afterPrevious);
      assert.ok(front.calendarBff.sequence().every((call) => call.startsWith('GET /calendar/bootstrap?')));
    } finally {
      delete global.window;
    }
  });
}

test('a BFF error on load is shown to the user', async () => {
  front.calendarBff.on('get', '/calendar/bootstrap', { status: 502, body: apiError('BAD_GATEWAY', 'Le service Calendar est indisponible.') });
  page = renderHook(useCalendarPage);

  const state = await page.waitFor((current) => !current.loading);

  assert.equal(state.error, 'Le service Calendar est indisponible.');
  assert.deepEqual(state.events, []);
});

test('opening and closing a form does not clear a failed calendar read without another GET', async () => {
  front.calendarBff.on('get', '/calendar/bootstrap', { status: 502, body: apiError('UNAVAILABLE', 'Read unavailable') });
  page = renderHook(useCalendarPage);
  const failed = await page.waitFor(current => !current.loading);
  failed.openCreateModal();
  const opened = await page.waitFor(current => current.createModalOpen);
  assert.equal(opened.error, 'Read unavailable');
  assert.equal(opened.readError, 'Read unavailable');
  assert.equal(opened.mutationError, null);
  opened.setCreateModalOpen(false);
  const closed = await page.waitFor(current => !current.createModalOpen);
  assert.equal(closed.readError, 'Read unavailable');
  assert.equal(front.calendarBff.requests.length, 1);
});

for (const operation of ['create', 'edit', 'delete', 'approve']) {
  for (const readFails of [false, true]) {
    test(`a late ${readFails ? 'failed' : 'successful'} read preserves a refused ${operation}`, async () => {
      const state = await renderLoadedPage();
      state.handleEventClick(state.events[0]);
      await page.waitFor(current => Boolean(current.selectedEvent));
      let reply;
      front.calendarBff.on('get', '/calendar/bootstrap', () => new Promise(resolve => { reply = resolve; }));
      const read = page.result.current.refreshData();
      await page.waitFor(() => Boolean(reply));
      const refused = { status: 403, body: apiError('FORBIDDEN', `${operation} refused`) };
      if (operation === 'create') {
        front.calendarBff.on('post', '/calendar/events', refused);
        await page.result.current.handleCreateEvent({ title: 'Draft', description: '', date: formatDateForQuery(state.currentDate), endDate: '', category: 'meeting', startTime: '09:00', endTime: '10:00', location: '', assigneeIds: [], recurrence: { frequency: 'none' } });
      } else if (operation === 'edit') {
        front.calendarBff.on('patch', '/calendar/events/{id}', refused);
        await page.result.current.handleSaveEvent({ ...state.events[0], title: 'Unsaved draft' });
      } else if (operation === 'delete') {
        front.calendarBff.on('delete', '/calendar/events/{id}', refused);
        await page.result.current.handleDeleteEvent(state.events[0]);
      } else {
        front.calendarBff.on('patch', '/calendar/events/{id}/approval', refused);
        await page.result.current.handleValidateEvent(state.events[0], 'approved');
      }
      assert.equal((await page.waitFor(current => !current.saving)).error, `${operation} refused`);
      reply(readFails ? { status: 502, body: apiError('UNAVAILABLE', 'Read unavailable') } : { body: bootstrap() });
      await read;
      const after = await page.waitFor(current => !current.loading);
      assert.equal(after.error, `${operation} refused`);
      assert.equal(after.mutationError, `${operation} refused`);
      assert.equal(after.readError, readFails ? 'Read unavailable' : null);
      assert.equal(after.selectedEvent.id, 5);
      assert.deepEqual(after.events.map(event => event.id), [5, 6]);
      assert.equal(front.calendarBff.requests.filter(call => call.method !== 'GET').length, 1);
    });
  }
}

test('read retry clears only its error, and an explicit new form clears only the previous mutation error', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('get', '/calendar/bootstrap', { status: 502, body: apiError('UNAVAILABLE', 'Read unavailable') });
  await state.refreshData();
  state.handleEventClick(state.events[0]);
  front.calendarBff.on('patch', '/calendar/events/{id}', { status: 403, body: apiError('FORBIDDEN', 'Edit refused') });
  await page.result.current.handleSaveEvent({ ...state.events[0], title: 'Unsaved draft' });
  let failed = await page.waitFor(current => !current.saving);
  assert.equal(failed.readError, 'Read unavailable');
  assert.equal(failed.mutationError, 'Edit refused');
  front.calendarBff.on('get', '/calendar/bootstrap', { body: bootstrap() });
  await failed.refreshData();
  failed = await page.waitFor(current => !current.loading);
  assert.equal(failed.readError, null);
  assert.equal(failed.mutationError, 'Edit refused');
  assert.equal(front.calendarBff.calls('/calendar/events/{id}', 'PATCH').length, 1);
  failed.openCreateModal();
  const opened = await page.waitFor(current => current.createModalOpen);
  assert.equal(opened.mutationError, null);
  assert.equal(opened.error, null);
});

test('a session refused by the BFF navigates to Login without automatic revocation', async () => {
  const window = installWindow();
  front.calendarBff.on('get', '/calendar/bootstrap', { status: 401, body: apiError('UNAUTHORIZED', 'Session invalide.') });
  front.userBff.on('post', '/auth/logout', { body: { message: 'Logged out successfully' } });
  try {
    page = renderHook(useCalendarPage);
    await page.waitFor(() => window.location.assigned.length === 1);

    assert.deepEqual(front.userBff.sequence(), []);
  assert.equal(front.ownerCalls.length,0);
  assert.equal(window.location.reloads,0);
  assert.equal(new URL(window.location.assigned[0]).searchParams.get('redirect'),window.location.href);
  assert.equal(new URL(window.location.assigned[0]).searchParams.has('returnUrl'),false);
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
  assert.equal(await page.result.current.handleSaveEvent({ ...state.events[0], title: 'Conseil renommé' }), true);
  const saved = await page.waitFor((current) => !current.saving);

  assert.deepEqual(front.calendarBff.calls('/calendar/events/{id}', 'PATCH').map((call) => [call.pathParams.id, call.body.title]), [['5', 'Conseil renommé']]);
  assert.equal(saved.events[0].title, 'Conseil renommé');
  assert.equal(saved.events[0].colorClassName, 'bg-[#eaf7ee] text-[#257444]');
  assert.equal(saved.selectedEvent, null);
});

test('handleSaveEvent reports a missing event', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('patch', '/calendar/events/{id}', { status: 404, body: apiError('NOT_FOUND', 'Événement introuvable') });

  assert.equal(await page.result.current.handleSaveEvent(state.events[1]), false);

  assert.equal((await page.waitFor((current) => !current.saving)).error, 'Événement introuvable');
});

test('a confirmed edit does not close another event selected during its request', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('patch', '/calendar/events/{id}', ({ pathParams }) => ({
    body: calendarEvent(Number(pathParams.id), { title: 'Confirmed event edit' }),
  }));
  state.handleEventClick(state.events[0]);
  const request = state.handleSaveEvent({ ...state.events[0], title: 'Confirmed event edit' });
  state.handleEventClick(state.events[1]);
  assert.equal(await request, false);
  const after = await page.waitFor(current => !current.saving);
  assert.equal(after.events[0].title, 'Confirmed event edit');
  assert.equal(after.selectedEvent?.id, state.events[1].id);
});

test('a confirmed edit does not close the same event reopened after explicit cancellation', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('patch', '/calendar/events/{id}', ({ pathParams }) => ({
    body: calendarEvent(Number(pathParams.id), { title: 'Confirmed earlier edit' }),
  }));
  state.handleEventClick(state.events[0]);
  const request = state.handleSaveEvent({ ...state.events[0], title: 'Confirmed earlier edit' });
  state.setSelectedEvent(null);
  state.handleEventClick(state.events[0]);
  assert.equal(await request, false);
  const after = await page.waitFor(current => !current.saving);
  assert.equal(after.events[0].title, 'Confirmed earlier edit');
  assert.equal(after.selectedEvent?.id, state.events[0].id);
});

test('a confirmed deletion does not close another event selected during its request', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('delete', '/calendar/events/{id}', { status: 204 });
  state.handleEventClick(state.events[0]);
  const request = state.handleDeleteEvent(state.events[0]);
  state.handleEventClick(state.events[1]);
  await request;
  const after = await page.waitFor(current => !current.saving);
  assert.deepEqual(after.events.map(event => event.id), [state.events[1].id]);
  assert.equal(after.selectedEvent?.id, state.events[1].id);
});

test('a confirmed deletion closes even a reopened copy of the deleted event', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('delete', '/calendar/events/{id}', { status: 204 });
  state.handleEventClick(state.events[0]);
  const request = state.handleDeleteEvent(state.events[0]);
  state.setSelectedEvent(null);
  state.handleEventClick(state.events[0]);
  await request;
  const after = await page.waitFor(current => !current.saving);
  assert.deepEqual(after.events.map(event => event.id), [state.events[1].id]);
  assert.equal(after.selectedEvent, null);
});

test('a bootstrap response started before a confirmed edit cannot restore the earlier event', async () => {
  const state = await renderLoadedPage();
  let reply;
  front.calendarBff.on('get', '/calendar/bootstrap', () => new Promise(resolve => { reply = resolve; }));
  const read = state.refreshData();
  await page.waitFor(() => Boolean(reply));
  front.calendarBff.on('patch', '/calendar/events/{id}', ({ pathParams }) => ({
    body: calendarEvent(Number(pathParams.id), { title: 'Confirmed after read started' }),
  }));
  state.handleEventClick(state.events[0]);
  await state.handleSaveEvent({ ...state.events[0], title: 'Confirmed after read started' });
  reply({ body: bootstrap() });
  await read;
  const after = await page.waitFor(current => !current.loading && !current.saving);
  assert.equal(after.events[0].title, 'Confirmed after read started');
});

test('only the latest retry may update events, errors or the loading state', async () => {
  const state = await renderLoadedPage();
  const replies = [];
  front.calendarBff.on('get', '/calendar/bootstrap', () => new Promise(resolve => { replies.push(resolve); }));
  const first = state.refreshData();
  await page.waitFor(() => replies.length === 1);
  const latest = state.refreshData();
  await page.waitFor(() => replies.length === 2);
  replies[0]({ status: 500, body: apiError('UNAVAILABLE', 'Earlier retry failed') });
  await first;
  const waiting = await page.waitFor(current => current.loading);
  assert.equal(waiting.error, null);
  replies[1]({ body: bootstrap({ events: [calendarEvent(42)] }) });
  await latest;
  const after = await page.waitFor(current => !current.loading);
  assert.deepEqual(after.events.map(event => event.id), [42]);
  assert.equal(after.error, null);
});

test('an earlier bootstrap cannot erase a confirmed creation and a fresh read remains authoritative', async () => {
  const state = await renderLoadedPage();
  let reply;
  front.calendarBff.on('get', '/calendar/bootstrap', () => new Promise(resolve => { reply = resolve; }));
  const read = state.refreshData();
  await page.waitFor(() => Boolean(reply));
  front.calendarBff.on('post', '/calendar/events', { status: 201, body: calendarEvent(42) });
  const date = formatDateForQuery(state.currentDate);
  await state.handleCreateEvent({ title: 'Confirmed creation', description: '', date, endDate: '', category: 'meeting', startTime: '09:00', endTime: '10:00', location: '', assigneeIds: [], recurrence: { frequency: 'none' } });
  reply({ body: bootstrap() });
  await read;
  assert.deepEqual((await page.waitFor(current => !current.loading)).events.map(event => event.id), [5, 6, 42]);
  front.calendarBff.on('get', '/calendar/bootstrap', { body: bootstrap({ events: [calendarEvent(42, { title: 'Fresh official version' })] }) });
  await page.result.current.refreshData();
  const after = await page.waitFor(current => !current.loading);
  assert.deepEqual(after.events.map(event => event.id), [42]);
  assert.equal(after.events[0].title, 'Fresh official version');
});

test('a stale read cannot resurrect a confirmed deletion or undo an approval', async () => {
  for (const operation of ['delete', 'approve']) {
    const state = await renderLoadedPage();
    let reply;
    front.calendarBff.on('get', '/calendar/bootstrap', () => new Promise(resolve => { reply = resolve; }));
    const read = state.refreshData();
    await page.waitFor(() => Boolean(reply));
    state.handleEventClick(state.events[0]);
    if (operation === 'delete') {
      front.calendarBff.on('delete', '/calendar/events/{id}', { status: 204 });
      await state.handleDeleteEvent(state.events[0]);
    } else {
      front.calendarBff.on('patch', '/calendar/events/{id}/approval', { body: calendarEvent(5, { approvalStatus: 'approved', canValidate: false }) });
      await state.handleValidateEvent(state.events[0], 'approved');
    }
    reply({ body: bootstrap() });
    await read;
    const after = await page.waitFor(current => !current.loading && !current.saving);
    if (operation === 'delete') assert.deepEqual(after.events.map(event => event.id), [6]);
    else assert.equal(after.events[0].approvalStatus, 'approved');
    page.unmount();
    page = undefined;
  }
});

test('a confirmed approval cannot replace another selection or reopen a closed event', async () => {
  for (const close of [false, true]) {
    const state = await renderLoadedPage();
    front.calendarBff.on('patch', '/calendar/events/{id}/approval', ({ pathParams }) => ({
      body: calendarEvent(Number(pathParams.id), { approvalStatus: 'approved', canValidate: false }),
    }));
    state.handleEventClick(state.events[0]);
    const request = state.handleValidateEvent(state.events[0], 'approved');
    if (close) state.setSelectedEvent(null);
    else state.handleEventClick(state.events[1]);
    await request;
    const after = await page.waitFor(current => !current.saving);
    assert.equal(after.events[0].approvalStatus, 'approved');
    assert.equal(after.selectedEvent?.id ?? null, close ? null : state.events[1].id);
    page.unmount();
    page = undefined;
  }
});

test('handleDeleteEvent deletes the event and removes it locally', async () => {
  const state = await renderLoadedPage();
  front.calendarBff.on('delete', '/calendar/events/{id}', { status: 204 });

  await page.result.current.handleDeleteEvent(state.events[1]);
  const after = await page.waitFor((current) => !current.saving);

  assert.deepEqual(front.calendarBff.calls('/calendar/events/{id}', 'DELETE').map((call) => call.pathParams.id), ['6']);
  assert.deepEqual(after.events.map((event) => event.id), [5]);
});

test('a synchronous repeated create or edit dispatch makes only one write and preserves refused official data', async () => {
  const state = await renderLoadedPage();
  state.handleEventClick(state.events[0]);
  front.calendarBff.on('patch', '/calendar/events/{id}', { status: 403, body: apiError('FORBIDDEN', 'Réessayer la modification') });
  const payload = { ...state.events[0], title: 'Draft, not official' };
  const first = state.handleSaveEvent(payload);
  assert.equal(await state.handleSaveEvent(payload), false);
  assert.equal(await first, false);
  const refused = await page.waitFor(current => !current.saving);
  assert.equal(front.calendarBff.calls('/calendar/events/{id}', 'PATCH').length, 1);
  assert.equal(refused.selectedEvent.title, state.events[0].title);
  assert.deepEqual(refused.events, state.events);

  refused.openCreateModal();
  front.calendarBff.on('post', '/calendar/events', { status: 403, body: apiError('FORBIDDEN', 'Réessayer la création') });
  const values = { title: 'Draft', description: '', date: '2026-09-16', endDate: '', category: 'other', startTime: '09:00', endTime: '10:00', location: '', assigneeIds: [], recurrence: { frequency: 'none' } };
  await Promise.all([refused.handleCreateEvent(values), refused.handleCreateEvent(values)]);
  const after = await page.waitFor(current => !current.saving);
  assert.equal(front.calendarBff.calls('/calendar/events', 'POST').length, 1);
  assert.equal(after.createModalOpen, true);
  assert.deepEqual(after.events, state.events);
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

  state.handleEventClick(state.events[0]);
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
