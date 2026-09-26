const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { loadTs, SRC } = require('./support/load-ts.cjs');

const {
  markTodayInGrid,
  millisecondsUntilTomorrow,
  observeTodayInGrid,
} = loadTs('app/calendar/_components/today-marker');

function dateButton(label) {
  const attributes = new Map([['aria-label', label]]);
  return {
    getAttribute(name) { return attributes.get(name) ?? null; },
    setAttribute(name, value) { attributes.set(name, value); },
    removeAttribute(name) { attributes.delete(name); },
  };
}

function grid(buttons) {
  return {
    querySelectorAll(selector) {
      assert.equal(selector, 'button[aria-label^="Sélectionner le "]');
      return buttons;
    },
  };
}

test('month and week date controls mark today independently of selection', () => {
  const yesterday = dateButton('Sélectionner le 25 Septembre 2026');
  const today = dateButton('Sélectionner le 26 Septembre 2026');
  const tomorrow = dateButton('Sélectionner le 27 Septembre 2026');
  yesterday.setAttribute('aria-selected', 'true');

  assert.equal(markTodayInGrid(grid([yesterday, today, tomorrow]), new Date(2026, 8, 26, 12)), true);
  assert.equal(today.getAttribute('aria-current'), 'date');
  assert.equal(yesterday.getAttribute('aria-current'), null);
  assert.equal(yesterday.getAttribute('aria-selected'), 'true');
});

test('an out-of-period date never leaves a stale today marker', () => {
  const oldToday = dateButton('Sélectionner le 26 Septembre 2026');
  oldToday.setAttribute('aria-current', 'date');

  assert.equal(markTodayInGrid(grid([oldToday]), new Date(2026, 9, 1, 12)), false);
  assert.equal(oldToday.getAttribute('aria-current'), null);
  assert.equal(markTodayInGrid(null, new Date(2026, 9, 1)), false);
});

test('local midnight changes the marked day and cleanup cancels the timer', () => {
  const first = dateButton('Sélectionner le 26 Septembre 2026');
  const next = dateButton('Sélectionner le 27 Septembre 2026');
  const beforeMidnight = new Date(2026, 8, 26, 23, 59, 59, 900);
  const afterMidnight = new Date(2026, 8, 27, 0, 0, 0, 10);
  let instant = beforeMidnight;
  let scheduled;
  let cancelled;
  let id = 0;

  const stop = observeTodayInGrid(
    grid([first, next]),
    () => instant,
    (callback, delay) => { scheduled = { callback, delay, id: ++id }; return id; },
    (timer) => { cancelled = timer; },
  );

  assert.equal(first.getAttribute('aria-current'), 'date');
  assert.equal(next.getAttribute('aria-current'), null);
  assert.equal(scheduled.delay, millisecondsUntilTomorrow(beforeMidnight));
  assert.equal(scheduled.delay, 150);

  instant = afterMidnight;
  scheduled.callback();
  assert.equal(first.getAttribute('aria-current'), null);
  assert.equal(next.getAttribute('aria-current'), 'date');

  const stale = scheduled;
  stop();
  assert.equal(cancelled, stale.id);
  stale.callback();
  assert.equal(id, stale.id);
});

test('page integration and styling target date controls without changing event data', () => {
  const page = fs.readFileSync(path.join(SRC, 'app/page.tsx'), 'utf8');
  const css = fs.readFileSync(path.join(SRC, 'app/app-overrides.css'), 'utf8');

  assert.match(page, /useCalendarTodayMarker\(calendar\.view, calendar\.currentDate\.getTime\(\)\)/);
  assert.match(page, /className="calendar-grid-viewport mt-9" ref=\{gridRef\}/);
  assert.match(css, /button\[aria-current="date"\]\[aria-label\^="Sélectionner le "\]/);
});
