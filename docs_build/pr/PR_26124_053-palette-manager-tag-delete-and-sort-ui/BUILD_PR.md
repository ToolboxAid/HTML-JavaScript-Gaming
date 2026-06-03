# BUILD_PR - PR_26124_053-palette-manager-tag-delete-and-sort-ui

## Purpose
Implement one scoped Palette Manager V2 UI update for tag deletion, Tag sorting, compact source controls, and accordion naming.

## Scope
- `toolbox/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Implementation
1. Restore the Add accordion title to `User Defined Swatch`.
2. Keep the Add button label as `User Defined Swatch`.
3. In the Tags accordion, each available tag must keep its tag-toggle button behavior.
4. Add a separate visible delete affordance for each available tag.
5. Delete an available tag only when no User Palette swatch currently uses the tag.
6. When tag deletion is blocked, show a clear validation/error message.
7. Add User Palette sort mode `Tag`.
8. Tag sort must sort by normalized lowercase tag text and put swatches without tags after tagged swatches.
9. Keep Source Palette sort modes unchanged.
10. Compact Source palette and Search source swatches controls into label/input rows.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not modify shared accordionV2.
- Do not modify shared sort services.
- Do not add dependencies.
- Do not broaden changes beyond Palette Manager V2 behavior and PR workflow docs.

## Validation
- Syntax check changed JavaScript files.
- Run targeted served-browser Palette Manager V2 tag delete, tag sort, and compact source-control check.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
