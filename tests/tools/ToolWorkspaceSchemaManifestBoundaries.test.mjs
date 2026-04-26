import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8"));
}

export async function run() {
  const schemaFiles = [
    "tools/schemas/workspace.manifest.schema.json",
    "tools/schemas/tool.manifest.schema.json",
    "tools/schemas/palette.schema.json",
    "tools/schemas/sample.tool-payload.schema.json",
    "tools/schemas/tools/vector-map-editor.schema.json",
    "tools/schemas/tools/vector-asset-studio.schema.json",
    "tools/schemas/tools/sprite-editor.schema.json"
  ];
  schemaFiles.forEach((relativePath) => {
    const schema = readJson(relativePath);
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
    assert.equal(typeof schema.$id, "string");
    assert.equal(schema.$id.length > 0, true);
  });

  const toolSchemaFiles = [
    "tools/vector-map-editor/tool.schema.json",
    "tools/vector-asset-studio/tool.schema.json",
    "tools/palette-editor/tool.schema.json"
  ];
  toolSchemaFiles.forEach((relativePath) => {
    const document = readJson(relativePath);
    assert.equal(document.$schema, "https://json-schema.org/draft/2020-12/schema");
  });

  const removedValidationUtilities = [
    "tools/schemas/workspaceManifest.schema.js",
    "tools/schemas/tools/cameraPathPayload.schema.js",
    "tools/schemas/tools/mapPayload.schema.js",
    "tools/schemas/tools/assetPayload.schema.js"
  ];
  removedValidationUtilities.forEach((relativePath) => {
    const absolutePath = new URL(`../../${relativePath}`, import.meta.url);
    assert.equal(existsSync(absolutePath), false);
  });

  const paletteBrowserSource = readFileSync(new URL("../../tools/Palette Browser/main.js", import.meta.url), "utf8");
  assert.match(paletteBrowserSource, /function duplicateSelectedPalette\(/);
  assert.match(paletteBrowserSource, /createCustomPalette\(nextName, palette\.entries\)/);
  assert.match(paletteBrowserSource, /Duplicate a built-in palette before editing swatches\./);
  assert.match(paletteBrowserSource, /Shared palette is locked to .*Edit swatches instead\./);
  assert.match(paletteBrowserSource, /if \(isReadOnlyPalette\(palette\)\) \{\s*return;\s*\}/s);

  const spriteEditorSource = readFileSync(new URL("../../tools/Sprite Editor/modules/spriteEditorApp.js", import.meta.url), "utf8");
  assert.match(spriteEditorSource, /image\/png/);
  assert.match(spriteEditorSource, /sprite-frame-.*\.png/);
  assert.match(spriteEditorSource, /sprite-sheet-.*\.png/);
}
