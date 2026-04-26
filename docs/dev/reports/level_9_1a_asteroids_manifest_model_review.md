# Level 9.1A Asteroids Manifest Model Review

## Scope
- Review-only documentation update.
- No runtime implementation changes.
- No validator changes.
- No `start_of_day` changes.
- No new manifest elements added to repository runtime files.

## Reviewed Inputs
- `docs/pr/PLAN_PR_LEVEL_9_1A_ASTEROIDS_MANIFEST_MODEL_REVIEW.md`
- `docs/pr/BUILD_PR_LEVEL_9_1A_ASTEROIDS_MANIFEST_MODEL_REVIEW.md`

## Cleaned Model Decision (Review)
1. `games/Asteroids/game.manifest.json` remains the intended game SSoT target.
2. Embedded game content should not be placed into workspace schema ownership areas.
3. Actual JSON content should live under the owning tool section in the game manifest model.
4. Primitive Skin Editor is the owner for HUD/skin color data.
5. Palette Browser is browsing-oriented and should not own HUD/skin payload ownership.
6. Asset Browser remains a file-reference owner for binary/media assets (audio/images/fonts).
7. Legacy lineage/catalog references are migration artifacts and should be removed after full migration parity.
8. Launch metadata is optional when direct routing is already canonical.

## Cleaned Manifest Shape (Review Baseline)
- The cleaned shape defined in `BUILD_PR_LEVEL_9_1A_ASTEROIDS_MANIFEST_MODEL_REVIEW.md` is accepted as the review baseline model for next implementation steps.
- This PR does not apply that shape to runtime files; it records review alignment only.

## Migration Intent (Review-Only)
- JSON files listed in the BUILD doc under "Files Intended To Be Removed After Data Migration" remain migration targets.
- Binary/media files listed under "Keep As Files" remain file-backed references.

## Open Review Items
1. Confirm whether `launch` should remain in the game manifest model.
2. Confirm canonical tool id for preview ownership (`preview-generator-tool` vs existing id).
3. Confirm long-term ownership/disposition of Asteroids classic palette data.
4. Confirm final ownership model for bezel stretch metadata (`bezel.stretch.override.json`).

## Implementation Status
- `status`: review complete
- `implementation`: deferred (intentionally out of scope for 9.1A)
