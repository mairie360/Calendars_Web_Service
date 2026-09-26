const assert = require('node:assert/strict');
const { test, before, after, beforeEach, afterEach } = require('node:test');
const { FrontHarness, jwtFor } = require('./support/front-harness.cjs');
const { unreachableUrl } = require('./support/contract-mock-server.cjs');
const { loadTs } = require('./support/load-ts.cjs');
const { admin, alice, marie, apiError, bootstrap, calendarEvent, installWindow } = require('./support/calendar-fixtures.cjs');

// Client calendrier (src/app/calendar/api.ts) -> serveur du front -> proxy -> BFF_Calendar simulé
// depuis contracts/openapi.json : chaque requête et chaque réponse est validée contre le contrat.

const front = new FrontHarness();
const api = loadTs('app/calendar/api');
const { BffRequestError } = loadTs('lib/bff-client');
const token = jwtFor(1);
let window;

before(() => front.start());
after(() => front.stop());
beforeEach(() => {
  front.reset();
  front.cookies.set('accessToken', token);
  window = installWindow();
  process.env.BFF_CALENDAR_BASE_URL = front.calendarBff.url;
});
afterEach(() => {
  delete global.window;
  assert.deepEqual(front.allViolations(), []);
});

const people = [admin, alice, marie];
const createValues = (overrides = {}) => ({
  title: 'Conseil municipal',
  description: 'Ordre du jour',
  date: '2026-09-16',
  endDate: '',
  category: 'meeting',
  service: 'direction',
  startTime: '18:00',
  endTime: '20:00',
  location: 'Salle du conseil',
  assigneeIds: [alice.id, marie.id],
  recurrence: { frequency: 'weekly', interval: 2, daysOfWeek: [3], endsOn: '2026-12-16' },
  ...overrides,
});

test('loadCalendarData reads GET /calendar/bootstrap once with the declared from/to and the session cookie as Bearer', async () => {
  front.calendarBff.on('get', '/calendar/bootstrap', { body: bootstrap() });

  const data = await api.loadCalendarData({ from: '2026-08-31', to: '2026-10-04' });

  assert.deepEqual(front.calendarBff.sequence(), ['GET /calendar/bootstrap?from=2026-08-31&to=2026-10-04']);
  const [call] = front.calendarBff.requests;
  assert.equal(call.headers.authorization, `Bearer ${token}`);
  assert.equal(call.headers.cookie, undefined);
  assert.deepEqual(data.categories, [{ label: 'Réunion', value: 'meeting' }, { label: 'Autre', value: 'other' }]);
  assert.deepEqual(data.services, [{ label: 'Direction générale', value: 'direction' }]);
  assert.deepEqual(data.people.map((person) => person.id), [admin.id, alice.id, marie.id]);
  assert.deepEqual(data.currentUser, { id: admin.id, name: admin.name, email: admin.email, role: 'Admin', groupIds: [1, 2] });
  assert.equal(data.assigneeScope, 'all');
  assert.equal(data.events.length, 2);
  // L'événement du BFF est repris tel quel (droits compris), seule la couleur d'affichage est ajoutée.
  assert.deepEqual(data.events[0], { ...calendarEvent(5), colorClassName: 'bg-[#e9f2ff] text-[#1256a6]' });
  // Sans objets `assignees`, le front les reconstruit depuis l'annuaire du bootstrap.
  assert.deepEqual(data.events[1].assignees, [marie]);
  assert.equal(data.events[1].colorClassName, 'bg-[#f3f4f6] text-[#4c5258]');
});

test('loadCalendarData keeps optional bootstrap data as the BFF returns it', async () => {
  front.calendarBff.on('get', '/calendar/bootstrap', {
    body: {
      events: [
        calendarEvent(8, { recurrence: { frequency: 'daily', interval: 1, daysOfWeek: [1, 5] }, approvalStatus: 'approved', endDate: '2026-09-18' }),
        calendarEvent(9, { recurrence: { frequency: 'none' }, approvalStatus: 'rejected', canEdit: false, canDelete: false }),
      ],
      assignees: [],
      categories: [],
      services: [],
    },
  });

  const data = await api.loadCalendarData({ from: '2026-09-01', to: '2026-09-30' });

  assert.deepEqual(data.events[0].recurrence, { frequency: 'daily', interval: 1, daysOfWeek: [1, 5] });
  assert.equal(data.events[0].endDate, '2026-09-18');
  assert.deepEqual([data.events[1].approvalStatus, data.events[1].canEdit, data.events[1].canDelete], ['rejected', false, false]);
  assert.equal(data.currentUser, undefined);
  assert.equal(data.assigneeScope, undefined);
});

