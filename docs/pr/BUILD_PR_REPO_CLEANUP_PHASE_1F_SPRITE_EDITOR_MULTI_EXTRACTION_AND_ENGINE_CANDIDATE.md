Toolbox Aid
David Quesenberry
03/29/2026
BUILD_PR_REPO_CLEANUP_PHASE_1F_SPRITE_EDITOR_MULTI_EXTRACTION_AND_ENGINE_CANDIDATE.md

# BUILD_PR - Repo Cleanup Phase 1F

## Title
Repo Cleanup Phase 1F - Controlled Multi-Helper Extraction and Engine Candidate Evaluation

## Source of Truth
- `docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1F_SPRITE_EDITOR_MULTI_EXTRACTION_AND_ENGINE_CANDIDATE.md`

## Scope Confirmation
- Controlled multi-helper extraction (max 3)
- Sprite Editor-only code scope (`tools/SpriteEditor_old_keep/modules/` and `tools/SpriteEditor_old_keep/shared/`)
- Behavior-preserving changes only

## Do-Not-Touch Confirmation
- `engine/`
- `games/`
- `samples/`
- unrelated files outside this BUILD scope

## Full Repo-Relative Paths (Touched for This BUILD)
- `tools/SpriteEditor_old_keep/modules/appCommands.js`
- `tools/SpriteEditor_old_keep/shared/normalizeCommandText.js`
- `tools/SpriteEditor_old_keep/shared/fuzzyMatchScore.js`
- `tools/SpriteEditor_old_keep/shared/scoreCommandItem.js`
- `docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1F_SPRITE_EDITOR_MULTI_EXTRACTION_AND_ENGINE_CANDIDATE.md`
- `docs/pr/BUILD_PR_REPO_CLEANUP_PHASE_1F_SPRITE_EDITOR_MULTI_EXTRACTION_AND_ENGINE_CANDIDATE.md`
- `docs/dev/CODEX_COMMANDS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`
- `docs/dev/README.md`

## Helper Inventory (Extracted in Phase 1F)
| helper | before owner | after owner | usage points in module flow | behavior delta |
|---|---|---|---|---|
| `normalizeCommandText(input)` | `tools/SpriteEditor_old_keep/modules/appCommands.js` prototype method | `tools/SpriteEditor_old_keep/shared/normalizeCommandText.js` | query normalization + item field normalization | none |
| `fuzzyMatchScore(text, query)` | `tools/SpriteEditor_old_keep/modules/appCommands.js` prototype method | `tools/SpriteEditor_old_keep/shared/fuzzyMatchScore.js` | fallback ranking path in command scoring | none |
| `scoreCommandItem(item, normalizedQuery)` | `tools/SpriteEditor_old_keep/modules/appCommands.js` prototype method | `tools/SpriteEditor_old_keep/shared/scoreCommandItem.js` | ranking score core for command palette items | none |

## Engine Candidate Evaluation Table
| helper | multi-tool future potential | UI-independent | tool-specific state free | engine duplication reduction potential | classification |
|---|---|---|---|---|---|
| `normalizeCommandText` | medium-high | yes | yes | medium | Candidate (Needs More Proof) |
| `fuzzyMatchScore` | high | yes | yes | high | Strong Candidate (ready for future promotion phase) |
| `scoreCommandItem` | low-medium | mostly | yes | low | Not Candidate |

## Extraction Validation Notes
1. Extraction count is 3 helpers (within max 3).
2. Helpers moved as isolated units (no bulk utility bundle file).
3. No API redesign; call behavior remains unchanged.
4. Updated imports only in `tools/SpriteEditor_old_keep/modules/appCommands.js`.
5. No changes in `engine/`, `games/`, or `samples/`.

## Acceptance Check
- No behavior changes: pass.
- Max 3 helpers extracted: pass.
- No engine modifications: pass.
- No cross-tool coupling introduced: pass.
- Engine candidate classification included: pass.
