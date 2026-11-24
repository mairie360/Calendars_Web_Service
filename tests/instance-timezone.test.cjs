const test = require('node:test');
const assert = require('node:assert/strict');
const loader=require('./support/load-ts.cjs');
const loadSrc=file=>loader.requireSrc?loader.requireSrc(file):loader.loadTs?loader.loadTs(file):require('../src/'+file);
const dates = loadSrc('app/calendar/date-utils.ts');
test('instance timezone controls instants independently from the browser timezone', () => {
  const saved = process.env.TZ, instance = process.env.INSTANCE_TIMEZONE;
  process.env.TZ = 'Pacific/Honolulu'; process.env.INSTANCE_TIMEZONE = 'Indian/Reunion';
  try { assert.equal(dates.parseDateInput('2026-10-14T21:30:00Z').getDate(), 15); assert.equal(dates.calendarToday(new Date('2026-10-14T21:30:00Z')).getDate(),15);
    const {markTodayInGrid,millisecondsUntilTomorrow}=loadSrc('components/CalendarPage/today-marker.ts');
    const buttons=[14,15].map(day=>({attrs:{'aria-label':`Sélectionner le ${day} Octobre 2026`},getAttribute(name){return this.attrs[name]},setAttribute(name,value){this.attrs[name]=value},removeAttribute(name){delete this.attrs[name]}}));
    markTodayInGrid({querySelectorAll:()=>buttons},new Date('2026-10-14T21:30:00Z'));assert.equal(buttons[1].attrs['aria-current'],'date');
    assert.equal(millisecondsUntilTomorrow(new Date('2026-10-14T21:30:00Z')),81000050); }
  finally { if(saved===undefined)delete process.env.TZ;else process.env.TZ=saved;if(instance===undefined)delete process.env.INSTANCE_TIMEZONE;else process.env.INSTANCE_TIMEZONE=instance; }
});

test('MAIR-484: every compose stack runs the calendar front in the Europe/Paris instance time zone', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.join(__dirname, '..');
  const files = fs.readdirSync(root).filter(name => /^docker-compose.*\.ya?ml$/.test(name));
  assert.ok(files.length >= 6);
  for (const file of files) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    const block = text.match(/^ {2}calendar-front:[^\n]*\n((?: {4,}[^\n]*\n|\s*\n)*)/m)?.[1];
    assert.ok(block, `${file}: calendar-front service`);
    // Without it the lib falls back to UTC and the events are shown one hour early in Paris.
    assert.match(block, /^ {6}INSTANCE_TIMEZONE: Europe\/Paris$/m, `${file}: INSTANCE_TIMEZONE`);
  }
});
