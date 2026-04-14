# BUILD_PR_LEVEL_01_ENGINE_VECTOR_RESIDUE_CLEANUP

## Purpose
Clean up the leftover `engine/vector/` residue now that the vector classes/content have already been moved elsewhere.

## Problem
The old `engine/vector/` folder and remaining content still exist even though the intended classes were already moved.
That creates:
- stale ownership ambiguity
- legacy import risk
- false structure signals during section-1 closeout

## Scope

### A. Residue audit
Codex must inspect the remaining `engine/vector/` folder and classify each remaining item as one of:
- stale residue that should be removed
- still-owned content that must be moved to its correct current home
- compatibility surface that must remain temporarily but should be marked clearly

### B. Cleanup rule
Preferred outcome:
- if the folder is only stale residue, remove it cleanly
- if it still contains real content, move that content to the correct modern home first
- do not leave `engine/vector/` as an ambiguous half-alive legacy boundary

### C. Boundary truth
Use current boundary decisions already established or in-flight:
- rendering-owned vector drawing stays with rendering
- shared math/utility-owned vector math stays in shared math/utility
- engine should not keep a misleading old vector home if the real ownership moved

### D. Import safety
- normalize any lingering imports that still point at `engine/vector/`
- keep validation green
- avoid broad churn outside this residue cleanup

### E. Roadmap handling
- update roadmap status markers only if truthfully supported
- no roadmap text rewrite

## Desired outcome
After this PR:
- `engine/vector/` is no longer a misleading leftover boundary
- any real remaining content is in the correct modern home
- legacy import risk is reduced
- section-1 residue is reduced further

## Validation requirements
Codex must report:
- what remained inside `engine/vector/`
- what was removed vs moved
- any imports updated
- whether the old folder still exists after cleanup and why
- whether this helps close section 1 truthfully

## Packaging
`<project folder>/tmp/BUILD_PR_LEVEL_01_ENGINE_VECTOR_RESIDUE_CLEANUP.zip`

## Scope guard
- docs-first PR bundle
- Codex writes implementation
- no unrelated repo changes
