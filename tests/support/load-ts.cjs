const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');

// Charge des modules src/**/*.ts sans build : transpilation à la volée en CommonJS, résolution de
// l'alias `@/*` du tsconfig et source maps en ligne pour que la couverture pointe sur les lignes TS.

const SRC = path.resolve(__dirname, '..', '..', 'src');
const COMPILER_OPTIONS = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2020,
  esModuleInterop: true,
  resolveJsonModule: true,
  inlineSourceMap: true,
  inlineSources: true,
};

function compile(module, filename) {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: COMPILER_OPTIONS, fileName: filename });
  module._compile(outputText, filename);
}

let installed = false;
function install() {
  if (installed) return;
  installed = true;
  require.extensions['.ts'] = compile;
  const resolveFilename = Module._resolveFilename;
  Module._resolveFilename = function resolveAlias(request, ...rest) {
    return resolveFilename.call(this, request.startsWith('@/') ? path.join(SRC, request.slice(2)) : request, ...rest);
  };
}

/** `loadTs('lib/bff-client')` charge `src/lib/bff-client.ts`. */
function loadTs(relativePath) {
  install();
  return require(path.join(SRC, relativePath.endsWith('.ts') ? relativePath : `${relativePath}.ts`));
}

/** Remplace un paquet (ex. `react`) par une implémentation de test pour tous les modules chargés ensuite. */
function stubModule(request, exports) {
  const filename = require.resolve(request);
  const stub = new Module(filename);
  stub.filename = filename;
  stub.exports = exports;
  stub.loaded = true;
  require.cache[filename] = stub;
}

module.exports = { loadTs, stubModule, SRC };
