const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);

// MAIR-607: the library keeps only components shared by several fronts. The
// calendar grids, toolbar, sidebar and event modals are Calendars' own code now.
test('MAIR-607 the calendar owns its components instead of importing a library entry', () => {
  for (const file of walk(path.join(root, 'src'))) {
    if (!/\.(tsx?|mjs|cjs|js)$/.test(file)) continue;
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /@mairie360\/lib-components\/(dashboard|settings|projects|messages|calendar|admin|elearning)/, `${path.relative(root, file)} must not import a removed library entry`);
  }
  for (const component of ['CalendarSidebar', 'CalendarToolbar', 'CreateEventModal', 'DaySchedule', 'EventDetailsModal', 'MonthGrid', 'WeekGrid']) {
    assert.ok(fs.existsSync(path.join(root, 'src/components/calendar', `${component}.tsx`)), `${component} lives in src/components/calendar`);
    assert.match(read('src/components/calendar/index.ts'), new RegExp(`export \\{ ${component} \\}`));
  }
  assert.match(read('src/app/calendar-client.tsx'), /from "@\/components\/calendar"/);
  assert.match(read('src/app/calendar/_components/validated-event-modals.tsx'), /from '@\/components\/calendar'/);
});

test('MAIR-607 the installed library no longer publishes a calendar entry', () => {
  const pkg = JSON.parse(read('node_modules/@mairie360/lib-components/package.json'));
  assert.equal(pkg.exports['./calendar'], undefined, 'the installed lib-components must not expose ./calendar (bump the pin to the MAIR-607 major)');
  assert.ok(pkg.exports['./primitives'] && pkg.exports['./shell'], 'primitives and shell entries remain');
});
