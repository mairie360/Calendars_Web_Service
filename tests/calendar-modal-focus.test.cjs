const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');
const { manageCalendarModalFocus } = loadTs('app/calendar/_components/modal-focus');

// DOM doubles exercise the controller; real desktop/mobile QA verifies React refs and browser focus.
function surface() {
  let notify;
  const listeners = new Map();
  const doc = { activeElement: null, addEventListener: (k, f) => listeners.set(k, f), removeEventListener: k => listeners.delete(k) };
  class Element {
    constructor(parent = null) { this.parent = parent; this.ownerDocument = doc; this.isConnected = true; this.tabIndex = 0; this.attributes = new Map(); this.items = []; }
    contains(node) { for (; node; node = node.parent) if (node === this) return true; return false; }
    focus() { doc.activeElement = this; listeners.get('focusin')?.(); }
    matches() { return Boolean(this.disabled); }
    closest() { return this.hidden ? this : null; }
    getClientRects() { return this.noRect ? [] : [{}]; }
    getAttribute(k) { return this.attributes.get(k) ?? null; }
    setAttribute(k, v) { this.attributes.set(k, v); }
    removeAttribute(k) { this.attributes.delete(k); }
    querySelectorAll() { return this.items; }
    querySelector() { return this.modal ?? null; }
    addEventListener(k, f) { this[k] = f; }
    removeEventListener(k) { delete this[k]; }
  }
  class Observer {
    constructor(f) { notify = f; }
    observe() {}
    disconnect() { notify = null; }
  }
  doc.defaultView = { HTMLElement: Element, MutationObserver: Observer, getComputedStyle: e => ({display: e.display ?? 'block', visibility: e.visibility ?? 'visible'}) };
  doc.body = new Element();
  const opener = new Element(doc.body), fallback = new Element(doc.body), outside = new Element(doc.body);
  const container = new Element(doc.body), modal = new Element(container);
  const first = new Element(modal), middle = new Element(modal), last = new Element(modal);
  container.modal = modal; modal.items = [first, middle, last];
  doc.querySelector = () => fallback;
  doc.activeElement = opener;
  const key = (key = 'Tab', shiftKey = false, extra = {}) => {
    const event = {key, shiftKey, prevented: false, preventDefault() { this.prevented = true; }, ...extra};
    container.keydown?.(event); return event;
  };
  return {doc, opener, fallback, outside, container, modal, first, middle, last, key, listeners, notify: () => notify?.(), Element};
}

test('opening focuses a real control, wraps both boundaries and retains normal interior Tab', () => {
  const s = surface(); const stop = manageCalendarModalFocus(s.container);
  assert.equal(s.doc.activeElement, s.first);
  assert.equal(s.key('Tab', true).prevented, true); assert.equal(s.doc.activeElement, s.last);
  assert.equal(s.key().prevented, true); assert.equal(s.doc.activeElement, s.first);
  s.middle.focus(); assert.equal(s.key().prevented, false); assert.equal(s.doc.activeElement, s.middle);
  stop(); assert.equal(s.doc.activeElement, s.opener); assert.equal(s.listeners.size, 0); assert.equal(s.container.keydown, undefined);
});

test('disabled fieldset controls, hidden/inert controls and absent boxes are not focus targets', () => {
  const s = surface(); s.first.disabled = true; s.middle.hidden = true; s.last.noRect = true;
  const stop = manageCalendarModalFocus(s.container); assert.equal(s.doc.activeElement, s.modal);
  assert.equal(s.key().prevented, true); assert.equal(s.doc.activeElement, s.modal);
  s.last.noRect = false; s.notify(); assert.equal(s.doc.activeElement, s.modal);
  s.key(); assert.equal(s.doc.activeElement, s.last); stop();
});

test('focus cannot escape into background and pending disabled focus falls back to the dialog', () => {
  const s = surface(); const stop = manageCalendarModalFocus(s.container);
  s.outside.focus(); assert.equal(s.doc.activeElement, s.first);
  s.first.disabled = s.middle.disabled = s.last.disabled = true; s.notify();
  assert.equal(s.doc.activeElement, s.modal); s.first.disabled = false; s.key(); assert.equal(s.doc.activeElement, s.first); stop();
});

test('switching detail to edit focuses the new dialog without restoring the original opener', () => {
  const s = surface(); const stop = manageCalendarModalFocus(s.container);
  const edit = new s.Element(s.container), field = new s.Element(edit); edit.items = [field];
  s.container.modal = edit; s.doc.activeElement = s.doc.body; s.notify();
  assert.equal(s.doc.activeElement, field); assert.equal(edit.tabIndex, -1);
  stop(); assert.equal(s.doc.activeElement, s.opener);
});

test('confirmed removal uses selected-view fallback and restores original dialog attributes', () => {
  const s = surface(); s.modal.setAttribute('tabindex', '0'); const stop = manageCalendarModalFocus(s.container);
  s.opener.isConnected = false; s.doc.activeElement = s.doc.body; stop();
  assert.equal(s.doc.activeElement, s.fallback); assert.equal(s.modal.getAttribute('tabindex'), '0');
});

test('closing never steals an intentional external destination and reconnecting starts a fresh session', () => {
  const s = surface(); const stop = manageCalendarModalFocus(s.container);
  s.doc.activeElement = s.outside; stop(); assert.equal(s.doc.activeElement, s.outside);
  const second = manageCalendarModalFocus(s.container); assert.equal(s.doc.activeElement, s.first);
  second(); assert.equal(s.doc.activeElement, s.outside);
});

test('Escape, composed and already-handled keys remain owned by the published modal', () => {
  const s = surface(); const stop = manageCalendarModalFocus(s.container);
  assert.equal(s.key('Escape').prevented, false);
  assert.equal(s.key('Tab', true, {isComposing: true}).prevented, false);
  assert.equal(s.key('Tab', true, {defaultPrevented: true}).prevented, false);
  assert.equal(s.doc.activeElement, s.first); stop();
});

test('server-like documents without a window do not acquire listeners', () => {
  const stop = manageCalendarModalFocus({ownerDocument: {defaultView: null}}); assert.equal(typeof stop, 'function'); stop();
});
