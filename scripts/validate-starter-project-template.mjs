import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getToolById } from "../tools/toolRegistry.js";
import {
  PROJECT_MANIFEST_SCHEMA,
  PROJECT_MANIFEST_VERSION,
  serializeProjectManifest,
  validateProjectManifest
} from "../tools/shared/projectManifestContract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const TEMPLATE_MANIFEST_PATH = "tools/templates/starter-project-template/config/starter.project.json";
const REPORT_PATH = "docs/dev/reports/starter_project_template_validation.txt";

function assert(condition, message, issues) {
  if (!condition) {
    issues.push(message);
  }
}

async function pathExists(repoRelativePath) {
  try {
    await fs.access(path.join(repoRoot, repoRelativePath));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const issues = [];
  const notes = [];
  const raw = JSON.parse(await fs.readFile(path.join(repoRoot, TEMPLATE_MANIFEST_PATH), "utf8"));
  const validation = validateProjectManifest(raw);

  assert(validation.valid, `Project manifest is invalid: ${validation.issues.join(" ")}`, issues);
  assert(validation.manifest.schema === PROJECT_MANIFEST_SCHEMA, "Starter project schema mismatch.", issues);
  assert(validation.manifest.version === PROJECT_MANIFEST_VERSION, "Starter project version mismatch.", issues);
  notes.push("starter project manifest validates against shared project contract");

  const manifest = validation.manifest;
  const assets = Array.isArray(manifest.sharedLibrary?.assets) ? manifest.sharedLibrary.assets : [];
  const palettes = Array.isArray(manifest.sharedLibrary?.palettes) ? manifest.sharedLibrary.palettes : [];

  const requiredTypes = ["vector", "tilemap", "parallax", "sprite"];
  for (const requiredType of requiredTypes) {
    assert(assets.some((entry) => entry?.type === requiredType), `Missing shared ${requiredType} reference in starter project sharedLibrary.assets.`, issues);
  }
  assert(palettes.length >= 1, "Missing shared palette reference in starter project sharedLibrary.palettes.", issues);

  for (const entry of [...assets, ...palettes]) {
    assert(typeof entry?.sourcePath === "string" && entry.sourcePath.trim().length > 0, `Missing sourcePath for shared reference ${entry?.id || "unknown"}.`, issues);
    if (typeof entry?.sourcePath === "string" && entry.sourcePath.trim()) {
      assert(await pathExists(entry.sourcePath), `Referenced shared asset/palette path does not exist: ${entry.sourcePath}`, issues);
    }
  }
  notes.push("shared vector/tilemap/parallax/sprite/palette references resolve on disk");

  const requiredTools = [
    "vector-map-editor",
    "vector-asset-studio",
    "tile-map-editor",
    "parallax-editor",
    "sprite-editor",
    "asset-browser",
    "palette-browser"
  ];
  for (const toolId of requiredTools) {
    assert(manifest.tools && typeof manifest.tools[toolId] === "object", `Missing starter tool payload for ${toolId}.`, issues);
  }
  notes.push("starter project includes payloads for all active first-class tools");

  assert(Boolean(manifest.tools?.["vector-map-editor"]?.snapshot?.documentData), "Vector Map Editor payload is missing snapshot.documentData.", issues);
  assert(typeof manifest.tools?.["vector-asset-studio"]?.svgText === "string", "Vector Asset Studio payload is missing svgText.", issues);
  assert(Boolean(manifest.tools?.["tile-map-editor"]?.documentModel?.assetRefs?.tilemapId), "Tilemap Studio payload is missing tilemap asset reference.", issues);
  assert(Array.isArray(manifest.tools?.["parallax-editor"]?.documentModel?.assetRefs?.parallaxSourceIds), "Parallax Scene Studio payload is missing parallax source ids.", issues);
  assert(Boolean(manifest.tools?.["sprite-editor"]?.project?.assetRefs?.spriteId), "Sprite Editor payload is missing sprite asset reference.", issues);
  notes.push("cross-tool loading payloads are structurally present");

  const roundTripped = JSON.parse(serializeProjectManifest(manifest));
  assert(roundTripped.schema === PROJECT_MANIFEST_SCHEMA, "Serialized starter project lost schema.", issues);
  assert(roundTripped.name === manifest.name, "Serialized starter project changed project name.", issues);
  assert(Array.isArray(roundTripped.sharedLibrary?.assets), "Serialized starter project lost sharedLibrary assets.", issues);
  notes.push("starter project serializes and reloads through shared project serializer");

  const spriteEditor = getToolById("sprite-editor");
  const legacySprite = getToolById("sprite-editor-old-keep");
  assert(spriteEditor?.active === true && spriteEditor?.visibleInToolsList === true, "Sprite Editor must remain first-class and visible.", issues);
  assert(legacySprite?.active !== true && legacySprite?.visibleInToolsList !== true, "SpriteEditor_old_keep must remain hidden legacy.", issues);
  notes.push("sprite tool visibility rules remain intact");

  const toolsIndex = await fs.readFile(path.join(repoRoot, "tools/index.html"), "utf8");
  assert(!/samples\//i.test(toolsIndex), "tools/index.html must remain tool-only and sample-free.", issues);
  notes.push("tools/index.html remains tool-only and sample-free");

  const reportLines = [
    "BUILD_PR_STARTER_PROJECT_TEMPLATE validation report",
    "",
    issues.length === 0 ? "STATUS: PASS" : "STATUS: FAIL",
    "",
    "Checks:",
    ...notes.map((note) => `- ${note}`),
    "",
    "Issues:",
    ...(issues.length > 0 ? issues.map((issue) => `- ${issue}`) : ["- none"])
  ];

  await fs.writeFile(path.join(repoRoot, REPORT_PATH), `${reportLines.join("\n")}\n`, "utf8");

  if (issues.length > 0) {
    console.error("STARTER_PROJECT_TEMPLATE_INVALID");
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 1;
    return;
  }

  console.log("STARTER_PROJECT_TEMPLATE_VALID");
  console.log(`Report: ${REPORT_PATH}`);
}

await main();
