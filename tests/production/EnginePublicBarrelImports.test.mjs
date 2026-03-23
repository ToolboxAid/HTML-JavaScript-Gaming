/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 EnginePublicBarrelImports.test.mjs
*/
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const SCAN_ROOTS = ['samples', 'games'];
const IMPORT_PATTERN = /(?:import\s+[^'"]*?\sfrom\s+|export\s+[^'"]*?\sfrom\s+|import\s*\()\s*['"](?<path>[^'"]*engine\/[^'"]+)['"]/g;
const APPROVED_DIRECT_IMPORTS = new Set([
  'engine/core/Engine.js',
]);

function collectSourceFiles(rootPath) {
  const files = [];

  for (const entry of readdirSync(rootPath)) {
    const fullPath = path.join(rootPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (/\.(js|mjs|html)$/i.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
}

function findDeepEngineImports() {
  const violations = [];

  for (const scanRoot of SCAN_ROOTS) {
    const rootPath = path.join(REPO_ROOT, scanRoot);
    const files = collectSourceFiles(rootPath);

    for (const filePath of files) {
      const source = readFileSync(filePath, 'utf8');
      const relativePath = path.relative(REPO_ROOT, filePath).replaceAll('\\', '/');

      for (const match of source.matchAll(IMPORT_PATTERN)) {
        const rawPath = match.groups?.path;
        if (!rawPath) {
          continue;
        }

        const normalized = rawPath.replaceAll('\\', '/');
        const enginePath = normalized.slice(normalized.indexOf('engine/'));

        if (APPROVED_DIRECT_IMPORTS.has(enginePath) || enginePath.endsWith('/index.js')) {
          continue;
        }

        const [, subsystem] = enginePath.split('/');
        if (!subsystem) {
          continue;
        }

        const barrelPath = path.join(REPO_ROOT, 'engine', subsystem, 'index.js');
        if (!existsSync(barrelPath)) {
          continue;
        }

        violations.push(`${relativePath} -> ${enginePath}`);
      }
    }
  }

  return violations.sort();
}

export function run() {
  const violations = findDeepEngineImports();
  assert.deepEqual(violations, []);
}
