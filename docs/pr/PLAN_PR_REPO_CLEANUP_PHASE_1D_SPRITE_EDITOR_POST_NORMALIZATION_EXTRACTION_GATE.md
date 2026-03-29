Toolbox Aid
David Quesenberry
03/29/2026
PLAN_PR_REPO_CLEANUP_PHASE_1D_SPRITE_EDITOR_POST_NORMALIZATION_EXTRACTION_GATE.md

# PLAN_PR - Repo Cleanup Phase 1D

## Title
Repo Cleanup Phase 1D - Sprite Editor Post-Normalization Extraction Gate

## Purpose
Define the post-Phase-1C decision gate for helper extraction readiness after ownership normalization is complete.

This phase is planning and analysis only. It does not extract helpers to `engine/` and does not modify runtime behavior.

## Baseline
Approved Phase 1C outcome:
- `docs/dev/BUILD_PR_REPO_CLEANUP_PHASE_1C_SPRITE_EDITOR_HELPER_OWNERSHIP_AND_PANEL_BOUNDARY_NORMALIZATION.md`

Key normalized ownership anchors from Phase 1C:
- Palette sidebar wheel handling now owned by `tools/SpriteEditor/modules/appPalette.js`
- Reference-tool left-panel guidance now owned by `tools/SpriteEditor/modules/appViewTools.js`

## Workflow Lock
- `PLAN_PR -> BUILD_PR -> APPLY_PR`
- No scope expansion
- No architecture rewrite in this phase

## Scope Lock
Allowed analysis/plan area:
- `tools/SpriteEditor/modules/` (analysis only)
- `docs/pr/`
- `docs/dev/`

Do not modify:
- `engine/`
- `games/`
- `samples/`
- runtime behavior

## Repo-Relative Analysis Paths
- `tools/SpriteEditor/modules/appPalette.js`
- `tools/SpriteEditor/modules/appInput.js`
- `tools/SpriteEditor/modules/appViewTools.js`
- `tools/SpriteEditor/modules/appActions.js`
- `tools/SpriteEditor/modules/appExport.js`
- `tools/SpriteEditor/modules/appCommands.js`
- `tools/SpriteEditor/modules/appPopups.js`
- `tools/SpriteEditor/modules/controlSurface*.js`

## Post-Normalization Helper Classification Model

### Bucket A: Keep Local
Definition:
- Helper is tightly coupled to Sprite Editor UI state, panel boundaries, or tool-specific behavior.
- Extraction would increase coupling or reduce clarity.

Examples:
- `appPalette.js`: `isPointInPaletteSidebar`, `scrollPaletteSidebarByWheel`, `handlePaletteSidebarWheel`
- `appViewTools.js`: `showReferenceToolPanelGuidance`

### Bucket B: Monitor
Definition:
- Near-duplicate or overlap exists, but semantics differ or stability is not proven.
- Keep local now; collect additional usage/behavior evidence.

Examples:
- `appActions.js` local color-token normalization logic vs `appExport.js` hex/color normalization helpers
- command/palette message-formatting overlaps that are similar but context-specific

### Bucket C: Future Candidate
Definition:
- Helper family is local today but appears reusable across multiple Sprite Editor modules with consistent semantics.
- Eligible for future local module extraction under `tools/SpriteEditor/modules/` only (not `engine/` in this phase).

Examples:
- command search/ranking internals in `appCommands.js` if reused by additional command-surface flows
- palette signature/matching policy helpers in `appPalette.js` if shared by additional IO/validation paths

## Extraction Gate Criteria
Any helper must pass all gates before future extraction out of current owner:

1. Stability Gate
- Behavior unchanged across at least one completed cleanup/build cycle after normalization.

2. Reuse Gate
- Proven reuse need across at least 3 call sites in distinct modules, or 2 subsystems with the same semantics.

3. Boundary Gate
- No hidden ownership violation (left-panel action logic stays left-owned, right-panel palette/state logic stays right-owned).

4. Coupling Gate
- Extracted helper does not require broad app object reach-through or UI side effects by default.

5. Testability Gate
- Extraction target can be validated with syntax checks and behavior checks without introducing architecture drift.

6. Engine Promotion Gate (future, not this phase)
- Promotion to `engine/` requires proven reuse outside Sprite Editor (another tool/game/sample), documented API boundary, and dedicated BUILD approval.

## Initial Bucket Draft (Post-1C)
| helper area | repo-relative path | bucket | rationale | extraction gate status |
|---|---|---|---|---|
| Palette sidebar wheel ownership helpers | `tools/SpriteEditor/modules/appPalette.js` | Keep Local | right-panel palette/state ownership; UI-coupled | Not a candidate |
| Reference tool panel guidance helper | `tools/SpriteEditor/modules/appViewTools.js` | Keep Local | tool behavior guidance; UI wording/state-coupled | Not a candidate |
| Color normalization logic overlaps | `tools/SpriteEditor/modules/appActions.js`, `tools/SpriteEditor/modules/appExport.js` | Monitor | similar normalization intent with context differences | Reuse unclear |
| Command scoring internals | `tools/SpriteEditor/modules/appCommands.js` | Future Candidate | reusable within Sprite Editor command ecosystem if reuse grows | Needs reuse evidence |
| Palette signature/preset matching helpers | `tools/SpriteEditor/modules/appPalette.js` | Future Candidate | potential for local policy extraction if used by more modules | Needs coupling review |

## Acceptance Criteria
1. PLAN_PR clearly defines Keep Local / Monitor / Future Candidate buckets.
2. Extraction gate criteria are explicit and measurable.
3. Repo-relative paths for analyzed helper areas are listed.
4. No code/runtime modifications are introduced in this phase.
5. Next-step BUILD guidance is concrete and scope-locked.

## Risks
- Premature extraction causing ownership blur after Phase 1C normalization.
- False-positive duplicate detection where semantics are intentionally different.
- Accidental scope creep into engine-level architecture work.

## Risk Controls
- Enforce extraction gates before any helper move.
- Require behavior-preserving BUILD scope with explicit per-helper rationale.
- Keep all extraction work tool-local unless a later phase explicitly approves engine promotion.

## Next-Step BUILD Guidance
Create:
- `BUILD_PR_REPO_CLEANUP_PHASE_1D_SPRITE_EDITOR_EXTRACTION_GATE_CLASSIFICATION_AND_PILOT`

BUILD scope guidance:
1. Produce a helper inventory matrix for `tools/SpriteEditor/modules/`.
2. Confirm bucket assignment for each touched helper family.
3. Apply at most one low-risk local pilot extraction inside Sprite Editor only, or docs-only classification if gate criteria are not met.
4. Include before/after ownership table and gate pass/fail checklist per helper.
5. Keep changes out of `engine/`, `games/`, and `samples/`.
