/**
 * Path mapping validator for sample normalization.
 *
 * Usage:
 *   node tools/codex/path_mapping_validator.js mapping.json
 *
 * Checks:
 * - target paths match samples/phasexx/xxyy
 * - no duplicate targets
 * - no spaces in normalized target paths
 * - xxyy phase prefix matches phasexx
 */

const fs = require("fs");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeRel(relPath) {
  return relPath.replace(/[\\/]+/g, "/").replace(/^\/+|\/+$/g, "");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function validateTarget(toRel) {
  const normalized = normalizeRel(toRel);
  assert(!/\s/.test(normalized), `Spaces are not allowed in target path: ${normalized}`);

  const match = normalized.match(/^samples\/phase(\d{2})\/(\d{4})$/);
  assert(match, `Target path must match samples/phasexx/xxyy: ${normalized}`);

  const phase = match[1];
  const sample = match[2];
  assert(sample.startsWith(phase), `Sample number ${sample} does not belong under phase${phase}`);
}

function main() {
  const mappingFile = process.argv[2];
  assert(mappingFile, "Usage: node tools/codex/path_mapping_validator.js mapping.json");

  const config = readJson(mappingFile);
  assert(Array.isArray(config.moves), "mapping.json must include moves[]");

  const targets = new Set();

  for (const move of config.moves) {
    assert(move.from && move.to, `Invalid move entry: ${JSON.stringify(move)}`);
    validateTarget(move.to);

    const normalizedTarget = normalizeRel(move.to);
    assert(!targets.has(normalizedTarget), `Duplicate target path: ${normalizedTarget}`);
    targets.add(normalizedTarget);
  }

  console.log("SUCCESS: mapping validation passed.");
}

try {
  main();
} catch (err) {
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
}
