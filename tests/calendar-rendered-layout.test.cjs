const assert = require('node:assert/strict');
const { test } = require('node:test');
const { calendarDom } = require('./support/calendar-dom.cjs');

function shadow(window, value) {
  return value.split(/,(?![^()]*\))/).map((part) => {
    const tokens = part.trim().split(/\s+(?![^()]*\))/);
    const lengths = tokens.filter((token) => Number.isFinite(Number.parseFloat(token)));
    const colors = tokens.filter((token) => !Number.isFinite(Number.parseFloat(token)));
    assert.ok([3, 4].includes(lengths.length));
    assert.equal(colors.length, 1);
    const pixels = lengths.map((token) => {
      const number = Number.parseFloat(token);
      assert.ok(number === 0 || token.endsWith('px'));
      return number;
    });
    if (pixels.length === 3) pixels.push(0);
    const color = window.document.createElement('span');
    color.style.color = colors[0]; window.document.body.append(color);
    try { return { lengths: pixels, color: window.getComputedStyle(color).color }; }
    finally { color.remove(); }
  });
}

test('MAIR-879: the shared lib-components 2 frame is not reshaped by calendar rules', async (t) => {
  const dom = await calendarDom(t);
  const navigation = dom.document.querySelector('aside.app-desktop-navigation[aria-label="Navigation principale"]');
  assert.ok(navigation, 'the collapsible navigation band of the lib frame is rendered');
  const commands = [...navigation.querySelectorAll('nav button')];
  assert.deepEqual(commands.map((button) => button.getAttribute('aria-label')), ['Tableau de bord', 'Projets', 'Messagerie', 'Formation', 'Calendrier', 'Administration', 'Paramètres']);
  assert.equal(dom.document.querySelector('.calendar-scroll-shell'), null);
  assert.ok(dom.document.querySelector('.app-shell-frame > .app-shell-body'));
  assert.ok(dom.document.querySelector('.app-shell-footer > footer'));
});

test('real calendar drawer opens the shared sidebar and closes through its published command', async (t) => {
  const dom = await calendarDom(t);
  await dom.click(dom.button('Ouvrir la navigation'));
  const drawer = dom.document.querySelector('[role="dialog"][aria-label="Navigation mobile"]');
  assert.ok(drawer);
  assert.ok(drawer.querySelector('aside'));
  await dom.click(dom.button('Fermer la navigation'));
  assert.equal(dom.document.querySelector('[role="dialog"][aria-label="Navigation mobile"]'), null);
});

test('real month and week grids retain bounded tracks and consumer event-title clipping', async (t) => {
  const dom = await calendarDom(t);
  const board = dom.document.querySelector('.calendar-board');
  assert.equal(dom.style(board).gridTemplateColumns.replace(/\s+/g, ''), 'minmax(0,1fr)');
  assert.equal(dom.style(dom.document.querySelector('.calendar-grid-viewport')).overflowX, 'hidden');
  for (const view of ['Mois', 'Semaine']) {
    if (view === 'Semaine') await dom.click(dom.button(view));
    const grid = dom.document.querySelector(view === 'Mois' ? '.calendar-month-grid' : '.calendar-week-grid');
    assert.ok(grid); assert.equal(Number.parseFloat(dom.style(grid).minWidth), 0);
    const titles = [...grid.querySelectorAll('[role="button"] > div')];
    assert.ok(titles.length, 'Existing BFF fixture events must reach the actual grid');
    for (const title of titles) {
      assert.equal(dom.style(title).whiteSpace, 'nowrap'); assert.equal(dom.style(title).textOverflow, 'ellipsis');
    }
  }
});

test('real upcoming panel keeps scroll and padding styles on its prepared region', async (t) => {
  const dom = await calendarDom(t), panel = dom.document.querySelector('.calendar-upcoming-panel');
  assert.ok(panel);
  assert.equal(dom.style(dom.document.querySelector('.calendar-sidebar')).gridTemplateColumns.replace(/\s+/g, ''), 'minmax(0,1fr)');
  const region = panel.querySelector(':scope > div');
  assert.equal(region.getAttribute('tabindex'), '0');
  assert.equal(dom.style(region).overflowY, 'auto');
  assert.equal(dom.style(region).paddingInline, '1.25rem');
  assert.equal(dom.style(region).flexGrow, '0'); assert.equal(dom.style(region).flexShrink, '1');
  assert.equal(dom.style(region).flexBasis, 'auto');
});

