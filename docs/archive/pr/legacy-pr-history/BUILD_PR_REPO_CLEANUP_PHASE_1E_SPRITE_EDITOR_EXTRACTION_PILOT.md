Toolbox Aid
David Quesenberry
03/29/2026
BUILD_PR_REPO_CLEANUP_PHASE_1E_SPRITE_EDITOR_EXTRACTION_PILOT.md

# BUILD_PR - Repo Cleanup Phase 1E

## Title
Repo Cleanup Phase 1E - Sprite Editor Extraction Pilot

## Source of Truth
- `docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1E_SPRITE_EDITOR_EXTRACTION_PILOT.md`

## Scope Confirmation
- Minimal, controlled extraction delta
- Sprite Editor-only code touch
- Extract exactly one helper from `tools/SpriteEditor_old_keep/modules/` to `tools/SpriteEditor_old_keep/shared/`
- Preserve behavior

## Do-Not-Touch Confirmation
- `src/engine/`
- `games/`
- `samples/`
- unrelated files outside this BUILD scope

## Full Repo-Relative Paths (Touched for This BUILD)
- `tools/SpriteEditor_old_keep/modules/appPalette.js`
- `tools/SpriteEditor_old_keep/shared/getPaletteSignature.js`
- `docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1E_SPRITE_EDITOR_EXTRACTION_PILOT.md`
- `docs/pr/BUILD_PR_REPO_CLEANUP_PHASE_1E_SPRITE_EDITOR_EXTRACTION_PILOT.md`
- `docs/dev/CODEX_COMMANDS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`
- `docs/operations/dev/README.md`

## Helper Ownership Before/After
| helper | before owner | after owner | extraction rationale | behavior change |
|---|---|---|---|---|
| `getPaletteSignature(palette)` | `tools/SpriteEditor_old_keep/modules/appPalette.js` (local prototype helper) | `tools/SpriteEditor_old_keep/shared/getPaletteSignature.js` (shared Sprite Editor helper) | Pure deterministic serialization helper with repeated use and no panel/UI coupling | none |

## Minimal Extraction Delta Applied
1. Added `tools/SpriteEditor_old_keep/shared/getPaletteSignature.js`
- Exports `getPaletteSignature(palette)` as a pure helper.

2. Updated `tools/SpriteEditor_old_keep/modules/appPalette.js`
- Imported `getPaletteSignature` from `../shared/getPaletteSignature.js`.
- Removed local `getPaletteSignature` prototype method.
- Replaced all local method calls with the imported helper.

## Validation
- `node -c tools/SpriteEditor_old_keep/shared/getPaletteSignature.js`
- `node -c tools/SpriteEditor_old_keep/modules/appPalette.js`

## Risk Notes
- Low risk: helper is pure and stateless.
- Main risk was hidden `this` dependency; mitigated by using only explicit arguments.
- Scope lock maintained by extracting one helper only and limiting edits to Sprite Editor paths.

## Acceptance Check
- One helper extracted: pass.
- Behavior preserved: pass (logic copied 1:1).
- No src/engine/game/sample changes: pass.
- No scope expansion: pass.