test('a client Authorization header never replaces the HttpOnly session cookie', async () => {
  front.calendarBff.on('get', '/calendar/bootstrap', { body: bootstrap() });
  window.localStorage.setItem('mairie360.auth.jwt', 'stored-token');

  await api.loadCalendarData({ from: '2026-09-01', to: '2026-09-30' });
  await fetch('/calendar/bootstrap?from=2026-09-01&to=2026-09-30', { headers: { Authorization: 'Bearer forged' } });

  assert.deepEqual(front.calendarBff.requests.map((call) => call.headers.authorization), [`Bearer ${token}`, `Bearer ${token}`]);
});

test('createCalendarEvent posts a CreateCalendarEventBody and normalises the 201 CalendarEvent', async () => {
  front.calendarBff.on('post', '/calendar/events', ({ body }) => ({ status: 201, body: calendarEvent(42, { ...body, assignees: [alice, marie] }) }));

  const created = await api.createCalendarEvent(createValues(), people);

  assert.deepEqual(front.calendarBff.sequence(), ['POST /calendar/events']);
  const [call] = front.calendarBff.requests;
  assert.equal(call.headers['content-type'], 'application/json');
  assert.deepEqual(call.body, {
    title: 'Conseil municipal', description: 'Ordre du jour', date: '2026-09-16', category: 'meeting', service: 'direction',
    startTime: '18:00', endTime: '20:00', location: 'Salle du conseil', assigneeIds: [alice.id, marie.id],
    recurrence: { frequency: 'weekly', interval: 2, daysOfWeek: [3], endsOn: '2026-12-16' },
  });
  assert.equal(created.id, 42);
  assert.deepEqual(created.recurrence, { frequency: 'weekly', interval: 2, daysOfWeek: [3], endsOn: '2026-12-16' });
});

test('createCalendarEvent omits an empty category and end date instead of sending values outside the contract', async () => {
  front.calendarBff.on('post', '/calendar/events', ({ body }) => ({ status: 201, body: calendarEvent(43, body) }));

  await api.createCalendarEvent(createValues({ category: '', endDate: '', service: undefined }), people);

  const [{ body }] = front.calendarBff.requests;
  assert.equal('category' in body, false);
  assert.equal('endDate' in body, false);
  assert.equal('service' in body, false);
});

test('updateCalendarEvent patches /calendar/events/{id} with an UpdateCalendarEventBody', async () => {
  front.calendarBff.on('patch', '/calendar/events/{id}', ({ body, pathParams }) => ({ body: calendarEvent(Number(pathParams.id), body) }));
  // Dates locales (sélection dans le calendrier) : envoyées en YYYY-MM-DD local, pas en UTC.
  const event = { ...calendarEvent(12), date: new Date(2026, 8, 20), endDate: new Date(2026, 8, 21), recurrence: { frequency: 'weekly', endsOn: new Date(2026, 11, 31) }, colorClassName: 'x' };

  const saved = await api.updateCalendarEvent(event, people);

  assert.deepEqual(front.calendarBff.sequence(), ['PATCH /calendar/events/12']);
  assert.equal(front.calendarBff.requests[0].body.date, '2026-09-20');
  assert.equal(front.calendarBff.requests[0].body.endDate, '2026-09-21');
  assert.deepEqual(front.calendarBff.requests[0].body.recurrence, { frequency: 'weekly', endsOn: '2026-12-31' });
  assert.equal('colorClassName' in front.calendarBff.requests[0].body, false);
  assert.equal(saved.date, '2026-09-20');
});

