# BUILD_PR - PR_26124_048-palette-manager-right-accordion-v2

## Purpose
Use shared accordionV2 for Palette Manager V2 right-column accordions and fix right-column height ownership around Import/Export and Validation/Error Viewer.

## Scope
- `toolbox/palette-manager-v2/index.html`
- `toolbox/palette-manager-v2/paletteManagerV2.css`
- PR workflow docs and required review artifacts only.

## Implementation
1. Convert right-column Import/Export from `details`/`summary` to `section.accordion-v2`.
2. Convert right-column Validation/Error Viewer from `details`/`summary` to `section.accordion-v2`.
3. Preserve right-column control IDs and content.
4. Add right-column-only accordionV2 sizing rules:
   - Import/Export collapsed: header only.
   - Import/Export open: fills available height above Validation/Error Viewer.
   - JSON preview: flexes from below buttons to the bottom of Import/Export and scrolls internally.
   - Validation/Error Viewer: bottom-anchored, compact, and internally scrollable.
5. Remove old right-column details/summary sizing overrides.

## Boundaries
- Do not change workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not modify shared accordionV2 behavior.
- Do not add dependencies.
- Do not alter left or center panel behavior.

## Validation
- Syntax check changed files.
- Run targeted served-browser Palette Manager V2 right-column check.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
