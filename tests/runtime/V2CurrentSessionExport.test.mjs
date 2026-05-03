import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const workspaceJsPath = path.join(repoRoot, "tools", "workspace-v2", "index.js");
const workspaceManifestSchemaPath = path.join(repoRoot, "tools", "schemas", "workspace.manifest.schema.json");
const deprecatedWorkspaceSchemaPath = path.join(repoRoot, "tools", "schemas", "workspace.schema.json");
const testPath = path.join(repoRoot, "tests", "runtime", "V2CurrentSessionExport.test.mjs");
const resultsPath = path.join(repoRoot, "tmp", "v2-current-tool-state-export-results.json");

function checkSyntax(filePath) {
  try {
    execFileSync(process.execPath, ["--check", filePath], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ok: true, error: "" };
  } catch (error) {
    return { ok: false, error: (error?.stderr || error?.stdout || error?.message || "").toString().trim() };
  }
}

function validateWorkspaceManifestShape(workspaceDocument) {
  if (!workspaceDocument || typeof workspaceDocument !== "object" || Array.isArray(workspaceDocument)) {
    return { ok: false, message: "manifest must be an object." };
  }
  const requiredRootKeys = ["documentKind", "schema", "version", "id", "name", "tools"];
  for (const key of requiredRootKeys) {
    if (!Object.prototype.hasOwnProperty.call(workspaceDocument, key)) {
      return { ok: false, message: `root.${key} is required.` };
    }
  }
  if (workspaceDocument.documentKind !== "workspace-manifest") {
    return { ok: false, message: "documentKind must be workspace-manifest." };
  }
  if (!workspaceDocument.tools || typeof workspaceDocument.tools !== "object" || Array.isArray(workspaceDocument.tools)) {
    return { ok: false, message: "tools must be an object." };
  }
  if (Object.prototype.hasOwnProperty.call(workspaceDocument.tools, "palette")) {
    return { ok: false, message: "tools.palette is not allowed." };
  }
  if (Object.prototype.hasOwnProperty.call(workspaceDocument.tools, "palettes")) {
    return { ok: false, message: "tools.palettes is not allowed." };
  }
  if (!Object.prototype.hasOwnProperty.call(workspaceDocument.tools, "palette-browser")) {
    return { ok: false, message: "tools.palette-browser is required." };
  }
  const paletteBrowser = workspaceDocument.tools["palette-browser"];
  if (!paletteBrowser || typeof paletteBrowser !== "object" || Array.isArray(paletteBrowser)) {
    return { ok: false, message: "tools.palette-browser must be an object." };
  }
  if (paletteBrowser.schema !== "html-js-gaming.palette") {
    return { ok: false, message: "tools.palette-browser.schema is unsupported." };
  }
  if (!Number.isInteger(paletteBrowser.version) || paletteBrowser.version < 1) {
    return { ok: false, message: "tools.palette-browser.version must be a positive integer." };
  }
  if (typeof paletteBrowser.name !== "string" || !paletteBrowser.name.trim()) {
    return { ok: false, message: "tools.palette-browser.name is required." };
  }
  if (!Array.isArray(paletteBrowser.swatches)) {
    return { ok: false, message: "tools.palette-browser.swatches must be an array." };
  }
  for (let index = 0; index < paletteBrowser.swatches.length; index += 1) {
    const swatch = paletteBrowser.swatches[index];
    if (!swatch || typeof swatch !== "object" || Array.isArray(swatch)) {
      return { ok: false, message: `tools.palette-browser.swatches[${index}] must be an object.` };
    }
    const swatchKeys = Object.keys(swatch);
    const allowedSwatchKeys = new Set(["symbol", "hex", "name"]);
    for (const key of swatchKeys) {
      if (!allowedSwatchKeys.has(key)) {
        return { ok: false, message: `tools.palette-browser.swatches[${index}].${key} is not allowed.` };
      }
    }
    if (typeof swatch.symbol !== "string" || swatch.symbol.length !== 1) {
      return { ok: false, message: `tools.palette-browser.swatches[${index}].symbol must be one character.` };
    }
    if (typeof swatch.hex !== "string" || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(swatch.hex)) {
      return { ok: false, message: `tools.palette-browser.swatches[${index}].hex must be #RRGGBB or #RRGGBBAA.` };
    }
    if (typeof swatch.name !== "string" || !swatch.name.trim()) {
      return { ok: false, message: `tools.palette-browser.swatches[${index}].name is required.` };
    }
  }
  if (!Object.prototype.hasOwnProperty.call(workspaceDocument.tools, "workspace-v2")) {
    return { ok: false, message: "tools.workspace-v2 is required." };
  }
  if (Object.prototype.hasOwnProperty.call(workspaceDocument, "workspaceSession")) {
    return { ok: false, message: "root.workspaceSession is not allowed." };
  }
  if (Object.prototype.hasOwnProperty.call(workspaceDocument, "games")) {
    return { ok: false, message: "root.games is not allowed." };
  }
  return { ok: true, message: "" };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceManifestSchemaExists = fs.existsSync(workspaceManifestSchemaPath);
  const deprecatedWorkspaceSchemaExists = fs.existsSync(deprecatedWorkspaceSchemaPath);
  const workspaceJs = workspaceJsExists ? fs.readFileSync(workspaceJsPath, "utf8") : "";
  const workspaceManifestSchema = workspaceManifestSchemaExists
    ? JSON.parse(fs.readFileSync(workspaceManifestSchemaPath, "utf8"))
    : null;
  const workspaceJsSyntax = checkSyntax(workspaceJsPath);
  const testSyntax = checkSyntax(testPath);

  if (!workspaceJsExists) failures.push("Missing tools/workspace-v2/index.js.");
  if (!workspaceManifestSchemaExists) failures.push("Missing tools/schemas/workspace.manifest.schema.json.");
  if (!workspaceJsSyntax.ok) failures.push("tools/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2CurrentSessionExport.test.mjs failed syntax check.");
  if (deprecatedWorkspaceSchemaExists) failures.push("Deprecated tools/schemas/workspace.schema.json should not be present.");

  if (workspaceManifestSchema && workspaceManifestSchema.properties && workspaceManifestSchema.properties.tools) {
    const requiredToolsKeys = Array.isArray(workspaceManifestSchema.properties.tools.required)
      ? workspaceManifestSchema.properties.tools.required
      : [];
    if (!requiredToolsKeys.includes("palette-browser")) {
      failures.push("workspace.manifest.schema.json tools.required must include palette-browser.");
    }
    const toolProperties = workspaceManifestSchema.properties.tools.properties || {};
    if (!Object.prototype.hasOwnProperty.call(toolProperties, "palette-browser")) {
      failures.push("workspace.manifest.schema.json must define tools.palette-browser.");
    }
    if (Object.prototype.hasOwnProperty.call(toolProperties, "palette")) {
      failures.push("workspace.manifest.schema.json must not define tools.palette.");
    }
    if (Object.prototype.hasOwnProperty.call(toolProperties, "palettes")) {
      failures.push("workspace.manifest.schema.json must not define tools.palettes.");
    }
  }

  const requiredWorkspaceJsTokens = [
    "buildWorkspaceSchemaDocument()",
    "validateWorkspaceSchemaDocument(",
    "\"palette-browser\"",
    "Use tools.palette-browser. Workspace supports one active palette tool entry."
  ];
  requiredWorkspaceJsTokens.forEach((token) => {
    if (!workspaceJs.includes(token)) {
      failures.push(`Missing required workspace manifest token: ${token}`);
    }
  });
  const forbiddenWorkspaceJsTokens = [
    "tools.palette.",
    "tools.palettes."
  ];
  forbiddenWorkspaceJsTokens.forEach((token) => {
    if (workspaceJs.includes(token)) {
      failures.push(`Workspace V2 must not use legacy palette key path: ${token}`);
    }
  });
  if (workspaceJs.includes("workspace.schema.json")) {
    failures.push("Workspace V2 runtime must not reference workspace.schema.json.");
  }

  const workspaceExport = {
    documentKind: "workspace-manifest",
    schema: "html-js-gaming.project",
    version: 1,
    id: "workspace-v2-palette-manager-v2-1234567890123-abcd1234",
    name: "Workspace V2 Session palette-manager-v2",
    tools: {
      "palette-browser": {
        schema: "html-js-gaming.palette",
        version: 1,
        name: "Workspace Active Palette",
        swatches: [
          { symbol: "A", hex: "#112233", name: "Primary" },
          { symbol: "B", hex: "#445566", name: "Secondary" }
        ]
      },
      "workspace-v2": {
        schema: "html-js-gaming.workspace-v2-tool-state/1",
        game: { id: "workspace-palette-manager-v2-1234567890123-abcd1234", name: "Workspace V2 Session" },
        defaultToolId: "palette-manager-v2",
        activeToolId: "palette-manager-v2",
        activeHostContextId: "palette-manager-v2-1234567890123-abcd1234",
        activeToolState: {
          version: "v2",
          toolId: "palette-manager-v2",
          paletteJson: {
            swatches: [
              { symbol: "A", hex: "#112233", name: "Primary" },
              { symbol: "B", hex: "#445566", name: "Secondary" }
            ]
          }
        },
        savedToolStates: {}
      }
    }
  };
  const workspaceExportValidation = validateWorkspaceManifestShape(workspaceExport);
  if (!workspaceExportValidation.ok) {
    failures.push(`Manifest-only workspace export shape is invalid: ${workspaceExportValidation.message}`);
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceJsExists,
      workspaceManifestSchemaExists,
      deprecatedWorkspaceSchemaExists,
      workspaceJsSyntax,
      testSyntax
    },
    scenarios: {
      workspaceExportValidation
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 current-tool-state export results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 current-tool-state export failures: ${failures.join(" | ")}`);
  return { failures };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const summary = run();
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
