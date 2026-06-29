/*
Toolbox Aid
David Quesenberry
06/02/2026
RuntimeErrorReporting.test.mjs
*/
import assert from "node:assert/strict";
import {
  RUNTIME_ERROR_REPORTING_ERRORS,
  RUNTIME_ERROR_REPORT_STAGE_LIST,
  createRuntimeErrorReport,
} from "../../../www/src/engine/runtime/runtimeErrorReporting.js";

export function run() {
  RUNTIME_ERROR_REPORT_STAGE_LIST.forEach((stage) => {
    const result = createRuntimeErrorReport({
      stage,
      source: `runtime.${stage}`,
      errors: [
        { code: `${stage.toUpperCase()}_FAIL`, message: `${stage} failure`, path: `${stage}.path` },
      ],
    });

    assert.equal(result.valid, true, `${stage} report is valid`);
    assert.equal(result.report.visible, true, `${stage} report is visible`);
    assert.equal(result.report.stage, stage);
    assert.equal(result.report.items.length, 1);
    assert.equal(result.report.items[0].path, `${stage}.path`);
  });

  const emptyErrors = createRuntimeErrorReport({
    stage: "manifest",
    source: "runtime.manifest",
    errors: [],
  });
  assert.equal(emptyErrors.valid, false);
  assert.deepEqual(emptyErrors.errors.map((error) => error.code), [RUNTIME_ERROR_REPORTING_ERRORS.ERRORS_INVALID]);

  const missingPath = createRuntimeErrorReport({
    stage: "render",
    source: "runtime.render",
    errors: [{ code: "RENDER_FAIL", message: "Render failed" }],
  });
  assert.equal(missingPath.valid, false);
  assert.deepEqual(missingPath.errors.map((error) => error.code), [RUNTIME_ERROR_REPORTING_ERRORS.ERROR_PATH_REQUIRED]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