test('deleteCalendarEvent sends DELETE /calendar/events/{id} and accepts the empty 204', async () => {
  front.calendarBff.on('delete', '/calendar/events/{id}', { status: 204 });

  assert.equal(await api.deleteCalendarEvent(12), undefined);

  assert.deepEqual(front.calendarBff.sequence(), ['DELETE /calendar/events/12']);
  assert.equal(front.calendarBff.requests[0].body, undefined);
});

test('updateCalendarEventApproval patches /calendar/events/{id}/approval with UpdateCalendarEventApprovalBody', async () => {
  front.calendarBff.on('patch', '/calendar/events/{id}/approval', ({ body, pathParams }) => ({
    body: calendarEvent(Number(pathParams.id), { approvalStatus: body.approvalStatus, canValidate: false }),
  }));

  const saved = await api.updateCalendarEventApproval(12, 'approved', people);

  assert.deepEqual(front.calendarBff.requests.map((call) => [call.template, call.body]), [['/calendar/events/{id}/approval', { approvalStatus: 'approved' }]]);
  assert.equal(saved.approvalStatus, 'approved');
  assert.equal(saved.canValidate, false);
});

for (const [status, operation, call] of [
  [400, ['get', '/calendar/bootstrap'], () => api.loadCalendarData({ from: '2026-09-01', to: '2026-09-30' })],
  [403, ['post', '/calendar/events'], () => api.createCalendarEvent(createValues(), people)],
  [404, ['patch', '/calendar/events/{id}'], () => api.updateCalendarEvent(calendarEvent(99), people)],
  [403, ['delete', '/calendar/events/{id}'], () => api.deleteCalendarEvent(12)],
  [404, ['patch', '/calendar/events/{id}/approval'], () => api.updateCalendarEventApproval(12, 'rejected', people)],
  [502, ['get', '/calendar/bootstrap'], () => api.loadCalendarData({ from: '2026-09-01', to: '2026-09-30' })],
]) {
  test(`a documented ${status} ApiError from ${operation[0].toUpperCase()} ${operation[1]} becomes a BffRequestError with its message`, async () => {
    front.calendarBff.on(...operation, { status, body: apiError('ERROR', `Refus ${status}`) });

    const error = await call().then(() => assert.fail('la requête aurait dû échouer'), (reason) => reason);

    assert.ok(error instanceof BffRequestError);
    assert.equal(error.status, status);
    assert.equal(error.message, `Refus ${status}`);
    assert.deepEqual(error.details, { code: 'ERROR', message: `Refus ${status}` });
    assert.equal(api.formatCalendarApiError(error), `Refus ${status}`);
  });
}

test('a 401 from the BFF ends the session: logout through BFF User, then reload towards Login', async () => {
  front.calendarBff.on('get', '/calendar/bootstrap', { status: 401, body: apiError('UNAUTHORIZED', 'Session invalide.') });
  front.userBff.on('post', '/auth/logout', { body: { message: 'Logged out successfully' } });

  const error = await api.loadCalendarData({ from: '2026-09-01', to: '2026-09-30' }).catch((reason) => reason);
  while (window.location.reloads === 0) await new Promise((resolve) => setTimeout(resolve, 5));

  assert.ok(error instanceof BffRequestError);
  assert.equal(error.status, 401);
  assert.deepEqual(front.userBff.sequence(), ['POST /auth/logout']);
  assert.equal(window.location.reloads, 1);
});

test('an unreachable BFF surfaces the proxy 502 message', async () => {
  process.env.BFF_CALENDAR_BASE_URL = await unreachableUrl();
  front.allowServerOrigin(process.env.BFF_CALENDAR_BASE_URL);

  const error = await api.loadCalendarData({ from: '2026-09-01', to: '2026-09-30' }).catch((reason) => reason);

  assert.ok(error instanceof BffRequestError);
  assert.equal(error.status, 502);
  assert.equal(api.formatCalendarApiError(error), 'Le service est indisponible.');
});

test('formatCalendarApiError falls back to a generic message', () => {
  assert.equal(api.formatCalendarApiError(new Error('  ')), 'Le service calendrier est injoignable.');
  assert.equal(api.formatCalendarApiError('boom'), 'Le service calendrier est injoignable.');
});
