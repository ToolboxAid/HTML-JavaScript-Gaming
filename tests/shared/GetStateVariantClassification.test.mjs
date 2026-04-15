/*
Toolbox Aid
David Quesenberry
04/14/2026
GetStateVariantClassification.test.mjs
*/
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyGetStateVariantDomain,
  classifyGetStateVariantLayer,
  extractGetStateVariantNames,
  bucketGetStateVariants,
} from "../../src/shared/state/index.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TARGET_ROOTS = ["src", "games", "samples", "tools"];

function collectJsLikeFiles(rootDir) {
  const files = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        return;
      }
      if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".mjs"))) {
        files.push(fullPath);
      }
    });
  }
  return files;
}

function toRepoRelative(filePath) {
  return path.relative(ROOT, filePath).replaceAll("\\", "/");
}

function collectGetStateVariantEntries() {
  const entries = [];
  TARGET_ROOTS.forEach((root) => {
    const rootPath = path.join(ROOT, root);
    if (!existsSync(rootPath) || !statSync(rootPath).isDirectory()) {
      return;
    }

    collectJsLikeFiles(rootPath).forEach((filePath) => {
      const sourceText = readFileSync(filePath, "utf8");
      const names = extractGetStateVariantNames(sourceText);
      const rel = toRepoRelative(filePath);
      names.forEach((name) => {
        entries.push({ name, filePath: rel });
      });
    });
  });
  return entries;
}

export function run() {
  assert.equal(classifyGetStateVariantDomain("getSimulationState"), "simulation");
  assert.equal(classifyGetStateVariantDomain("getReplayState"), "replay");
  assert.equal(classifyGetStateVariantDomain("getEditorState"), "editor");
  assert.equal(classifyGetStateVariantDomain("getState"), "other");

  assert.equal(classifyGetStateVariantLayer("samples/phase-01/test.js"), "sample");
  assert.equal(classifyGetStateVariantLayer("tools/shared/test.js"), "tool");
  assert.equal(classifyGetStateVariantLayer("src/engine/test.js"), "runtime");
  assert.equal(classifyGetStateVariantLayer("games/Asteroids/test.js"), "runtime");

  const entries = collectGetStateVariantEntries();
  assert.equal(entries.length > 0, true);

  const buckets = bucketGetStateVariants(entries);
  assert.equal(buckets.byDomain.simulation.length > 0, true);
  assert.equal(buckets.byDomain.replay.length > 0, true);
  assert.equal(buckets.byDomain.editor.length > 0, true);
  assert.equal(buckets.byDomain.other.length > 0, true);

  assert.equal(buckets.byLayer.sample.length > 0, true);
  assert.equal(buckets.byLayer.tool.length > 0, true);
  assert.equal(buckets.byLayer.runtime.length > 0, true);

  const simulationNames = new Set(buckets.byDomain.simulation.map((entry) => entry.name));
  const replayNames = new Set(buckets.byDomain.replay.map((entry) => entry.name));
  const editorNames = new Set(buckets.byDomain.editor.map((entry) => entry.name));
  assert.equal(simulationNames.has("getSimulationState"), true);
  assert.equal(replayNames.has("getReplayState"), true);
  assert.equal(editorNames.has("getEditorState"), true);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
