const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { AsyncLocalStorage } = require('node:async_hooks');
const { NextRequest } = require('next/server');
const { createSessionRefreshHandler, createSessionLogoutHandler, forgetUserSession } = require('@mairie360/front-kit/next');
const { loadTs } = require('./load-ts.cjs');
const { OpenApiContract } = require('./openapi-contract.cjs');
const { ContractMockServer } = require('./contract-mock-server.cjs');

// Chaîne réseau complète du front, sans navigateur ni build Next.js :
//
//   code client (api.ts, auth-session.ts)  --fetch same-origin-->  serveur du front (vrais route handlers)
//   route handlers (bff-proxy.ts, user-bff-proxy.ts)  --fetch-->  BFF simulés pilotés par leur contrat OpenAPI
//
// Un garde remplace `fetch` : côté client, seules les URL de l'origine du front passent (comme la CSP
// `connect-src 'self'`) ; côté serveur, seuls les BFF simulés sont joignables. Tout autre appel est une
// violation et échoue.

const ROOT = path.resolve(__dirname, '..', '..');
const CALENDAR_CONTRACT = path.join(ROOT, 'contracts', 'openapi.json');

/** Routes de l'App Router servies par des fichiers dédiés (prioritaires sur le catch-all). */
const APP_ROUTES = {
  '/api/user/me': 'app/api/user/me/route',
  '/api/auth/me': 'app/api/auth/me/route',
  '/api/auth/session': 'app/api/auth/session/route',
  '/api/auth/logout': 'app/api/auth/logout/route',
  '/api/auth/refresh': 'app/api/auth/refresh/route',
  '/api/auth/resume': 'app/api/auth/resume/route',
};

/** Selected actual published User read and session documents, available in standalone CI. */
function loadUserContract() {
  const file = path.join(ROOT, 'tests/fixtures/user-session-openapi.json');
  return { contract: OpenApiContract.load(file), source: file };
}

class FrontHarness {
  constructor() {
    this.calendarBff = new ContractMockServer('BFF_CALENDAR', OpenApiContract.load(CALENDAR_CONTRACT));
    const user = loadUserContract();
    this.userBff = new ContractMockServer('BFF_USER', user.contract);
    this.userContractSource = user.source;
    this.violations = [];
    /** Requêtes émises par le code client, telles que vues par le front. */
    this.browserRequests = [];
    this.cookies = new Map();
    this.serverContext = new AsyncLocalStorage();
    this.nativeFetch = global.fetch;
    /** Origines serveur autorisées en plus des BFF simulés (ex. port fermé pour simuler une panne). */
    this.extraServerOrigins = new Set();
    this.ownerOrigin = 'https://login.mairie.test';
    this.ownerCalls = [];
    this.ownerOverride = undefined;
  }

  get mocks() { return [this.calendarBff, this.userBff]; }

  async start() {
    await Promise.all(this.mocks.map((mock) => mock.start()));
    process.env.BFF_CALENDAR_BASE_URL = this.calendarBff.url;
    process.env.USER_BFF_URL = this.userBff.url;
    this.server = http.createServer((req, res) => {
      this.serverContext.run({ request: `${req.method} ${req.url}` }, () => this.handle(req, res)).catch((error) => {
        this.violations.push(`[FRONT] erreur du serveur de test : ${error.stack ?? error}`);
        if (!res.headersSent) res.writeHead(500);
        res.end();
      });
    });
    await new Promise((resolve) => this.server.listen(0, '127.0.0.1', resolve));
    this.origin = `http://127.0.0.1:${this.server.address().port}`;
    process.env.CALENDAR_FRONT_URL = this.origin;
    process.env.LOGIN_FRONT_URL = this.ownerOrigin;
    const ownerConfig = { userBffUrl: () => this.userBff.url, cookieOptions: () => ({secure:false}), allowedOrigins: () => [this.origin] };
    this.ownerHandlers = { '/api/auth/refresh': createSessionRefreshHandler(ownerConfig), '/api/auth/logout': createSessionLogoutHandler(ownerConfig) };
    this.inFlight = new Set();
    global.fetch = (input, init) => {
      const request = this.guardedFetch(input, init);
      this.inFlight.add(request);
      request.then(() => this.inFlight.delete(request), () => this.inFlight.delete(request));
      return request;
    };
  }

  // Let requests started by a test (an opened event's detail read, MAIR-557) finish before the next
  // test resets the mocks: the server-side renderer does not run effect cleanups on unmount.
  async settle() {
    while (this.inFlight.size) await Promise.allSettled([...this.inFlight]);
  }

  async stop() {
    global.fetch = this.nativeFetch;
    this.server.closeAllConnections();
    await new Promise((resolve) => this.server.close(resolve));
    await Promise.all(this.mocks.map((mock) => mock.stop()));
  }

