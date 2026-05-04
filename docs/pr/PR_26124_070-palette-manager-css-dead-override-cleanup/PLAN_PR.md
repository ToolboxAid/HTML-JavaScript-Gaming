# PLAN_PR - PR_26124_070-palette-manager-css-dead-override-cleanup

## Goal
Remove confirmed duplicate, dead, or unreachable override blocks from Palette Manager V2 CSS without changing visual behavior.

## Scope
- `tools/palette-manager-v2/paletteManagerV2.css`
- PR workflow docs and required review artifacts.

## Boundaries
- CSS only.
- Do not modify HTML or JavaScript.
- Do not refactor class names.
- Do not merge rules.
- Remove only confirmed duplicate/dead override blocks.
- Keep the most recent/active rule when duplicates exist.
- Keep the append-only `.palette-manager-v2__pin-button--tile` override at the bottom exactly in place.
- Do not change layout, spacing, sizing, pin styling, or pin size.
- Do not touch workspace/toolState/session behavior, sample JSON, `tools/shared`, schemas, or dependencies.

## Implementation Plan
1. Inspect `tools/palette-manager-v2/paletteManagerV2.css`.
2. Compare Palette Manager accordion overrides against shared `src/engine/theme/accordionV2/accordionV2.css`.
3. Remove only CSS blocks confirmed to be inactive duplicates or obsolete patch remnants:
   - closed-state import accordion declarations already covered by shared accordionV2,
   - import accordion content declarations identical to shared accordionV2 content,
   - validation accordion open-state declarations identical to validation base declarations,
   - center tile-grid patch declarations already covered by the base tile grid/default CSS.
4. Preserve active right-column sizing rules and the final append-only pin override.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by this Palette Manager V2 CSS-only cleanup.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm left, center, and right accordion layout appears unchanged.
3. Confirm User Palette and Sample Palette grids retain the same size and scrolling behavior.
4. Confirm Palette JSON and Validation/Error Viewer sizing remains unchanged.
5. Confirm pin styling and pin size are unchanged.
