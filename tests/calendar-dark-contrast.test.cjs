const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const { resolve, dirname } = require('node:path');
const { pathToFileURL } = require('node:url');
const { createRequire } = require('node:module');
const root = process.env.MAIRIE_THEME_ROOT || resolve(__dirname, '..');
const load = createRequire(resolve(root, 'package.json'));
const { JSDOM } = load('jsdom');
const postcss = load('postcss');
const { transform, Features } = load('lightningcss');
const markup = `<body class="mairie-ui"><div class="calendar-scroll-shell"><main><section class="calendar-board"><section class="rounded-lg border bg-white p-6 text-[#172033]">
<div role="tablist" aria-label="Changer de vue" class="inline-flex rounded-lg bg-[#e4e0dc] p-1 text-sm font-medium text-[#172033]"><button id="month" type="button" role="tab" aria-selected="true" class="h-7 rounded-md px-4 leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30 bg-white shadow-sm">Mois</button><button id="week" type="button" role="tab" aria-selected="false" class="h-7 rounded-md px-4 leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30 hover:bg-white/55">Semaine</button></div>
<div id="weekday" class="px-2 text-center text-sm font-medium leading-6 text-[#5f6770]">Lun</div><div id="today" class="h-10 px-2 pt-2 text-sm font-medium leading-5 text-[#0b4f99]">15</div><button id="selected-day" class="min-h-16 w-full rounded-md border bg-white p-2 text-left text-sm leading-5 transition-colors border-[#0f6fdc] bg-[#e8f2ff] text-[#0b4f99]">15</button>
<div id="event" role="button" tabindex="0" class="min-w-0 overflow-hidden rounded-md px-2 py-1 text-xs font-medium leading-4 bg-[#e9f2ff] text-[#1256a6]"><div class="min-w-0 truncate text-left">Événement</div></div><div class="rounded-lg bg-[#f6f8fa]"><div id="metadata" class="mt-1 text-xs leading-5 text-[#6c7278]">15 octobre · 09:00</div><div id="author" class="mt-2 flex items-center gap-1.5 text-xs leading-5 text-[#6c7278]">Alice Martin</div></div>
<button id="primary" class="bg-[#1256a6] text-white">Nouvel événement</button></section></section></main></div><div role="dialog" aria-label="Détail de l’événement" class="bg-[#f5f3f0] text-[#172033]"><p id="description" class="mt-2 whitespace-normal break-words text-sm leading-6 text-[#475569]">Description 5</p><span id="assignee" class="inline-flex items-center rounded-md bg-[#e9f2ff] px-2 py-1 text-xs font-semibold text-[#2563eb]">Alice Martin</span></div><div role="dialog" class="bg-[#f5f3f0]"><label id="edit-label" class="text-sm font-medium text-[#334155]">Titre</label><div class="bg-[#f6f8fa]"><span id="recurrence-label" class="text-[#334155]">Récurrence</span></div><button id="save" class="rounded-md bg-[#2faa55] px-4 text-sm font-semibold text-white hover:bg-[#27984b]">Enregistrer</button><button id="save-hover" class="qa-hover rounded-md bg-[#2faa55] px-4 text-sm font-semibold text-white hover:bg-[#27984b]">Enregistrer</button></div></body>`;

