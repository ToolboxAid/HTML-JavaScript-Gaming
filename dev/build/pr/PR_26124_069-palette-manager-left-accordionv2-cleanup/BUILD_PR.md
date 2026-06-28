# BUILD_PR - PR_26124_069-palette-manager-left-accordionv2-cleanup

## Purpose
Perform one scoped Palette Manager V2 cleanup by converting any remaining left-column legacy `details`/`summary` accordion markup to the existing `accordionV2` structure.

## Scope
- `toolbox/palette-manager-v2/index.html` only if left-column legacy accordion markup exists.
- PR workflow docs and required review artifacts.

## Implementation
1. Inspect only `toolbox/palette-manager-v2/index.html` and immediate Palette Manager accordion references.
2. Search for `details`/`summary` markup inside `.palette-manager-v2__panel--left`.
3. If found, convert only the left-column legacy accordion markup to the existing pattern used by working Palette Manager V2 sections:
   - `section.accordion-v2`
   - `button.accordion-v2__header`
   - `span.accordion-v2__icon`
   - `div.accordion-v2__content`
4. Preserve existing IDs, labels, controls, inputs, and section content.
5. Preserve the shared platform shell `details`/`summary` wrapper because it is outside the left column and is owned by the platform shell.
6. If no left-column legacy `details`/`summary` accordion markup exists, do not change runtime files and document the verified no-op.

## Boundaries
- Do not change behavior.
- Do not change layout beyond matching `accordionV2` structure.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not change pin styling or size.
- Do not add dependencies.
- Avoid broad refactor.

## Validation
- Run a targeted left-column markup validation that confirms `.palette-manager-v2__panel--left` contains no `details` or `summary` elements and still contains the expected left-column `accordion-v2` sections.
- Syntax check changed JavaScript files if any JavaScript is changed.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
