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

test('calendar navigation preserves the measured reference target height and separating shadow', () => {
  const sidebar = '.calendar-scroll-shell aside[aria-label="Navigation principale"]';
  assert.match(declarations(sidebar), /position: relative;/);
  assert.match(declarations(sidebar), /z-index: 20;/);
  assert.match(declarations(sidebar), /box-shadow: 8px 0 24px rgb\(12 28 48 \/ 28%\);/);
  assert.match(declarations(`${sidebar} > nav button`), /min-height: 44px;/);
  assert.match(declarations(`${sidebar} > nav button`), /flex-shrink: 0;/);
});

test('mobile navigation shadow stays below the published Close control', () => {
  assert.match(declarations('.calendar-scroll-shell [role="dialog"][aria-label="Navigation mobile"] aside[aria-label="Navigation principale"]'), /z-index: 0;/);
});

test('calendar grids fit their viewport without horizontal page scrolling', () => {
  assert.match(declarations('.calendar-board'), /grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(css, /\.calendar-grid-viewport \{\s*overflow-x: hidden;/);
  assert.match(css, /\.calendar-month-grid,\s*\.calendar-week-grid\s*\{[^}]*min-width: 0;/);
  assert.match(css, /\.calendar-week-grid > \.grid\s*\{[^}]*grid-template-columns: 2\.4rem repeat\(7, minmax\(0, 1fr\)\);/);
  assert.match(css, /\.calendar-month-grid \[role="button"\] > div,[\s\S]*?text-overflow: ellipsis;/);
});

test('upcoming events stay compact and long lists scroll inside the card', () => {
  assert.match(declarations('.calendar-sidebar'), /grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(declarations('.calendar-sidebar > .calendar-upcoming-panel'), /max-height: clamp\(320px, calc\(100dvh - 440px\), 560px\);/);
  assert.match(declarations('.calendar-sidebar > .calendar-upcoming-panel > div'), /flex: 0 1 auto;/);
  assert.match(declarations('.calendar-sidebar > .calendar-upcoming-panel > div'), /padding-inline: 1\.25rem;/);
  assert.match(declarations('.calendar-sidebar > .calendar-upcoming-panel > div'), /overflow-y: auto;/);
  assert.match(declarations('.calendar-sidebar > .calendar-upcoming-panel > div:focus-visible'), /outline: 2px solid #1256a6;/);
  assert.match(css, /@media \(min-width: 768px\) and \(max-width: 1699px\)/);
  assert.match(css, /@media \(min-width: 1700px\)[\s\S]*?\.calendar-board\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\) 310px;/);
});

test('wide upcoming lists fit the grid height instead of growing the whole board', () => {
  const wide = css.slice(css.indexOf('@media (min-width: 1700px)'));
  assert.match(wide, /\.calendar-sidebar\s*\{[^}]*grid-template-rows: auto minmax\(0, 1fr\);/);
  assert.match(wide, /\.calendar-sidebar\s*\{[^}]*contain: size;/);
  assert.match(wide, /\.calendar-upcoming-panel\s*\{[^}]*max-height: none;/);
  assert.match(wide, /\.calendar-upcoming-panel > div\s*\{[^}]*flex: 1 1 0;/);
});

test('calendar presentation matches reference spacing and typography without changing other fronts', () => {
  assert.match(declarations('html'), /font-size: 17px;/);
  // The rendered reference keeps the shared small-text scale, despite its
  // earlier template @theme values. Follow computed evidence, not source alone.
  assert.doesNotMatch(css, /--text-(?:xs|sm):/);
  assert.match(css, /body \{\s*margin: 0;\s*font-family: system-ui, sans-serif;/);
  assert.match(declarations('.calendar-scroll-shell > div > div:last-child > main'), /padding: 28px;/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?padding: 20px 14px;/);
  assert.match(css, /\.calendar-board > section > div\s*\{[^}]*padding: 16px 10px;/);
  assert.match(css, /\.calendar-board > section,\s*\.calendar-sidebar > section\s*\{[^}]*box-shadow: var\(--calendar-card-shadow\);/);
  assert.match(declarations('html[data-theme="dark"]'), /rgb\(0 0 0 \/ 35%\)/);
  assert.match(declarations('html[data-settings-density="compact"] .calendar-scroll-shell > div > div:last-child > main'), /padding: 16px;/);
  assert.match(declarations('html[data-settings-density="comfortable"] .calendar-scroll-shell > div > div:last-child > main'), /padding: 32px;/);
});
