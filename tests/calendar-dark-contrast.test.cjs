const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const { resolve, dirname } = require('node:path');
const { JSDOM } = require('jsdom');
const postcss = require('postcss');

const root = resolve(__dirname, '..');
const markup = `<body class="mairie-ui"><div class="calendar-scroll-shell"><main><section class="calendar-board"><section class="rounded-lg border bg-white p-6 text-[#172033]">
<div role="tablist" aria-label="Changer de vue" class="inline-flex rounded-lg bg-[#e4e0dc] p-1 text-sm font-medium text-[#172033]"><button id="month" type="button" role="tab" aria-selected="true" class="h-7 rounded-md px-4 leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30 bg-white shadow-sm">Mois</button><button id="week" type="button" role="tab" aria-selected="false" class="h-7 rounded-md px-4 leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30 hover:bg-white/55">Semaine</button></div>
<div id="weekday" class="px-2 text-center text-sm font-medium leading-6 text-[#5f6770]">Lun</div><div id="today" class="h-10 px-2 pt-2 text-sm font-medium leading-5 text-[#0b4f99]">15</div><button id="selected-day" class="min-h-16 w-full rounded-md border bg-white p-2 text-left text-sm leading-5 transition-colors border-[#0f6fdc] bg-[#e8f2ff] text-[#0b4f99]">15</button>
<div id="event" role="button" tabindex="0" class="min-w-0 overflow-hidden rounded-md px-2 py-1 text-xs font-medium leading-4 bg-[#e9f2ff] text-[#1256a6]"><div class="min-w-0 truncate text-left">Événement</div></div><div class="rounded-lg bg-[#f6f8fa]"><div id="metadata" class="mt-1 text-xs leading-5 text-[#6c7278]">15 octobre · 09:00</div><div id="author" class="mt-2 flex items-center gap-1.5 text-xs leading-5 text-[#6c7278]">Alice Martin</div></div>
<button id="primary" class="bg-[#1256a6] text-white">Nouvel événement</button></section></section></main></div><div role="dialog" aria-label="Détail de l’événement" class="bg-[#f5f3f0] text-[#172033]"><p id="description" class="mt-2 whitespace-normal break-words text-sm leading-6 text-[#475569]">Description 5</p><span id="assignee" class="inline-flex items-center rounded-md bg-[#e9f2ff] px-2 py-1 text-xs font-semibold text-[#2563eb]">Alice Martin</span></div></body>`;

