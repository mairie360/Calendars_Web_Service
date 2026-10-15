const assert = require('node:assert/strict');
const { test } = require('node:test');
const { JSDOM } = require('jsdom');
const React = require('react');
const { createRoot } = require('react-dom/client');
const { loadTs } = require('./support/load-ts.cjs');
const { useCalendarTodayMarker } = loadTs('app/calendar/_components/use-calendar-today-marker');

test('the actual today hook marks the mounted grid, replaces period timers and cleans up on unmount', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 9, 15, 12).getTime() });
  const dom = new JSDOM('<div id="root"></div>');
  const previous = { window:global.window, document:global.document, act:global.IS_REACT_ACT_ENVIRONMENT };
  global.window = dom.window; global.document = dom.window.document; global.IS_REACT_ACT_ENVIRONMENT = true;
  let sequence = 0; const timers = new Map(); const cancelled = [];
  dom.window.setTimeout = (callback, delay) => { timers.set(++sequence, { callback, delay }); return sequence; };
  dom.window.clearTimeout = id => { cancelled.push(id); timers.delete(id); };
  function Probe({ view, period }) {
    const ref = useCalendarTodayMarker(view, period);
    return React.createElement('div', { ref },
      React.createElement('button', { 'aria-label':'Sélectionner le 15 Octobre 2026' }, '15'),
      React.createElement('button', { 'aria-label':'Sélectionner le 16 Octobre 2026' }, '16'));
  }
  const root = createRoot(document.getElementById('root'));
  let unmounted = false;
  try {
    await React.act(async () => root.render(React.createElement(Probe, { view:'month', period:1 })));
    const [today, tomorrow] = document.querySelectorAll('button');
    assert.equal(today.getAttribute('aria-current'), 'date'); assert.equal(tomorrow.getAttribute('aria-current'), null);
    assert.equal(timers.size, 1); assert.ok([...timers.values()][0].delay > 0);
    await React.act(async () => root.render(React.createElement(Probe, { view:'month', period:1 })));
    assert.equal(sequence, 1, 'unchanged period must not restart the observer');
    await React.act(async () => root.render(React.createElement(Probe, { view:'week', period:2 })));
    assert.deepEqual(cancelled, [1]); assert.equal(timers.size, 1);
    t.mock.timers.setTime(new Date(2026, 9, 16, 0, 0, 1).getTime());
    const [nextId, next] = [...timers.entries()][0];
    timers.delete(nextId);
    await React.act(async () => next.callback());
    assert.equal(today.getAttribute('aria-current'), null); assert.equal(tomorrow.getAttribute('aria-current'), 'date');
    await React.act(async () => root.unmount()); unmounted = true;
    assert.ok(cancelled.includes(3)); assert.equal(timers.size, 0);
  } finally {
    if (!unmounted) await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, value] of Object.entries({ window:previous.window, document:previous.document, IS_REACT_ACT_ENVIRONMENT:previous.act })) value === undefined ? delete global[key] : global[key] = value;
  }
});
