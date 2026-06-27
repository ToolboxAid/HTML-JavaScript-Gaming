import path from "node:path";

export const TESTS_ROOT = path.resolve("tests");

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
  "tests/core/EngineCoreBoundaryBaseline.test.mjs",
  "tests/shared/SharedFoundationCombinedPass.test.mjs",
  "tests/tools/ToolBoundaryEnforcement.test.mjs"
]);

export const INTEGRATION_COVERAGE_ANCHORS = Object.freeze([
  "tests/world/WorldGameStateSystem.test.mjs",
  "tests/replay/ReplaySystem.test.mjs",
  "tests/render/Renderer.test.mjs",
  "tests/tools/RuntimeAssetBinding.test.mjs",
  "tests/core/Engine2DCapabilityCombinedFoundation.test.mjs"
]);

export const FIXTURE_ARTIFACTS = Object.freeze([
  "tests/fixtures/games/AsteroidsValidation.snippet.js",
  "tests/fixtures/games/AsteroidsValidation.test.mjs.patch",
  "tests/fixtures/tools/VectorNativeTemplate.regex.before.txt",
  "tests/fixtures/tools/VectorNativeTemplate.regex.after.txt",
  "tests/fixtures/tools/VectorNativeTemplate.test.mjs.patch"
]);
