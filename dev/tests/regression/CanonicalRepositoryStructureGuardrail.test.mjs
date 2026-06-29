import assert from "node:assert/strict";
import test from "node:test";

import {
  auditCanonicalRepositoryStructure,
  formatCanonicalStructureReport,
} from "../../scripts/validate-canonical-repository-structure.mjs";

test("canonical repository structure guardrail accepts canonical paths and approved legacy exceptions", () => {
  const result = auditCanonicalRepositoryStructure([
    "assets/toolbox/idea-board/js/index.js",
    "assets/toolbox/idea-board/css/index.css",
    "assets/js/shared/dom.js",
    "assets/theme-v2/js/admin-system-health.js",
    "assets/theme-v2/css/theme.css",
    "assets/toolbox/assets/js/assets-upload-worker.js",
    "www/src/engine/rendering/Renderer.js",
    "www/src/engine/ui/baseLayout.css",
    "dev/tests/regression/CanonicalRepositoryStructureGuardrail.test.mjs",
    "dev/tests/runtime/V2SessionValidation.test.mjs",
  ]);

  assert.equal(result.status, "PASS");
  assert.equal(result.findings.length, 0);
  assert.equal(result.legacy.length, 2);
});

test("canonical repository structure guardrail fails unapproved violation fixture paths", () => {
  const result = auditCanonicalRepositoryStructure([
    "toolbox/new-tool/new-tool.js",
    "toolbox/new-tool/new-tool.css",
    "assets/toolbox/new-tool/js/view.js",
    "src/engine/rootRuntime.js",
    "src/engine/ui/newPanel.css",
    "dev/tests/results/generated-result.json",
    "dev/tests/new-lane/NewLane.test.mjs",
  ]);

  assert.equal(result.status, "FAIL");
  assert.equal(result.findings.length, 7);
  assert.match(formatCanonicalStructureReport(result), /New or unapproved toolbox JavaScript sidecar/);
  assert.match(formatCanonicalStructureReport(result), /Generated test result artifacts must not be tracked/);
});
