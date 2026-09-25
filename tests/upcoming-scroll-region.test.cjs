const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');

const { prepareUpcomingScrollRegion } = loadTs('app/calendar/_components/upcoming-scroll-region');

test('the upcoming-events list is a named keyboard-scrollable region', () => {
  const attributes = {};
  const region = { tabIndex: -1, setAttribute(name, value) { attributes[name] = value; } };
  const board = {
    querySelector(selector) {
      assert.equal(selector, '.calendar-sidebar > section:first-child > div');
      return region;
    },
  };

  prepareUpcomingScrollRegion(board);
  assert.equal(region.tabIndex, 0);
  assert.deepEqual(attributes, { role: 'region', 'aria-label': 'Événements à venir' });
});

test('missing or unmounted sidebar does not fail', () => {
  prepareUpcomingScrollRegion(null);
  prepareUpcomingScrollRegion({ querySelector() { return null; } });
});
