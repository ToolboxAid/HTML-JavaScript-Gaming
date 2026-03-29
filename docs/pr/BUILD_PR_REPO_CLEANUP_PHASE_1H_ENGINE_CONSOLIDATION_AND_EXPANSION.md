Toolbox Aid
David Quesenberry
03/29/2026
BUILD_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md

# BUILD_PR - Repo Cleanup Phase 1H

## Title
Repo Cleanup Phase 1H - Engine Consolidation and Controlled Expansion

## Source of Truth
- `docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md`

## Scope Confirmation
- Controlled engine consolidation delta
- Promote up to 2 helpers from `tools/SpriteEditor/shared/` to `engine/`
- Maintain behavior and architecture boundaries

## Do-Not-Touch Confirmation
- `games/`
- `samples/`
- unrelated files outside this BUILD scope

## Full Repo-Relative Paths (Touched for This BUILD)
- `engine/utils/normalizeCommandText.js`
- `tools/SpriteEditor/modules/appCommands.js`
- `tools/SpriteEditor/shared/scoreCommandItem.js`
- `tools/SpriteEditor/shared/normalizeCommandText.js` (removed)
- `docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md`
- `docs/pr/BUILD_PR_REPO_CLEANUP_PHASE_1H_ENGINE_CONSOLIDATION_AND_EXPANSION.md`
- `docs/dev/CODEX_COMMANDS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`
- `docs/dev/README.md`

## Promoted Helpers (This Phase)
| helper | before owner | after owner | engine domain | behavior change |
|---|---|---|---|---|
| `normalizeCommandText(input)` | `tools/SpriteEditor/shared/normalizeCommandText.js` | `engine/utils/normalizeCommandText.js` | `engine/utils` (generic text normalization) | none |

## Consolidation Notes
- Existing Phase 1G promotion remains in place:
  - `engine/utils/fuzzyMatchScore.js`
- Command ranking shared helper now depends on engine-owned generic helpers.
- Sprite Editor module import updated to consume engine utility directly where used.

## Duplicate Removal List
- Removed `tools/SpriteEditor/shared/normalizeCommandText.js` after engine promotion.

## Updated Helper Inventory Snapshot
| helper | owner after Phase 1H |
|---|---|
| `fuzzyMatchScore` | `engine/utils/fuzzyMatchScore.js` |
| `normalizeCommandText` | `engine/utils/normalizeCommandText.js` |
| `scoreCommandItem` | `tools/SpriteEditor/shared/scoreCommandItem.js` |

## Import Updates
- `tools/SpriteEditor/shared/scoreCommandItem.js`
  - `normalizeCommandText` import -> `../../../engine/utils/normalizeCommandText.js`
- `tools/SpriteEditor/modules/appCommands.js`
  - `normalizeCommandText` import -> `../../../engine/utils/normalizeCommandText.js`

## Validation
- `node -c engine/utils/normalizeCommandText.js`
- `node -c tools/SpriteEditor/shared/scoreCommandItem.js`
- `node -c tools/SpriteEditor/modules/appCommands.js`

## Acceptance Check
- Behavior unchanged: pass.
- Promotions this phase <= 2: pass (1 promoted).
- Engine structure improved without generic dumping: pass.
- Shared duplicate removed after promotion: pass.
