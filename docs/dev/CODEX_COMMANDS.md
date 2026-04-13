MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement PR_03_04_FINAL_CLEANUP_SWEEP.

Goal:
Final cleanup of shared extraction with no behavior changes.

Steps:
1. Scan for duplicate helpers/selectors.
2. Remove or consolidate safely.
3. Fix imports to canonical shared locations.

Validation:
- no duplicates remain
- imports resolve
- tests pass

Return ZIP:
<project folder>/tmp/PR_03_04_FINAL_CLEANUP_SWEEP.zip
