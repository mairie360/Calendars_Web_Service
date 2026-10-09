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

test('real calendar sidebar applies reference position, shadow and seven command row styles', async (t) => {
  const dom = await calendarDom(t), sidebar = dom.document.querySelector('aside[aria-label="Navigation principale"]');
  const computed = dom.style(sidebar);
  assert.equal(computed.position, 'relative'); assert.equal(computed.zIndex, '20');
  assert.deepEqual(shadow(dom.window, computed.boxShadow), [{ lengths: [8, 0, 24, 0], color: 'rgba(12, 28, 48, 0.28)' }]);
  const commands = [...sidebar.querySelectorAll('nav button')];
  assert.deepEqual(commands.map((button) => button.textContent), ['Tableau de bord', 'Projets', 'Messagerie', 'Formation', 'Calendrier', 'Administration', 'Paramètres']);
  for (const button of commands) {
    assert.equal(dom.style(button).minHeight, '44px'); assert.equal(dom.style(button).flexShrink, '0');
  }
});

test('real calendar drawer applies its lower sidebar layer and closes through its published command', async (t) => {
  const dom = await calendarDom(t);
  await dom.click(dom.button('Ouvrir la navigation'));
  const drawer = dom.document.querySelector('[role="dialog"][aria-label="Navigation mobile"]');
  assert.ok(drawer);
  assert.equal(dom.style(drawer.querySelector('aside')).zIndex, '0');
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

test('actual shell and supplied density contexts apply reference typography, insets and scroll styles', async (t) => {
  const dom = await calendarDom(t), main = dom.document.querySelector('main');
  assert.equal(dom.style(dom.document.documentElement).fontSize, '17px');
  assert.equal(dom.style(dom.document.body).fontFamily, 'system-ui, sans-serif');
  assert.equal(dom.style(main).padding, '28px');
  assert.equal(dom.style(main).overflowY, 'auto'); assert.equal(dom.style(main).overflowX, 'hidden');
  const shell = dom.document.querySelector('.calendar-scroll-shell');
  assert.equal(dom.style(shell).height, '100dvh'); assert.equal(dom.style(shell).overflow, 'hidden');
  assert.equal(Number.parseFloat(dom.style(shell.querySelector(':scope > div')).minHeight), 0);
  assert.equal(dom.style(dom.document.querySelector('aside').closest('.hidden')).overflowY, 'auto');
  assert.equal(Number.parseFloat(dom.style(main.parentElement).minHeight), 0);
  for (const [density, padding] of [['compact', '16px'], ['comfortable', '32px']]) {
    dom.document.documentElement.setAttribute('data-settings-density', density);
    assert.equal(dom.style(main).padding, padding);
  }
  // Supplying the CSS context does not verify settings persistence or breakpoint layout.
});

test('real cards reference the consumer shadow token and supplied light/dark contexts change its declaration', async (t) => {
  const dom = await calendarDom(t);
  const cards = [...dom.document.querySelectorAll('.calendar-board > section, .calendar-sidebar > section')];
  assert.ok(cards.length >= 3);
  for (const card of cards) assert.equal(dom.style(card).boxShadow, 'var(--calendar-card-shadow)');
  const token = () => shadow(dom.window, dom.style(dom.document.documentElement).getPropertyValue('--calendar-card-shadow'));
  assert.deepEqual(token(), [
    { lengths: [0, 5, 15, 0], color: 'rgba(23, 32, 51, 0.14)' },
    { lengths: [0, 1, 3, 0], color: 'rgba(23, 32, 51, 0.12)' },
  ]);
  dom.document.documentElement.setAttribute('data-theme', 'dark');
  assert.deepEqual(token(), [
    { lengths: [0, 6, 20, 0], color: 'rgba(0, 0, 0, 0.35)' },
    { lengths: [0, 1, 4, 0], color: 'rgba(0, 0, 0, 0.3)' },
  ]);
  // JSDOM retains the variable reference; native rendering and settings persistence are separate.
});

test('real page marks today after bootstrap, keeps selection independent and reattaches in week view', async (t) => {
  const dom = await calendarDom(t);
  const today = () => [...dom.document.querySelectorAll('button[aria-current="date"]')];
  assert.deepEqual(today().map((button) => button.getAttribute('aria-label')), ['Sélectionner le 9 Octobre 2026']);
  assert.equal(dom.style(today()[0]).borderTopWidth, '2px');
  assert.equal(dom.style(today()[0]).borderTopStyle, 'dashed');
  assert.equal(dom.style(today()[0]).borderTopColor, 'rgb(15, 118, 110)');
  const other = dom.button('Sélectionner le 8 Octobre 2026');
  const beforeOther = other.className, beforeToday = today()[0].className;
  await dom.click(other);
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
