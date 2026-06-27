# PR_26161_018 Controls Wireframe Controller Profiles Report

## Branch Validation

- PASS: Current branch was `main`.
- Expected branch: `main`.
- Worktree was clean before PR_26161_018 edits.

## Scope

- Impacted lane: Controls/Input Mapping tool recovery/UAT.
- Playwright impacted: Yes.
- Full samples validation: SKIPPED. Samples are out of scope for this Controls wireframe/profile planning change, and no sample JSON alignment was requested.
- Engine runtime behavior: Unchanged. No production controller runtime, sample runtime, auth behavior, or unrelated rewrite was added.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- PASS: Reviewed `docs_build/tools/input-mapping-v2/uat.md`.
- PASS: Verified branch `main` before edits.
- PASS: Continued from PR_26161_017 table-first Controls behavior.
- PASS: Controls metadata moved away from beta to Wireframe with `releaseChannel: "wireframe"`.
- PASS: Controller profile planning was added inside Controls, not as a separate tool.
- PASS: Wireframe UI includes Device Type, Controller Name, Controller ID, Mapping Profile, Input, and Action.
- PASS: Unknown controller status gives an actionable Refresh Devices step and future Create Profile path.
- PASS: Existing mapping table behavior and DB persistence were preserved.
- PASS: No production controller runtime or engine behavior was added.

## Files Changed

- `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- `toolbox/input-mapping-v2/index.html`
- `toolbox/controls/index.html`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/controls-wireframe-controller-profiles-report.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

## Testing Performed

- PASS: `node --check src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `node --check toolbox/input-mapping-v2/input-mapping-v2.js`
- PASS: HTML restriction scan for inline scripts, style blocks, inline styles, and inline event handlers in both Controls routes.
- PASS: `git diff --check`
  - Note: Git reported CRLF normalization warnings on touched files only.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --workers=1 --reporter=line`
  - Final result: 4 passed.
  - Initial run found only a test expectation mismatch because the registry API returns normalized `wireframe`; the assertion was corrected and the final run passed.

## Playwright Coverage

- Generated `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Generated `docs_build/dev/reports/coverage_changed_js_guardrail.txt`.
- Coverage report includes an advisory WARN for `src/dev-runtime/guest-seeds/tool-metadata-inventory.js` because server-side seed metadata is not collected by browser V8 coverage.
- Controls browser runtime coverage was collected for `toolbox/input-mapping-v2/input-mapping-v2.js`.

## Manual Validation Steps

1. Open `/toolbox/input-mapping-v2/index.html`.
2. Confirm Controls shows as Wireframe in registry-backed tool metadata.
3. Confirm Actions, Capture, Controller Profiles, Mappings, Mapping JSON, Devices, and Status panels appear.
4. Confirm Controller Profiles shows Device Type, Controller Name, Controller ID, Mapping Profile, Input, and Action.
5. Confirm the unknown controller status recommends Refresh Devices and points to the future Create Profile flow.
6. Add a mapping row, save it, reload, and confirm it persists.
7. Capture `KeyA`, confirm the mapping appears in the table and Mapping JSON, then click the token to delete it.

## Skipped Lanes

- Full samples smoke: SKIPPED because samples and sample JSON alignment are explicitly out of scope.
- Broad workspace suite: SKIPPED because this PR only changes the Controls tool surface, Controls metadata, and targeted Controls Playwright coverage.
- Engine tests: SKIPPED because no engine runtime files or controller runtime behavior changed.
