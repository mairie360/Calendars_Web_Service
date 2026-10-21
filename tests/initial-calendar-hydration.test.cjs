const assert = require('node:assert/strict');
const { test, before, after, beforeEach, afterEach } = require('node:test');
const { installReactRuntime, mount } = require('./support/server-view.cjs');
const { router } = installReactRuntime();
const React = require('react');
const { loadTs } = require('./support/load-ts.cjs');
const { FrontHarness, jwtFor } = require('./support/front-harness.cjs');
const { bootstrap, calendarEvent, installWindow, sessionResponse, apiError } = require('./support/calendar-fixtures.cjs');
const Client = loadTs('components/CalendarPage/CalendarPage').default;
const front = new FrontHarness();
let view;
const data = () => bootstrap({ events: [calendarEvent(5, { date: '2026-11-17', title: 'Confirmed server event' })] });
const initial = () => ({ status: 'confirmed', data: data(), query: { view: 'day', date: '2026-11-17', linkedDate: true, eventId: null } });
before(() => front.start());
after(() => front.stop());
beforeEach(() => {
  front.reset(); router.reset();
  const browser = installWindow(); browser.location.search = '?view=day&date=2026-11-17';
  front.cookies.set('accessToken', jwtFor(1));
  front.userBff.on('get', '/me', { body: sessionResponse() });
});
afterEach(() => { view?.unmount(); view = undefined; assert.deepEqual(front.allViolations(), []); });

test('hydration shows the confirmed period immediately and revisiting it reuses the seeded account cache', async () => {
  front.calendarRead({ body: data() });
  view = mount(React.createElement(Client, { initial: initial() }));
  assert.match(view.html, /Confirmed server event/);
  await view.settle();
  assert.deepEqual(front.calendarBff.sequence(), []);
  await view.act(() => view.props('CalendarToolbar').onNext());
  await view.waitFor(() => front.calendarBff.requests.length === 1 && !view.html.includes('role="status"'));
  assert.equal(front.calendarBff.sequence()[0], 'GET /calendar/period?from=2026-11-18&to=2026-11-18');
  await view.act(() => view.props('CalendarToolbar').onPrevious());
  await view.waitFor(() => view.text().includes('Confirmed server event') && !view.html.includes('role="status"'));
  assert.equal(front.calendarBff.requests.length, 1);
});

test('foreground verification keeps an open event draft on both confirmed and refused reads', async () => {
  view = mount(React.createElement(Client, { initial: initial() }));
  await view.act(() => view.props('CalendarHeader').onCreate());
  await view.fire(props => props.id === 'event-title', 'onChange', { target: { value: 'Draft across foreground' } });
  front.calendarRead({ body: bootstrap({ events: [calendarEvent(5, { date: '2026-11-17', title: 'Foreground event' })] }) });
  await view.act(() => window.dispatchEvent({ type: 'focus' }));
  await view.waitFor(() => front.calendarBff.requests.length === 1 && view.text().includes('Foreground event'));
  assert.equal(view.hostElements(props => props.id === 'event-title')[0].props.value, 'Draft across foreground');
  front.calendarRead({ status: 503, body: apiError('UNAVAILABLE', 'Foreground read refused') });
  await view.act(() => window.dispatchEvent({ type: 'focus' }));
  await view.waitFor(() => view.text().includes('Foreground read refused'));
  assert.equal(view.hostElements(props => props.id === 'event-title')[0].props.value, 'Draft across foreground');
  assert.match(view.text(), /Foreground event/);
});

test('an unavailable server receipt resumes through the existing browser bootstrap route', async () => {
  front.calendarRead({ body: data() });
  view = mount(React.createElement(Client, { initial: { status: 'unavailable', message: 'Initial server read unavailable' } }));
  await view.waitFor(() => view.text().includes('Confirmed server event') && !view.html.includes('role="status"'));
  assert.equal(front.calendarBff.sequence()[0], 'GET /calendar/bootstrap?from=2026-11-17&to=2026-11-17');
  assert.doesNotMatch(view.text(), /Initial server read unavailable/);
});
