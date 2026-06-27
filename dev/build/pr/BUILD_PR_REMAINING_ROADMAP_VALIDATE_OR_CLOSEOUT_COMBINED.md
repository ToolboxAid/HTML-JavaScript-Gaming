# BUILD_PR_REMAINING_ROADMAP_VALIDATE_OR_CLOSEOUT_COMBINED

## Purpose
Validate the remaining listed roadmap items against repo truth and close them in the fewest practical PRs.

## Validate-first rule
For each target item:
1. Inspect repo truth first.
2. If already complete, mark complete.
3. If partially complete, do the smallest valid work to finish it.
4. If not complete, perform the minimum PLAN/BUILD/APPLY-equivalent work needed through this one combined PR.
5. Do not blindly recreate work that already exists.

## Target items

### Tooling Strategy By Need
- 2D tool stabilization before 3D tool expansion

### Next Planning / Normalization Lanes
- Apply master roadmap baseline
- Normalize samples phase structure

### Repo Operator + Asset Conversion Scripting Lanes
- Existing games asset folders updated so existing images / vectors / related runtime assets can be transformed into tool-editable `data/` objects, with corresponding project JSON updates

### Later Capability Lanes
- FEATURE: Fullscreen Bezel Overlay System

### Final Cleanup Lane
- Reduce legacy footprint after replacements are proven

## Combined scope

### A. Validation-first completion
Codex must inspect whether each listed item is already complete or partially complete before changing anything.

### B. Smallest valid closeout
If work is still needed:
- complete only the smallest valid remaining surface
- keep changes surgical
- avoid unrelated lane expansion

### C. Mixed-lane handling
Because these items span strategy, normalization, scripting, capability, and cleanup:
- reuse already completed work wherever possible
- prefer status closure when repo truth already supports it
- only implement missing residue where necessary

### D. Roadmap handling
- update status markers only
- no roadmap text rewrite
- if an item is still not truthfully complete, leave it open and report exact blockers

## Desired outcome
This PR should close as many of the listed items as truthfully possible in one pass, and leave only explicit residue if any real blocker remains.

## Validation requirements
Codex must report:
- which target items were already complete
- which were partially complete
- what minimal work was done to close any incomplete items
- which items remain open, if any, and exact blockers
- whether one final residue-only PR would be needed at all

## Packaging
`<project folder>/tmp/BUILD_PR_REMAINING_ROADMAP_VALIDATE_OR_CLOSEOUT_COMBINED.zip`

## Scope guard
- docs-first PR bundle
- Codex writes implementation
- validate first, build second
- combine aggressively to reduce PR count
- no unrelated repo changes
