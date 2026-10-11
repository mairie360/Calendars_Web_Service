const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');
const { trainingDestination } = loadTs('app/calendar/_components/event-training-link.tsx');

test('event training links preserve a configured destination and encode the real course identifier', () => {
  const value = trainingDestination('https://training.example/catalog?view=all#top',{ id:'cours / éducation',title:'Formation' });
  const url = new URL(value); assert.equal(url.searchParams.get('course'),'cours / éducation'); assert.equal(url.searchParams.get('view'),'all'); assert.equal(url.hash,'#top');
});
test('no training link is manufactured without a valid association and configured module', () => {
  for (const base of [undefined,'','javascript:alert(1)','https://user:password@training.example/']) assert.equal(trainingDestination(base,{ id:'c1',title:'Cours' }),undefined);
  for (const training of [null,{ id:' ',title:'Cours' },{ id:'c1',title:' ' }]) assert.equal(trainingDestination('https://training.example',training),undefined);
});
