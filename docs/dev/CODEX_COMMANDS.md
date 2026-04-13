PR Naming Rule:
ALL PRs MUST follow:
PR_<SECTION>_<STEP>_<SHORT_NAME>

Reject any PR name that does not follow this format.

MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement PR_03_01_SHARED_NUMBERS_NORMALIZATION.

Goal:
Consolidate duplicated numeric helpers onto the shared math layer with no behavior or API changes.

Target layer:
- src/shared/math/

Focus helpers:
- asFiniteNumber
- asPositiveInteger
- toFiniteNumber
- roundNumber

Required steps:
1. Produce docs/dev/reports/number_usage_scan.txt for numeric helper duplicates and consumers in scope.
2. Produce docs/dev/reports/extraction_map.txt with exact source -> shared target mapping.
3. Standardize consumers in scope onto shared numeric helpers.
4. Remove only obsolete duplicate numeric helper implementations within this PR scope.
5. Keep changes surgical.

Rules:
- numeric helpers only
- no string/id/object helper extraction
- no broad cleanup
- no API changes
- no behavior changes

Validation:
- impacted imports resolve
- duplicate numeric helpers in scope removed or redirected
- impacted tests/smoke pass

Return ZIP:
<project folder>/tmp/PR_03_01_SHARED_NUMBERS_NORMALIZATION.zip
