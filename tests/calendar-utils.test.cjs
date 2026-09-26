const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');
const { installWindow } = require('./support/calendar-fixtures.cjs');

// Logique pure du calendrier (dates, statistiques, couleurs) et navigation entre modules : aucune requête réseau.

const dates = loadTs('app/calendar/date-utils');
const { buildStats, eventOccursOnDate } = loadTs('app/calendar/stats');
const { getEventColor, resolveAssignees } = loadTs('app/calendar/constants');
// The root layout reads the other fronts' URLs at runtime and hands them to the browser; one is set for the test.
const { setBrowserFrontUrls } = loadTs('lib/front-urls');
const navigation = loadTs('app/navigation');

const ymd = (date) => dates.formatDateForQuery(date);

test('parseDateInput accepts Date, YYYY-MM-DD, DD-MM-YYYY and DD/MM/YYYY at local midnight', () => {
  assert.equal(ymd(dates.parseDateInput(new Date(2026, 8, 16, 18, 30))), '2026-09-16');
  assert.equal(ymd(dates.parseDateInput(' 2026-09-16 ')), '2026-09-16');
  assert.equal(ymd(dates.parseDateInput('16-09-2026')), '2026-09-16');
  assert.equal(ymd(dates.parseDateInput('16/09/2026')), '2026-09-16');
  assert.equal(ymd(dates.parseDateInput('September 16, 2026 10:00')), '2026-09-16');
  assert.equal(dates.parseDateInput(new Date(2026, 8, 16, 18)).getHours(), 0);
  assert.ok(dates.parseDateInput() instanceof Date);
});

test('date formatting matches the server (DD-MM-YYYY) and the contract query (YYYY-MM-DD) formats', () => {
  assert.equal(dates.formatDateForServer('2026-01-05'), '05-01-2026');
  assert.equal(dates.formatDateForQuery('05-01-2026'), '2026-01-05');
  assert.equal(dates.formatMonthYear('2026-09-16'), 'Septembre 2026');
  assert.equal(dates.formatFullDate('2026-09-16'), '16 septembre 2026');
});

test('period ranges cover whole weeks starting on Monday', () => {
  assert.deepEqual(Object.values(dates.getCalendarPeriodRange('month', '2026-09-16')).map(ymd), ['2026-08-31', '2026-10-04']);
  assert.deepEqual(Object.values(dates.getCalendarPeriodRange('week', '2026-09-20')).map(ymd), ['2026-09-14', '2026-09-20']);
  assert.deepEqual(Object.values(dates.getCalendarPeriodRange('day', '2026-09-16')).map(ymd), ['2026-09-16', '2026-09-16']);
  assert.equal(ymd(dates.startOfWeek('2026-09-20')), '2026-09-14');
  assert.equal(ymd(dates.endOfWeek('2026-09-14')), '2026-09-20');
});

test('period navigation and titles follow the view', () => {
  assert.equal(ymd(dates.getNextPeriod('2026-01-31', 'month')), '2026-02-01');
  assert.equal(ymd(dates.getPreviousPeriod('2026-01-31', 'month')), '2025-12-01');
  assert.equal(ymd(dates.getNextPeriod('2026-09-16', 'week')), '2026-09-23');
  assert.equal(ymd(dates.getPreviousPeriod('2026-09-16', 'week')), '2026-09-09');
  assert.equal(ymd(dates.getNextPeriod('2026-12-31', 'day')), '2027-01-01');
  assert.equal(ymd(dates.getPreviousPeriod('2026-03-01', 'day')), '2026-02-28');
  assert.equal(dates.getPeriodTitle('month', '2026-09-16'), 'Septembre 2026');
  assert.equal(dates.getPeriodTitle('week', '2026-09-16'), 'Semaine du 14 septembre 2026');
  assert.equal(dates.getPeriodTitle('day', '2026-09-16'), '16 septembre 2026');
});

test('buildCreateInitialValues prefills a one-hour slot', () => {
  assert.deepEqual(dates.buildCreateInitialValues('2026-09-16'), { date: '16-09-2026', endDate: '', startTime: '09:00', endTime: '10:00' });
  assert.deepEqual(dates.buildCreateInitialValues(new Date(2026, 8, 16), '23:30'), { date: '16-09-2026', endDate: '', startTime: '23:30', endTime: '00:30' });
});

