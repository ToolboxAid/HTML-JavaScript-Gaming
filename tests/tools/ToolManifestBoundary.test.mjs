import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8"));
}

export async function run() {
  const schemaFiles = [
    "tests/schemas/tool.manifest.schema.json",
    "src/shared/schemas/tools/palette-browser.schema.json",
    "src/shared/schemas/samples/sample.tool-payload.schema.json",
    "src/shared/schemas/tools/svg-asset-studio.schema.json",
    "src/shared/schemas/tools/sprite-editor.schema.json"
  ];
  schemaFiles.forEach((relativePath) => {
    const schema = readJson(relativePath);
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
    assert.equal(typeof schema.$id, "string");
    assert.equal(schema.$id.length > 0, true);
  });

  const toolSchemaFiles = [
    "tests/fixtures/tool-schemas/palette-editor/tool.schema.json",
    "tests/fixtures/tool-schemas/vector-asset-studio/tool.schema.json",
    "tests/fixtures/tool-schemas/vector-map-editor/tool.schema.json"
  ];
  toolSchemaFiles.forEach((relativePath) => {
    const document = readJson(relativePath);
    assert.equal(document.$schema, "https://json-schema.org/draft/2020-12/schema");
  });

  const removedValidationUtilities = [
    ["tools", "schemas", ["workspace", "manifest", "schema"].join(".") + ".json"].join("/"),
    "src/shared/schemas/workspaceManifest.schema.js",
    "src/shared/schemas/tools/cameraPathPayload.schema.js",
    "src/shared/schemas/tools/mapPayload.schema.js",
    "src/shared/schemas/tools/assetPayload.schema.js"
  ];
  removedValidationUtilities.forEach((relativePath) => {
    const absolutePath = new URL(`../../${relativePath}`, import.meta.url);
    assert.equal(existsSync(absolutePath), false);
  });

  const paletteManagerSource = readFileSync(new URL("../../toolbox/palette-manager-v2/main.js", import.meta.url), "utf8");
  assert.match(paletteManagerSource, /const PALETTE_MANAGER_V2_TOOL_SESSION_KEY = "workspace\.tools\.palette-manager-v2";/);
  assert.match(paletteManagerSource, /workspaceSessionPersistence: createWorkspacePaletteSessionPersistence\(\)/);
  assert.match(paletteManagerSource, /paletteSource: resolvePaletteSource\(\)/);
  assert.match(paletteManagerSource, /window\.paletteManagerV2App =/);
  assert.doesNotMatch(paletteManagerSource, /paletteBrowserApp/);

  const spriteEditorSource = readFileSync(new URL("../../toolbox/Sprite Editor/modules/spriteEditorApp.js", import.meta.url), "utf8");
  assert.match(spriteEditorSource, /image\/png/);
  assert.match(spriteEditorSource, /sprite-frame-.*\.png/);
  assert.match(spriteEditorSource, /sprite-sheet-.*\.png/);
}
