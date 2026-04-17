# BUILD_PR_LEVEL_18_10_REMOVE_SAMPLE_SPECIFIC_LOGIC_FROM_ENGINE_PATHS

## Purpose
Complete Level 18 Track A by removing any remaining sample-specific logic from engine paths.

## Scope
- one PR purpose only
- docs-first bundle
- no implementation code authored by ChatGPT
- tightly scoped to sample-specific logic that still exists inside engine paths
- no unrelated cleanup or refactors

## Codex Responsibilities
1. Inspect engine paths for logic, assumptions, helpers, flags, adapters, branches, or naming that are sample-specific.
2. For each confirmed sample-specific surface:
   - remove it from engine paths, or
   - relocate it to the correct sample/shared boundary if relocation is required
3. Preserve stable engine contracts.
4. Update only the exact consumers/imports needed after the removal or relocation.
5. Re-run validation to confirm engine paths are free of sample-specific logic.
6. Write execution-backed reports under `docs/dev/reports`.
7. Update `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md` in place under roadmap guard rules:
   - never delete roadmap content
   - never rewrite roadmap text
   - only update status markers:
     - [ ] -> [.]
     - [.] -> [x]
   - append additive content only if explicitly required by this PR

## Acceptance
- no remaining sample-specific logic exists in engine paths within this PR scope
- engine contracts remain stable
- exact consumer/import updates are completed
- reports are written under `docs/dev/reports`
- Track A final item can be updated in the roadmap when execution-backed
