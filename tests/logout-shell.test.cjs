const assert=require('node:assert/strict');
const {test,before,after,beforeEach,afterEach}=require('node:test');
const {FrontHarness,jwtFor}=require('./support/front-harness.cjs');
const {installReactRuntime,mount}=require('./support/server-view.cjs');
const {loadTs}=require('./support/load-ts.cjs');
const {installWindow,bootstrap,sessionResponse}=require('./support/calendar-fixtures.cjs');
installReactRuntime();const React=require('react');const Page=loadTs('app/page').default;
const h=new FrontHarness();let view,window;
before(()=>h.start());after(()=>h.stop());
beforeEach(()=>{h.reset();window=installWindow();h.cookies.set('accessToken',jwtFor(1));h.cookies.set('refreshToken','disposable-shell-refresh');h.userBff.on('get','/me',{body:sessionResponse()});h.calendarBff.on('get','/calendar/bootstrap',{body:bootstrap()});});
afterEach(()=>{view?.unmount();view=undefined;delete global.window;assert.deepEqual(h.allViolations(),[]);});
async function render(){view=mount(React.createElement(Page));await view.waitFor(html=>!html.includes('role="status"')&&view.find('Header')[0]?.props.user.name!=='Chargement…');}
async function command(label){const button=view.hostElements((_p,text,tag)=>tag==='button'&&text===label)[0];assert.ok(button,'Visible command '+label);await view.act(()=>button.props.onClick());}

test('the actual shell displays failed logout and offers an explicit successful retry',async()=>{
 await render();h.ownerOverride=()=>Response.json({message:'Unavailable'},{status:503});await view.act(()=>view.props('Header').onLogout());await view.waitFor(html=>html.includes('La déconnexion n’a pas abouti'));
 assert.match(view.html,/role="alert"/);assert.match(view.html,/Réessayer|Retour à la connexion/);assert.deepEqual(window.location.assigned,[]);assert.equal(h.cookies.size,2);
 h.ownerOverride=undefined;h.userBff.on('post','/auth/logout',{body:{message:'Closed',session_revoked:true}});await command('Réessayer');await view.waitFor(()=>window.location.assigned.length===1);
 assert.equal(window.location.assigned[0],'https://login.mairie.test/');assert.equal(h.cookies.size,0);assert.equal(h.userBff.calls('/auth/logout').length,1);
});
test('unconfirmed revocation stays visible until the user chooses to return to Login',async()=>{
 await render();window.localStorage.setItem('mairie360.auth.jwt','legacy-auth-fixture');h.userBff.on('post','/auth/logout',{body:{message:'Server revocation unconfirmed',session_revoked:false}});
 await view.act(()=>view.props('Header').onLogout());await view.waitFor(html=>html.includes('La déconnexion n’a pas pu être confirmée'));
 assert.deepEqual(window.location.assigned,[]);assert.equal(h.cookies.size,0);assert.match(view.html,/Retour à la connexion/);
 assert.equal(window.localStorage.getItem('mairie360.auth.jwt'),'legacy-auth-fixture');
 await command('Retour à la connexion');assert.equal(window.location.assigned.length,1);assert.equal(new URL(window.location.assigned[0]).searchParams.get('redirect'),window.location.href);assert.equal(new URL(window.location.assigned[0]).searchParams.has('returnUrl'),false);assert.equal(h.userBff.calls('/auth/logout').length,1);
 assert.equal(window.localStorage.getItem('mairie360.auth.jwt'),null);
});

test('an incomplete owner receipt cannot clear local keys or leave the rendered calendar',async()=>{
 await render();window.localStorage.setItem('mairie360.auth.jwt','legacy-auth-fixture');window.localStorage.setItem('unrelated.preference','keep');
 h.ownerOverride=()=>Response.json({session_revoked:true});
 await view.act(()=>view.props('Header').onLogout());await view.waitFor(html=>html.includes('La déconnexion n’a pas pu être confirmée'));
 assert.deepEqual(window.location.assigned,[]);assert.equal(h.cookies.size,2);assert.match(view.html,/role="alert"/);
 assert.equal(window.localStorage.getItem('mairie360.auth.jwt'),'legacy-auth-fixture');assert.equal(window.localStorage.getItem('unrelated.preference'),'keep');
});
