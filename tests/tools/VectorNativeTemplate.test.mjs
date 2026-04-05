import assert from "node:assert/strict";
import { buildVectorNativeTemplate, createVectorNativeTemplateDefinition, summarizeVectorNativeTemplate } from "../../tools/shared/vectorNativeTemplate.js";

export async function run() {
  const definition = createVectorNativeTemplateDefinition();
  assert.equal(definition.templatePath, "templates/vector-native-arcade/");
  assert.equal(definition.registry.sprites.length, 0);
  assert.equal(definition.registry.vectors.length, 5);

  const first = await buildVectorNativeTemplate();
  const second = await buildVectorNativeTemplate();

  assert.equal(first.template.status, "ready");
  assert.equal(first.template.validationResult.validation.status, "valid");
  assert.equal(first.template.packageResult.packageStatus, "ready");
  assert.equal(first.template.runtimeResult.runtimeLoader.status, "ready");
  assert.equal(first.template.runtimeResult.bootstrap.assetTable["vector.template.player"].runtimeKind, "vector-geometry");
  assert.equal(first.template.runtimeResult.bootstrap.assetTable["vector.template.player"].renderables.length > 0, true);
  assert.match(first.template.debugVisualizationResult.debugVisualization.reportText, /geometry=/);
  assert.match(first.template.performanceResult.performance.reportText, /Geometry: assets=/);
  assert.equal(first.template.ciValidationResult.ciValidation.status, "pass");
  assert.equal(first.template.publishingResult.publishing.status, "ready");
  assert.equal(first.template.vectorOnly.hasSpriteRuntimeDependency, false);
  assert.deepEqual(first.template.vectorOnly.missingVectorIds, []);
  assert.equal(
    first.template.packageResult.manifest.package.assets.some((asset) => asset.id.startsWith("sprite.")),
    false
  );
  assert.match(first.template.reportText, /Template path: templates\/vector-native-arcade\//);
  assert.match(first.template.reportText, /VECTOR_NATIVE_TEMPLATE_CONTRACT/);
  assert.deepEqual(first, second);
  assert.equal(summarizeVectorNativeTemplate(first), "Vector native template ready with 10 packaged assets.");
}
