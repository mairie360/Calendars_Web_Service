const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');

const { getEventColor } = loadTs('app/calendar/constants');
const css = readFileSync(require.resolve('@mairie360/lib-components/styles.css'), 'utf8');

/** Custom properties of the first rule whose selector ends with `selector` and declares --mairie-secondary. */
function tokens(selector) {
  for (const [, head, body] of css.matchAll(/([^{}]+)\{([^{}]*--mairie-secondary:[^{}]*)\}/g)) {
    if (head.trim().endsWith(selector)) return Object.fromEntries([...body.matchAll(/(--mairie-[\w-]+):\s*([^;]+)/g)].map(([, k, v]) => [k, v.trim()]));
  }
  throw new Error(`no lib theme ${selector}`);
}

function luminance(hex) {
  const [r, g, b] = hex.replace('#', '').match(/../g).map((c) => {
    const v = Number.parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('MAIR-1121 / MAIR-1122: every event colour is a lib token pair with an AA contrast, light and dark', () => {
  for (const [theme, selector] of [['light', ':root'], ['dark', 'html[data-theme="dark"]']]) {
    const values = tokens(selector);
    // MAIR-1122: the meeting looks by participation count as well.
    const looks = [['meeting'], ['activity'], ['ceremony'], ['other'], ['meeting', 'pending'], ['meeting', 'declined']];
    for (const [category, participation] of looks) {
      const classes = getEventColor(category, participation);
      const background = classes.match(/bg-\[var\((--mairie-[\w-]+)\)\]/)[1];
      const text = classes.match(/text-\[var\((--mairie-[\w-]+)\)\]/)[1];
      const name = participation ? `${category} ${participation}` : category;
      assert.ok(values[background] && values[text], `${name}: ${background} / ${text} are lib tokens (${theme})`);
      const ratio = contrast(values[background], values[text]);
      assert.ok(ratio >= 4.5, `${name} in ${theme}: ${values[text]} on ${values[background]} is ${ratio.toFixed(2)}:1`);
    }
  }
});
