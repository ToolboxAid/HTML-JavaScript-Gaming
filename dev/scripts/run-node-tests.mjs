/*
Toolbox Aid
David Quesenberry
03/21/2026
run-node-tests.mjs
*/
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const ROOT_ALIASES = new Map([
  ['/assets/', 'www/assets/'],
  ['/src/', 'src/'],
  ['/toolbox/', 'www/toolbox/'],
]);

registerHooks({
  resolve(specifier, context, nextResolve) {
    const alias = [...ROOT_ALIASES.entries()].find(([prefix]) => specifier.startsWith(prefix));
    if (alias) {
      const [prefix, targetRoot] = alias;
      const resolved = pathToFileURL(path.join(repoRoot, targetRoot, specifier.slice(prefix.length))).href;
      return nextResolve(resolved, context);
    }

    return nextResolve(specifier, context);
  },
});

await import('../tests/run-tests.mjs');
