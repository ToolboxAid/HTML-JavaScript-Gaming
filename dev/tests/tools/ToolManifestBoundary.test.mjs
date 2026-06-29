import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(`../../../${relativePath}`, import.meta.url), "utf8"));
}

export async function run() {
  const schemaFiles = [
    "dev/tests/schemas/tool.manifest.schema.json",
    "www/src/shared/schemas/tools/palette-browser.schema.json",
    "src/shared/schemas/samples/sample.tool-payload.schema.json",
    "www/src/shared/schemas/tools/svg-asset-studio.schema.json",
    "www/src/shared/schemas/tools/sprite-editor.schema.json"
  ];
  schemaFiles.forEach((relativePath) => {
    const schema = readJson(relativePath);
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
    assert.equal(typeof schema.$id, "string");
    assert.equal(schema.$id.length > 0, true);
  });

  const toolSchemaFiles = [
    "dev/tests/fixtures/tool-schemas/palette-editor/tool.schema.json",
    "dev/tests/fixtures/tool-schemas/vector-asset-studio/tool.schema.json",
    "dev/tests/fixtures/tool-schemas/vector-map-editor/tool.schema.json"
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
    const absolutePath = new URL(`../../../${relativePath}`, import.meta.url);
    assert.equal(existsSync(absolutePath), false);
  });

  const spritesSource = readFileSync(new URL("../../../www/assets/toolbox/sprites/js/index.js", import.meta.url), "utf8");
  assert.match(spritesSource, /image\/png/);
  assert.match(spritesSource, /sprite-frame-/);
}