test('MAIR-879: the lib main area keeps its own scroll, insets and typography', async (t) => {
  const dom = await calendarDom(t), main = dom.document.querySelector('main');
  assert.ok(main.classList.contains('app-shell-main'));
  assert.notEqual(dom.style(dom.document.documentElement).fontSize, '17px', 'no calendar-only root font size');
  assert.notEqual(dom.style(dom.document.body).fontFamily, 'system-ui, sans-serif', 'no calendar-only font family');
  assert.notEqual(dom.style(main).padding, '28px', 'the lib owns the main insets');
  const skip = [...dom.document.querySelectorAll('a[href]')].find(link => link.getAttribute('href') === `#${main.id}`);
  assert.ok(skip);
});

test('real cards reference the consumer shadow token in the always-light theme', async (t) => {
  const dom = await calendarDom(t);
  const cards = [...dom.document.querySelectorAll('.calendar-board > section, .calendar-sidebar > section')];
  assert.ok(cards.length >= 3);
  for (const card of cards) assert.equal(dom.style(card).boxShadow, 'var(--calendar-card-shadow)');
  const token = () => shadow(dom.window, dom.style(dom.document.documentElement).getPropertyValue('--calendar-card-shadow'));
  const light = [
    { lengths: [0, 5, 15, 0], color: 'rgba(23, 32, 51, 0.14)' },
    { lengths: [0, 1, 3, 0], color: 'rgba(23, 32, 51, 0.12)' },
  ];
  assert.deepEqual(token(), light);
  // MAIR-933 (lib 2): the fronts are always light, a dark attribute no longer swaps the calendar token.
  dom.document.documentElement.setAttribute('data-theme', 'dark');
  assert.deepEqual(token(), light);
});

test('real page marks today after bootstrap, keeps selection independent and reattaches in week view', async (t) => {
  const dom = await calendarDom(t);
  const today = () => [...dom.document.querySelectorAll('button[aria-current="date"]')];
  assert.deepEqual(today().map((button) => button.getAttribute('aria-label')), ['Sélectionner le 9 Octobre 2026']);
  assert.equal(dom.style(today()[0]).borderTopWidth, '2px');
  assert.equal(dom.style(today()[0]).borderTopStyle, 'solid');
  // MAIR-905: Today cell — the number sits on an accent pill.
  assert.match(dom.style(today()[0].querySelector('.calendar-day-number')).backgroundColor, /var\(--mairie-accent\)|rgb\(45, 120, 108\)/);
  assert.equal(dom.style(today()[0]).borderTopColor, 'rgb(45, 120, 108)' /* lib 1.2.0+ accent */);
  assert.equal(dom.style(dom.document.documentElement).getPropertyValue('--mairie-accent').trim(), '#2d786c');
  const other = dom.button('Sélectionner le 8 Octobre 2026');
  const beforeOther = other.className, beforeToday = today()[0].className;
  await dom.click(other);
  // MAIR-905 C1: a day click keeps the selection and opens « Nouvel événement » on that day, 09:00 – 10:00.
  const dialog = dom.document.querySelector('[role="dialog"]');
  assert.match(dialog?.textContent ?? '', /Nouvel événement/);
  assert.equal(dom.document.getElementById('event-date')?.value ?? dialog.querySelector('input[value="08-10-2026"]')?.value, '08-10-2026');
  await dom.click(dom.button('Annuler'));
  assert.notEqual(other.className, beforeOther, 'The real selected-day presentation changes');
  assert.notEqual(today()[0].className, beforeToday, 'The previous selection presentation clears');
  assert.equal(today()[0].getAttribute('aria-label'), 'Sélectionner le 9 Octobre 2026');
  assert.notEqual(today()[0].getAttribute('aria-selected'), 'true');
  await dom.click(dom.button('Semaine'));
  assert.ok(dom.document.querySelector('.calendar-week-grid'));
  assert.deepEqual(today().map((button) => button.getAttribute('aria-label')), ['Sélectionner le 9 Octobre 2026']);
  assert.ok(dom.front.calendarBff.requests.length);
  assert.ok(dom.front.calendarBff.requests.every((request) => request.method === 'GET'), 'View/selection changes do not invent a BFF write');
});


test('historical calendar drawer styles do not put desktop navigation into normal flow', async t => {
  const dom = await calendarDom(t);
  const navigation = dom.document.querySelector('.app-desktop-navigation');
  assert.ok(navigation);
  assert.notEqual(dom.style(navigation).position, 'relative',
    'The shared desktop navigation must not inherit the historical drawer position.');
});
