# PLAN_PR - PR_26124_066-palette-manager-final-baseline-hardening

## Goal
Perform a final focused Palette Manager V2 hardening pass before using it as the base pattern for future tool rebuilds.

## Scope
- `toolbox/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not change behavior unless fixing a concrete stale/dead/duplicate artifact.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Avoid broad refactor.

## Audit Checklist
1. Confirm no old `details`/`summary` accordion markup remains in Palette Manager V2.
2. Check for duplicate or dead CSS override blocks.
3. Check for unused event handlers, refs, or stale IDs from rejected/rolled-back PRs.
4. Check for duplicate tag controls or duplicate Clear controls.
5. Confirm Validation/Error Viewer Clear remains inside its viewer header.
6. Confirm User Palette Clear checkbox behavior remains unchanged.
7. Confirm Sample Palette scroll preservation remains unchanged.
8. Confirm Tag sort keeps untagged swatches last.
9. Confirm Import/Copy/Export buttons remain centered in `menuSample`.
10. Confirm pin size is not changed.

## Implementation Plan
1. Inspect only `toolbox/palette-manager-v2`.
2. Fix only concrete stale/dead/duplicate artifacts found by the audit.
3. Preserve all listed behaviors and layout contracts.
4. Document any audit-only findings in the report.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by this Palette Manager V2-only hardening pass.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm all accordions use accordionV2 UI, not old `details`/`summary`.
3. Confirm Validation/Error Viewer Clear is in the viewer header and still clears only displayed history.
4. Confirm User Palette checkbox clearing is unchanged.
5. Confirm source palette individual pin/unpin preserves source grid scroll.
6. Confirm User Palette Tag descending sort keeps untagged swatches last.
7. Confirm Import JSON, Copy JSON, and Export JSON remain centered in `menuSample`.
8. Confirm pin button size is unchanged.
