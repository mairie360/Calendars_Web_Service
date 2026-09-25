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

test('calendar grids fit their viewport without horizontal page scrolling', () => {
  assert.match(declarations('.calendar-board'), /grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(css, /\.calendar-grid-viewport \{\s*overflow-x: hidden;/);
  assert.match(css, /\.calendar-month-grid,\s*\.calendar-week-grid\s*\{[^}]*min-width: 0;/);
  assert.match(css, /\.calendar-week-grid > \.grid\s*\{[^}]*grid-template-columns: 2\.4rem repeat\(7, minmax\(0, 1fr\)\);/);
  assert.match(css, /\.calendar-month-grid \[role="button"\] > div,[\s\S]*?text-overflow: ellipsis;/);
});

test('upcoming events stay compact and long lists scroll inside the card', () => {
  assert.match(declarations('.calendar-sidebar'), /grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(declarations('.calendar-sidebar > section:first-child'), /max-height: min\(35rem, calc\(100dvh - 8rem\)\);/);
  assert.match(declarations('.calendar-sidebar > section:first-child > div'), /overflow-y: auto;/);
  assert.match(declarations('.calendar-sidebar > section:first-child > div:focus-visible'), /outline: 2px solid #1256a6;/);
  assert.match(css, /@media \(min-width: 48rem\) and \(max-width: 106\.249rem\)/);
  assert.match(css, /@media \(min-width: 106\.25rem\)[\s\S]*?\.calendar-board\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\) 19\.375rem;/);
});
