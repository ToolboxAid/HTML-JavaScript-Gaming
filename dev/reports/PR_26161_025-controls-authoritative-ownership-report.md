# PR_26161_025-controls-authoritative-ownership

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Scope

- Audited `toolbox/controls/index.html`.
- Audited `toolbox/input-mapping-v2/index.html`.
- Authoritative tool: `Controls` at `toolbox/controls/index.html`.
- Deprecated tool: `Input Mapping V2` at `toolbox/input-mapping-v2/index.html`.
- Impacted lane: Controls/Input Mapping tool, Tool metadata registry, Admin DB viewer ownership display.
- Playwright impacted: Yes.

## Requirement Checklist

- PASS - Controls is the user-facing tool for input mappings.
- PASS - Controls is the single source of truth for input mappings.
- PASS - Controls is the single source of truth for controller profiles.
- PASS - Controls is the single source of truth for device detection UI.
- PASS - Controls is the single source of truth for mapping persistence.
- PASS - `input-mapping-v2` is marked deprecated in tool metadata.
- PASS - `input-mapping-v2` route provides redirect/launch guidance to Controls.
- PASS - Duplicate UI ownership removed from `input-mapping-v2`.
- PASS - Duplicate DB ownership removed from `input-mapping-v2`.
- PASS - Duplicate mapping persistence ownership removed from `input-mapping-v2`.
- PASS - Duplicate controller profile ownership removed from `input-mapping-v2`.
- PASS - Tool metadata identifies Controls as authoritative and Input Mapping V2 as deprecated.
- PASS - No engine runtime behavior changed.

## Implementation Notes

- Moved the active input mapping runtime modules into `toolbox/controls/`.
- Updated Controls to load `toolbox/controls/controls.js`.
- Updated the Controls API client to request the `controls` server tool constants and repository.
- Changed shared mock DB ownership from `input-mapping-v2` to `controls` while preserving existing table names:
  - `input_mapping_records`
  - `input_controller_profile_records`
- Updated the mock API router to expose mapping/profile repository ownership through `controls`.
- Replaced the old `input-mapping-v2` page with a deprecated guidance page linking to Controls.
- Updated tool metadata so Controls points to `toolbox/controls/index.html` and Input Mapping V2 is hidden/deprecated.
- Updated Admin DB Viewer expectations to show Controls as the owner of input mapping and controller profile tables.

## Remaining Migration Work

- None for required UI ownership, DB ownership, mapping persistence ownership, controller profile ownership, or device detection ownership.
- Future removal PR: delete the deprecated `toolbox/input-mapping-v2/` route when old links no longer need guidance.
- Historical manifest/schema references to old tool keys were not changed because this PR does not change engine runtime contracts.

## Validation Performed

- PASS - `node --check toolbox/controls/controls.js`
- PASS - `node --check toolbox/controls/controls-api-client.js`
- PASS - `node --check src/dev-runtime/server/mock-api-router.mjs`
- PASS - `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS - `node --check src/dev-runtime/persistence/mock-db-store.js`
- PASS - `node --check src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- PASS - `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS - `node --check tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs`
- PASS - `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`
- PASS - HTML restriction scan on `toolbox/controls/index.html` and `toolbox/input-mapping-v2/index.html`: no inline script/style/event handler matches.
- PASS - Old ownership scan: no active `input-mapping-v2` server constants, repository client, DB owner, or mock router ownership hooks remain.
- PASS - `git diff --check` passed with line-ending warnings only.
- PASS - `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs`: 5/5 passed.
- PASS - `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs`: 4/4 passed.
- PASS - `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs -g "current read-only Local Mem DB tables|current read-only Local DB tables"`: 2/2 passed.
- WARN - `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs`: 6/7 passed; the broader persistence test failed on an existing Colors page asset request for `assets/theme-v2/images/characters/palette-manager.png`, outside this Controls ownership scope.

## V8 Coverage

- PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt` generated.
- PASS - `toolbox/controls/controls.js`: 91% function coverage in the final Controls run.
- PASS - `toolbox/controls/controls-api-client.js`: 100% function coverage in the final Controls run.
- WARN - Server/dev-runtime changed JS files are not collected by browser V8 coverage; advisory only.

## Manual Validation Steps

1. Open `toolbox/controls/index.html`.
2. Confirm the Controls tool shows Actions, Table Input Mappings, Controller Profile, Devices, and Status.
3. Add a mapping and confirm it persists after reload.
4. Add a controller profile and confirm it persists after reload.
5. Open `toolbox/input-mapping-v2/index.html`.
6. Confirm the page is deprecated guidance only and links to Controls.
7. Open Admin DB Viewer and confirm Controls owns `input_mapping_records` and `input_controller_profile_records`.

## Skipped Lanes

- Full samples validation: SKIPPED. Samples were not in scope and no sample JSON or engine runtime behavior changed.
- Full suite: SKIPPED. Targeted Controls, metadata, and DB ownership lanes covered the changed behavior.

## Artifacts

- PASS - Review diff: `docs_build/dev/reports/codex_review.diff`
- PASS - Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- PASS - Repo-structured delta ZIP: `tmp/PR_26161_025-controls-authoritative-ownership_delta.zip`
