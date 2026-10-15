const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');
const { createCalendarDataCache } = loadTs('app/calendar/data-cache');
const params = (from='2026-10-01') => ({from,to:from});
const value = (owner='alice',title='confirmed') => ({events:[{id:1,title}],people:[],categories:[],services:[],currentUser:owner===null?undefined:{id:owner}});

test('bootstrap is loaded once, revisited periods are cloned from the bounded account cache', async () => {
  let boots=0, periods=0;
  const cache=createCalendarDataCache({bootstrap:async()=>{boots++;return value();},period:async()=>{periods++;return value();},limit:2});
  const first=await cache.read(params());
  first.events[0].title='local edit';
  assert.equal((await cache.read(params())).events[0].title,'confirmed');
  await cache.read(params('2026-11-01'));
  await cache.read(params('2026-12-01'));
  await cache.read(params());
  assert.equal(boots,1);
  assert.equal(periods,3);
});

test('confirmed invalidation and expiry force another period read, refused reads do not replace data', async () => {
  let reads=0, clock=0, refuse=false;
  const cache=createCalendarDataCache({bootstrap:async()=>value(),period:async()=>{reads++;if(refuse)throw new Error('unavailable');return value();},now:()=>clock,ttl:100});
  await cache.read(params());
  cache.invalidate();
  await cache.read(params());
  assert.equal(reads,1);
  clock=101; refuse=true;
  await assert.rejects(cache.read(params()),/unavailable/);
  refuse=false;
  await cache.read(params());
  assert.equal(reads,3);
});

test('late reads after invalidation cannot seed the next visit with stale events', async () => {
  let finish,reads=0;
  const cache=createCalendarDataCache({bootstrap:async()=>value(),period:async()=>{reads++;return reads===1?new Promise(resolve=>{finish=resolve;}):value('alice','fresh');}});
  await cache.read(params());
  const pending=cache.read(params('2026-11-01'));
  cache.invalidate();
  finish(value('alice','stale'));
  await pending;
  assert.equal((await cache.read(params('2026-11-01'))).events[0].title,'fresh');
  assert.equal(reads,2);
});

test('identity refresh clears the former account, an unknown identity is never cached', async () => {
  let owner='alice',boots=0;
  const cache=createCalendarDataCache({bootstrap:async()=>{boots++;return value(owner,owner??'anonymous');},period:async(_params,context)=>context});
  await cache.read(params());
  owner='bob';
  await cache.read(params('2026-11-01'),true);
  assert.equal((await cache.read(params())).currentUser.id,'bob');
  owner=null;
  await cache.read(params(),true);
  assert.equal(cache.canPrefetch(),false);
  await cache.read(params());
  assert.equal(boots,4);
  cache.clear();
  assert.equal(cache.canPrefetch(),false);
});

test('an aborted period never enters the cache', async () => {
  let finish,reads=0;
  const cache=createCalendarDataCache({bootstrap:async()=>value(),period:async()=>{reads++;return reads===1?new Promise(resolve=>{finish=resolve;}):value();}});
  await cache.read(params());
  const controller=new AbortController();
  const pending=cache.read({...params('2026-11-01'),signal:controller.signal});
  controller.abort(); finish(value());
  await assert.rejects(pending,error=>error.name==='AbortError');
  await cache.read(params('2026-11-01'));
  assert.equal(reads,2);
});

test('period navigation during identity verification cannot reuse the previous account context', async () => {
  let finish,boots=0,periods=0;
  const cache=createCalendarDataCache({bootstrap:async()=>{boots++;return boots===2?new Promise(resolve=>{finish=resolve;}):value(boots===1?'alice':'bob');},period:async(_params,context)=>{periods++;return context;}});
  await cache.read(params());
  const identityRead=cache.read(params(),true);
  const nextPeriod=await cache.read(params('2026-11-01'));
  assert.equal(nextPeriod.currentUser.id,'bob');
  assert.equal(periods,0);
  finish(value('bob'));await identityRead;
});

test('a confirmed server period seeds only its known account and is cloned before local edits', async () => {
  let boots = 0, periods = 0;
  const cache = createCalendarDataCache({ initial: { params: params(), value: value() }, bootstrap: async () => { boots++; return value('bob'); }, period: async (_params, context) => { periods++; return context; } });
  const first = await cache.read(params()); first.events[0].title = 'draft';
  assert.equal((await cache.read(params())).events[0].title, 'confirmed');
  await cache.read(params('2026-11-01'));
  assert.equal(boots, 0); assert.equal(periods, 1);
  await cache.read(params(), true);
  assert.equal((await cache.read(params('2026-11-01'))).currentUser.id, 'bob');
  assert.equal(boots, 1);
});
