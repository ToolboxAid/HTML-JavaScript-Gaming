# BUILD_PR_LEVEL_10_26_LEVEL_10_CLOSEOUT_SAMPLE_TOOL_NORMALIZATION_AND_SHARED_STRATEGY

## Purpose
Close Level 10 in one combined PR by bundling the remaining open work into a single final handoff.

## Why this is combined
The goal is to finish Level 10 with fewer PRs, not more.
This PR combines:
1. Level 10 closeout and handoff
2. sample asset ownership normalization
3. tool demo asset ownership normalization
4. final shared-asset strategy decision and enforcement
5. final status-only roadmap update after validation

## Targeted roadmap closure for section 10
This PR is intended to close the remaining open items under:

## 10. Assets & Data Policy
- [.] shared asset policy defined at planning level
- [.] game asset ownership normalized
- [ ] sample asset ownership normalized
- [ ] tool demo asset ownership normalized
- [ ] promotion criteria for shared assets enforced
- [ ] asset duplication reduced
- [ ] top-level shared asset strategy finalized if needed

## Scope

### A. Level 10 closeout and handoff
Confirm the Level 10 lane is complete and stable across:
- Asteroids
- `games/_template`
- samples
- tool demos

Closeout must summarize:
- conventions adopted
- validations run
- defects fixed
- remaining risk, if any

### B. Sample asset ownership normalization
Normalize sample asset ownership to the same policy used by games:
- assets should live with the owning sample unless explicitly promoted
- remove ambiguous ownership
- reduce duplicated sample asset patterns where appropriate
- align sample conventions with game/template conventions where it makes sense
- do not perform broad destructive moves; keep changes surgical

### C. Tool demo asset ownership normalization
Normalize tool demo assets using the same ownership rules:
- demo assets stay with the tool/demo unless explicitly promoted
- remove ambiguous shared/demo ownership
- reduce duplication where appropriate
- keep active tools under `tools/`
- preserve repo conventions already established

### D. Promotion criteria for shared assets
Finalize and enforce the rule for when an asset may become shared.

Required outcome:
- explicit promotion criteria documented
- promotion is intentional, not accidental
- no silent sharing by convenience
- ownership must be clear

### E. Top-level shared asset strategy finalization
Make the final Level 10 decision on the top-level shared asset strategy.

Required outcome:
- explicitly decide whether a top-level shared asset strategy is needed
- if yes, define the boundary and promotion rule
- if no, explicitly state local ownership first and promotion-by-rule only
- document the decision clearly enough to support status closure

### F. Asset duplication reduction
Use this PR to close the remaining duplication question in a controlled way:
- remove or reduce duplication where it is clearly unnecessary
- do not create risky wide-scope churn
- prefer policy enforcement plus surgical fixes over mass movement

### G. Roadmap rule
After validation:
- restore the correct full `MASTER_ROADMAP_HIGH_LEVEL.md` if needed
- update roadmap status markers only
- no other roadmap text changes

## Expected Level 10 completion result
This PR should allow section 10 to move to done, provided validation supports it.

## Validation requirements
Codex must validate and summarize:
- Asteroids remains correct
- `_template` remains the convention source for new games
- at least one sample is normalized/validated
- at least one tool demo path is normalized/validated
- shared promotion criteria are documented and enforced
- duplication reductions are real and safe
- roadmap updates are status-only

## Packaging requirement
Codex must package all changed files into:
`<project folder>/tmp/BUILD_PR_LEVEL_10_26_LEVEL_10_CLOSEOUT_SAMPLE_TOOL_NORMALIZATION_AND_SHARED_STRATEGY.zip`

## Scope guard
- combine only what is needed to finish Level 10
- no unrelated repo changes
- prefer the smallest valid set of edits that closes the lane cleanly

## Implementation Delta
- Added final local-first strategy + promotion-by-rule specification:
  - `docs/specs/asset_ownership_strategy.md`
  - `docs/specs/shared_asset_promotion_registry.json` (explicit registry, currently empty)
- Added focused enforcement validator:
  - `scripts/validate-asset-ownership-strategy.mjs`
  - `tests/tools/AssetOwnershipStrategyCloseout.test.mjs`
  - wired into `tests/run-tests.mjs`
- Normalized sample ownership path (`samples/phase-15/1505`):
  - updated `AssetBrowserScene.js` asset entries to explicit sample-local ownership paths
  - added owned sample assets:
    - `samples/phase-15/1505/assets/images/hero.png`
    - `samples/phase-15/1505/assets/audio/menu.mp3`
- Normalized tool demo ownership path (`tools/shared/samples/project-asset-registry-demo`):
  - moved demo authored files under local demo `assets/` tree
  - updated project/demo references to explicit tool-demo-local ownership paths
  - added owned demo assets:
    - `tools/shared/samples/project-asset-registry-demo/assets/images/clouds-layer.svg`
    - `tools/shared/samples/project-asset-registry-demo/assets/tiles/overworld-main.png`
- Reduced unnecessary duplication in touched scope:
  - `parallaxSources[].path` now points to local parallax source JSON instead of duplicating the image file path
  - removed ambiguous root-level placement for demo authored asset JSON files

## Level 10 Validation Coverage
- Games:
  - Asteroids manifest ownership validated (`games/Asteroids/assets/tools.manifest.json`)
  - `_template` manifest ownership validated (`games/_template/assets/tools.manifest.json`)
- Sample:
  - `samples/phase-15/1505` validated for local ownership pathing and existence
- Tool demo:
  - `tools/shared/samples/project-asset-registry-demo/project.assets.json` validated for local ownership, existence, and dedupe guard
- Shared runtime regressions (from prior Level 10 lane):
  - Asteroids bezel/background behavior still validated
  - `_template` contract checks still validated
  - additional sample regression (`SpaceInvaders`) still validated

## Roadmap Handling
- Full roadmap version check: already full version (`639` lines), so no restore action was required.
- Updated status markers only for section-10 items in `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`.
- No roadmap prose rewrites were performed.

## Final Section-10 Status
- Section-10 items are now marked complete based on validator-backed evidence.
- Remaining open section-10 items after this PR: none.

## Validation Evidence (2026-04-14)
- `node --check scripts/validate-asset-ownership-strategy.mjs` PASS
- `node --check tests/tools/AssetOwnershipStrategyCloseout.test.mjs` PASS
- `node --check samples/phase-15/1505/AssetBrowserScene.js` PASS
- `node --check tests/run-tests.mjs` PASS
- `node --check tools/shared/projectAssetRegistry.js` PASS
- `validateAssetOwnershipStrategy` focused run PASS
- `AssetOwnershipStrategyCloseout` test PASS
- `BackgroundImageAndFullscreenBezel` focused run PASS
- `AsteroidsPresentation` focused run PASS
- `SpaceInvadersScene` focused run PASS
- `GamesTemplateContractEnforcement` focused run PASS
