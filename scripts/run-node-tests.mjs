/*
Toolbox Aid
David Quesenberry
03/21/2026
run-node-tests.mjs
*/
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const ROOT_ALIASES = ['/src/', '/games/', '/tools/', '/samples/'];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (ROOT_ALIASES.some((prefix) => specifier.startsWith(prefix))) {
      const resolved = pathToFileURL(path.join(repoRoot, specifier.slice(1))).href;
      return nextResolve(resolved, context);
    }

    return nextResolve(specifier, context);
  },
});

await import('../tests/run-tests.mjs');