test('eventOccursOnDate handles multi-day events and daily, weekly and monthly recurrences', () => {
  const multiDay = { id: 1, title: 'Salon', date: '2026-09-16', endDate: '2026-09-18' };
  assert.equal(eventOccursOnDate(multiDay, '2026-09-17'), true);
  assert.equal(eventOccursOnDate(multiDay, '2026-09-19'), false);

  const daily = { id: 2, title: 'Point', date: '2026-09-01', recurrence: { frequency: 'daily', interval: 2, endsOn: '2026-09-09' } };
  assert.equal(eventOccursOnDate(daily, '2026-09-05'), true);
  assert.equal(eventOccursOnDate(daily, '2026-09-06'), false);
  assert.equal(eventOccursOnDate(daily, '2026-09-11'), false);
  assert.equal(eventOccursOnDate(daily, '2026-08-30'), false);

  const weekly = { id: 3, title: 'Marché', date: '2026-09-02', recurrence: { frequency: 'weekly', interval: 1, daysOfWeek: [3, 6] } };
  assert.equal(eventOccursOnDate(weekly, '2026-09-12'), true);
  assert.equal(eventOccursOnDate(weekly, '2026-09-13'), false);
  const weeklyDefault = { id: 4, title: 'Permanence', date: '2026-09-02', recurrence: { frequency: 'weekly', interval: 2 } };
  assert.equal(eventOccursOnDate(weeklyDefault, '2026-09-16'), true);
  assert.equal(eventOccursOnDate(weeklyDefault, '2026-09-09'), false);

  const monthly = { id: 5, title: 'Conseil', date: '2026-01-15', recurrence: { frequency: 'monthly', interval: 3 } };
  assert.equal(eventOccursOnDate(monthly, '2026-04-15'), true);
  assert.equal(eventOccursOnDate(monthly, '2026-05-15'), false);
  assert.equal(eventOccursOnDate({ ...monthly, recurrence: { frequency: 'none' } }, '2026-04-15'), false);
});

test('buildStats counts occurrences for the month, the week and the selected day', () => {
  const events = [
    { id: 1, title: 'A', date: '2026-09-16' },
    { id: 2, title: 'B', date: '2026-09-14', endDate: '2026-09-15' },
    { id: 3, title: 'C', date: '2026-09-01', recurrence: { frequency: 'weekly', daysOfWeek: [3] } },
  ];

  // Mois : A + B sur 2 jours + C le mardi 1er (date de base) et les 5 mercredis.
  assert.deepEqual(buildStats(events, new Date(2026, 8, 16)), [
    { label: 'Ce mois', value: '9 événements' },
    { label: 'Cette semaine', value: '4 événements' },
    { label: "Aujourd'hui", value: '2 événements' },
  ]);
  assert.equal(buildStats([], new Date(2026, 8, 16))[2].value, '0 événement');
});

test('event colours and assignee resolution', () => {
  assert.equal(getEventColor('ceremony'), 'bg-[#fff5d8] text-[#8a5d00]');
  assert.equal(getEventColor('unknown'), getEventColor('other'));
  assert.equal(getEventColor(), getEventColor('other'));
  const people = [{ id: 7, name: 'Alice' }, { id: 'user-3', name: 'Marie' }];
  assert.deepEqual(resolveAssignees(['7', 'user-3', 'missing'], people), people);
});

test('navigation opens other fronts in the browser and module pages with the router', () => {
  const window = installWindow();
  setBrowserFrontUrls({ PROJECT_FRONT_URL: 'https://projects.mairie.test/' });
  const pushed = [];
  try {
    navigation.navigateToPage('profile', (href) => pushed.push(href));
    navigation.navigateToPage('settings', (href) => pushed.push(href));
    navigation.navigateToPage('unknown', (href) => pushed.push(href));
    assert.deepEqual(pushed, ['/profile']);

    navigation.navigateToPage('projects', (href) => pushed.push(href));
    assert.deepEqual(pushed, ['/profile']);
    assert.deepEqual(window.location.assigned, ['https://projects.mairie.test/']);
    assert.equal(navigation.getNavigationHref('profile'), '/profile');
    assert.equal(navigation.appSidebarItems.find((item) => item.id === 'admin').adminOnly, true);
    assert.equal(navigation.appSidebarItems.some((item) => item.id === 'profile'), false);
    assert.equal(navigation.appSidebarItems.filter((item) => item.id === 'settings').length, 1);
  } finally {
    delete global.window;
  }
});
