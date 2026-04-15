# BUILD_PR_LEVEL_06_SAMPLE_PHASE_TRACKS_AND_2D_SAMPLE_BUILDS_INSPECT_FIRST

## Purpose
Close as much of the remaining Sample Phase Tracks and Dependency-Driven Sample Builds lane as truthfully possible, without blindly creating work that may already exist.

## Inspect-first rule
Before creating, moving, renaming, or normalizing anything, Codex must first inspect the repo and classify what already exists.

Do NOT assume these items are absent.

## Target items

### Sample Phase Tracks
- foundational phases normalized
- tilemap / camera / rendering phases normalized
- tool-linked sample phases normalized
- network concepts / latency / simulation phase normalized

### Dependency-Driven Sample Builds
- 2D camera sample
- tilemap scrolling sample
- collision sample
- enemy behavior sample
- full 2D reference game sample

## Required approach

### A. Inspect and classify first
For each target item, classify it as one of:
- already exists and should be marked complete
- partially exists and needs normalization
- does not exist and needs to be created
- exists under the wrong name/location and needs alignment

### B. Normalize only where needed
- if an item already exists and is truthfully complete, do not recreate it
- if an item partially exists, normalize the smallest valid surface
- if an item is missing, create only what is required
- avoid duplicate sample creation

### C. Grouping rule
Treat this as one combined sample-lane pass:
- phase grouping/normalization
- 2D dependency-driven sample build truth check
- minimal creation only where repo inspection proves it is needed

### D. Roadmap handling
- update status markers only
- no roadmap text rewrite
- mark items complete only if repo truth supports it

## Desired outcome
This PR should close as many of the listed items as truthfully possible without creating duplicate samples or duplicate phase work.

## Validation requirements
Codex must report:
- which items already existed
- which items were only normalized
- which items actually had to be created
- any remaining residue
- whether one residue-only PR would finish the lane, if needed

## Packaging
`<project folder>/tmp/BUILD_PR_LEVEL_06_SAMPLE_PHASE_TRACKS_AND_2D_SAMPLE_BUILDS_INSPECT_FIRST.zip`

## Scope guard
- docs-first PR bundle
- Codex writes implementation
- inspect first, create second
- no blind creation
- no unrelated repo changes
