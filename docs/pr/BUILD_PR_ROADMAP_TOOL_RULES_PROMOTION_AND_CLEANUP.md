# BUILD_PR_ROADMAP_TOOL_RULES_PROMOTION_AND_CLEANUP

## Purpose
Promote tool-governance rules out of checklist/status tracking and normalize them as top-level roadmap instructions.

## Items to reclassify

These should be treated as rules/instructions, not tasks:

- no standalone showcase-only tool tracks
- tools header accordion added to reduce vertical real-estate usage
- tool-shell UI compaction is useful but does not replace tool-boundary normalization work
- any follow-up tool UI cleanup should remain subordinate to shared-boundary and data-contract work

## Required change

### A. Promote to top-level instruction/rules area
Move the above items to the top roadmap rules/instructions area.

### B. Remove checklist/status semantics
- remove `[ ]` / `[.]` markers from these items
- keep wording unchanged
- preserve content by move, not delete

### C. Keep roadmap task lists actionable
After this PR:
- checklist items should represent real work to complete
- rules/governance items should live in top-level rules/instructions, not as status-tracked tasks

## Constraints
- no wording changes
- no deletion
- move only, plus checkbox/status removal as part of the move
- roadmap text otherwise untouched
- status-only updates elsewhere if needed

## Validation
Codex must report:
- where each item was moved
- confirmation that wording was preserved
- confirmation that the checklist no longer tracks these as tasks

## Packaging
`<project folder>/tmp/BUILD_PR_ROADMAP_TOOL_RULES_PROMOTION_AND_CLEANUP.zip`
