const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');

const { validateEventChronology } = loadTs('app/calendar/_components/validation');

const valid = {
  date: '16-09-2026',
  endDate: '',
  startTime: '09:00',
  endTime: '10:00',
  recurrence: { frequency: 'none' },
};

test('calendar form accepts valid same-day and multi-day events', () => {
  assert.equal(validateEventChronology(valid), null);
  assert.equal(validateEventChronology({ ...valid, date: '2026-09-16' }), null);
  assert.equal(validateEventChronology({ ...valid, endDate: '17-09-2026', endTime: '08:00' }), null);
  assert.equal(validateEventChronology({ ...valid, recurrence: { frequency: 'daily', endsOn: '16-09-2026' } }), null);
});

test('calendar form rejects invalid and reversed dates', () => {
  assert.match(validateEventChronology({ ...valid, date: '31-02-2026' }), /date de début est invalide/);
  assert.match(validateEventChronology({ ...valid, endDate: 'not-a-date' }), /date de fin est invalide/);
  assert.match(validateEventChronology({ ...valid, endDate: '15-09-2026' }), /date de fin doit être après/);
  assert.match(validateEventChronology({ ...valid, recurrence: { frequency: 'weekly', endsOn: '31-02-2026' } }), /fin de récurrence est invalide/);
  assert.match(validateEventChronology({ ...valid, recurrence: { frequency: 'weekly', endsOn: '15-09-2026' } }), /fin de récurrence doit être après/);
});

test('calendar form rejects reversed same-day hours but not valid overnight multi-day hours', () => {
  assert.match(validateEventChronology({ ...valid, endTime: '09:00' }), /heure de fin doit être après/);
  assert.match(validateEventChronology({ ...valid, endTime: '08:45' }), /heure de fin doit être après/);
  assert.match(validateEventChronology({ ...valid, endTime: '25:00' }), /heure de fin doit être après/);
  assert.equal(validateEventChronology({ ...valid, endDate: '17-09-2026', endTime: '08:00' }), null);
});

test('recurrence ignores a stale multi-day end date when checking chronology', () => {
  assert.equal(validateEventChronology({
    ...valid,
    endDate: '15-09-2026',
    recurrence: { frequency: 'monthly', endsOn: '16-12-2026' },
  }), null);
});
