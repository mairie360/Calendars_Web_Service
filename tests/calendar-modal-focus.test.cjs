const assert = require('node:assert/strict');
const { test } = require('node:test');
const { calendarDom } = require('./support/calendar-dom.cjs');
const React = require('react');
const { calendarEvent, apiError } = require('./support/calendar-fixtures.cjs');

const dialog = dom => dom.document.querySelector('.calendar-validated-modal [role="dialog"]');
const enabled = scope => [...scope.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea, [tabindex]')]
  .filter(node => node.tabIndex >= 0 && !node.matches(':disabled') && !node.closest('[hidden], [aria-hidden="true"], [inert]'));
function press(dom, node, key, shiftKey = false) {
  const event = new dom.window.KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true });
  node.dispatchEvent(event); return event;
}
async function openEvent(dom) {
  const opener = [...dom.document.querySelectorAll('.calendar-month-grid [role="button"]')].find(node => node.textContent.includes('Événement 5'));
  assert.ok(opener, 'The real BFF event must appear in the grid');
  opener.focus(); await dom.click(opener);
  assert.ok(dialog(dom)); return opener;
}

test('opening the real event details moves focus inside, cycles Tab and returns to its grid trigger', async t => {
  const dom = await calendarDom(t), opener = await openEvent(dom);
  const modal = dialog(dom);
  assert.ok(modal.contains(dom.document.activeElement), 'Focus must leave the background event trigger when its modal opens');
  const items = enabled(modal); assert.ok(items.length > 1);
  const first = items[0], last = items.at(-1);
  last.focus(); assert.equal(press(dom, last, 'Tab').defaultPrevented, true);
  assert.equal(dom.document.activeElement, first);
  assert.equal(press(dom, first, 'Tab', true).defaultPrevented, true);
  assert.equal(dom.document.activeElement, last);
  await dom.click(modal.querySelector('button[aria-label="Fermer"]'));
  assert.equal(dialog(dom), null); assert.equal(dom.document.activeElement, opener);
});

test('replacing event details with the actual editor re-evaluates the focus scope and Escape restores the grid trigger', async t => {
  const dom = await calendarDom(t), opener = await openEvent(dom), details = dialog(dom);
  const edit = [...details.querySelectorAll('button')].find(node => node.textContent.trim() === 'Modifier');
  assert.ok(edit); edit.focus(); await dom.click(edit);
  const editor = dialog(dom); assert.notEqual(editor, details);
  assert.ok(editor.querySelector('#event-title'));
  await dom.waitFor(() => editor.contains(dom.document.activeElement));
  const items = enabled(editor); items.at(-1).focus(); press(dom, items.at(-1), 'Tab');
  assert.equal(dom.document.activeElement, items[0]);
  await React.act(async () => press(dom, dom.document.activeElement, 'Escape'));
  await dom.waitFor(() => dialog(dom) === null);
  assert.equal(dom.document.activeElement, opener);
});

test('opening and cancelling creation preserves its real command as the keyboard return target', async t => {
  const dom = await calendarDom(t), opener = dom.button('Nouvel événement');
  opener.focus(); await dom.click(opener);
  const modal = dialog(dom); assert.ok(modal.contains(dom.document.activeElement));
  const cancel = [...modal.querySelectorAll('button')].find(node => node.textContent.trim() === 'Annuler');
  assert.ok(cancel); await dom.click(cancel);
  assert.equal(dialog(dom), null); assert.equal(dom.document.activeElement, opener);
});

