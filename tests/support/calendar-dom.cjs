const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { FrontHarness, jwtFor } = require('./front-harness.cjs');
const { loadTs, SRC } = require('./load-ts.cjs');
const fixture = require('./calendar-fixtures.cjs');

/** Mount the actual page and published components with real React hooks and existing contract mocks. */
async function calendarDom(t) {
  const keys = ['Date', 'window', 'document', 'HTMLElement', 'Element', 'Node', 'SVGElement',
    'MutationObserver', 'Event', 'MouseEvent', 'KeyboardEvent', 'CustomEvent',
    'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
    'ResizeObserver', 'IS_REACT_ACT_ENVIRONMENT'];
  const previous = Object.fromEntries(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const RealDate = Date;
  const clock = new RealDate(2026, 9, 9, 12).getTime();
  global.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : [clock])); }
    static now() { return clock; }
  };
  const front = new FrontHarness();
  let dom, reactRoot, React;
  const errors = [];
  t.after(async () => {
    try {
      if (reactRoot) await React.act(async () => reactRoot.unmount());
      dom?.window.close();
      if (front.server) await front.stop();
      assert.deepEqual(front.allViolations(), [], 'Only the existing contract mocks may receive requests');
      assert.deepEqual(errors, [], 'The application stylesheet and DOM effects must be accepted');
    } finally {
      for (const key of keys) {
        if (previous[key]) Object.defineProperty(globalThis, key, previous[key]);
        else delete globalThis[key];
      }
    }
  });
  await front.start();
  front.cookies.set('accessToken', jwtFor(1));
  front.userBff.on('get', '/me', { body: fixture.sessionResponse() });
  front.calendarBff.on('get', '/calendar/bootstrap', { body: fixture.bootstrap() });
  const console = new VirtualConsole();
  console.on('jsdomError', (error) => errors.push(error.message));
  dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
    url: front.origin, pretendToBeVisual: true, virtualConsole: console,
  });
  for (const key of keys.filter((key) => !['Date', 'getComputedStyle', 'requestAnimationFrame',
    'cancelAnimationFrame', 'ResizeObserver', 'IS_REACT_ACT_ENVIRONMENT'].includes(key))) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true,
      value: key === 'window' ? dom.window : key === 'document' ? dom.window.document : dom.window[key] });
  }
  global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
  global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
  global.IS_REACT_ACT_ENVIRONMENT = true;
  // JSDOM does not evaluate breakpoints or implement geometry observation.
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  dom.window.ResizeObserver = global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  const style = dom.window.document.createElement('style');
  style.textContent = fs.readFileSync(path.join(SRC, 'app/app-overrides.css'), 'utf8');
  dom.window.document.head.append(style);
  const { setBrowserFrontUrls } = loadTs('lib/front-urls');
  setBrowserFrontUrls({
    DASHBOARD_FRONT_URL: 'https://dashboard.example/', PROJECT_FRONT_URL: 'https://projects.example/',
    MESSAGE_FRONT_URL: 'https://messages.example/', ELEARNING_FRONT_URL: 'https://training.example/',
    CALENDAR_FRONT_URL: front.origin, ADMINISTRATION_FRONT_URL: 'https://admin.example/',
    SETTINGS_FRONT_URL: 'https://settings.example/',
  });
  t.after(() => setBrowserFrontUrls({}));
  React = require('react');
  const { createRoot } = require('react-dom/client');
  const Page = loadTs('app/page').default;
  reactRoot = createRoot(dom.window.document.getElementById('root'));
  await React.act(async () => reactRoot.render(React.createElement(Page)));
  async function waitFor(predicate) {
    for (let attempt = 0; attempt < 100 && !predicate(); attempt += 1) {
      await React.act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    }
    assert.ok(predicate(), 'The actual mounted page must reach the expected state');
  }
  await waitFor(() => dom.window.document.querySelector('.calendar-month-grid') &&
    dom.window.document.body.textContent.includes('Admin Mairie'));
  const click = async (element) => {
    assert.ok(element, 'Expected a real rendered command');
    await React.act(async () => element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  };
  const button = (name) => [...dom.window.document.querySelectorAll('button')]
    .find((element) => element.getAttribute('aria-label') === name || element.textContent.trim() === name);
  return { window: dom.window, document: dom.window.document, front, click, button, waitFor,
    style: (element) => dom.window.getComputedStyle(element) };
}

module.exports = { calendarDom };
