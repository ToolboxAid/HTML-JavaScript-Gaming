/*
Toolbox Aid
David Quesenberry
06/02/2026
ManifestRuntimeParser.test.mjs
*/
import assert from "node:assert/strict";
import {
  MANIFEST_RUNTIME_PARSER_ERRORS,
  MANIFEST_RUNTIME_SCHEMA,
  parseManifestRuntimePayload,
} from "../../../www/src/engine/runtime/manifestRuntimeParser.js";

export function createValidManifestRuntimePayload() {
  return {
    schema: MANIFEST_RUNTIME_SCHEMA,
    version: 1,
    game: {
      id: "ConfigPilot",
      name: "Config Pilot",
      folder: "ConfigPilot",
    },
    launch: {
      directPath: "/archive/v1-v2/games/ConfigPilot/index.html",
      workspaceManagerPath: "/toolbox/workspace-manager-v2/index.html?gameId=ConfigPilot",
      workspaceManagerOptional: true,
    },
    screen: {
      width: 960,
      height: 540,
    },
    tools: {},
    objects: {
      "object.config.player": {
        objectType: "dynamic",
        geometryRef: "object.geometry.player",
        rules: ["movement.player"],
      },
    },
    rules: {
      "movement.player": {
        ruleType: "movement",
        targets: ["object.config.player"],
        parameters: {
          speed: 240,
        },
      },
    },
  };
}

export function run() {
  const payload = createValidManifestRuntimePayload();
  const validation = parseManifestRuntimePayload(payload, {
    sourcePath: "archive/v1-v2/games/ConfigPilot/game.manifest.json",
  });

  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);
  assert.equal(validation.manifest.sourcePath, "archive/v1-v2/games/ConfigPilot/game.manifest.json");
  assert.equal(validation.manifest.schema, MANIFEST_RUNTIME_SCHEMA);
  assert.equal(validation.manifest.game.id, "ConfigPilot");
  assert.equal(validation.manifest.launch.directPath, "/archive/v1-v2/games/ConfigPilot/index.html");
  assert.deepEqual(validation.manifest.screen, { width: 960, height: 540 });
  assert.deepEqual(Object.keys(validation.manifest.objects), ["object.config.player"]);
  assert.deepEqual(Object.keys(validation.manifest.rules), ["movement.player"]);

  payload.game.id = "ChangedAfterParse";
  assert.equal(validation.manifest.game.id, "ConfigPilot");

  assertErrorCodes(
    parseManifestRuntimePayload(null),
    [MANIFEST_RUNTIME_PARSER_ERRORS.PAYLOAD_INVALID],
    "non-object payload is rejected visibly"
  );
  assertErrorCodes(
    parseManifestRuntimePayload({ ...createValidManifestRuntimePayload(), schema: "" }),
    [MANIFEST_RUNTIME_PARSER_ERRORS.SCHEMA_REQUIRED],
    "missing schema is rejected visibly"
  );
  assertErrorCodes(
    parseManifestRuntimePayload({ ...createValidManifestRuntimePayload(), schema: "wrong" }),
    [MANIFEST_RUNTIME_PARSER_ERRORS.SCHEMA_INVALID],
    "invalid schema is rejected visibly"
  );
  assertErrorCodes(
    parseManifestRuntimePayload({ ...createValidManifestRuntimePayload(), version: 0 }),
    [MANIFEST_RUNTIME_PARSER_ERRORS.VERSION_INVALID],
    "invalid version is rejected visibly"
  );
  assertErrorCodes(
    parseManifestRuntimePayload({ ...createValidManifestRuntimePayload(), launch: { directPath: "" } }),
    [MANIFEST_RUNTIME_PARSER_ERRORS.DIRECT_PATH_REQUIRED],
    "missing directPath is rejected visibly"
  );
  assertErrorCodes(
    parseManifestRuntimePayload({ ...createValidManifestRuntimePayload(), tools: [] }),
    [MANIFEST_RUNTIME_PARSER_ERRORS.TOOLS_INVALID],
    "invalid tools field is rejected visibly"
  );
  assertErrorCodes(
    parseManifestRuntimePayload({ ...createValidManifestRuntimePayload(), objects: [] }),
    [MANIFEST_RUNTIME_PARSER_ERRORS.OBJECTS_INVALID],
    "invalid objects field is rejected visibly"
  );
  assertErrorCodes(
    parseManifestRuntimePayload({ ...createValidManifestRuntimePayload(), rules: [] }),
    [MANIFEST_RUNTIME_PARSER_ERRORS.RULES_INVALID],
    "invalid rules field is rejected visibly"
  );
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.equal(validation.valid, false, name);
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
  assert.equal(validation.manifest, null, name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
