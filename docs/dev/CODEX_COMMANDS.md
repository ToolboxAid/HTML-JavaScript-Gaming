MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_REMAINING_ROADMAP_VALIDATE_OR_CLOSEOUT_COMBINED`.

Goal:
Validate the remaining listed roadmap items against repo truth and close them in one combined pass wherever possible.

Validate-first requirements:
1. Inspect repo truth for each target item before changing anything.
2. Classify each item as:
   - already complete
   - partially complete
   - incomplete
3. If already complete:
   - update roadmap status only
4. If partially complete or incomplete:
   - do the smallest valid work needed to close it
   - avoid unrelated expansion

Target items:

Tooling Strategy By Need
- 2D tool stabilization before 3D tool expansion

Next Planning / Normalization Lanes
- Apply master roadmap baseline
- Normalize samples phase structure

Repo Operator + Asset Conversion Scripting Lanes
- Existing games asset folders updated so existing images / vectors / related runtime assets can be transformed into tool-editable `data/` objects, with corresponding project JSON updates

Later Capability Lanes
- FEATURE: Fullscreen Bezel Overlay System

Final Cleanup Lane
- Reduce legacy footprint after replacements are proven

Required work:
1. Reuse already-completed repo work wherever truth supports closure.
2. Perform only the smallest valid residue work for any incomplete items.
3. Keep changes coherent and surgical.
4. Update roadmap status markers only.
5. Report:
   - what was already complete
   - what was completed in this PR
   - what remains open, if anything, with exact blockers

Final packaging step is REQUIRED:
- package ALL changed files into this exact repo-structured ZIP:
  `<project folder>/tmp/BUILD_PR_REMAINING_ROADMAP_VALIDATE_OR_CLOSEOUT_COMBINED.zip`

Hard rules:
- validate first, build second
- combine aggressively to reduce PR count
- no unrelated repo changes
- no missing ZIP
