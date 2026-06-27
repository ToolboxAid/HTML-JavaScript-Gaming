/**
 * Windows-safe rename/move engine template for Codex BUILD work.
 * Uses Node.js path APIs only. No shell interpolation.
 *
 * Usage:
 *   node tools/codex/node_rename_engine_template.js mapping.json
 *
 * mapping.json format:
 * {
 *   "projectRoot": "C:/Users/you/Documents/GitHub/HTML-JavaScript-Gaming",
 *   "moves": [
 *     { "from": "samples/Phase 13 - Network Concepts, Latency & Simulation (1301-1315)/1316_network_sample_a", "to": "samples/phase13/1316" }
 *   ]
 * }
 */

const fs = require("fs");
const path = require("path");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function exists(p) {
  return fs.existsSync(p);
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeRel(relPath) {
  return relPath.replace(/[\\/]+/g, "/").replace(/^\/+|\/+$/g, "");
}

function validateMapping(projectRoot, moves) {
  assert(Array.isArray(moves) && moves.length > 0, "Mapping must contain at least one move.");
  const targets = new Set();

  for (const move of moves) {
    assert(move.from && move.to, `Invalid move entry: ${JSON.stringify(move)}`);

    const fromRel = normalizeRel(move.from);
    const toRel = normalizeRel(move.to);

    assert(/^samples\/phase\d{2}\/\d{4}$/.test(toRel.replace(/\//g, "/")) ||
           /^samples\/phase\d{2}\/\d{4}$/.test(toRel.replace(/\//g, "/")) === false,
           "Internal regex guard failure.");

    assert(/^samples\/phase\d{2}\/\d{4}$/.test(toRel.replace(/\//g, "/")) ||
           /^samples\/phase\d{2}\/\d{4}$/.test(toRel.replace(/\//g, "/")) === false,
           "Internal regex guard failure.");
  }

  for (const move of moves) {
    const fromRel = normalizeRel(move.from);
    const toRel = normalizeRel(move.to);

    assert(/^samples\/phase\d{2}\/\d{4}$/.test(toRel), `Target path must match samples/phasexx/xxyy: ${toRel}`);

    const fromAbs = path.resolve(projectRoot, fromRel);
    const toAbs = path.resolve(projectRoot, toRel);

    assert(exists(fromAbs), `Source path missing: ${fromRel}`);
    assert(!targets.has(toRel), `Duplicate target path: ${toRel}`);
    targets.add(toRel);

    if (exists(toAbs)) {
      throw new Error(`Target already exists: ${toRel}`);
    }
  }
}

function movePath(projectRoot, fromRel, toRel) {
  const fromAbs = path.resolve(projectRoot, normalizeRel(fromRel));
  const toAbs = path.resolve(projectRoot, normalizeRel(toRel));
  ensureDir(path.dirname(toAbs));
  fs.renameSync(fromAbs, toAbs);
  console.log(`MOVED: ${fromRel} -> ${toRel}`);
}

function main() {
  const mappingFile = process.argv[2];
  assert(mappingFile, "Usage: node tools/codex/node_rename_engine_template.js mapping.json");

  const config = readJson(mappingFile);
  const projectRoot = config.projectRoot;
  const moves = config.moves;

  assert(projectRoot, "mapping.json must include projectRoot");
  validateMapping(projectRoot, moves);

  for (const move of moves) {
    movePath(projectRoot, move.from, move.to);
  }

  console.log("SUCCESS: All moves completed.");
}

try {
  main();
} catch (err) {
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
}
