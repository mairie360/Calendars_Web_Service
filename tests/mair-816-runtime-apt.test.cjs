// MAIR-816: the release-dev Trivy gate refused the image for apt 2.6.1 (CVE-2026-109518, fixed in
// 2.6.2), still shipped by the node bookworm-slim base. The runtime stage must upgrade apt through
// the signed Debian repositories and fail the build if the installed version is older than the fix.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');

const runtimeBase = () => {
  const dockerfile = readFileSync(join(__dirname, '..', 'Dockerfile'), 'utf8');
  const stage = dockerfile.split(/ AS runtime-base\n/)[1];
  assert.ok(stage, 'Dockerfile has a runtime-base stage');
  return stage.split(/\nFROM /)[0];
};

test('MAIR-816 the runtime image upgrades apt past CVE-2026-109518', () => {
  const stage = runtimeBase();
  assert.match(stage, /apt-get -o Acquire::Retries=0 install -y --no-install-recommends [^\n]*\bapt\b/);
  // The download runs with the vulnerable apt: no retry may reach the vulnerable code path.
  assert.match(stage, /apt-get -o Acquire::Retries=0 update/);
  assert.doesNotMatch(stage, /apt-get (update|install)/);
  assert.match(stage, /dpkg-query -W -f='\$\{Version\}' apt\)" ge '2\.6\.2'/);
});

// Trivy also refuses the libpam of the same base image (CVE-2025-6020); the runtime
// stage upgrades the four libpam packages and fails the build below the fixed Debian revision.
test('MAIR-1256 the runtime image upgrades libpam past CVE-2025-6020', () => {
  const stage = runtimeBase();
  const install = stage.match(/apt-get -o Acquire::Retries=0 install -y --no-install-recommends ([^&]*)&&/)?.[1] ?? '';
  for (const pkg of ['libpam0g', 'libpam-modules', 'libpam-modules-bin', 'libpam-runtime']) {
    assert.match(install, new RegExp(`(^|\\s)${pkg}(\\s|\\\\|$)`), `${pkg} is upgraded`);
  }
  assert.match(stage, /dpkg-query -W -f='\$\{Version\}' libpam-modules\)" ge '1\.5\.2-6\+deb12u3'/);
});
