const assert = require('node:assert/strict');
const { test, before, after, beforeEach, afterEach } = require('node:test');
const { FrontHarness, jwtFor } = require('./support/front-harness.cjs');
const { loadTs } = require('./support/load-ts.cjs');
const { installReactRuntime, mount } = require('./support/server-view.cjs');
const { alice, apiError, bootstrap, calendarEvent, installWindow, sessionResponse, withoutToastRegions } = require('./support/calendar-fixtures.cjs');

// HTML of the calendar page (src/app/page.tsx) rendered with react-dom/server against the mocked BFFs:
// the real page, shell and @mairie360/lib-components are rendered, the hook state is kept between render
// passes (tests/support/server-view.cjs), so the markup reflects what the BFF answered.

const { router } = installReactRuntime();
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Page = loadTs('components/CalendarPage/CalendarPage').default;
const initialDate = loadTs('app/calendar/date-utils').calendarToday();
const { getPeriodTitle } = loadTs('app/calendar/date-utils');
const { formatFullDate } = loadTs('components/CalendarPage/calendar-date');
const ddmmyyyy = (date) => `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

const front = new FrontHarness();
let view;
const isCalendarPending = () => view.hostElements(props => props.role === 'status').some(({ text }) => /Chargement des données du calendrier|Enregistrement en cours/.test(text));
let window;
const toastTexts = () => (view.html.match(/<section data-m360-component="ToastProvider"[\s\S]*?<\/section>/)?.[0] ?? '').replace(/<[^>]*>/g, ' ');
const dialogHtml = () => { const html = withoutToastRegions(view.html); return html.slice(html.indexOf('role="dialog"')); };

before(() => front.start());
after(() => front.stop());
beforeEach(() => {
  front.reset();
  router.reset();
  window = installWindow();
  front.cookies.set('accessToken', jwtFor(1));
  front.userBff.on('get', '/me', { body: sessionResponse() });
});
afterEach(async () => {
  await front.settle();
  view?.unmount();
  view = undefined;
  assert.deepEqual(front.allViolations(), []);
});

// Opening an event shows it at once and completes its actions from GET /calendar/events/{id} (MAIR-557).
async function openEventDetails(event) {
  await view.act(() => view.props('MonthGrid').onEventClick(event));
  await view.waitFor(() => view.props('ValidatedEventDetailsModal')?.event?.canEdit !== undefined);
}

async function renderLoadedPage(body = bootstrap()) {
  front.calendarRead({ body });
  view = mount(React.createElement(Page));
  return view.waitFor((html) => !isCalendarPending() && view.find('Header')[0]?.props.user.name !== 'Chargement…');
}

test('server renders on either side of a month boundary expose no server-local calendar date', () => {
  const RealDate = Date;
  try {
    for (const clock of [new RealDate(2026, 8, 30, 23, 59).getTime(), new RealDate(2026, 9, 1, 0, 1).getTime()]) {
      global.Date = class extends RealDate {
        constructor(...args) { super(...(args.length ? args : [clock])); }
        static now() { return clock; }
      };
      // Real SSR has no effects: this is not the effect-running mount harness.
      const html = renderToStaticMarkup(React.createElement(Page));
      assert.match(html, /role="status"[^>]*>(?:<[^>]*>)*Chargement des données du calendrier…/);
      assert.doesNotMatch(html, /calendar-month-grid|calendar-week-grid|Sélectionner le|>Créer<\/button>/);
      assert.deepEqual(front.calendarBff.sequence(), []);
    }
  } finally {
    global.Date = RealDate;
  }
});

test('the first pass renders the loading state, the second the events answered by GET /calendar/bootstrap', async () => {
  front.calendarRead({ body: bootstrap() });
  view = mount(React.createElement(Page));

  assert.equal(view.passes, 1);
  // MAIR-911: the three panels start as skeletons (DataState loading, announced as a status).
  assert.match(view.html, /role="status"[^>]*>(?:<[^>]*>)*Chargement des données du calendrier…/);
  assert.match(view.html, /role="status"[^>]*>(?:<[^>]*>)*Chargement des statistiques…/);
  assert.match(view.html, /role="status"[^>]*>(?:<[^>]*>)*Chargement des événements à venir…/);
  assert.doesNotMatch(view.text(), /Événement 5/);
  assert.doesNotMatch(view.html, new RegExp(`<h2[^>]*>${getPeriodTitle('month', initialDate)}</h2>`), 'do not expose server-local date markup before client initialization');
  assert.equal(view.find('MonthGrid').length, 0);
  assert.doesNotMatch(view.html, />Créer<\/button>/);

  const html = await view.waitFor((current) => !isCalendarPending());

  assert.match(html, new RegExp(`<h2[^>]*>${getPeriodTitle('month', initialDate)}</h2>`));
  assert.deepEqual(front.calendarBff.sequence().map((line) => line.split('?')[0]), ['GET /calendar/bootstrap']);
  assert.doesNotMatch(withoutToastRegions(html), /role="alert"/);
  assert.match(view.text(), /Événement 5/);
  assert.match(view.text(), /Permanence/);
  assert.doesNotMatch(view.text(), /Description 5/, 'MAIR-918: « À venir » no longer shows descriptions');
  assert.match(html, /role="radiogroup" aria-label="Changer de vue"/);
  assert.match(html, /<button type="button" role="radio" aria-checked="true"[^>]*>Mois<\/button>/);
  assert.match(html, /<button type="button" role="radio" aria-checked="false"[^>]*>Semaine<\/button>/);
  assert.equal(view.find('MonthGrid').length, 1);
  assert.equal(view.find('WeekGrid').length, 0);
});

test('the shell shows the user resolved from BFF User in the header', async () => {
  const html = await renderLoadedPage();

  // MAIR-879: lib-components 2 frame — collapsible navigation band, tinted top bar, full-width footer.
  assert.match(html, /data-m360-component="AccessibleShell"/);
  assert.match(html, /class="app-shell-veil h-screen[^"]*app-shell-frame flex flex-col"/);
  assert.doesNotMatch(html, /calendar-scroll-shell/, 'the front no longer reshapes the shared frame');
  assert.match(html, /<main\b[^>]*class="app-shell-main-area min-h-0 flex-1[^"]*overflow-auto app-shell-main"/);
  assert.deepEqual(front.userBff.sequence(), ['GET /me']);
  assert.match(html, /<(?:span|div) data-slot="avatar-fallback"[^>]*>AM<\/(?:span|div)>|<span[^>]*>AM<\/span>/);
  assert.match(html, /<span[^>]*>Admin Mairie<\/span>/);
  // lib-components 2.3: the page base has no footer anymore, the white frame ends with the content.
  assert.doesNotMatch(html, /<footer\b/);
  assert.doesNotMatch(html, /app-shell-footer/);
  assert.equal(view.props('DesktopNavigation').isAdmin, false, 'a page mounted without its server provider keeps the least privileged display role');
});

test('desktop and mobile navigation expose only active modules and keep Settings functional', async () => {
  const { setBrowserFrontUrls } = loadTs('lib/front-urls');
  const assigned = [];
  const originalAssign = global.window.location.assign;
  global.window.location.assign = (href) => assigned.push(href);
  setBrowserFrontUrls({
    DASHBOARD_FRONT_URL: 'https://dashboard.test.example/',
    PROJECT_FRONT_URL: 'https://projects.test.example/',
    MESSAGE_FRONT_URL: 'https://messages.test.example/',
    ELEARNING_FRONT_URL: 'https://training.test.example/',
    CALENDAR_FRONT_URL: 'https://calendar.test.example/',
    ADMINISTRATION_FRONT_URL: 'https://admin.test.example/',
    SETTINGS_FRONT_URL: 'https://settings.test.example/',
    EMAIL_FRONT_URL: 'https://emails.test.example/',
    FILES_FRONT_URL: 'https://files.test.example/',
  });
  try {
    await renderLoadedPage();
    assert.equal(view.props('Header').profileHref, 'https://settings.test.example/');
    const desktop = view.props('DesktopNavigation');
    assert.equal(desktop.activeItem, 'calendar');
    const isAdmin = desktop.isAdmin;
    const desktopMenu = view.html.match(/<aside\b[^>]*class="app-desktop-navigation"[\s\S]*?<\/aside>/)?.[0] ?? '';
    assert.doesNotMatch(desktopMenu, /E-mails|Fichiers/);
    assert.match(desktopMenu, /aria-label="Paramètres"/);
    assert.equal(desktopMenu.includes('aria-label="Administration"'), isAdmin);
    assert.equal(view.find('Sidebar').length, 0, 'the desktop band is not the mobile drawer');

    await view.act(() => view.props('Header').setSidebarOpen(true));
    const [mobile] = view.find('Sidebar');
    assert.ok(mobile, 'the mobile drawer renders the shared sidebar');
    assert.deepEqual(mobile.props.items.map(item => item.id),
      ['dashboard', 'projects', 'messages', 'training', 'calendar', 'admin', 'settings']);
    assert.equal(mobile.props.items.find(item => item.id === 'admin').adminOnly, true);
    assert.equal(mobile.props.isAdmin, isAdmin);
    assert.equal(mobile.props.activeItem, 'calendar');
    const drawer = view.html.match(/<div[^>]*role="dialog"[^>]*aria-label="Navigation mobile"[\s\S]*?<\/nav>/)?.[0] ?? '';
    assert.doesNotMatch(drawer, /E-mails|Fichiers/);
    assert.match(drawer, /Paramètres/);
    await view.act(() => mobile.props.onItemSelect(mobile.props.items.find(item => item.id === 'settings')));
    assert.deepEqual(assigned, ['https://settings.test.example/']);
    await view.act(() => view.props('Header').onPageChange('profile'));
    assert.deepEqual(assigned, ['https://settings.test.example/', 'https://settings.test.example/']);
    assert.equal(view.find('Sidebar').length, 0);
  } finally {
    setBrowserFrontUrls({});
    global.window.location.assign = originalAssign;
  }
});

test('MAIR-884 F9: « Actualiser » rereads the displayed period through skeletons and is disabled meanwhile', async () => {
  await renderLoadedPage();
  await view.act(() => view.props('CalendarToolbar').onNext());
  await view.waitFor(() => !isCalendarPending() && front.calendarBff.requests.length === 2);
  const title = view.props('CalendarToolbar').title;
  const reads = front.calendarBff.requests.length;
  let reply;
  front.calendarBff.on('get', '/calendar/bootstrap', () => new Promise(resolve => { reply = resolve; }));
  await view.click('Actualiser');
  await view.waitFor(() => Boolean(reply));
  assert.equal(view.props('RefreshButton').disabled, true, '« Actualiser » cannot be pressed twice');
  assert.equal(view.find('MonthGrid').length, 0, 'the panels show their skeletons');
  assert.match(view.html, /role="status"[^>]*>(?:<[^>]*>)*Chargement des statistiques…/);
  await view.act(() => reply({ body: bootstrap() }));
  await view.waitFor(() => !isCalendarPending() && view.find('MonthGrid').length === 1);
  assert.equal(front.calendarBff.requests.length, reads + 1);
  assert.equal(view.props('CalendarToolbar').title, title, 'the period does not change');
  assert.equal(view.props('RefreshButton').disabled, false);
});

test('a BFF error is rendered as an alert with a retry button that reloads the calendar', async () => {
  front.calendarRead({ status: 502, body: apiError('BFF_ERROR', 'Calendar API unavailable') });
  view = mount(React.createElement(Page));
  const failed = await view.waitFor((html) => withoutToastRegions(html).includes('role="alert"'));

  assert.match(failed, /<span role="alert">Calendrier : Calendar API unavailable<\/span>/);
  assert.match(failed, /<button type="button"[^>]*>[\s\S]*?Réessayer<\/button>/);
  assert.doesNotMatch(view.text(), /Événement 5/);
  // MAIR-911 « API Calendar en panne »: the toolbar stays, the three panels show their unavailable states.
  assert.equal(view.find('CalendarToolbar').length, 1);
  assert.match(view.text(), /Calendrier indisponible\./);
  assert.match(view.text(), /Statistiques indisponibles\./);
  assert.equal(view.find('UnavailableAlert').length, 1, 'À venir offers its own retry');
  assert.equal(view.find('MonthGrid').length, 0);

  front.calendarRead({ body: bootstrap() });
  await view.click('Réessayer');
  const html = await view.waitFor((current) => !withoutToastRegions(current).includes('role="alert"') && !isCalendarPending());

  assert.equal(front.calendarBff.requests.length, 2);
  assert.match(view.text(), /Événement 5/);
  assert.doesNotMatch(html, /Réessayer/);
});

test('opening creation keeps the failed read and its retry, without claiming a refused save in the form', async () => {
  front.calendarRead({ status: 502, body: apiError('UNAVAILABLE', 'Read unavailable') });
  view = mount(React.createElement(Page));
  await view.waitFor(html => html.includes('Read unavailable'));
  await view.act(() => view.props('CalendarHeader').onCreate());
  assert.match(view.html, /<span role="alert">Calendrier : Read unavailable<\/span>/);
  assert.match(view.text(), /Réessayer/);
  assert.equal(view.props('ValidatedCreateEventModal').error, null);
  assert.equal(front.calendarBff.requests.length, 1);
  await view.act(() => view.props('ValidatedCreateEventModal').onCancel());
  assert.match(view.text(), /Read unavailable/);
});

test('a successful independent read cannot hide a refused edit or reset its draft', async () => {
  await renderLoadedPage();
  await openEventDetails(view.props('MonthGrid').events[0]);
  await view.click('Modifier');
  await view.fire(props => props.id === 'event-title', 'onChange', { target: { value: 'Draft retained' } });
  front.calendarBff.on('patch', '/calendar/events/{id}', { status: 403, body: apiError('FORBIDDEN', 'Edit refused') });
  // Submit the actual shared form so the wrapper owns the refused draft too.
  const form = view.hostElements((props, _text, tag) => tag === 'form' && props.onSubmit)[0];
  await view.act(() => form.props.onSubmit({ preventDefault() {} }));
  await view.waitFor(html => html.includes('Edit refused'));
  front.calendarRead({ status: 502, body: apiError('UNAVAILABLE', 'Read unavailable') });
  await view.act(() => view.props('CalendarToolbar').onViewChange('week'));
  await view.waitFor(html => html.includes('Read unavailable'));
  assert.match(view.text(), /Edit refused/);
  assert.equal(view.props('ValidatedEventDetailsModal').error, 'Edit refused');
  front.calendarRead({ body: bootstrap() });
  await view.click('Réessayer');
  await view.waitFor(html => !html.includes('Read unavailable') && !html.includes('Chargement des données'));
  assert.equal(view.props('ValidatedEventDetailsModal').error, 'Edit refused');
  assert.match(view.html, /<span role="alert"[^>]*>Edit refused<\/span>/);
  assert.equal(view.hostElements(props => props.id === 'event-title')[0].props.value, 'Draft retained');
  assert.doesNotMatch(view.text(), /Réessayer/);
  assert.equal(front.calendarBff.calls('/calendar/events/{id}', 'PATCH').length, 1);
});

test('pending and refused edit keeps its draft through reordered category reads, then confirms only an explicit retry', async () => {
  await renderLoadedPage();
  const event = view.props('MonthGrid').events[0];
  await openEventDetails(event);
  await view.click('Modifier');
  await view.fire(props => props.id === 'event-title', 'onChange', { target: { value: 'Combined draft' } });
  await view.fire(props => props.id === 'event-category', 'onChange', { target: { value: 'other' } });
  let reply;
  front.calendarBff.on('patch', '/calendar/events/{id}', () => new Promise(resolve => { reply = resolve; }));
  const submitEdit = () => view.hostElements((props, _text, tag) => tag === 'form' && props.onSubmit)[0]
    .props.onSubmit({ preventDefault() {} });
  await view.act(submitEdit);
  await view.waitFor(() => Boolean(reply));
  assert.match(view.html, /<fieldset[^>]*disabled=""[^>]*aria-busy="true"/);
  const reordered = bootstrap({ categories: [{ label: 'Autre reçue', value: 'other' }, { label: 'Réunion reçue', value: 'meeting' }] });
  front.calendarRead({ body: reordered });
  await view.act(() => view.props('CalendarToolbar').onViewChange('week'));
  await view.waitFor(() => front.calendarBff.calls('/calendar/period', 'GET').length > 0 && view.find('WeekGrid').length > 0);
  assert.equal(view.props('ValidatedEventDetailsModal').categories[0].value, 'meeting', 'period reads keep the bootstrap categories');
  assert.equal(view.hostElements(props => props.id === 'event-title')[0].props.value, 'Combined draft');
  assert.equal(view.hostElements(props => props.id === 'event-category')[0].props.value, 'other');
  assert.equal(view.props('ValidatedEventDetailsModal').saving, true);
  await view.act(() => reply({ status: 403, body: apiError('FORBIDDEN', 'Combined edit refused') }));
  await view.waitFor(html => html.includes('Combined edit refused'));
  front.calendarRead({ body: bootstrap() });
  await view.act(() => view.props('CalendarToolbar').onViewChange('day'));
  await view.waitFor(() => !view.props('ValidatedEventDetailsModal').saving && view.props('ValidatedEventDetailsModal').categories[0].value === 'meeting');
  assert.equal(view.hostElements(props => props.id === 'event-title')[0].props.value, 'Combined draft');
  assert.equal(view.hostElements(props => props.id === 'event-category')[0].props.value, 'other');
  assert.match(dialogHtml(), /role="alert"[^>]*>Combined edit refused/);
  assert.equal(front.calendarBff.calls('/calendar/events/{id}', 'PATCH').length, 1);
  const confirmed = calendarEvent(event.id, { ...event, title: 'Combined draft', category: 'other' });
  front.calendarBff.on('patch', '/calendar/events/{id}', { body: confirmed });
  await view.act(submitEdit);
  await view.waitFor(() => !view.html.includes('Modifier l’événement') && !view.html.includes('Enregistrement en cours'));
  assert.equal(front.calendarBff.calls('/calendar/events/{id}', 'PATCH').length, 2);
  assert.equal(view.props('DaySchedule').events[0].title, 'Combined draft');
  assert.equal(view.props('DaySchedule').events[0].category, 'other');
  assert.doesNotMatch(view.html, /role="dialog"/);
  assert.doesNotMatch(withoutToastRegions(view.html), /Combined edit refused/);
  // MAIR-879: the refused write stays in an error toast until dismissed; the confirmed one is a success toast.
  assert.match(toastTexts(), /Combined edit refused/);
  assert.match(toastTexts(), /Événement « Combined draft » enregistré\./);
});

test('changing the view re-renders the week grid with the reloaded events', async () => {
  await renderLoadedPage();

  await view.act(() => view.props('CalendarToolbar').onViewChange('week'));
  const html = await view.waitFor(() => front.calendarBff.requests.length === 2 && !isCalendarPending());

  assert.equal(view.find('WeekGrid').length, 1);
  assert.equal(view.find('MonthGrid').length, 0);
  assert.match(html, /<button type="button" role="radio" aria-checked="true"[^>]*>Semaine<\/button>/);
  assert.match(view.text(), /Événement 5/);
});

test('day arrows render the navigated date in the actual schedule, statistics and new-event form', async () => {
  window.location.search = '?date=2026-12-31';
  await renderLoadedPage(bootstrap({ events: [calendarEvent(42, { date: '2027-01-01' })] }));
  await view.act(() => view.props('CalendarToolbar').onViewChange('day'));
  await view.waitFor(() => !isCalendarPending());
  await view.act(() => view.props('CalendarToolbar').onNext());
  const html = await view.waitFor(() => !isCalendarPending() && view.props('CalendarToolbar').title === 'Vendredi 1 janvier 2027');
  assert.ok(view.find('Panel').some(({ props }) => props.title === 'Vendredi 1 janvier 2027'), 'MAIR-893: the period is the title of the calendar panel');
  assert.match(html, /aria-label="1 Janvier 2027 à 09:00"/);
  assert.doesNotMatch(html, /aria-label="31 Décembre 2026 à/);
  assert.equal(view.props('CalendarSidebar').stats.total, 1, 'MAIR-918: statistics of the displayed month (January)');
  await view.act(() => view.props('CalendarHeader').onCreate());
  assert.equal(view.props('ValidatedCreateEventModal').initialValues.date, '01-01-2027');
  assert.ok(front.calendarBff.sequence().every((call) => /^GET \/calendar\/(bootstrap|period)\?/.test(call)));
});

for (const mode of ['month', 'week', 'day']) {
  test(`MAIR-893 F3 (${mode}): Précédent / Suivant move one period, « Aujourd’hui » comes back, the panel title follows`, async () => {
    await renderLoadedPage();
    if (mode !== 'month') {
      await view.act(() => view.props('SegmentedControl').onChange(mode));
      await view.waitFor(() => !isCalendarPending() && view.props('CalendarToolbar').view === mode);
    }
    const today = getPeriodTitle(mode, initialDate);
    const panelTitles = () => view.find('Panel').map(({ props }) => props.title);
    assert.ok(panelTitles().includes(today));
    const iconButton = (name) => (props) => props['aria-label'] === name;
    await view.click(iconButton('Période suivante'));
    await view.click(iconButton('Période suivante'));
    await view.waitFor(() => !isCalendarPending() && view.props('CalendarToolbar').title !== today);
    const ahead = view.props('CalendarToolbar').title;
    assert.ok(panelTitles().includes(ahead));
    assert.equal(view.html.includes('aria-current="date"'), false, 'today is not highlighted outside its period');
    await view.click(iconButton('Période précédente'));
    await view.waitFor(() => !isCalendarPending() && view.props('CalendarToolbar').title !== ahead);
    await view.click('Aujourd’hui');
    await view.waitFor(() => !isCalendarPending() && view.props('CalendarToolbar').title === today);
    assert.ok(panelTitles().includes(today));
    assert.ok(front.calendarBff.sequence().every((call) => /^GET \/calendar\/(bootstrap|period)\?/.test(call)));
  });
}

test('MAIR-905 F4: a month day opens « Nouvel événement » on that day at 09:00 – 10:00, a pill opens its details', async () => {
  await renderLoadedPage();
  const day = new Date(initialDate.getFullYear(), initialDate.getMonth(), 12);
  const label = (props) => props['aria-label'] === `Sélectionner le ${formatFullDate(day)}`;
  await view.click(label);
  await view.waitFor(() => view.props('ValidatedCreateEventModal').isOpen === true);
  const values = view.props('ValidatedCreateEventModal').initialValues;
  assert.equal(values.date, ddmmyyyy(day));
  assert.equal(values.startTime, '09:00');
  assert.equal(values.endTime, '10:00');
  assert.equal(view.props('MonthGrid').selectedDate.getDate(), 12, 'the clicked day stays selected for navigation');
  await view.act(() => view.props('ValidatedCreateEventModal').onCancel());
  await view.waitFor(() => view.props('ValidatedCreateEventModal').isOpen === false);
  await openEventDetails(view.props('MonthGrid').events[0]);
  assert.equal(view.props('ValidatedEventDetailsModal').isOpen, true);
  assert.equal(view.props('ValidatedCreateEventModal').isOpen, false, 'a pill never starts a creation');
  assert.ok(front.calendarBff.sequence().every((call) => /^GET \/calendar\//.test(call)));
});

test('MAIR-918 F5: « À venir » lists the next occurrences first and a row opens the event details', async () => {
  const inThreeDays = new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate() + 3);
  const ymd = `${inThreeDays.getFullYear()}-${String(inThreeDays.getMonth() + 1).padStart(2, '0')}-${String(inThreeDays.getDate()).padStart(2, '0')}`;
  await renderLoadedPage(bootstrap({ events: [calendarEvent(7, { title: 'Conseil à venir', date: ymd, startTime: '18:00', endTime: '19:30' })] }));
  const sidebar = view.props('CalendarSidebar');
  assert.deepEqual(sidebar.upcoming.map(({ event }) => event.title), ['Conseil à venir']);
  assert.deepEqual(view.find('Panel').map(({ props }) => props.title).slice(-2), ['À venir', 'Statistiques'], 'À venir comes first');
  assert.match(view.text(), /Conseil à venir\s*Réunion/);
  assert.match(view.text(), /18:00 – 19:30/);
  await view.click((props, text, tag) => tag === 'button' && /Conseil à venir/.test(text));
  await view.waitFor(() => view.props('ValidatedEventDetailsModal')?.event?.canEdit !== undefined);
  assert.equal(view.props('ValidatedEventDetailsModal').event.id, 7);
});

test('calendar layout uses responsive grids and a bounded sidebar with BFF-backed events', async () => {
  const monthHtml = await renderLoadedPage();

  assert.match(monthHtml, /class="calendar-board mt-7 grid items-start gap-6"/);
  assert.match(monthHtml, /class="calendar-grid-viewport mt-9"/);
  assert.equal(view.props('MonthGrid').className, 'calendar-month-grid');
  assert.equal(view.props('CalendarSidebar').className, 'calendar-sidebar');
  assert.deepEqual(view.props('CalendarSidebar').stats.items.map((item) => [item.label, item.value]), [['Réunions', 1], ['Autres', 1]]);
  assert.deepEqual(front.calendarBff.sequence().map((line) => line.split('?')[0]), ['GET /calendar/bootstrap']);

  await view.act(() => view.props('CalendarToolbar').onViewChange('week'));
  await view.waitFor(() => front.calendarBff.requests.length === 2 && !isCalendarPending());

  assert.equal(view.props('WeekGrid').className, 'calendar-week-grid');
  assert.match(view.html, /class="calendar-grid-viewport mt-9"/);
});

test('the create modal opens from the title bar and the created event appears in the page', async () => {
  await renderLoadedPage();
  assert.doesNotMatch(view.html, /Ajoutez une date au calendrier de la mairie\./);

  await view.act(() => view.props('CalendarHeader').onCreate());
  assert.match(view.html, /Ajoutez une date au calendrier de la mairie\./);
  assert.equal(view.props('ValidatedCreateEventModal').isOpen, true);

  const created = calendarEvent(9, { title: 'Conseil municipal', date: '2026-09-18' });
  // Creating in another month reloads that visible range. The mock must return
  // the persisted event too, rather than overwrite it with today's old fixture.
  front.calendarRead({ body: bootstrap({ events: [created] }) });
  front.calendarBff.on('post', '/calendar/events', { status: 201, body: created });
  await view.act(() => view.props('ValidatedCreateEventModal').onCreate({
    title: 'Conseil municipal', date: new Date(2026, 8, 18), startTime: '18:00', endTime: '20:00', category: 'meeting', service: 'direction',
    location: 'Salle du conseil', description: '', assigneeIds: [alice.id],
  }));
  const html = await view.waitFor((current) => current.includes('Conseil municipal') && !isCalendarPending());

  assert.equal(front.calendarBff.sequence().filter((line) => line.startsWith('POST')).length, 1);
  assert.doesNotMatch(html, /Ajoutez une date au calendrier de la mairie\./);
  assert.match(view.text(), /Conseil municipal/);
  assert.equal(view.props('MonthGrid').events.some((event) => event.id === created.id), true);
});

test('clicking an event opens its details with the BFF permissions', async () => {
  await renderLoadedPage();
  const [event] = view.props('MonthGrid').events;

  await openEventDetails(event);

  const details = view.props('ValidatedEventDetailsModal');
  assert.equal(details.isOpen, true);
  assert.equal(details.event.title, 'Événement 5');
  assert.equal(details.canValidate, true);
  assert.match(view.html, /Salle du conseil/);
  assert.match(view.html, />Supprimer</);
  assert.match(view.html, />Modifier</);
});

test('MAIR-929 F5: the details dialog is titled with the event, shows its category and facts, and orders its actions', async () => {
  await renderLoadedPage();
  await openEventDetails(view.props('MonthGrid').events[0]);
  const dialog = dialogHtml();
  assert.ok(view.find('Modal').some(({ props }) => props.open && props.title === 'Événement 5'), 'MAIR-929: titled with the event');
  assert.match(dialog, /data-tone="info"[^>]*>(?:<[^>]*>)*Réunion</, 'category pill in the info tone');
  assert.deepEqual(view.find('EventDetailRow').map(({ props }) => props.label), ['Date', 'Horaire', 'Lieu', 'Participants']);
  assert.match(view.text(), /Description 5/);
  const footer = dialog.slice(dialog.indexOf('<footer'));
  const order = ['Supprimer', 'Fermer', 'Modifier'].map((name) => footer.indexOf(`>${name}<`));
  assert.ok(order.every((index) => index > 0) && order[0] < order[1] && order[1] < order[2], `footer order ${order}`);
  assert.doesNotMatch(footer, />Valider<|>Refuser</, 'approval stays between the facts and the footer');
  await view.click((props, text, tag) => tag === 'button' && text === 'Fermer');
  await view.waitFor(() => view.props('ValidatedEventDetailsModal').isOpen === false);
});

test('MAIR-931 F7: a confirmed deletion closes every dialog, updates the page and toasts « Événement supprimé »; a recurring event mentions its repetitions', async () => {
  await renderLoadedPage(bootstrap({ events: [calendarEvent(5, { recurrence: { frequency: 'daily', interval: 1, daysOfWeek: [] } }), calendarEvent(6, { title: 'Permanence', category: 'other' })] }));
  await openEventDetails(view.props('MonthGrid').events[0]);
  const exact = (name) => (props, text, tag) => tag === 'button' && text === name;
  await view.click(exact('Supprimer'));
  assert.match(view.html, /role="alertdialog"/);
  assert.match(view.text(), /« Événement 5 » sera retiré du calendrier, avec toutes ses répétitions\. Cette action est définitive\./);
  assert.equal(front.calendarBff.calls('/calendar/events/{id}', 'DELETE').length, 0);
  let reply;
  front.calendarBff.on('delete', '/calendar/events/{id}', () => new Promise(resolve => { reply = resolve; }));
  const confirming = view.click(exact('Confirmer la suppression'));
  await view.waitFor(() => Boolean(reply));
  assert.ok(view.find('ConfirmModal').some(({ props }) => props.open && props.busy), 'the confirm button loads during the call');
  await view.act(() => reply({ status: 204 }));
  await confirming;
  await view.waitFor(() => view.props('ValidatedEventDetailsModal').isOpen === false && toastTexts().includes('Événement supprimé'));
  assert.doesNotMatch(view.html, /role="alertdialog"|role="dialog"/);
  assert.deepEqual(view.props('MonthGrid').events.map((event) => event.id), [6]);
  assert.equal(view.props('CalendarSidebar').stats.total > 0, true);
  assert.equal(view.props('CalendarSidebar').upcoming.some(({ event }) => event.id === 5), false);
});

for (const [label, method, route, approvalStatus] of [
  ['Supprimer', 'delete', '/calendar/events/{id}', null],
  ['Valider', 'patch', '/calendar/events/{id}/approval', 'approved'],
  ['Refuser', 'patch', '/calendar/events/{id}/approval', 'rejected'],
]) {
  test(`${label}: the details dialog is busy while pending, a refusal goes to an error toast, then a confirmed retry alone changes the event`, async () => {
    await renderLoadedPage();
    const event = view.props('MonthGrid').events[0];
    await openEventDetails(event);
    let reply;
    front.calendarBff.on(method, route, () => new Promise(resolve => { reply = resolve; }));
    // Delete returns its promise, unlike the void approval handlers. Keep the
    // click pending so this assertion observes the UI before either response.
    const exact = (name) => (props, text, tag) => tag === 'button' && text === name;
    // MAIR-931: a deletion goes through the confirmation first.
    const act = async () => {
      if (label !== 'Supprimer') return view.click(exact(label));
      await view.click(exact(label));
      return view.click(exact('Confirmer la suppression'));
    };
    const pendingClick = act();
    await view.waitFor(() => Boolean(reply));
    let dialog = dialogHtml();
    // MAIR-929 C4: no saving status in the title any more; the dialog is disabled and busy.
    assert.doesNotMatch(dialog, /Enregistrement en cours…/);
    assert.match(view.html, /<fieldset[^>]*disabled=""[^>]*aria-busy="true"/);
    assert.equal(view.props('MonthGrid').events[0].approvalStatus, event.approvalStatus);
    await view.act(() => reply({ status: 403, body: apiError('FORBIDDEN', `${label} refusé`) }));
    await pendingClick;
    const refusal = label === 'Supprimer' ? `Suppression impossible — ${label} refusé` : `${label} refusé`;
    await view.waitFor(() => toastTexts().includes(refusal));
    if (label === 'Supprimer') assert.doesNotMatch(view.html, /role="alertdialog"/, 'a refused deletion returns to the details');
    dialog = dialogHtml();
    assert.doesNotMatch(dialog, new RegExp(`${label} refusé`), 'the refusal is a toast, not a title status');
    assert.match(dialog, /Événement 5/);
    assert.equal(view.props('MonthGrid').events[0].approvalStatus, event.approvalStatus);
    // A read is not an acknowledgement of this refused detail action.
    await view.act(() => view.props('CalendarToolbar').onViewChange('week'));
    // bootstrap, the opened event's detail (MAIR-557), the refused action and the week read.
    await view.waitFor(() => front.calendarBff.requests.length === 4 && !isCalendarPending());
    assert.ok(toastTexts().includes(`${label} refusé`), 'the error toast stays until dismissed');
    assert.equal(front.calendarBff.calls(route, method.toUpperCase()).length, 1);
    front.calendarBff.on(method, route, approvalStatus
      ? { body: calendarEvent(5, { approvalStatus }) }
      : { status: 204 });
    // The error toast also contains « <label> refusé »: target the dialog button by its exact text.
    await act();
    await view.waitFor(() => !isCalendarPending() && front.calendarBff.calls(route, method.toUpperCase()).length === 2 && !view.props('ValidatedEventDetailsModal')?.saving);
    if (approvalStatus) {
      assert.equal(view.props('WeekGrid').events[0].approvalStatus, approvalStatus);
      assert.doesNotMatch(dialogHtml(), /role="alert"/);
      assert.match(view.html, /role="dialog"/);
    } else {
      assert.equal(view.props('WeekGrid').events.some(item => item.id === event.id), false);
      assert.doesNotMatch(view.html, /role="dialog"/);
    }
  });
}

test('a refused session returns to Login without an automatic logout request', async () => {
  front.userBff.on('get', '/me', { status: 401 });
  front.userBff.on('post', '/auth/logout', { body: { message: 'Logged out successfully' } });
  front.calendarRead({ body: bootstrap() });
  view = mount(React.createElement(Page));

  await view.waitFor(() => window.location.assigned.length === 1);
  assert.deepEqual(front.userBff.sequence(), ['GET /me']);
  assert.equal(front.ownerCalls.length,0);
  assert.equal(window.location.reloads,0);
});

test('MAIR-557: the details dialog offers the actions granted by the event detail, not by the period list', async () => {
  const full = bootstrap();
  const listed = full.events.map(({ canEdit, canDelete, canValidate, createdById, description, ...event }) => event);
  let release;
  const held = new Promise((resolve) => { release = resolve; });
  await renderLoadedPage({ ...full, events: listed });
  front.calendarBff.on('get', '/calendar/events/{id}', async ({ pathParams }) => {
    await held;
    return { body: full.events.find((event) => String(event.id) === pathParams.id) };
  });

  try {
    await view.act(() => view.props('MonthGrid').onEventClick(view.props('MonthGrid').events[0]));
    await view.waitFor((html) => html.includes('role="dialog"'));
    assert.doesNotMatch(dialogHtml(), />Modifier<|>Supprimer<|>Valider</);
  } finally {
    // Released even when an assertion fails, so afterEach's settle() does not wait forever.
    await view.act(() => release());
  }
  await view.waitFor((html) => />Modifier</.test(html.slice(html.indexOf('role="dialog"'))));
  const dialog = dialogHtml();
  assert.match(dialog, />Supprimer</);
  assert.match(dialog, />Valider</);
  assert.match(dialog, /Description 5/);
  assert.deepEqual(front.calendarBff.calls('/calendar/events/{id}', 'GET').map((call) => call.pathParams.id), ['5']);
});
