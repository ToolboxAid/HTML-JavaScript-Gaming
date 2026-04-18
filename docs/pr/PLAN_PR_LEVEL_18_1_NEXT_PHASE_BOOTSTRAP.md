# PLAN_PR_LEVEL_18_1_NEXT_PHASE_BOOTSTRAP

## Purpose
Initialize Level 18 ("Finalize engine") as a docs-first phase bootstrap after Level 17 completion, without implementing engine/sample/tool changes yet.

## Source of Truth
- `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md` (Section: `## 18. Finalize engine`)

## Scope
- define Level 18 objectives directly from roadmap section 18
- establish an initial PR structure for Level 18 execution lanes
- create the Level 18.1 BUILD bootstrap doc for follow-on BUILD work
- keep this PR docs-only

## Level 18 Objectives (Roadmap-Aligned)
1. verify all `samples/` and `games/` use engine systems (reduce local ad hoc logic)
2. classify game-like samples/demos and recommend proper `phase-xx` targets
3. organize/rebuild `samples/` and `games/` structure where needed
4. move simulated networking surfaces toward real networking with tests
5. continue single-class-per-file normalization
6. flatten CSS layering toward shared top-layer styles
7. classify and reorganize `docs/` into stable buckets
8. remove move/rename-only docs after content is preserved
9. consolidate fragmented PR documentation for one-stop capability review
10. remove import-to-export residue patterns
11. remove unnecessary `.keep` files outside template exceptions
12. lock APIs, clean boundaries, and document contracts

## Initial Level 18 Execution Lanes
1. `18.2` Engine-Usage Audit and Migration Recommendations
2. `18.3` Samples/Games Classification and Move Recommendations
3. `18.4` Docs Classification and Consolidation Bootstrap
4. `18.5` Boundary/Contracts Normalization Planning Gate

## Out of Scope
- no runtime, engine, sample, game, or tool implementation
- no roadmap status flips in this bootstrap PR
- no broad repo-wide refactors

## Exit Criteria
- Level 18 objectives are concretely documented for execution
- Level 18.1 BUILD doc exists and is actionable
- docs-only bootstrap package is produced
