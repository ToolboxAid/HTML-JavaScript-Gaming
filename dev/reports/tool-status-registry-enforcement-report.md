# PR_26156_128 Tool Status Registry Enforcement Report

## Scope

PR_26156_128 removes duplicate Toolbox status ownership and makes the Admin Tools Progress status source the shared source for status, readiness, visibility, required-for-testable, and required-for-publish metadata.

## Status Source Enforcement

- Added `admin/tools-progress-source.js` as the Admin Tools Progress metadata source consumed by both `admin/tools-progress.html` through `admin/tools-progress.js` and `toolbox/index.html` through `toolbox/tools-page-accordions.js`.
- Removed status ownership fields from `toolbox/toolRegistry.js`; the base registry now owns tool identity, route, grouping, image, and ordering metadata.
- Updated `getVisibleActiveToolRegistry()` to return active tools hydrated from Admin Tools Progress metadata.
- Updated Admin Tools Progress rendering to hydrate all rows through the same source before rendering status/readiness cells.
- Updated Toolbox card rendering to hydrate each card from the same source before role visibility and status rendering.

## Removed Duplicate Ownership

Removed obsolete/dead Toolbox-local status ownership:

- `TOOLBOX_STATUS_MODEL`
- `TOOLBOX_PROGRESS_FOUNDATION_FIELDS`
- local `progressModel`
- local `defaultProgress`
- local `progressRequirements`
- duplicated local card fields for `status`, `requiredForTestable`, `requiredForPublish`, `requires`, `progressChecklist`, `adminOnly`, `hidden`, `deferred`, and `visibleInToolsList`

## Visibility Behavior

- Admin Tools Progress status source currently hydrates 41 active/planned status rows.
- Toolbox listable entries currently hydrate to 37 entries.
- Normal user Toolbox visibility is filtered to Ready tools only.
- Current normal user Ready tools are Project Workspace and Game Design.
- Admin role sees all Toolbox-listable tools and their hydrated statuses.

## Missing Metadata Diagnostics

Visible diagnostics were added for missing status metadata:

- Admin Tools Progress rows render `[data-tools-progress-status-diagnostic]` when metadata is missing.
- Toolbox cards render `[data-toolbox-status-diagnostic]` when metadata is missing.
- Current registered tools have complete metadata, so no missing-metadata diagnostics render in normal/Admin pages.
- Targeted tests cover a synthetic missing-metadata tool to prove diagnostics are visible and the tool is treated as unavailable.

## Validation

Impacted lanes:

- `tools-progress`
- `tool-runtime`

Commands run:

- `node --check admin/tools-progress-source.js`
- `node --check admin/tools-progress.js`
- `node --check toolbox/toolRegistry.js`
- `node --check toolbox/tools-page-accordions.js`
- `node --check tests/playwright/tools/ToolsProgressHydration.spec.mjs`
- `node --check scripts/validate-tool-registry.mjs`
- `node --check scripts/validate-active-tools-surface.mjs`
- `node scripts/validate-tool-registry.mjs`
- `node ./scripts/run-targeted-test-lanes.mjs --lane tools-progress --lane tool-runtime`
- `git diff --check`

Results:

- Targeted lane run passed: 2 lanes, 10 Playwright tests.
- Tools Progress lane passed: 5 tests.
- Tool Runtime lane passed: 5 tests.
- Registry validation passed.
- Changed-file syntax checks passed.
- `git diff --check` passed.

Supplemental note:

- `scripts/validate-active-tools-surface.mjs` was updated so its status-foundation check points at `admin/tools-progress-source.js` instead of the retired Toolbox-local `progressRequirements` mapping.
- Running the full `node scripts/validate-active-tools-surface.mjs` command still reports existing non-status Toolbox wireframe expectations for Progress controls, child capability markup, and Build Path renderer shape. That validator is not the targeted validation lane for this PR and was not used as the pass/fail gate.

Skipped lanes:

- Full samples smoke was skipped by request.
- Other MSJ lanes were skipped because this PR did not change samples, archived V1/V2 content, DB/auth/cloud persistence, parser behavior, engine runtime behavior, or non-Toolbox tool implementation behavior.

## Manual Notes

- Verified status metadata counts from the source: 41 Admin rows, 37 Toolbox-listable entries, 2 Ready normal-user entries.
- Verified targeted test coverage checks that Toolbox card statuses match Admin Tools Progress source status values.
- Verified user role only exposes Ready tools.
- Verified Admin role exposes non-Ready statuses for planning review.

## Out Of Scope

- No archived V1/V2 pages were modified.
- No `start_of_day` folders were modified.
- No CSS, inline styles, page-local scripts, DB, auth, cloud, or persistence behavior was added.
