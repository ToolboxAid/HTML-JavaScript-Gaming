Toolbox Aid
David Quesenberry
03/29/2026
BUILD_PR_REPO_CLEANUP_PHASE_1D_SPRITE_EDITOR_POST_NORMALIZATION_EXTRACTION_GATE.md

# BUILD_PR - Repo Cleanup Phase 1D

## Title
Repo Cleanup Phase 1D - Sprite Editor Post-Normalization Extraction Gate

## Source of Truth
- `docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1D_SPRITE_EDITOR_POST_NORMALIZATION_EXTRACTION_GATE.md`

## Scope Confirmation
- Docs-only delta
- Analysis scope limited to `tools/SpriteEditor_old_keep/modules/`
- Output scope limited to `docs/pr` and `docs/dev` artifacts
- No runtime code changes

## Do-Not-Touch Confirmation
- `engine/`
- `games/`
- `samples/`
- `tests/`

## Full Repo-Relative Paths (This BUILD Package)
- `docs/pr/PLAN_PR_REPO_CLEANUP_PHASE_1D_SPRITE_EDITOR_POST_NORMALIZATION_EXTRACTION_GATE.md`
- `docs/pr/BUILD_PR_REPO_CLEANUP_PHASE_1D_SPRITE_EDITOR_POST_NORMALIZATION_EXTRACTION_GATE.md`
- `docs/dev/CODEX_COMMANDS.md`
- `docs/dev/COMMIT_COMMENT.txt`
- `docs/dev/NEXT_COMMAND.txt`
- `docs/dev/README.md`

## Helper Inventory (Post-Phase-1C Baseline)
| helper family | primary paths | ownership domain | reuse signal | UI coupling | classification |
|---|---|---|---|---|---|
| Palette sidebar interaction helpers (`isPointInPaletteSidebar`, `scrollPaletteSidebarByWheel`, `handlePaletteSidebarWheel`) | `tools/SpriteEditor_old_keep/modules/appPalette.js`, callsite in `tools/SpriteEditor_old_keep/modules/appInput.js` | right-panel palette/state | 2 modules, same feature boundary | high | Keep Local |
| Reference tool panel guidance (`showReferenceToolPanelGuidance`) | `tools/SpriteEditor_old_keep/modules/appViewTools.js`, callsites in `appViewTools.js` and `appInput.js` | tool/view behavior | 2 modules, same guidance concern | high | Keep Local |
| Color token normalization overlap (`normalizeColorToken` local action flow vs export color parsers) | `tools/SpriteEditor_old_keep/modules/appActions.js`, `tools/SpriteEditor_old_keep/modules/appExport.js` | action + export pipeline | near-duplicate intent, semantics differ | medium | Monitor |
| Palette signature/matching policies (`getPaletteSignature`, `findMatchingPalettePresetName`) | `tools/SpriteEditor_old_keep/modules/appPalette.js` | palette policy | currently concentrated in one domain | medium | Future Candidate |
| Command text normalization/ranking (`normalizeCommandText`, `scoreCommandItem`) | `tools/SpriteEditor_old_keep/modules/appCommands.js` | command palette/search | contained but expandable | low-medium | Future Candidate |
| Control-surface panel builders and draw/input primitives | `tools/SpriteEditor_old_keep/modules/controlSurface*.js` | panel composition + canvas UI | highly local to Sprite Editor shell | high | Keep Local |

## Classification Buckets

### Keep Local
- Palette sidebar interaction helpers
- Reference tool guidance helper
- Control-surface panel build/draw/input helpers

Why:
- Strong Sprite Editor UI coupling
- Panel-boundary ownership is intentional and clear after Phase 1C
- Extraction would not improve architecture quality at this stage

### Monitor
- Color normalization overlaps between action and export flows

Why:
- Similar utility shape, but side effects and accepted token formats are context-sensitive
- Needs behavior mapping before any merge/extraction proposal

### Future Candidate
- Palette signature/matching policy helpers
- Command normalization/ranking internals

Why:
- Potential for reuse expansion inside Sprite Editor module set
- Not yet enough stable multi-owner reuse to justify extraction

## Extraction Gate Criteria (Applied)
Any helper must pass all gates before extraction:

1. Reuse Gate:
- 2+ real locations with identical semantics (prefer 3+ for non-trivial helpers)

2. Behavior Gate:
- Equivalent behavior contract with no feature-specific edge paths

3. Coupling Gate:
- No hidden app-state or panel-boundary dependency leakage

4. Boundary Gate:
- Extraction does not blur left-panel action ownership or right-panel palette/state ownership

5. Safety Gate:
- Reduces duplication without introducing regression risk

6. Promotion Gate (engine future only):
- Proven reuse beyond Sprite Editor plus explicit architecture approval

## Extraction Gate Outcome Summary
| helper family | gate result | reason |
|---|---|---|
| Palette sidebar interaction helpers | fail (keep local) | panel-boundary and UI-state coupling is intentional |
| Reference tool guidance helper | fail (keep local) | UX guidance is tool-local behavior |
| Color normalization overlap | defer (monitor) | semantics not yet proven equivalent |
| Palette signature/matching policies | pending (future candidate) | reuse pattern not broad enough yet |
| Command ranking internals | pending (future candidate) | currently cohesive in one subsystem |

## Risks
- Premature extraction can reverse Phase 1C ownership clarity.
- False-positive duplicate detection can merge helpers with subtly different behavior.
- Scope drift into engine/shared-tool abstraction can violate cleanup workflow locks.

## Acceptance Criteria
1. Helper inventory is explicit and path-based.
2. Classification includes Keep Local / Monitor / Future Candidate buckets.
3. Extraction gate criteria are explicit.
4. Gate outcomes are documented per helper family.
5. Package remains docs-only and repo-structured.

## Next-Step BUILD Guidance
Recommended next command target:
- `BUILD_PR_REPO_CLEANUP_PHASE_1E_SPRITE_EDITOR_EXTRACTION_GATE_PILOT_OR_HOLD`

Guidance:
1. Re-check monitor bucket helpers with behavior diff table.
2. If no helper passes gates, emit docs-only HOLD decision.
3. If one helper family passes all gates, run one contained Sprite Editor-local pilot extraction only.
