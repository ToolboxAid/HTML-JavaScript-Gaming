import path from "node:path";

export const TESTS_ROOT = path.resolve("dev/tests");

export const REQUIRED_TEST_DIRECTORIES = Object.freeze([
  "core",
  "shared",
  "tools",
  "games",
  "replay",
  "world",
  "render",
  "fixtures",
  "helpers",
  "production"
]);

export const UNIT_COVERAGE_ANCHORS = Object.freeze([
  "dev/tests/core/EngineCoreBoundaryBaseline.test.mjs",
  "dev/tests/shared/SharedFoundationCombinedPass.test.mjs",
  "dev/tests/tools/ToolBoundaryEnforcement.test.mjs"
]);

export const INTEGRATION_COVERAGE_ANCHORS = Object.freeze([
  "dev/tests/world/WorldGameStateSystem.test.mjs",
  "dev/tests/replay/ReplaySystem.test.mjs",
  "dev/tests/render/Renderer.test.mjs",
  "dev/tests/tools/RuntimeAssetBinding.test.mjs",
  "dev/tests/core/Engine2DCapabilityCombinedFoundation.test.mjs"
]);

export const FIXTURE_ARTIFACTS = Object.freeze([
  "dev/tests/fixtures/games/AsteroidsValidation.snippet.js",
  "dev/tests/fixtures/games/AsteroidsValidation.test.mjs.patch",
  "dev/tests/fixtures/tools/VectorNativeTemplate.regex.before.txt",
  "dev/tests/fixtures/tools/VectorNativeTemplate.regex.after.txt",
  "dev/tests/fixtures/tools/VectorNativeTemplate.test.mjs.patch"
]);
