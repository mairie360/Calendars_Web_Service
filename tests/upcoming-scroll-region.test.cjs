const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');

const { prepareUpcomingScrollRegion } = loadTs('components/CalendarPage/upcoming-scroll-region');

test('MAIR-1222 the upcoming-events list is a keyboard-scrollable region named apart from its « À venir » panel', () => {
  const attributes = {};
  const region = { tabIndex: -1, setAttribute(name, value) { attributes[name] = value; } };
  const board = {
    querySelector(selector) {
      assert.equal(selector, '.calendar-sidebar > .calendar-upcoming-panel > div');
      return region;
    },
  };

  prepareUpcomingScrollRegion(board);
  assert.equal(region.tabIndex, 0);
  // RGAA 9.2: two landmarks never share a name; the panel around it is already « À venir ».
  assert.deepEqual(attributes, { role: 'region', 'aria-label': 'Liste des événements à venir' });
});

test('missing or unmounted sidebar does not fail', () => {
  prepareUpcomingScrollRegion(null);
  prepareUpcomingScrollRegion({ querySelector() { return null; } });
});
