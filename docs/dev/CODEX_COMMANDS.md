PR Naming Rule:
ALL PRs MUST follow:
PR_<SECTION>_<STEP>_<SHORT_NAME>

Reject any PR name that does not follow this format.

MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement PR_03_02_SHARED_STRINGS_EXTRACTION.

Goal:
Consolidate duplicated string helpers onto the shared layer with no behavior or API changes.

Target layer:
- src/shared/utils/

Focus helpers:
- normalizeString
- safeTrim
- toLowerSafe
- stringCompare

Required steps:
1. Produce docs/dev/reports/string_usage_scan.txt for string helper duplicates and consumers in scope.
2. Produce docs/dev/reports/extraction_map.txt with exact source -> shared target mapping.
3. Standardize consumers in scope onto shared string helpers.
4. Remove only obsolete duplicate string helper implementations within this PR scope.
5. Keep changes surgical.

Rules:
- string helpers only
- no number/id/object helper extraction
- no broad cleanup
- no API changes
- no behavior changes

Validation:
- impacted imports resolve
- duplicate string helpers in scope removed or redirected
- impacted tests/smoke pass

Return ZIP:
<project folder>/tmp/PR_03_02_SHARED_STRINGS_EXTRACTION.zip
