const assert = require('node:assert/strict');
const { test, before, after, beforeEach, afterEach } = require('node:test');
const { FrontHarness, jwtFor } = require('./support/front-harness.cjs');
const { loadTs } = require('./support/load-ts.cjs');
const { installReactRuntime, mount } = require('./support/server-view.cjs');
const { alice, apiError, bootstrap, calendarEvent, installWindow, sessionResponse } = require('./support/calendar-fixtures.cjs');

// HTML of the calendar page (src/app/page.tsx) rendered with react-dom/server against the mocked BFFs:
// the real page, shell and @mairie360/lib-components are rendered, the hook state is kept between render
// passes (tests/support/server-view.cjs), so the markup reflects what the BFF answered.

const { router } = installReactRuntime();
const React = require('react');
const Page = loadTs('app/page').default;
const { initialDate } = loadTs('app/calendar/constants');
const { getPeriodTitle } = loadTs('app/calendar/date-utils');

const front = new FrontHarness();
let view;
let window;

before(() => front.start());
after(() => front.stop());
beforeEach(() => {
  front.reset();
  router.reset();
  window = installWindow();
  front.cookies.set('accessToken', jwtFor(1));
  front.userBff.on('get', '/me', { body: sessionResponse() });
});
afterEach(() => {
  view?.unmount();
  view = undefined;
  assert.deepEqual(front.allViolations(), []);
});

async function renderLoadedPage(body = bootstrap()) {
  front.calendarBff.on('get', '/calendar/bootstrap', { body });
  view = mount(React.createElement(Page));
  return view.waitFor((html) => !html.includes('role="status"') && view.find('Header')[0]?.props.user.name !== 'Chargement…');
}

test('the first pass renders the loading state, the second the events answered by GET /calendar/bootstrap', async () => {
  front.calendarBff.on('get', '/calendar/bootstrap', { body: bootstrap() });
  view = mount(React.createElement(Page));

  assert.equal(view.passes, 1);
  assert.match(view.html, /<span role="status">Chargement des données du calendrier…<\/span>/);
  assert.doesNotMatch(view.text(), /Événement 5/);
  assert.match(view.html, new RegExp(`<h2[^>]*>${getPeriodTitle('month', initialDate)}</h2>`));

  const html = await view.waitFor((current) => !current.includes('role="status"'));

  assert.deepEqual(front.calendarBff.sequence().map((line) => line.split('?')[0]), ['GET /calendar/bootstrap']);
  assert.doesNotMatch(html, /role="alert"/);
  assert.match(view.text(), /Événement 5/);
  assert.match(view.text(), /Permanence/);
  assert.match(view.text(), /Description 5/);
  assert.match(html, /<button type="button" role="tab" aria-selected="true"[^>]*>Mois<\/button>/);
  assert.match(html, /<button type="button" role="tab" aria-selected="false"[^>]*>Semaine<\/button>/);
  assert.equal(view.find('MonthGrid').length, 1);
  assert.equal(view.find('WeekGrid').length, 0);
});

test('the shell shows the user resolved from BFF User in the header', async () => {
  const html = await renderLoadedPage();

  assert.match(html, /calendar-scroll-shell/);
  assert.match(html, /calendar-scroll-layout/);
  assert.match(html, /calendar-scroll-column/);
  assert.match(html, /class="app-main flex-1"/);
  assert.match(html, /<footer[^>]*app-footer/);
  assert.deepEqual(front.userBff.sequence(), ['GET /me']);
  assert.match(html, /<span data-slot="avatar-fallback"[^>]*>AM<\/span>|<span[^>]*>AM<\/span>/);
  assert.match(html, /<span[^>]*>Admin Mairie<\/span>/);
  assert.match(html, /<footer/);
  assert.deepEqual(view.props('Sidebar').isAdmin, true);
});

