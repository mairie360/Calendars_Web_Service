const assert = require('node:assert/strict');
const { readdirSync, readFileSync, statSync } = require('node:fs');
const { join, relative } = require('node:path');
const { test } = require('node:test');

const SRC = join(__dirname, '..', 'src');
// Hex colours (#fff, #3c4f76) and functional colours (rgb(...), hsl(...)): the charter tokens replace them.
const COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/;

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(css|tsx?)$/.test(name) && !/\.test\.tsx?$/.test(name) && !name.endsWith('.d.ts') ? [path] : [];
  });
}

test('MAIR-1120: the calendar sources hold no hard-coded colour, only mairie-* tokens', () => {
  const offenders = files(SRC).flatMap((path) => readFileSync(path, 'utf8').split('\n')
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => COLOUR.test(line.replace(/\/\/.*$|\/\*.*?\*\//g, '')))
    .map(({ index }) => `${relative(SRC, path)}:${index + 1}`));
  assert.deepEqual(offenders, []);
});
