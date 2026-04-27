import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getActiveToolRegistry } from "../../tools/toolRegistry.js";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

const DISALLOWED_RUNTIME_PATTERNS = Object.freeze([
  {
    name: "silent default sample loader",
    regex: /\bloadDefaultSample\s*\(/i
  },
  {
    name: "default sample symbol",
    regex: /\bdefaultSample\b/i
  },
  {
    name: "tool-local sample manifest coupling",
    regex: /\bSAMPLE_MANIFEST_PATH\b/
  },
  {
    name: "tool-local sample manifest load coupling",
    regex: /\bloadSampleManifest\s*\(/i
  },
  {
    name: "hardcoded sample/demo JSON fetch",
    regex: /fetch\(\s*["'`](?:\/|\.\/)?(?:samples\/|tools\/[^"'`]*\/samples\/)[^"'`]*\.json["'`]/i
  },
  {
    name: "hardcoded /assets JSON path",
    regex: /["'`][^"'`]*\/assets\/[^"'`]*\.json["'`]/i
  },
  {
    name: "legacy workspace asset catalog fallback path",
    regex: /workspace\.asset-catalog\.json/i
  },
  {
    name: "legacy game query fallback",
    regex: /searchParams\.get\(["']game["']\)/i
  }
]);

function toRepoPath(absPath) {
  return path.relative(REPO_ROOT, absPath).replace(/\\/g, "/");
}

function listScriptFiles(directoryPath) {
  const files = [];
  const stack = [directoryPath];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        return;
      }
      if (entry.isFile() && /\.(js|mjs)$/i.test(entry.name)) {
        files.push(fullPath);
      }
    });
  }
  return files;
}

function scanForDisallowedPatterns(filePath, text) {
  const violations = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    DISALLOWED_RUNTIME_PATTERNS.forEach((pattern) => {
      if (!pattern.regex.test(line)) {
        return;
      }
      violations.push(`${toRepoPath(filePath)}:${index + 1} (${pattern.name}) ${line.trim()}`);
    });
  });
  return violations;
}

export async function run() {
  const violations = [];

  getActiveToolRegistry().forEach((tool) => {
    const toolRoot = path.join(REPO_ROOT, "tools", tool.folderName);
    const scriptFiles = listScriptFiles(toolRoot);
    const runtimeBlob = scriptFiles.map((filePath) => fs.readFileSync(filePath, "utf8")).join("\n");

    const bootRegistrationPresent = runtimeBlob.includes(`registerToolBootContract("${tool.id}"`)
      || runtimeBlob.includes(`registerToolBootContract('${tool.id}'`);
    assert.equal(bootRegistrationPresent, true, `${tool.id} must register a boot contract.`);

    scriptFiles.forEach((filePath) => {
      const text = fs.readFileSync(filePath, "utf8");
      violations.push(...scanForDisallowedPatterns(filePath, text));

      if (text.includes("samplePresetPath") && text.includes("fetch(")) {
        const guardIndex = text.indexOf("if (!samplePresetPath)");
        const fetchIndex = guardIndex >= 0 ? text.indexOf("fetch(", guardIndex) : -1;
        const returnIndex = guardIndex >= 0 ? text.indexOf("return", guardIndex) : -1;
        assert.equal(
          guardIndex >= 0 && returnIndex >= 0 && fetchIndex >= 0 && returnIndex < fetchIndex,
          true,
          `${toRepoPath(filePath)} must guard sample preset fetch behind explicit samplePresetPath input.`
        );
      }
    });
  });

  assert.equal(
    violations.length,
    0,
    `Hidden tool coupling violations detected:\n${violations.join("\n")}`
  );
}
