const http = require('node:http');

// Faux BFF servi en HTTP réel (port des BFF, tests/support/contract-mock-server.ts) : chaque requête
// reçue est vérifiée contre le contrat OpenAPI du BFF simulé (chemin, méthode, paramètres, query non
// déclarée, corps JSON) et chaque réponse mockée est validée contre le schéma du statut renvoyé.
// Les écarts sont collectés dans `violations` et font échouer le test (voir `assertNoViolations`).

class ContractMockServer {
  constructor(service, contract) {
    this.service = service;
    this.contract = contract;
    this.requests = [];
    this.violations = [];
    this.handlers = new Map();
    this.url = '';
  }

  async start() {
    this.server = http.createServer((req, res) => {
      this.handle(req, res).catch((error) => {
        this.violations.push(`[${this.service}] erreur du mock : ${error instanceof Error ? error.message : String(error)}`);
        send(res, 500, JSON.stringify({ code: 'MOCK_ERROR', message: 'Erreur du mock' }));
      });
    });
    await new Promise((resolve) => this.server.listen(0, '127.0.0.1', resolve));
    this.url = `http://127.0.0.1:${this.server.address().port}`;
    return this.url;
  }

  async stop() {
    if (!this.server) return;
    this.server.closeAllConnections();
    await new Promise((resolve) => this.server.close(resolve));
    this.server = undefined;
  }

  /** Enregistre une réponse ; le couple méthode/chemin doit exister dans le contrat du BFF. */
  on(method, template, handler) {
    if (!this.contract.document.paths[template]?.[method.toLowerCase()]) {
      throw new Error(`${method} ${template} n'est pas déclaré dans le contrat ${this.contract.title}`);
    }
    this.handlers.set(`${method.toUpperCase()} ${template}`, typeof handler === 'function' ? handler : () => handler);
    return this;
  }

  reset() {
    this.requests.length = 0;
    this.violations.length = 0;
    this.handlers.clear();
  }

  calls(template, method) {
    return this.requests.filter((request) => request.template === template && (!method || request.method === method.toUpperCase()));
  }

  /** Séquence `METHOD /chemin?query` reçue, dans l'ordre. */
  sequence() {
    return this.requests.map((request) => `${request.method} ${request.url.pathname}${request.url.search}`);
  }

  async handle(req, res) {
    const method = req.method ?? 'GET';
    const url = new URL(req.url ?? '/', this.url);
    const rawBody = await readBody(req);
    const { match, errors, undeclaredQuery } = this.contract.validateRequest(method, url);
    const where = `${method} ${url.pathname}${url.search}`;
    errors.forEach((error) => this.violations.push(`[${this.service}] requête ${where} : ${error}`));
    undeclaredQuery.forEach((name) => this.violations.push(`[${this.service}] requête ${where} : paramètre query "${name}" non déclaré`));
    if (!match) return send(res, 404, JSON.stringify({ code: 'NOT_FOUND', message: 'Route absente du contrat' }));

    let body;
    const { required, schema: bodySchema } = this.contract.requestBodySchema(match);
    if (rawBody) {
      if (!match.operation.requestBody) this.violations.push(`[${this.service}] requête ${method} ${match.template} : corps envoyé sans requestBody déclaré`);
      try { body = JSON.parse(rawBody); } catch { this.violations.push(`[${this.service}] requête ${method} ${match.template} : corps JSON invalide`); }
    } else if (required) {
      this.violations.push(`[${this.service}] requête ${method} ${match.template} : corps requis manquant`);
    }
    if (bodySchema && body !== undefined) {
      this.contract.validate(bodySchema, body, '$body').forEach((error) => this.violations.push(`[${this.service}] requête ${method} ${match.template} ${error}`));
    }

    const request = { method, url, template: match.template, pathParams: match.pathParams, headers: req.headers, body };
    this.requests.push(request);
    const handler = this.handlers.get(`${method} ${match.template}`);
    if (!handler) {
      this.violations.push(`[${this.service}] appel non mocké : ${method} ${match.template}`);
      return send(res, 500, JSON.stringify({ code: 'NOT_MOCKED', message: 'Appel non mocké' }));
    }

    const reply = handler(request);
    const status = reply.status ?? 200;
    const { documented, schema } = this.contract.responseSchema(match, status);
    if (!documented) this.violations.push(`[${this.service}] ${method} ${match.template} : statut ${status} non documenté`);
    if (schema && reply.body !== undefined) {
      this.contract.validate(schema, reply.body).forEach((error) => this.violations.push(`[${this.service}] réponse ${status} ${method} ${match.template} ${error}`));
    }
    return send(res, status, reply.body === undefined ? '' : JSON.stringify(reply.body), reply.headers);
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function send(res, status, payload, headers = {}) {
  if (res.headersSent) return;
  res.writeHead(status, { ...(payload ? { 'Content-Type': 'application/json' } : {}), ...headers });
  res.end(payload);
}

/** Retourne une URL sur laquelle rien n'écoute (port libéré juste après attribution). */
async function unreachableUrl() {
  const server = http.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return `http://127.0.0.1:${port}`;
}

module.exports = { ContractMockServer, unreachableUrl };
