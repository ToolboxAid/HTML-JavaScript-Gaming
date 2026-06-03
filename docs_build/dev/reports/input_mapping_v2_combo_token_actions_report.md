# Input Mapping V2 Combo Token Actions Report

Task: PR_26140_109-polish-input-mapping-v2-combo-token-actions

## Source Reading
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before making changes.
- Read `.codex/skills/repo-build/SKILL.md` and followed the repo BUILD workflow requirements.
- Read `docs_build/pr/BUILD_PR.md`; it still describes an unrelated overlay runtime hardening build, so the explicit PR109 request was used as the active build scope.

## Implementation
- Added per-token deletion for Captured Mappings tiles. Clicking or keyboard-activating a mapping token removes only that token and keeps the action tile selected.
- Preserved combo capture as an exact two-input flow by default. The first input shows in-progress feedback and the second input commits one combo mapping.
- Removed visible square brackets from token text while keeping comma-separated token content inside the span.
- Set captured mapping token width to 250px and kept hover/title metadata intact.
- Made mapping cards vertically scroll when mappings overflow and preserved the selected tile `scrollTop` across rerenders for selection, refresh, token deletion, and combo commits.
- Preserved capture gating from PR108, selected tile indication, used-input highlighting, and existing combo/cross-device behavior.

## Constraints
- No schema changes were made.
- No sample JSON files were touched.
- Workspace V2 launch behavior was preserved.

## Validation
- `node --check tools/input-mapping-v2/js/ToolStarterApp.js`
- `node --check tools/input-mapping-v2/js/controls/PreviewPanelControl.js`
- `node --check tools/input-mapping-v2/js/services/InputMappingState.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "Input Mapping V2"`: 7 passed.
- `npm run test:workspace-v2`: 66 passed.
- `git diff --check`: passed; PowerShell reported line-ending normalization warnings only.

Full samples smoke test was not run, per instruction.