for (const status of [200, 503]) test(`a pending edit preserves busy dismissal rules and a late ${status} cannot steal focus from another control`, async t => {
  const dom = await calendarDom(t); await openEvent(dom);
  let finish;
  dom.front.calendarBff.on('patch', '/calendar/events/{id}', () => new Promise(resolve => {
    finish = () => resolve(status === 200 ? { body: calendarEvent(5) } : { status, body: apiError('SERVICE_UNAVAILABLE', 'Save refused') });
  }));
  let modal = dialog(dom);
  const edit = [...modal.querySelectorAll('button')].find(node => node.textContent.trim() === 'Modifier');
  edit.focus(); await dom.click(edit);
  await dom.waitFor(() => dialog(dom).contains(dom.document.activeElement));
  modal = dialog(dom);
  const save = [...modal.querySelectorAll('button')].find(node => node.textContent.trim() === 'Enregistrer');
  assert.ok(save); save.focus(); await dom.click(save);
  await dom.waitFor(() => finish && dialog(dom)?.closest('fieldset')?.disabled);
  const pending = dialog(dom);
  await React.act(async () => press(dom, dom.document.activeElement, 'Escape'));
  assert.equal(dialog(dom), pending, 'Escape must retain an in-flight submitted draft');
  // Native disabled controls may blur to body while the entire form is busy.
  dom.document.activeElement.blur();
  assert.equal(dom.document.activeElement, dom.document.body);
  assert.equal(press(dom, dom.document.body, 'Tab').defaultPrevented, true);
  assert.ok(pending.contains(dom.document.activeElement));
  const elsewhere = dom.button('Nouvel événement'); elsewhere.focus();
  await React.act(async () => finish());
  await dom.waitFor(() => status === 200 ? dialog(dom) === null : dialog(dom)?.textContent.includes('Save refused'));
  assert.equal(dom.document.activeElement, elsewhere, 'A settled asynchronous response must preserve the user’s newer focus');
  assert.equal(dom.front.calendarBff.calls('/calendar/events/{id}', 'PATCH').length, 1);
});

test('a nested dialog uses its own Tab scope and restores the control inside its parent', async t => {
  const dom = await calendarDom(t); await openEvent(dom);
  const parent = dialog(dom), trigger = enabled(parent).at(-1);
  trigger.focus();
  const nested = dom.document.createElement('div');
  nested.setAttribute('role', 'dialog'); nested.setAttribute('aria-modal', 'true');
  const first = dom.document.createElement('button'), last = dom.document.createElement('button');
  first.textContent = 'Nested first'; last.textContent = 'Nested last'; nested.append(first, last);
  await React.act(async () => parent.append(nested));
  await dom.waitFor(() => nested.contains(dom.document.activeElement));
  last.focus(); press(dom, last, 'Tab'); assert.equal(dom.document.activeElement, first);
  press(dom, first, 'Tab', true); assert.equal(dom.document.activeElement, last);
  await React.act(async () => nested.remove());
  await dom.waitFor(() => dom.document.activeElement === trigger);
});

test('a dialog with its own focus and Tab handler remains authoritative and can restore a newer target', async t => {
  const dom = await calendarDom(t), opener = dom.button('Nouvel événement'); opener.focus();
  const modern = dom.document.createElement('div');
  modern.setAttribute('role', 'dialog'); modern.setAttribute('aria-modal', 'true');
  const first = dom.document.createElement('button'), preferred = dom.document.createElement('button');
  first.textContent = 'First'; preferred.textContent = 'Preferred initial focus'; modern.append(first, preferred);
  modern.addEventListener('keydown', event => { if (event.key === 'Tab') event.preventDefault(); });
  await React.act(async () => {
    dom.document.querySelector('.app-shell-frame').append(modern);
    preferred.focus();
  });
  await dom.waitFor(() => dom.document.querySelector('.app-skip-link').hasAttribute('inert'));
  assert.equal(dom.document.activeElement, preferred, 'The shared scope must preserve an existing initial focus');
  assert.equal(press(dom, preferred, 'Tab').defaultPrevented, true);
  assert.equal(dom.document.activeElement, preferred, 'An already handled Tab must not be handled again');
  const newerTarget = dom.button('Semaine');
  await React.act(async () => { modern.remove(); newerTarget.focus(); });
  assert.equal(dom.document.activeElement, newerTarget, 'The dialog’s own connected return target must win');
});

test('deleting the event does not attempt to restore focus onto its disconnected grid trigger', async t => {
  const dom = await calendarDom(t), opener = await openEvent(dom);
  const restore = t.mock.method(opener, 'focus');
  dom.front.calendarBff.on('delete', '/calendar/events/{id}', { status: 204 });
  const remove = [...dialog(dom).querySelectorAll('button')].find(node => node.textContent.trim() === 'Supprimer');
  assert.ok(remove); remove.focus(); await dom.click(remove);
  await dom.waitFor(() => dialog(dom) === null);
  assert.equal(opener.isConnected, false); assert.equal(restore.mock.callCount(), 0);
  assert.equal(dom.front.calendarBff.calls('/calendar/events/{id}', 'DELETE').length, 1);
});
