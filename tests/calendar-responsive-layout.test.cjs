const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { JSDOM, VirtualConsole } = require('jsdom');

const stylesheet = readFileSync(join(__dirname, '../src/app/app-overrides.css'), 'utf8');
const selector = (value) => value.replace(/\s*>\s*/g, ' > ').replace(/\s+/g, ' ').trim();
const value = (text) => text.replace(/\s+/g, '').replace(/\b0px\b/g, '0');

function policyDocument(t) {
  const errors = [], console = new VirtualConsole();
  console.on('jsdomError', (error) => errors.push(error.message));
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { virtualConsole: console });
  t.after(() => dom.window.close());
  const style = dom.window.document.createElement('style');
  style.textContent = stylesheet; dom.window.document.head.append(style);
  assert.deepEqual(errors, [], 'Parse the actual consumer stylesheet');
  const rows = [];
  function visit(rules, condition = null) {
    for (const rule of rules) {
      if (rule.cssRules) visit(rule.cssRules, rule.conditionText || condition);
      if (rule.style) rows.push({ selectors: (rule.selectorText || '').split(',').map(selector),
        condition: condition ? value(condition) : null, style: rule.style });
    }
  }
  visit(style.sheet.cssRules);
  const declarations = (selected, condition = null) => {
    const matches = rows.filter((row) => row.selectors.includes(selector(selected)) && row.condition === (condition ? value(condition) : null));
    assert.ok(matches.length, 'Keep the scoped policy rule: ' + selected);
    return (property) => {
      const values = matches.map((row) => row.style.getPropertyValue(property)).filter(Boolean);
      assert.ok(values.length, 'Keep the declared policy: ' + property);
      return values.at(-1);
    };
  };
  return { rows, declarations, window: dom.window };
}

test('parsed calendar media policies retain reference tracks, insets and bounded upcoming lists', (t) => {
  const { declarations } = policyDocument(t);
  const mobile = '(max-width: 767px)', tablet = '(min-width: 768px) and (max-width: 1699px)', desktop = '(min-width: 1700px)';
  assert.equal(value(declarations('.calendar-week-grid > .grid', mobile)('grid-template-columns')), '2.4remrepeat(7,minmax(0,1fr))');
  assert.equal(value(declarations('.calendar-scroll-shell > div > div:last-child > main', mobile)('padding')), '20px14px');
  assert.equal(value(declarations('.calendar-board > section > div', mobile)('padding')), '16px10px');
  assert.equal(value(declarations('.calendar-sidebar', tablet)('grid-template-columns')), 'repeat(2,minmax(0,1fr))');
  assert.equal(value(declarations('.calendar-board', desktop)('grid-template-columns')), 'minmax(0,1fr)310px');
  const panel = '.calendar-sidebar > .calendar-upcoming-panel';
  assert.equal(value(declarations(panel)('max-height')), 'clamp(320px,100dvh-440px,560px)');
  assert.equal(value(declarations(panel, desktop)('max-height')), 'min(100%,clamp(320px,100dvh-440px,560px))');
  // CSSOM policy inspection does not evaluate media queries or measure scrolling.
});

test('parsed calendar fallback and focus policies remain scoped without overriding global small-text tokens', (t) => {
  const { declarations, rows, window } = policyDocument(t);
  assert.equal(declarations('.calendar-scroll-shell > div > div:last-child > footer')('position'), 'static');
  assert.equal(declarations('.calendar-scroll-shell > div > .hidden')('overflow-y'), 'auto');
  for (const row of rows) for (let index = 0; index < row.style.length; index += 1) {
    assert.equal(['--text-xs', '--text-sm'].includes(row.style.item(index)), false, 'Keep global small-text tokens');
  }
  for (const [selected, width] of [
    ['.calendar-sidebar > .calendar-upcoming-panel > div:focus-visible', '2px'],
    ['.calendar-grid-viewport button[aria-current="date"]:focus-visible', '3px'],
  ]) {
    const tokens = declarations(selected)('outline').trim().split(/\s+(?![^()]*\))/);
    const lengths = tokens.filter((token) => Number.isFinite(Number.parseFloat(token)));
    const colors = tokens.filter((token) => token !== 'solid' && !Number.isFinite(Number.parseFloat(token)));
    assert.deepEqual(lengths, [width]); assert.ok(tokens.includes('solid')); assert.equal(colors.length, 1);
    // JSDOM does not expand outline shorthand into computed longhands reliably.
    const probe = window.document.createElement('span');
    probe.style.color = colors[0]; window.document.body.append(probe);
    assert.equal(window.getComputedStyle(probe).color, 'rgb(18, 86, 166)'); probe.remove();
  }
  // Focus configuration is preserved; native keyboard/scroll and RGAA remain separate.
});