test('a BFF error is rendered as an alert with a retry button that reloads the calendar', async () => {
  front.calendarBff.on('get', '/calendar/bootstrap', { status: 502, body: apiError('BFF_ERROR', 'Calendar API unavailable') });
  view = mount(React.createElement(Page));
  const failed = await view.waitFor((html) => html.includes('role="alert"'));

  assert.match(failed, /<span role="alert">BFF calendrier : Calendar API unavailable<\/span>/);
  assert.match(failed, /<button type="button"[^>]*>[\s\S]*?<span>Réessayer<\/span><\/button>/);
  assert.doesNotMatch(view.text(), /Événement 5/);

  front.calendarBff.on('get', '/calendar/bootstrap', { body: bootstrap() });
  await view.click('Réessayer');
  const html = await view.waitFor((current) => !current.includes('role="alert"') && !current.includes('role="status"'));

  assert.equal(front.calendarBff.requests.length, 2);
  assert.match(view.text(), /Événement 5/);
  assert.doesNotMatch(html, /Réessayer/);
});

test('changing the view re-renders the week grid with the reloaded events', async () => {
  await renderLoadedPage();

  await view.act(() => view.props('CalendarToolbar').onViewChange('week'));
  const html = await view.waitFor(() => front.calendarBff.requests.length === 2 && !view.html.includes('role="status"'));

  assert.equal(view.find('WeekGrid').length, 1);
  assert.equal(view.find('MonthGrid').length, 0);
  assert.match(html, /<button type="button" role="tab" aria-selected="true"[^>]*>Semaine<\/button>/);
  assert.match(view.text(), /Événement 5/);
});

test('the create modal opens from the title bar and the created event appears in the page', async () => {
  await renderLoadedPage();
  assert.doesNotMatch(view.html, /Ajoutez une date au calendrier de la mairie\./);

  await view.act(() => view.props('PageTitleBar').onAction());
  assert.match(view.html, /Ajoutez une date au calendrier de la mairie\./);
  assert.equal(view.props('CreateEventModal').isOpen, true);

  front.calendarBff.on('post', '/calendar/events', { status: 201, body: calendarEvent(9, { title: 'Conseil municipal', date: '2026-09-18' }) });
  await view.act(() => view.props('CreateEventModal').onCreate({
    title: 'Conseil municipal', date: new Date(2026, 8, 18), startTime: '18:00', endTime: '20:00', category: 'meeting', service: 'direction',
    location: 'Salle du conseil', description: '', assigneeIds: [alice.id],
  }));
  const html = await view.waitFor((current) => current.includes('Conseil municipal') && !current.includes('role="status"'));

  assert.equal(front.calendarBff.sequence().filter((line) => line.startsWith('POST')).length, 1);
  assert.doesNotMatch(html, /Ajoutez une date au calendrier de la mairie\./);
  assert.match(view.text(), /Conseil municipal/);
});

test('clicking an event opens its details with the BFF permissions', async () => {
  await renderLoadedPage();
  const [event] = view.props('MonthGrid').events;

  await view.act(() => view.props('MonthGrid').onEventClick(event));

  const details = view.props('EventDetailsModal');
  assert.equal(details.isOpen, true);
  assert.equal(details.event.title, 'Événement 5');
  assert.equal(details.canValidate, true);
  assert.match(view.html, /Salle du conseil/);
  assert.match(view.html, />Supprimer</);
  assert.match(view.html, />Modifier</);
});

test('a refused session logs out and reloads instead of rendering the calendar', async () => {
  front.userBff.on('get', '/me', { status: 401 });
  front.userBff.on('post', '/auth/logout', { body: { message: 'Logged out successfully' } });
  front.calendarBff.on('get', '/calendar/bootstrap', { body: bootstrap() });
  view = mount(React.createElement(Page));

  await view.waitFor(() => window.location.reloads === 1);
  assert.deepEqual(front.userBff.sequence(), ['GET /me', 'POST /auth/logout']);
});