async function screen(theme) {
  const { compile } = await import('tailwindcss');
  const globals = readFileSync(resolve(root, 'src/app/globals.css'), 'utf8');
  const municipal = readFileSync(resolve(root, 'src/app/municipal-theme.css'), 'utf8');
  const dom = new JSDOM(`<html data-theme="${theme}"><head></head>${markup}</html>`);
  const classes = [...dom.window.document.querySelectorAll('[class]')].flatMap(element => [...element.classList]);
  const style = dom.window.document.createElement('style');
  const compiled = (await compile(`${globals}\n${municipal}`, {
    base: root,
    loadStylesheet: async (id, base) => {
      const path = id === 'tailwindcss' ? require.resolve('tailwindcss/index.css') : resolve(base, id);
      return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
    },
    loadModule: async id => ({ path: require.resolve(id), base: root, module: (await import(id)).default }),
  })).build(classes);
  // JSDOM does not apply layered utility priority reliably. Keep the compiler's
  // layer order while exposing the declarations to its CSS cascade.
  const parsed = postcss.parse(compiled);
  parsed.walkAtRules('layer', rule => rule.replaceWith(...(rule.nodes ?? [])));
  style.textContent = parsed.toString();
  dom.window.document.head.append(style);
  const computed = element => dom.window.getComputedStyle(element);
  // JSDOM drops shorthand backgrounds containing var(), unlike browsers.
  // Resolve only the actual active colour tokens before applying its cascade.
  for (const [prefix, element] of [['mairie', dom.window.document.documentElement]]) {
    const tokens = computed(element);
    style.textContent = style.textContent.replace(new RegExp(`var\\((--${prefix}-[\\w-]+)\\)`, 'g'), (match, name) => {
      const value = tokens.getPropertyValue(name).trim();
      return /^#[\da-f]{6}$/i.test(value) ? value : match;
    });
  }
  const variable = (element, name) => {
    for (let current = element; current; current = current.parentElement) {
      const value = computed(current).getPropertyValue(name).trim();
      if (value) return value;
    }
    return '';
  };
  const colour = (value, element) => {
    for (let pass = 0; pass < 10 && value.includes('var('); ++pass) value = value.replace(/var\((--[\w-]+)(?:,\s*([^)]*))?\)/g, (_match, name, fallback) => variable(element, name) || fallback || '');
    if (/^#[\da-f]{3}$/i.test(value)) value = '#' + [...value.slice(1)].map(char => char + char).join('');
    if (/^#[\da-f]{6}$/i.test(value)) return [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16));
    const rgb = /^rgb[a]?\((\d+)[, ]+(\d+)[, ]+(\d+)/.exec(value);
    assert.ok(rgb, `Expected an applied solid colour, received ${value}`);
    return rgb.slice(1, 4).map(Number);
  };
  const background = element => {
    for (let current = element; current; current = current.parentElement) {
      const value = computed(current).backgroundColor;
      if (value && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') return colour(value, current);
    }
    throw new Error('No rendered background');
  };
  const luminance = channels => channels.map(channel => channel / 255).map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  return {
    dom,
    colour: id => colour(computed(dom.window.document.getElementById(id)).color, dom.window.document.getElementById(id)),
    background: id => background(dom.window.document.getElementById(id)),
    contrast(id) {
      const element = dom.window.document.getElementById(id);
      const pair = [luminance(colour(computed(element).color, element)), luminance(background(element))].sort((a, b) => b - a);
      return (pair[0] + 0.05) / (pair[1] + 0.05);
    },
  };
}

for (const id of ['month', 'week', 'weekday', 'today', 'selected-day', 'event', 'metadata', 'author', 'description', 'assignee']) {
  test(`dark rendered Calendar ${id} has AA text contrast on its opaque surface`, async context => {
    const view = await screen('dark');
    try {
      const ratio = view.contrast(id);
      context.diagnostic(`${id}: text rgb(${view.colour(id)}) on rgb(${view.background(id)}), contrast ${ratio.toFixed(2)}:1`);
      assert.ok(ratio >= 4.5, `${id} contrast ${ratio.toFixed(2)} must reach 4.5`);
    } finally { view.dom.window.close(); }
  });
}
test('selected and unselected dark Calendar tabs keep distinct surfaces and the primary button retains its brand colour', async () => {
  const view = await screen('dark');
  try {
    assert.notDeepEqual(view.background('month'), view.background('week'));
    assert.deepEqual(view.background('primary'), [18, 86, 166]);
    assert.ok(view.contrast('primary') >= 4.5);
    assert.equal(view.dom.window.document.getElementById('month').getAttribute('aria-selected'), 'true');
    assert.equal(view.dom.window.document.getElementById('week').getAttribute('aria-selected'), 'false');
  } finally { view.dom.window.close(); }
});
test('light Calendar keeps its existing tab, day, event and description colours', async () => {
  const view = await screen('light');
  try {
    assert.deepEqual(view.background('week'), [228, 224, 220]);
    assert.deepEqual(view.colour('weekday'), [95, 103, 112]);
    assert.deepEqual(view.colour('today'), [11, 79, 153]);
    assert.deepEqual(view.background('event'), [233, 242, 255]);
    assert.deepEqual(view.colour('metadata'), [108, 114, 120]);
    assert.deepEqual(view.colour('description'), [71, 85, 105]);
  } finally { view.dom.window.close(); }
});
