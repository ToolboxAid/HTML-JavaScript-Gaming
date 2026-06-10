# PR_26161_019 Controls DB Controller Profiles Report

## Branch Validation

- PASS: Current branch was `main`.
- Expected branch: `main`.
- Worktree was clean before PR_26161_019 edits.

## Scope

- Impacted lane: Controls/Input Mapping recovery/UAT.
- Playwright impacted: Yes.
- Full samples validation: SKIPPED. Samples and sample JSON alignment are explicitly out of scope for this Controls DB-backed profile change.
- Engine runtime behavior: Unchanged. No production controller runtime, engine input runtime, auth behavior, sample alignment, or unrelated rewrite was added.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- PASS: Verified branch `main` before edits.
- PASS: Continued from PR_26161_018.
- PASS: Controls status remains Wireframe.
- PASS: Controller profiles persist through the shared DB/mock adapter using `input_controller_profile_records`.
- PASS: Controller profile records include Device Type, Controller Name, Controller ID, Mapping Profile, Inputs, and Actions.
- PASS: Page load reads mappings and controller profiles from the shared DB/mock adapter.
- PASS: Mappings can reference a saved controller profile through `controllerProfileId` and `mappingProfile`.
- PASS: Unknown controller status remains actionable and does not create fake profile rows.
- PASS: Existing table-first mapping behavior, Add Mapping, keyboard capture, token delete, Mapping JSON, Devices, and Status panels are preserved.
- PASS: No sample JSON alignment, auth behavior, or production controller runtime was added.

## Files Changed

- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- `toolbox/input-mapping-v2/input-mapping-v2.js`
- `toolbox/input-mapping-v2/index.html`
- `toolbox/controls/index.html`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/controls-db-controller-profiles-report.md`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Testing Performed

- PASS: `node --check toolbox/input-mapping-v2/input-mapping-v2.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS: `node --check src/dev-runtime/persistence/mock-db-store.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: HTML restriction scan for inline scripts, style blocks, inline styles, and inline event handlers in both Controls routes.
- PASS: `git diff --check`
  - Note: Git reported CRLF normalization warnings on touched files only.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --workers=1 --reporter=line`
  - Final result: 5 passed.

## Playwright Coverage

- Generated `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Generated `docs_build/dev/reports/coverage_changed_js_guardrail.txt`.
- Coverage includes `toolbox/input-mapping-v2/input-mapping-v2.js` with browser V8 execution.
- Coverage includes advisory WARN entries for server-side DB/mock adapter files because they are exercised through the local server API, not collected by browser V8 coverage.
- The report may also list the prior Wireframe metadata file as advisory because the coverage helper includes the current HEAD comparison window; it is non-blocking and no Controls metadata file changed in PR_26161_019.

## Manual Validation Steps

1. Open `/toolbox/input-mapping-v2/index.html`.
2. Confirm Controller Profiles shows no saved profile row before explicit user action.
3. Confirm the unknown controller status tells the creator to Refresh Devices and use Add Profile.
4. Click Add Profile, fill Device Type, Controller Name, Controller ID, Mapping Profile, Inputs, and Actions, then save.
5. Reload and confirm the saved controller profile persists.
6. Add a mapping, select the saved Mapping Profile, save, reload, and confirm the mapping still references the saved profile.
7. Capture `KeyA`, confirm the mapping appears in the table and Mapping JSON, then click the token to delete it.

## Skipped Lanes

- Full samples smoke: SKIPPED because samples and sample JSON alignment are out of scope.
- Broad workspace suite: SKIPPED because this PR only changes Controls/Input Mapping and its direct DB/mock adapter path.
- Engine tests: SKIPPED because no production engine runtime behavior changed.
