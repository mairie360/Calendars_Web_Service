const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { join } = require('node:path');

const css = readFileSync(join(__dirname, '../src/app/app-overrides.css'), 'utf8');

function declarations(selector) {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `missing ${selector} rule`);
  return css.slice(start, css.indexOf('}', start));
}

test('the calendar shell keeps content scrollable without a fixed footer', () => {
  assert.match(declarations('.calendar-scroll-shell'), /height: 100dvh;/);
  assert.match(declarations('.calendar-scroll-shell'), /overflow: hidden;/);
  assert.match(declarations('.calendar-scroll-shell > div'), /min-height: 0;/);
  assert.match(declarations('.calendar-scroll-shell > div > div:last-child'), /min-height: 0;/);
  assert.match(declarations('.calendar-scroll-shell > div > div:last-child > main'), /overflow-y: auto;/);
  assert.match(declarations('.calendar-scroll-shell > div > div:last-child > main'), /overflow-x: hidden;/);
  assert.match(declarations('.calendar-scroll-shell > div > div:last-child > footer'), /position: static;/);
  assert.match(declarations('.calendar-scroll-shell > div > .hidden'), /overflow-y: auto;/);
});
