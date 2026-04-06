Toolbox Aid
David Quesenberry
03/29/2026
BUILD_PR_REPO_CLEANUP_PHASE_1G_ENGINE_PROMOTION_FROM_STRONG_CANDIDATES.md

# BUILD_PR - Repo Cleanup Phase 1G

## Title
Repo Cleanup Phase 1G - Engine Promotion From Strong Candidates

## Source of Truth
- `docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1G_ENGINE_PROMOTION_FROM_STRONG_CANDIDATES.md`

## Scope Confirmation
- Minimal engine promotion delta
- Promote exactly one helper from Sprite Editor shared into engine ownership
- Maintain behavior and update imports only where used

## Do-Not-Touch Confirmation
- `games/`
- `samples/`
- unrelated files outside this BUILD scope

## Full Repo-Relative Paths (Touched for This BUILD)
- `engine/utils/fuzzyMatchScore.js`
- `tools/SpriteEditor_old_keep/shared/scoreCommandItem.js`
- `tools/SpriteEditor_old_keep/shared/fuzzyMatchScore.js` (removed)
- `docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1G_ENGINE_PROMOTION_FROM_STRONG_CANDIDATES.md`
- `docs/pr/BUILD_PR_REPO_CLEANUP_PHASE_1G_ENGINE_PROMOTION_FROM_STRONG_CANDIDATES.md`
- `docs/dev/CODEX_COMMANDS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`
- `docs/dev/README.md`

## Helper Ownership Before/After
| helper | before owner | after owner | placement justification | behavior change |
|---|---|---|---|---|
| `fuzzyMatchScore(text, query)` | `tools/SpriteEditor_old_keep/shared/fuzzyMatchScore.js` | `engine/utils/fuzzyMatchScore.js` | Pure text scoring utility with zero UI/state coupling; best fit in engine utilities | none |

## Engine Placement Justification
- The helper is deterministic and stateless.
- It has no Sprite Editor data dependency and no UI coupling.
- `engine/utils/` is the appropriate reusable utility domain.

## Import Update
- Updated `tools/SpriteEditor_old_keep/shared/scoreCommandItem.js` to import from:
  - `../../../engine/utils/fuzzyMatchScore.js`

## Validation
- `node -c engine/utils/fuzzyMatchScore.js`
- `node -c tools/SpriteEditor_old_keep/shared/scoreCommandItem.js`
- `node -c tools/SpriteEditor_old_keep/shared/normalizeCommandText.js`
- `node -c tools/SpriteEditor_old_keep/modules/appCommands.js`

## Acceptance Check
- Behavior unchanged: pass.
- Exactly one helper promoted: pass.
- No games/samples changes: pass.
- Import updated only where used: pass.
- Engine structure respected: pass.
