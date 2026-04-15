MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_REMAINING_NON_3D_VALIDATE_OR_CLOSEOUT_COMBINED.

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
   - do not open any 3D lane work

Target items:
- Existing games asset folders updated so existing images / vectors / related runtime assets can be transformed into tool-editable `data/` objects, with corresponding project JSON updates
- Execute 2D capability polish lanes
- Reduce legacy footprint after replacements are proven

Roadmap/meta handling:
- update summary/status rows that are now outdated because repo truth changed
- status markers only
- do NOT rewrite roadmap text

Final packaging step is REQUIRED:
<project folder>/tmp/BUILD_PR_REMAINING_NON_3D_VALIDATE_OR_CLOSEOUT_COMBINED.zip
