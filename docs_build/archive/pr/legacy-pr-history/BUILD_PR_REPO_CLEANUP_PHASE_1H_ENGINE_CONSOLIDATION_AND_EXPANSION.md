Toolbox Aid
David Quesenberry
03/29/2026
BUILD_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md

# BUILD_PR - Repo Cleanup Phase 1H

## Title
Repo Cleanup Phase 1H - Engine Consolidation and Controlled Expansion

## Source of Truth
- `docs_build/pr/PLAN_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md`

## Scope Confirmation
- Controlled engine consolidation delta
- Promote up to 2 helpers from `toolbox/SpriteEditor_old_keep/shared/` to `src/engine/`
- Maintain behavior and architecture boundaries

## Do-Not-Touch Confirmation
- `games/`
- `samples/`
- unrelated files outside this BUILD scope

## Full Repo-Relative Paths (Touched for This BUILD)
- `src/shared/utils/normalizeCommandText.js`
- `toolbox/SpriteEditor_old_keep/modules/appCommands.js`
- `toolbox/SpriteEditor_old_keep/shared/scoreCommandItem.js`
- `toolbox/SpriteEditor_old_keep/shared/normalizeCommandText.js` (removed)
- `docs_build/pr/PLAN_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md`
- `docs_build/pr/BUILD_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md`
- `docs_build/dev/CODEX_COMMANDS.md`
- `docs_build/dev/COMMIT_COMMENT.txt`
- `docs_build/dev/NEXT_COMMAND.txt`
- `docs_build/operations/dev/README.md`

## Promoted Helpers (This Phase)
| helper | before owner | after owner | engine domain | behavior change |
|---|---|---|---|---|
| `normalizeCommandText(input)` | `toolbox/SpriteEditor_old_keep/shared/normalizeCommandText.js` | `src/shared/utils/normalizeCommandText.js` | `src/engine/utils` (generic text normalization) | none |

## Consolidation Notes
- Existing Phase 1G promotion remains in place:
  - `src/shared/utils/fuzzyMatchScore.js`
- Command ranking shared helper now depends on engine-owned generic helpers.
- Sprite Editor module import updated to consume engine utility directly where used.

## Duplicate Removal List
- Removed `toolbox/SpriteEditor_old_keep/shared/normalizeCommandText.js` after engine promotion.

## Updated Helper Inventory Snapshot
| helper | owner after Phase 1H |
|---|---|
| `fuzzyMatchScore` | `src/shared/utils/fuzzyMatchScore.js` |
| `normalizeCommandText` | `src/shared/utils/normalizeCommandText.js` |
| `scoreCommandItem` | `toolbox/SpriteEditor_old_keep/shared/scoreCommandItem.js` |

## Import Updates
- `toolbox/SpriteEditor_old_keep/shared/scoreCommandItem.js`
  - `normalizeCommandText` import -> `../../../src/src/shared/utils/normalizeCommandText.js`
- `toolbox/SpriteEditor_old_keep/modules/appCommands.js`
  - `normalizeCommandText` import -> `../../../src/src/shared/utils/normalizeCommandText.js`

## Validation
- `node -c src/shared/utils/normalizeCommandText.js`
- `node -c toolbox/SpriteEditor_old_keep/shared/scoreCommandItem.js`
- `node -c toolbox/SpriteEditor_old_keep/modules/appCommands.js`

## Acceptance Check
- Behavior unchanged: pass.
- Promotions this phase <= 2: pass (1 promoted).
- Engine structure improved without generic dumping: pass.
- Shared duplicate removed after promotion: pass.
