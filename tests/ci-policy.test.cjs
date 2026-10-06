const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');

const read = file => readFileSync(join(__dirname, '..', file), 'utf8');
const digest = '0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6';

test('production and development install the lock with a required ephemeral secret and readonly npm policy', () => {
  for (const file of ['Dockerfile', 'development.Dockerfile']) {
    const dockerfile = read(file);
    assert.match(dockerfile, /^# syntax=docker\/dockerfile:1$/m);
    assert.doesNotMatch(dockerfile, /^(ARG|ENV)\s+NODE_AUTH_TOKEN\b/m);
    assert.doesNotMatch(dockerfile, /echo.*(_authToken|NODE_AUTH_TOKEN)|npm config set|\bnpm install\b|\/run\/secrets/);
    assert.match(dockerfile, /RUN --mount=type=secret,id=node_auth_token,env=NODE_AUTH_TOKEN,required=true \\\n\s+--mount=type=bind,source=\.npmrc,target=\/app\/\.npmrc \\\n\s+npm ci\s*\n/);
    assert.equal([...dockerfile.matchAll(/\bnpm ci\b/g)].length, 1);
  }
  assert.match(read('.npmrc'), /^\/\/npm\.pkg\.github\.com\/:_authToken=\$\{NODE_AUTH_TOKEN\}$/m);
  assert.match(read('.npmrc'), /^min-release-age=7$/m);
  assert.match(read('.npmrc'), /^min-release-age-exclude\[\]=@mairie360\/lib-components$/m);
});

test('production, development and both consumer workflows pin the same exact official Node LTS', () => {
  for (const file of ['Dockerfile', 'development.Dockerfile']) {
    const dockerfile = read(file);
    assert.match(dockerfile, /^ARG NODE_VERSION=24\.21\.0$/m);
    const images = [...dockerfile.matchAll(/^FROM node:\$\{NODE_VERSION\}-bookworm-slim@sha256:([a-f0-9]{64}) AS ([\w-]+)$/gm)];
    assert.deepEqual(images.map(([, sha]) => sha), file === 'Dockerfile' ? [digest, digest] : [digest]);
  }
  assert.match(read('.github/workflows/cicd.yml'), /node_version: "24\.21\.0"/);
  assert.match(read('.github/workflows/contracts.yml'), /node-version: '24\.21\.0'/);
});

test('production keeps the non-root standalone Node and curl runtime without unused package managers', () => {
  const dockerfile = read('Dockerfile');
  const runner = dockerfile.split('FROM runtime-base AS runner\n')[1];
  assert.ok(runner);
  assert.match(runner, /^USER nextjs$/m);
  assert.match(runner, /^ENV PORT=5002$/m);
  assert.match(runner, /^CMD \["node", "server\.js"\]$/m);
  assert.doesNotMatch(runner, /NODE_AUTH_TOKEN|\.npmrc|npm|yarn|corepack|COPY \. \./);
  assert.match(dockerfile, /rm -rf \/usr\/local\/lib\/node_modules\/npm \/usr\/local\/lib\/node_modules\/corepack \/opt\/yarn-v1\.22\.22/);
  assert.match(dockerfile, /rm -f \/usr\/local\/bin\/npm \/usr\/local\/bin\/npx \/usr\/local\/bin\/corepack \/usr\/local\/bin\/yarn \/usr\/local\/bin\/yarnpkg/);
  const dev = read('development.Dockerfile');
  assert.match(dev, /^USER projects$/m);
  assert.match(dev, /^ENV NODE_ENV=development$/m);
  assert.match(dev, /^CMD \["npm", "run", "dev"\]$/m);
});

test('Docker excludes local environments and artifacts while retaining tracked npm policy', () => {
  const patterns = read('.dockerignore').split(/\r?\n/).map(line => line.trim());
  for (const item of ['node_modules', '.next', '.git', '.env*', '.npmrc.*', 'cicd-repo', 'rgaa-report', '.rgaa-ai-cache', 'coverage', 'test-results', 'playwright-report']) assert.ok(patterns.includes(item), item);
  assert.ok(!patterns.includes('.npmrc') && !patterns.includes('.npmrc*'));
});

test('the development Compose build uses the required secret without runtime credentials', () => {
  const yaml = require('js-yaml');
  const compose = yaml.load(read('docker-compose.yml'));
  assert.deepEqual(compose.secrets, { node_auth_token: { environment: 'NODE_AUTH_TOKEN' } });
  assert.deepEqual(compose.services['calendar-front'].build, {
    context: '.', dockerfile: 'development.Dockerfile', secrets: ['node_auth_token'],
  });
  for (const [name, service] of Object.entries(compose.services)) {
    assert.ok(!service.secrets, `${name}: no runtime secret`);
    assert.ok(!service.environment || !Object.hasOwn(service.environment, 'NODE_AUTH_TOKEN'), `${name}: no runtime token`);
    if (name !== 'calendar-front') assert.ok(!service.build, `${name}: unchanged existing image`);
  }
});

test('isolated test stacks run the published image, the scripts build it with a secret only', () => {
  const yaml = require('js-yaml');
  const stacks = {
    'docker-compose-security.yml': 'security_test.sh',
    'docker-compose-performance.yml': 'performance_test.sh',
    'docker-compose-accessibility.yml': 'accessibility_test.sh',
  };
  for (const [file, script] of Object.entries(stacks)) {
    const compose = yaml.load(read(file));
    // The CI exports IMAGE_REF (dev-<sha> for ZAP / k6, staging-<sha> for RGAA): never rebuilt.
    assert.match(compose.services['calendar-front'].image, /^\$\{IMAGE_REF:\?/);
    assert.ok(!compose.secrets, `${file}: no build secret left`);
    for (const [name, service] of Object.entries(compose.services)) {
      assert.ok(!service.build, `${file} ${name}: no build`);
      assert.ok(!service.secrets, `${file} ${name}: no runtime secret`);
      assert.ok(!service.environment || !Object.hasOwn(service.environment, 'NODE_AUTH_TOKEN'), `${file} ${name}: no runtime token`);
    }
    const shell = read(script);
    assert.match(shell, /docker build -t calendar-front:local --secret id=node_auth_token,env=NODE_AUTH_TOKEN \./);
    assert.doesNotMatch(shell, /--build-arg|up -d --build/);
  }
});

test('consumer CI retains blocking security defaults and explicit named secrets', () => {
  const ci = read('.github/workflows/cicd.yml');
  assert.doesNotMatch(ci, /secrets:\s*inherit|continue-on-error:|image_scan_fail_on_findings:|semgrep_fail_on_findings:\s*false/);
  assert.deepEqual([...ci.matchAll(/^ {6}([A-Z0-9_]+): \$\{\{ secrets\.([A-Z0-9_]+) \}\}$/gm)].map(([, target, source]) => [target, source]), [
    ['CODECOV_TOKEN', 'CODECOV_TOKEN'], ['N8N_WEBHOOK_SECRET', 'N8N_WEBHOOK_SECRET'],
    // AI pre-audit of the RGAA check (release-prod), MAIR-320.
    ['ANTHROPIC_API_KEY', 'ANTHROPIC_API_KEY'],
  ]);
});
