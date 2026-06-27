# PR_26160_086 Tool Status Tooltip Update Report

## Branch Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Current branch is `main` | PASS | `git branch --show-current` returned `main` before changes. |

## Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Update Toolbox/Admin status tooltip hover text to use the new governance definitions | PASS | `src/dev-runtime/guest-seeds/tool-metadata-inventory.js` now exports the PR085 definitions through `TOOL_RELEASE_CHANNEL_HELP_TEXT`. |
| Tooltip text explains `planned`, `wireframe`, `beta`, and `complete` | PASS | API contract assertion verifies all four help strings in `tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs`. |
| Tooltip appears in Toolbox Build Path | PASS | `toolbox/tools-page-accordions.js` adds shared-definition title text to Build Path status cells and existing status filter buttons use the same contract help text. |
| Tooltip appears in Admin Tool Votes | PASS | `admin/tool-votes.js` applies shared-definition title text to State selects/options and renders a shared-definition diagnostics line. |
| Do not hardcode duplicate definitions in multiple places when shared metadata exists | PASS | Active UI reads help text from the Toolbox API contract. The compatibility `toolbox/toolRegistry.js` stub was updated only to prevent stale definitions for legacy scripts/tests. |
| Use DB/API/service-backed or shared metadata where already available | PASS | Active Toolbox/Admin surfaces consume `getToolboxContract()` from `/api/toolbox/registry/snapshot`. |
| Do not use inline script/style/event handlers | PASS | Focused `rg` audit found no inline handlers/styles in changed HTML/JS. |

## Tooltip Coverage

| Surface | Coverage |
| --- | --- |
| Toolbox status filter controls | Existing `data-toolbox-status-filter` buttons use `releaseChannelHelp(channel)` from the API contract for `title`; Playwright asserts Beta contains "Can be used in a real game." |
| Toolbox Build Path status cells | New `data-build-path-status-help` cells show `<Status>: <definition>` in `title`; Playwright asserts Complete contains "Ready for long-term support." |
| Toolbox tiles/status kickers | Existing `data-toolbox-kicker` badges continue using contract-backed `tool.releaseChannelHelpText`. |
| Admin Tool Votes State select | New select/option titles use shared `releaseChannelHelpText`; Playwright asserts Colors State title contains the Complete definition. |
| Admin Tool Votes Diagnostics | New `data-toolbox-votes-state-help` line renders all shared definitions; Playwright asserts the Beta definition is visible. |

## Validation

| Lane | Result | Notes |
| --- | --- | --- |
| Branch guard | PASS | Current branch was `main`. |
| Changed-file syntax | PASS | `node --check` passed for changed JS and test files. |
| Inline HTML/JS audit | PASS | `rg` found no inline scripts, styles, or event handlers in changed files. |
| Diff hygiene | PASS | `git diff --check` completed with line-ending normalization warnings only. |
| Targeted Playwright | PASS | `npx playwright test tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs --reporter=line` passed 4/4. |

## Impacted Lanes

- Impacted lane: Toolbox/Admin Tool Votes metadata SSoT.
- Playwright impacted: Yes.
- Samples skipped: Safe to skip because the change only updates Toolbox/Admin status metadata and hover/help display.
- Full samples validation: Not run per request.

## Manual Test Notes

- Open `/toolbox/index.html`, switch to Build Path, hover status filter buttons and status cells.
- Open `/admin/tool-votes.html`, hover State dropdowns and confirm the Diagnostics panel lists the same four status meanings.
