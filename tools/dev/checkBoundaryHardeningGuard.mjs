import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCAN_ROOTS = ['src/engine', 'src/shared', 'games', 'tools'];
const EXTENSIONS = new Set(['.js', '.mjs']);

const LAYER_BY_PREFIX = Object.freeze([
  ['src/engine/', 'engine'],
  ['src/shared/', 'shared'],
  ['games/', 'games'],
  ['tools/', 'tools'],
]);

const FORBIDDEN_TARGETS_BY_SOURCE = Object.freeze({
  engine: new Set(['games', 'tools', 'samples', 'docs']),
  shared: new Set(['engine', 'games', 'tools', 'samples', 'docs']),
  games: new Set(['tools', 'samples', 'docs']),
  tools: new Set(['games', 'samples', 'docs']),
});

const IMPORT_SPECIFIER_RE = /(?:^\s*import[\s\S]*?\sfrom\s*['"]([^'"]+)['"]\s*;?$|^\s*import\s*\(\s*['"]([^'"]+)['"]\s*\)|^\s*(?:const|let|var)\s+[\s\S]*?\s=\s*require\(\s*['"]([^'"]+)['"]\s*\))/gm;

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function listSourceFiles(rootRelative) {
  const rootAbsolute = path.join(ROOT, rootRelative);
  if (!fs.existsSync(rootAbsolute)) {
    return [];
  }
  const stack = [rootAbsolute];
  const files = [];
  while (stack.length > 0) {
    const next = stack.pop();
    if (!next) {
      continue;
    }
    const entries = fs.readdirSync(next, { withFileTypes: true });
    for (const entry of entries) {
      const entryAbsolute = path.join(next, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryAbsolute);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      if (!EXTENSIONS.has(path.extname(entry.name))) {
        continue;
      }
      files.push(entryAbsolute);
    }
  }
  return files;
}

function resolveLayerForAbsolutePath(absoluteFilePath) {
  const relative = normalizePath(path.relative(ROOT, absoluteFilePath));
  for (const [prefix, layer] of LAYER_BY_PREFIX) {
    if (relative.startsWith(prefix)) {
      return layer;
    }
  }
  return null;
}

function resolveLayerForSpecifier(sourceAbsolutePath, rawSpecifier) {
  const specifier = normalizePath(rawSpecifier);

  if (specifier.startsWith('/')) {
    const absolute = path.resolve(ROOT, specifier.slice(1));
    return resolveLayerForAbsolutePath(absolute);
  }

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const absolute = path.resolve(path.dirname(sourceAbsolutePath), specifier);
    return resolveLayerForAbsolutePath(absolute);
  }

  return null;
}

function evaluateSpecifier(sourceLayer, targetLayer) {
  if (!targetLayer || !sourceLayer) {
    return null;
  }
  if (targetLayer === sourceLayer) {
    return null;
  }
  const forbiddenTargets = FORBIDDEN_TARGETS_BY_SOURCE[sourceLayer] || new Set();
  if (!forbiddenTargets.has(targetLayer)) {
    return null;
  }
  return `${sourceLayer} layer must not depend on ${targetLayer} layer`;
}

function collectViolations() {
  const files = SCAN_ROOTS.flatMap((root) => listSourceFiles(root));
  const violations = [];

  for (const fileAbsolute of files) {
    const sourceLayer = resolveLayerForAbsolutePath(fileAbsolute);
    if (!sourceLayer) {
      continue;
    }
    const sourceRelative = normalizePath(path.relative(ROOT, fileAbsolute));
    const text = fs.readFileSync(fileAbsolute, 'utf8');

    let match = IMPORT_SPECIFIER_RE.exec(text);
    while (match) {
      const rawSpecifier = match[1] || match[2] || match[3] || '';
      const targetLayer = resolveLayerForSpecifier(fileAbsolute, rawSpecifier);
      const reason = evaluateSpecifier(sourceLayer, targetLayer);
      if (reason) {
        const line = text.slice(0, match.index).split('\n').length;
        violations.push({
          file: sourceRelative,
          line,
          sourceLayer,
          targetLayer,
          specifier: rawSpecifier,
          reason,
        });
      }
      match = IMPORT_SPECIFIER_RE.exec(text);
    }
  }

  return {
    scannedFileCount: files.length,
    violations,
  };
}

function printReport(result) {
  console.log(`Boundary hardening guard scanned files: ${result.scannedFileCount}`);
  console.log(`Boundary hardening guard violations: ${result.violations.length}`);
  if (result.violations.length === 0) {
    return;
  }
  for (const violation of result.violations) {
    console.log(
      `${violation.file}:${violation.line} | ${violation.specifier} | ${violation.reason}`
    );
  }
}

function run() {
  const result = collectViolations();
  printReport(result);
  if (result.violations.length > 0) {
    process.exitCode = 1;
    return;
  }
  process.exitCode = 0;
}

run();
