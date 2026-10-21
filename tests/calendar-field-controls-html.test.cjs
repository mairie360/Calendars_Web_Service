const assert = require('node:assert/strict');
const { test, afterEach } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');
const { installReactRuntime, mount, stubModule } = require('./support/server-view.cjs');

// MAIR-607: the date field and the assignee select came back from the library with
// their jsdom tests (tests/component/calendar). The Node environment owns coverage,
// so their open states are exercised here too; portals render inline.
// Both controls listen on window while open; the runner decorates this stand-in with the browser globals.
globalThis.window ??= {};
installReactRuntime();
stubModule('react-dom', { createPortal: (children) => children });
const React = require('react');
const { CalendarDateField, EventAssigneeSelect } = loadTs('components/calendar/index.ts');

let view;
afterEach(() => {
  view?.unmount();
  view = undefined;
});
const byAriaLabel = (label) => (props) => props['aria-label'] === label;

test('MAIR-607 the date field opens its month popover, navigates months and reports a picked or typed date', async () => {
  const changes = [];
  view = mount(React.createElement(CalendarDateField, { label: 'Date de début', value: '16-09-2026', onChange: (value) => changes.push(value) }));
  assert.match(view.html, /value="16-09-2026"|value="2026-09-16"/);
  assert.doesNotMatch(view.text(), /Mois suivant/);
  await view.click(byAriaLabel('Ouvrir le calendrier pour Date de début'));
  assert.match(view.text(), /septembre 2026/i);
  await view.click(byAriaLabel('Mois suivant'));
  assert.match(view.text(), /octobre 2026/i);
  await view.click(byAriaLabel('Mois précédent'));
  assert.match(view.text(), /septembre 2026/i);
  await view.click((props, text) => typeof props['aria-label'] === 'string' && props['aria-label'].startsWith('Choisir le') && text.trim() === '17');
  assert.deepEqual(changes, ['17-09-2026']);
  await view.fire((props, _text, tag) => tag === 'input' && typeof props.onChange === 'function', 'onChange', { target: { value: '18/09/2026' } });
  assert.deepEqual(changes, ['17-09-2026', '18-09-2026']);
});

test('MAIR-607 the assignee select lists, filters, toggles and removes people', async () => {
  const people = [
    { id: 'u1', name: 'Marie Martin', role: 'Urbanisme' },
    { id: 'u2', name: 'Jean Dupont', role: 'Voirie' },
    { id: 'u3', name: 'Léa Bernard', role: 'Culture' },
  ];
  const changes = [];
  view = mount(React.createElement(EventAssigneeSelect, { label: 'Participants', people, value: [], onChange: (value) => changes.push(value) }));
  assert.match(view.text(), /Sélectionner des personnes/);
  assert.doesNotMatch(view.html, /role="option"/);
  await view.click((props) => props['aria-haspopup'] === 'listbox');
  assert.equal((view.html.match(/role="option"/g) || []).length, 3);
  await view.fire((props, _text, tag) => tag === 'input' && typeof props.onChange === 'function', 'onChange', { target: { value: 'mar' } });
  assert.equal((view.html.match(/role="option"/g) || []).length, 1);
  assert.match(view.text(), /Marie Martin/);
  await view.click((props, text) => props.role === 'option' && /Marie Martin/.test(text));
  assert.deepEqual(changes, [['u1']]);
  view.unmount();
  view = mount(React.createElement(EventAssigneeSelect, { label: 'Participants', people, value: ['u1', 'u2'], onChange: (value) => changes.push(value) }));
  assert.match(view.text(), /2 personnes sélectionnées/);
  await view.click(byAriaLabel('Retirer Jean Dupont'));
  assert.deepEqual(changes.at(-1), ['u1']);
  view.unmount();
  view = mount(React.createElement(EventAssigneeSelect, { label: 'Participants', people: [], value: [], disabled: true }));
  assert.match(view.html, /disabled=""/);
  view = undefined;
});
