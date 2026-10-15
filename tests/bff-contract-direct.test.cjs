const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');
const { findContractRoute, isContractDataPath, allowedMethods, requestBodyMediaTypes } = loadTs('lib/bff-contract');

test('contract lookup accepts declared literal and parameterized routes without prefix matches', () => {
  assert.equal(findContractRoute(['health']).template, '/health');
  assert.equal(findContractRoute(['calendar', 'bootstrap']).template, '/calendar/bootstrap');
  assert.equal(findContractRoute(['calendar', 'events', '42'])?.template, '/calendar/events/{id}');
  for (const path of [[], ['missing'], ['health', 'extra'], ['calendar']]) assert.equal(findContractRoute(path), undefined);
  assert.equal(isContractDataPath('/calendar/bootstrap'), true);
  assert.equal(isContractDataPath('/missing'), false);
  assert.equal(isContractDataPath('/calendar/bootstrap/extra'), false);
});
test('allowed methods ignore path metadata and add HEAD only to GET operations', () => {
  assert.deepEqual(allowedMethods({ template:'/test', operations: { get:{}, parameters:[], post:{}, summary:{} } }), ['GET','POST','HEAD']);
  assert.deepEqual(allowedMethods({ template:'/test', operations: { get:{}, head:{} } }), ['GET','HEAD']);
  assert.deepEqual(allowedMethods({ template:'/test', operations: { patch:{}, delete:{} } }), ['PATCH','DELETE']);
});
test('request body types follow the selected operation and never invent JSON for bodyless reads', () => {
  const route = { template:'/test', operations: { post:{ requestBody:{content:{'application/json':{},'multipart/form-data':{}}} }, get:{} } };
  assert.deepEqual(requestBodyMediaTypes(route, 'POST'), ['application/json','multipart/form-data']);
  assert.deepEqual(requestBodyMediaTypes(route, 'get'), []);
  assert.deepEqual(requestBodyMediaTypes(route, 'PATCH'), []);
});