  // Explicit fixtures for the bootstrap and the new published period operation.
  // Opening an event reads its detail (MAIR-557): by default it answers the last listed version of
  // that event, so tests that only click keep their fixtures; a test can still override it with `on()`.
  calendarRead(reply) {
    const listed = new Map();
    const remember = value => {
      if (value?.body?.events && (!value.status || value.status < 400)) for (const event of value.body.events) listed.set(String(event.id), event);
      return value;
    };
    const read = typeof reply === 'function' ? async request => remember(await reply(request)) : remember(reply);
    this.calendarBff.on('get', '/calendar/bootstrap', read);
    const periodReply = value => value?.body && (!value.status || value.status < 400)
      ? { ...value, body: { events: value.body.events.map(({ assignees, ...event }) => event), users: value.body.users } } : value;
    this.calendarBff.on('get', '/calendar/period', typeof reply === 'function'
      ? async request => periodReply(await read(request)) : periodReply(reply));
    this.calendarBff.on('get', '/calendar/events/{id}', ({ pathParams }) => listed.has(pathParams.id)
      ? { body: listed.get(pathParams.id) }
      : { status: 404, body: { error: { code: 'NOT_FOUND', message: 'Événement introuvable', details: [] } } });
  }

  reset() {
    forgetUserSession(this.userBff.url, this.cookies.get('refreshToken'));
    for (const mock of this.mocks) mock.reset();
    this.ownerCalls.length = 0;
    this.ownerOverride = undefined;
    this.violations.length = 0;
    this.browserRequests.length = 0;
    this.cookies.clear();
    this.extraServerOrigins.clear();
  }

  allowServerOrigin(url) {
    this.extraServerOrigins.add(new URL(url).origin);
  }

  /** Toutes les violations de contrat ou de périmètre réseau collectées depuis le dernier `reset`. */
  allViolations() {
    return [...this.violations, ...this.mocks.flatMap((mock) => mock.violations)];
  }

  async guardedFetch(input, init) {
    const raw = input instanceof Request ? input.url : String(input);
    const serverSide = this.serverContext.getStore();
    if (serverSide) {
      const target = new URL(raw);
      if (target.origin === this.ownerOrigin) {
        const handler = this.ownerHandlers[target.pathname];
        if (!handler) throw new Error('Undeclared Login owner operation');
        this.ownerCalls.push({url:target,init});
        return this.ownerOverride ? this.ownerOverride(target,init) : handler(new NextRequest(target,init));
      }
      if (!this.extraServerOrigins.has(target.origin) && !this.mocks.some((mock) => target.origin === new URL(mock.url).origin)) {
        this.violations.push(`[FRONT serveur] appel réseau hors BFF simulés : ${target.href} (pendant ${serverSide.request})`);
        throw new TypeError('fetch failed');
      }
      return this.nativeFetch(input, init);
    }

    // Côté client : résolution relative à l'origine du front, comme dans le navigateur.
    const target = new URL(raw, this.origin);
    if (target.origin !== this.origin) {
      this.violations.push(`[FRONT client] appel réseau vers une autre origine : ${target.href}`);
      throw new TypeError('Failed to fetch');
    }
    const headers = new Headers(init?.headers);
    // Le navigateur signale toujours une requête same-origin (voir la protection CSRF du proxy).
    if (!headers.has('sec-fetch-site')) headers.set('sec-fetch-site', 'same-origin');
    if (!headers.has('origin')) headers.set('origin', this.origin);
    if (this.cookies.size) headers.set('cookie', [...this.cookies].filter(([name]) => name !== 'refreshToken' || target.pathname === '/api' || target.pathname.startsWith('/api/')).map(([name, value]) => `${name}=${value}`).join('; '));
    this.browserRequests.push({ method: (init?.method ?? 'GET').toUpperCase(), path: `${target.pathname}${target.search}` });
    const response = await this.nativeFetch(target, { ...init, headers });
    for (const cookie of response.headers.getSetCookie()) {
      const [pair,...attributes]=cookie.split(';');const [name,...value]=pair.split('=');
      if(attributes.some(x=>/^\s*max-age=0\s*$/i.test(x))) this.cookies.delete(name.trim());
      else this.cookies.set(name.trim(),value.join('='));
    }
    return response;
  }

  async handle(req, res) {
    const url = new URL(req.url, this.origin);
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length && !['GET', 'HEAD'].includes(req.method) ? Buffer.concat(chunks) : undefined;
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    const request = new NextRequest(url, { method: req.method, headers, body });

    const response = await this.dispatch(request, url.pathname);
    const responseHeaders = {};
    response.headers.forEach((value, name) => { if (name !== 'set-cookie') responseHeaders[name] = value; });
    const setCookies = response.headers.getSetCookie();
    if (setCookies.length) responseHeaders['set-cookie'] = setCookies;
    res.writeHead(response.status, responseHeaders);
    res.end(Buffer.from(await response.arrayBuffer()));
  }

  /** Routage de l'App Router : route dédiée si elle existe, sinon `src/app/[...path]/route.ts`. */
  dispatch(request, pathname) {
    const routeFile = APP_ROUTES[pathname];
    if (routeFile) {
      const handler = loadTs(routeFile)[request.method];
      return handler ? handler(request) : new Response(null, { status: 405 });
    }
    const handler = loadTs('app/[...path]/route')[request.method];
    if (!handler) return new Response(null, { status: 405 });
    const segments = pathname.split('/').filter(Boolean).map(decodeURIComponent);
    return handler(request, { params: Promise.resolve({ path: segments }) });
  }
}

/** JWT non signé : seul le BFF vérifie la signature, le front ne fait que relayer le cookie. */
function jwtFor(userId, exp = Math.floor(Date.now() / 1000) + 3600) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: String(userId), exp })}.signature`;
}

module.exports = { FrontHarness, APP_ROUTES, CALENDAR_CONTRACT, jwtFor };
