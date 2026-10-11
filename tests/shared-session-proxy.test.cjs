const assert=require('node:assert/strict');
const {test,before,after,beforeEach,afterEach}=require('node:test');
const {FrontHarness,jwtFor}=require('./support/front-harness.cjs');
const {loadTs}=require('./support/load-ts.cjs');
const {installWindow,bootstrap,calendarEvent,apiError,sessionResponse}=require('./support/calendar-fixtures.cjs');
const h=new FrontHarness();let window,token,access;
before(()=>h.start());after(()=>h.stop());
beforeEach(()=>{h.reset();window=installWindow();token='disposable-calendar-refresh-'+Math.random();access=jwtFor(1);h.cookies.set('accessToken',jwtFor(1,1));h.cookies.set('refreshToken',token);});
afterEach(()=>{delete global.window;assert.deepEqual(h.allViolations(),[]);});
const client=loadTs('lib/bff-client');
const range='?from=2026-09-01&to=2026-09-30';
const read=()=>client.requestBff('/calendar/bootstrap'+range);
const renewed=()=>h.userBff.on('post','/auth/refresh',{body:{message:'JWT refreshed successfully'},headers:{'Set-Cookie':[
 `accessToken=${access}; Path=/auth; Max-Age=3600; HttpOnly; SameSite=Strict`,
 `refreshToken=renewed-${token}; Path=/auth; HttpOnly; SameSite=Strict`
]}});
const business=()=>h.calendarBff.on('get','/calendar/bootstrap',request=>request.headers.authorization===`Bearer ${access}`?{body:bootstrap()}:{status:401,body:apiError('UNAUTHORIZED','Session expirée')});

test('expired access renews through Login and retries the actual published range',async()=>{
 renewed();business();await read();assert.deepEqual(h.browserRequests.map(x=>x.path),['/api/bff/calendar/bootstrap'+range]);
 assert.equal(h.ownerCalls.length,1);assert.equal(h.ownerCalls[0].url.pathname,'/api/auth/refresh');
 assert.deepEqual(h.userBff.calls('/auth/refresh')[0].body,{refresh_token:token});assert.equal(h.userBff.calls('/auth/refresh')[0].headers.authorization,undefined);
 assert.deepEqual(h.calendarBff.calls('/calendar/bootstrap').map(x=>x.headers.authorization),[`Bearer ${jwtFor(1,1)}`,`Bearer ${access}`]);
 assert.ok(h.calendarBff.calls('/calendar/bootstrap').every(x=>x.url.search===range&&x.headers.cookie===undefined));
 assert.equal(h.cookies.get('accessToken'),access);assert.equal(h.cookies.get('refreshToken'),'renewed-'+token);assert.deepEqual(window.location.assigned,[]);
});
test('simultaneous Calendar and User reads share one real User rotation',async()=>{
 renewed();business();h.userBff.on('get','/me',req=>req.headers.authorization===`Bearer ${access}`?{body:sessionResponse()}:{status:401});
 const [one,two,user]=await Promise.all([read(),read(),fetch('/api/user/me')]);assert.ok(one&&two);assert.equal(user.status,200);
 assert.equal(h.ownerCalls.length,3);assert.equal(h.userBff.calls('/auth/refresh').length,1);assert.equal(h.calendarBff.requests.length,4);assert.equal(h.userBff.calls('/me').length,2);
 assert.equal(h.cookies.get('refreshToken'),'renewed-'+token);
});
test('the read without an access cookie never forwards a browser bearer',async()=>{
 h.cookies.delete('accessToken');renewed();business();await client.requestBff('/calendar/bootstrap'+range,{headers:{Authorization:'Bearer forged-browser'}});
 assert.equal(h.calendarBff.requests[0].headers.authorization,undefined);assert.equal(h.calendarBff.requests[1].headers.authorization,`Bearer ${access}`);
});
for(const status of [401,503])test(`owner renewal${status} stops the replay and preserves cookies`,async()=>{
 window.localStorage.setItem('mairie360.auth.jwt','legacy');window.localStorage.setItem('unrelated.preference','keep');
 business();h.ownerOverride=()=>Response.json({message:'Disposable renewal refusal'},{status});
 await assert.rejects(read(),{status});assert.equal(h.calendarBff.requests.length,1);assert.equal(h.cookies.get('refreshToken'),token);assert.equal(h.userBff.calls('/auth/logout').length,0);
 assert.equal(window.location.assigned.length,status===401?1:0);assert.equal(window.location.reloads,0);
 assert.equal(window.localStorage.getItem('mairie360.auth.jwt'),status===401?null:'legacy');assert.equal(window.localStorage.getItem('unrelated.preference'),'keep');
 if(status===401){const target=new URL(window.location.assigned[0]);assert.equal(target.searchParams.get('redirect'),window.location.href);assert.equal(target.searchParams.has('returnUrl'),false);}
});
test('malformed successful renewal cannot replay a Calendar operation',async()=>{
 business();h.ownerOverride=()=>Response.json({message:'No rotated cookies'});await assert.rejects(read(),{status:502});assert.equal(h.calendarBff.requests.length,1);assert.deepEqual(window.location.assigned,[]);assert.equal(h.cookies.get('refreshToken'),token);
});
test('a second401 stops after one replay without a logout request',async()=>{
 renewed();h.calendarBff.on('get','/calendar/bootstrap',{status:401,body:apiError('UNAUTHORIZED','Still rejected')});await assert.rejects(read(),{status:401});
 assert.equal(h.calendarBff.requests.length,2);assert.equal(h.userBff.calls('/auth/refresh').length,1);assert.equal(h.userBff.calls('/auth/logout').length,0);assert.equal(window.location.assigned.length,1);
});
test('a published Calendar mutation retries the original body exactly once',async()=>{
 renewed();const body={title:'Conseil',date:'2026-09-16'};
 h.calendarBff.on('post','/calendar/events',req=>req.headers.authorization===`Bearer ${access}`?{status:201,body:calendarEvent(2)}:{status:401,body:apiError('UNAUTHORIZED','Expired')});
 await client.requestBff('/calendar/events',{method:'POST',body:JSON.stringify(body)});
 assert.deepEqual(h.calendarBff.requests.map(x=>x.body),[body,body]);assert.equal(h.userBff.calls('/auth/refresh').length,1);
});
test('foreign API reads and logout mutations cannot contact a service or alter cookies',async()=>{
 for(const [path,init]of[['/api/bff/health',{headers:{Origin:'https://foreign.mairie.test'}}],['/api/auth/logout',{method:'POST',headers:{Origin:'https://foreign.mairie.test','Content-Type':'application/json'},body:'{}'}]]){
  const r=await fetch(path,init);assert.equal(r.status,403);assert.equal(r.headers.get('set-cookie'),null);
 }
 assert.equal(h.ownerCalls.length,0);assert.equal(h.calendarBff.requests.length,0);assert.equal(h.userBff.requests.length,0);assert.equal(h.cookies.get('refreshToken'),token);
});
