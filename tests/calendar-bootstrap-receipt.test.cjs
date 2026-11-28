const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { loadTs } = require('./support/load-ts.cjs');

const root = path.resolve(__dirname, '..');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'contracts/openapi.json'), 'utf8'));
const { parseCalendarBootstrapReceipt } = loadTs('lib/calendar-bootstrap-receipt');
const { getEventColor } = loadTs('app/calendar/constants');

const bootstrap = (event) => ({
  events: [{ id: 1, title: 'Commission urbanisme', date: '2026-11-12', category: 'meeting', ...event }],
  users: {}, assignees: [], categories: [], services: [],
});

// MAIR-1256 (design-match): the projection of the bootstrap read dropped `myParticipation` and `canRespond`, so every
// meeting was painted « je participe » (solid navy) and the dashed « en attente » / struck « déclinée » pills of
// the mockup never showed, nor the answer buttons of the event details.
test('MAIR-1256 the bootstrap projection keeps the participation of a meeting', () => {
  for (const state of ['accepted', 'pending', 'declined']) {
    const [event] = parseCalendarBootstrapReceipt(bootstrap({ myParticipation: state, canRespond: true })).events;
    assert.equal(event.myParticipation, state);
    assert.equal(event.canRespond, true);
  }
  const [pending] = parseCalendarBootstrapReceipt(bootstrap({ myParticipation: 'pending' })).events;
  assert.match(getEventColor(pending.category, pending.myParticipation), /border-dashed/);
});

test('MAIR-1256 the bootstrap projection reads every event field of the pinned contract', () => {
  const properties = Object.keys(contract.components.schemas.CalendarEvent.properties);
  const source = fs.readFileSync(path.join(root, 'src/lib/calendar-bootstrap-receipt.ts'), 'utf8');
  const projected = source.match(/const dto1 = record\(\{([\s\S]*?)\}\);/)[1];
  for (const property of properties) assert.match(projected, new RegExp(`"${property}":`), `CalendarEvent.${property} is dropped by the projection`);
});

// MAIR-1256 (design-match): without the lib dist in the Tailwind sources, the `sm:flex-row` of the lib PageHeader came
// before the front's own `flex-col` and lost: the calendar title row stacked its buttons under a centred title.
test('MAIR-1256 Tailwind scans the lib components so their responsive utilities win', () => {
  const css = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8');
  assert.match(css, /@source "\.\.\/\.\.\/node_modules\/@mairie360\/lib-components\/dist\/";/);
});
