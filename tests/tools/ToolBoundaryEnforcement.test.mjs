import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const ACTIVE_TOOL_FOLDERS = Object.freeze([
  "Tilemap Studio",
  "Parallax Scene Studio",
  "Vector Map Editor",
  "Vector Asset Studio",
  "Sprite Editor"
]);

function listScriptFiles(directoryPath) {
  const files = [];
  const entries = readdirSync(directoryPath, { withFileTypes: true });
  entries.forEach((entry) => {
    const nextPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listScriptFiles(nextPath));
      return;
    }
    if (entry.isFile() && (nextPath.endsWith(".js") || nextPath.endsWith(".mjs"))) {
      files.push(nextPath);
    }
  });
  return files;
}

function extractSpecifiers(fileText) {
  const specifiers = [];
  const fromMatches = fileText.matchAll(/from\s+["']([^"']+)["']/g);
  for (const match of fromMatches) {
    specifiers.push(match[1]);
  }
  const importCallMatches = fileText.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g);
  for (const match of importCallMatches) {
    specifiers.push(match[1]);
  }
  return specifiers;
}

function toPosixPath(value) {
  return value.replace(/\\/g, "/");
}

export async function run() {
  const toolsRoot = path.join(REPO_ROOT, "tools");

  ACTIVE_TOOL_FOLDERS.forEach((toolFolder) => {
    const toolPath = path.join(toolsRoot, toolFolder);
    assert.equal(statSync(toolPath).isDirectory(), true, `${toolFolder} must exist.`);
    const files = listScriptFiles(toolPath);

    files.forEach((filePath) => {
      const text = readFileSync(filePath, "utf8");
      const specifiers = extractSpecifiers(text);
      specifiers.forEach((specifier) => {
        if (!specifier.startsWith("../")) {
          return;
        }
        ACTIVE_TOOL_FOLDERS.forEach((candidateToolFolder) => {
          if (candidateToolFolder === toolFolder) {
            return;
          }
          const candidatePrefix = `../${candidateToolFolder}/`;
          assert.equal(
            specifier.startsWith(candidatePrefix),
            false,
            `${toPosixPath(filePath)} imports another active tool (${specifier}).`
          );
        });
      });
    });
  });

  const tilemapMain = readFileSync(path.join(toolsRoot, "Tilemap Studio", "main.js"), "utf8");
  const parallaxMain = readFileSync(path.join(toolsRoot, "Parallax Scene Studio", "main.js"), "utf8");
  const vectorAssetMain = readFileSync(path.join(toolsRoot, "Vector Asset Studio", "main.js"), "utf8");
  const sharedHelper = readFileSync(path.join(toolsRoot, "shared", "toolSampleCatalog.js"), "utf8");

  assert.match(tilemapMain, /from "\.\.\/shared\/toolSampleCatalog\.js"/);
  assert.match(parallaxMain, /from "\.\.\/shared\/toolSampleCatalog\.js"/);
  assert.match(vectorAssetMain, /from "\.\.\/shared\/toolSampleCatalog\.js"/);
  assert.doesNotMatch(tilemapMain, /function normalizeSamplePath\(/);
  assert.doesNotMatch(parallaxMain, /function normalizeSamplePath\(/);
  assert.doesNotMatch(vectorAssetMain, /function normalizeSamplePath\(/);
  assert.match(sharedHelper, /export function normalizeToolSamplePath\(/);
}
