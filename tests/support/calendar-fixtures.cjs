// Réponses BFF_Calendar conformes à contracts/openapi.json (validées dans bff-contract.test.cjs)
// et environnement navigateur minimal pour le code client.

const alice = { id: 'user-7', name: 'Alice Martin', email: 'alice@mairie.test', role: 'User' };
const marie = { id: 'user-3', name: 'Marie Responsable', email: 'marie@mairie.test', role: 'Responsable' };
const admin = { id: 'user-1', name: 'Admin Mairie', email: 'admin@mairie.test', role: 'Admin' };

// Follow the same instance civil day as the page, including when host and instance
// dates differ around midnight. This fixture does not select the host time zone.
function todayYmd() {
  const now = require('./load-ts.cjs').loadTs('app/calendar/date-utils').calendarToday();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function calendarEvent(id, overrides = {}) {
  return {
    id,
    title: `Événement ${id}`,
    date: todayYmd(),
    category: 'meeting',
    service: 'direction',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Salle du conseil',
    description: `Description ${id}`,
    assigneeIds: [alice.id],
    assignees: [alice],
    approvalStatus: 'pending',
    createdById: admin.id,
    canValidate: true,
    canEdit: true,
    canDelete: true,
    ...overrides,
  };
}

function bootstrap(overrides = {}) {
  return {
    events: [calendarEvent(5), calendarEvent(6, { title: 'Permanence', category: 'other', assignees: undefined, assigneeIds: [marie.id], canValidate: false })]
      .map((event) => JSON.parse(JSON.stringify(event))),
    users: Object.fromEntries([admin, alice, marie].map((person) => [person.id, person])),
    assignees: [admin, alice, marie],
    categories: [{ label: 'Réunion', value: 'meeting' }, { label: 'Autre', value: 'other' }],
    services: [{ label: 'Direction générale', value: 'direction' }],
    currentUser: { id: admin.id, name: admin.name, email: admin.email, role: 'Admin', groupIds: [1, 2] },
    assigneeScope: 'all',
    ...overrides,
  };
}

/** Codes publiés par ErrorResponseErrorCode (enveloppe d'erreur commune des BFFs, MAIR-234). */
const ERROR_CODES = new Set(['BAD_REQUEST', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT', 'PAYLOAD_TOO_LARGE', 'UNPROCESSABLE_ENTITY', 'TOO_MANY_REQUESTS', 'INTERNAL_ERROR', 'BAD_GATEWAY', 'SERVICE_UNAVAILABLE', 'GATEWAY_TIMEOUT']);
const LEGACY_CODES = { UNAVAILABLE: 'SERVICE_UNAVAILABLE', BFF_UNAVAILABLE: 'SERVICE_UNAVAILABLE', ERROR: 'INTERNAL_ERROR', BFF_ERROR: 'BAD_GATEWAY' };
/** Erreur BFF_Calendar (schéma ErrorResponse : { error: { code, message, details } }), le code dans l'enum publié. */
const apiError = (code, message, details = []) => ({ error: { code: ERROR_CODES.has(code) ? code : (LEGACY_CODES[code] ?? 'INTERNAL_ERROR'), message, details } });

/** Session BFF User conforme à `SessionResponse`. */
function sessionResponse(overrides = {}) {
  return {
    user: { id: 1, first_name: 'Admin', last_name: 'Mairie', email: 'admin@mairie.test', phone: null, status: 'active', ...overrides.user },
    groups: overrides.groups ?? [{ id: 1, name: 'Direction', owner_id: 1, description: null }],
    roles: overrides.roles ?? [{ id: 1, name: 'admin' }],
  };
}

/** `window` minimal : localStorage en mémoire et `location.reload` / `location.assign` enregistrés. */
function installWindow() {
  const store = new Map();
  const window = {
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
    },
    location: { href: new URL(process.env.CALENDAR_FRONT_URL ?? 'http://calendar.mairie.test/').href, reloads: 0, assigned: [], reload() { this.reloads += 1; }, assign(href) { this.assigned.push(href); } },
  };
  global.window = window;
  const { loadTs } = require('./load-ts.cjs');
  loadTs('lib/front-urls').setBrowserFrontUrls({ LOGIN_FRONT_URL: process.env.LOGIN_FRONT_URL ?? 'https://login.mairie.test', CALENDAR_FRONT_URL: process.env.CALENDAR_FRONT_URL ?? 'http://calendar.mairie.test/' });
  return window;
}

module.exports = { admin, alice, marie, apiError, bootstrap, calendarEvent, installWindow, sessionResponse };
