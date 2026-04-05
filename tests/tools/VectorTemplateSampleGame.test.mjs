import assert from "node:assert/strict";
import { buildVectorTemplateSampleGame, createVectorTemplateSampleGameDefinition, summarizeVectorTemplateSampleGame } from "../../tools/shared/vectorTemplateSampleGame.js";

export async function run() {
  const definition = createVectorTemplateSampleGameDefinition();
  assert.equal(definition.gamePath, "games/vector-arcade-sample/");
  assert.equal(definition.registry.projectId, "vector-arcade-sample");
  assert.equal(definition.registry.sprites.length, 0);

  const first = await buildVectorTemplateSampleGame();
  const second = await buildVectorTemplateSampleGame();

  assert.equal(first.sampleGame.status, "ready");
  assert.equal(first.sampleGame.validationResult.validation.status, "valid");
  assert.equal(first.sampleGame.packageResult.packageStatus, "ready");
  assert.equal(first.sampleGame.runtimeResult.runtimeLoader.status, "ready");
  assert.equal(first.sampleGame.runtimeResult.bootstrap.assetTable["vector.template.player"].runtimeKind, "vector-geometry");
  assert.equal(first.sampleGame.runtimeResult.bootstrap.assetTable["vector.template.player"].renderables.length > 0, true);
  assert.equal(first.sampleGame.publishingResult.publishing.status, "ready");
  assert.equal(first.sampleGame.vectorOnly.hasSpriteRuntimeDependency, false);
  assert.equal(
    first.sampleGame.packageResult.manifest.package.assets.some((asset) => asset.id.startsWith("sprite.")),
    false
  );
  assert.match(first.sampleGame.reportText, /Game path: games\/vector-arcade-sample\//);
  assert.match(first.sampleGame.reportText, /VECTOR_TEMPLATE_SAMPLE_GAME_CONTRACT/);
  assert.deepEqual(first, second);
  assert.equal(summarizeVectorTemplateSampleGame(first), "Vector template sample game ready with 10 packaged assets.");
}