async function screen(theme, viewport = 1280) {
  const { compile } = load('tailwindcss');
  const globals = readFileSync(resolve(root, 'src/app/globals.css'), 'utf8');
  const dom = new JSDOM(`<html data-theme="${theme}"><head></head>${markup}</html>`);
  dom.window.document.documentElement.setAttribute('data-qa-municipal', 'true');
  const classes = [...dom.window.document.querySelectorAll('[class]')].flatMap(element => [...element.classList]);
  const style = dom.window.document.createElement('style');
  const compiled = (await compile(globals, {
    base: resolve(root, 'src/app'),
    loadStylesheet: async (id, base) => {
      const path = id === 'tailwindcss' ? load.resolve('tailwindcss/index.css') : id.startsWith('.') || id.startsWith('/') ? resolve(base, id) : load.resolve(id);
      return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
    },
    loadModule: async id => ({ path: load.resolve(id), base: root, module: (await import(pathToFileURL(load.resolve(id)).href)).default }),
  })).build(classes);
  // JSDOM does not apply layered utility priority reliably. Keep the compiler's
  // layer order while exposing the declarations to its CSS cascade.
  const parsed = postcss.parse(transform({ filename: 'projects-contrast.css', code: Buffer.from(compiled), include: Features.Nesting }).code.toString());
  const layers = [];
  parsed.walkAtRules('layer', rule => {
    rule.params.split(',').map(name => name.trim()).filter(Boolean).forEach(name => { if (!layers.includes(name)) layers.push(name); });
  });
  const importantLayers = new WeakMap();
  parsed.walkDecls(declaration => {
    if (!declaration.important || !['background', 'background-color'].includes(declaration.prop)) return;
    let ancestor = declaration.parent; let layer;
    while (ancestor) { if (ancestor.type === 'atrule' && ancestor.name === 'layer') { layer = ancestor.params.trim(); break; } ancestor = ancestor.parent; }
    importantLayers.set(declaration, layer === undefined ? Infinity : layers.indexOf(layer));
  });
  parsed.walkAtRules('layer', rule => rule.replaceWith(...(rule.nodes ?? [])));
  // There is no DaisyUI theme-controller input in this fixture. Its :has rules
  // cannot match; omit them because older JSDOM misparses escaped ! utilities
  // when evaluating those unrelated selectors. Explicit data-theme rules stay.
  parsed.walkRules(rule => {
    // The fixture body is municipal; preserve the :has rule's specificity while
    // avoiding the same older JSDOM escaped-class bug for this known condition.
    rule.selector = rule.selector.replaceAll('html:has(body.mairie-ui)', 'html[data-qa-municipal="true"]');
    const selectors = rule.selectors.filter(selector => !selector.includes('.theme-controller'));
    if (selectors.length) rule.selectors = selectors; else rule.remove();
  });
  // Model a hover-capable pointer explicitly; JSDOM has no native pointer media.
  parsed.walkAtRules('media', rule => {
    if (rule.params === '(hover: hover)') { rule.replaceWith(...(rule.nodes ?? [])); return; }
    const width = /^\(width\s*(>=|>|<=|<)\s*(\d+(?:\.\d+)?)(px|rem)\)$/.exec(rule.params);
    const legacy = /^\((min|max)-width:\s*(\d+(?:\.\d+)?)(px|rem)\)$/.exec(rule.params);
    if (!width && !legacy) return;
    const operator = width ? width[1] : legacy[1] === 'min' ? '>=' : '<=';
    const bound = Number((width || legacy)[2]) * ((width || legacy)[3] === 'rem' ? 16 : 1);
    const matches = operator === '>=' ? viewport >= bound : operator === '>' ? viewport > bound : operator === '<=' ? viewport <= bound : viewport < bound;
    if (matches) rule.replaceWith(...(rule.nodes ?? [])); else rule.remove();
  });
  parsed.walkRules(rule => { rule.selector = rule.selector.replaceAll(':hover', '.qa-hover').replaceAll(':focus-visible', '.qa-focus-visible'); });
  const importantBackgrounds = [];
  parsed.walkDecls(declaration => {
    if (declaration.important && ['background', 'background-color'].includes(declaration.prop)) importantBackgrounds.push({ rule: declaration.parent, rank: importantLayers.get(declaration) });
  });
  style.textContent = parsed.toString();
  dom.window.document.head.append(style);
  const computed = element => { try { return dom.window.getComputedStyle(element); } catch (error) { throw new Error(`${element.id}: ${error.name}: ${error.message}`, { cause: error }); } };
  // JSDOM drops shorthand backgrounds containing var(), unlike browsers.
  // Resolve only the actual active colour tokens before applying its cascade.
  const tokens = computed(dom.window.document.documentElement);
  const resolveTokens = css => css.replace(/var\((--mairie-[\w-]+)\)/g, (match, name) => {
    const value = tokens.getPropertyValue(name).trim();
    return /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value) ? value : match;
  });
  style.textContent = resolveTokens(style.textContent);
  // Important declarations reverse layer order: base beats utilities, and any
  // named layer beats unlayered !important. Flattening without this step gives
  // a false positive for escaped !bg utilities (confirmed in native Chrome).
  // Keep JSDOM's selector specificity/order only within the winning layer.
  const layeredBackground = element => {
    const matches = rule => rule.selectors.some(selector => !/::|:(?:before|after|first-letter|first-line)\b/.test(selector) && element.matches(selector));
    const applicable = importantBackgrounds.filter(candidate => matches(candidate.rule));
    if (!applicable.length) return computed(element).backgroundColor;
    const strongest = Math.min(...applicable.map(candidate => candidate.rank));
    const adjusted = parsed.clone(); let index = 0;
    adjusted.walkDecls(declaration => {
      if (!['background', 'background-color'].includes(declaration.prop)) return;
      // Important declarations also beat all normal declarations, regardless
      // of layer or selector specificity (older JSDOM misses this as well).
      if (!declaration.important) { if (declaration.parent.type === 'rule' && matches(declaration.parent)) declaration.remove(); return; }
      const candidate = importantBackgrounds[index++];
      if (candidate.rank > strongest && matches(declaration.parent)) declaration.remove();
    });
    const previous = style.textContent;
    try { style.textContent = resolveTokens(adjusted.toString()); return computed(element).backgroundColor; }
    finally { style.textContent = previous; }
  };
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
      const value = layeredBackground(current);
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

for (const id of ['edit-label', 'recurrence-label']) test(`dark Calendar editor ${id} stays readable`, async () => {
  const view = await screen('dark'); try { assert.ok(view.contrast(id) >= 4.5, `${id}: ${view.contrast(id).toFixed(2)}`); } finally { view.dom.window.close(); }
});
for (const theme of ['light','dark']) test(`${theme}: Calendar save keeps white AA text in normal and hover states`, async () => {
  const view = await screen(theme); try { for (const id of ['save','save-hover']) { assert.deepEqual(view.colour(id),[255,255,255]); assert.ok(view.contrast(id) >= 4.5, `${id}: ${view.contrast(id).toFixed(2)}`); } assert.notDeepEqual(view.background('save'),view.background('save-hover')); } finally { view.dom.window.close(); }
});
