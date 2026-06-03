# PLAN_PR - PR_26124_069-palette-manager-left-accordionv2-cleanup

## Goal
Convert any remaining Palette Manager V2 left-column legacy `details`/`summary` accordions to the shared `accordionV2` structure.

## Scope
- `tools/palette-manager-v2/index.html` only if left-column legacy accordion markup exists.
- PR workflow docs and required review artifacts.

## Boundaries
- Do not change behavior.
- Do not change layout beyond matching existing `accordionV2` structure.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not change pin styling or size.
- Do not add dependencies.
- Avoid broad refactor.

## Implementation Plan
1. Inspect `tools/palette-manager-v2/index.html` left-column markup.
2. Identify any `details`/`summary` accordions inside `.palette-manager-v2__panel--left`.
3. Convert only those left-column legacy accordions, if found, to the current local `accordionV2` structure:
   - `section.accordion-v2`
   - `button.accordion-v2__header`
   - `.accordion-v2__content`
   - existing IDs and controls preserved.
4. Preserve the shared platform shell `details` wrapper if present outside the left column.
5. If no left-column legacy accordion exists, make no runtime change and record the verified no-op.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by this Palette Manager V2 accordion structure cleanup.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm the left-column Selected Swatch, User Defined Swatch, and Tags sections use the same accordionV2 behavior as center/right sections.
3. Confirm section open/close behavior is unchanged.
4. Confirm no pin styling, pin size, JSON behavior, or sample data behavior changed.
