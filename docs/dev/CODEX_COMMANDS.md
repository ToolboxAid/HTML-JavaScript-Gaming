PR Naming Rule:
ALL PRs MUST follow:
PR_<SECTION>_<STEP>_<SHORT_NAME>

Reject any PR name that does not follow this format.

MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement PR_06_06_SAMPLE_ENGINE_DEPENDENCY_CLEANUP.

Goal:
Remove sample dependencies on non-public engine internals by standardizing samples onto approved public/shared surfaces only.

Required steps:
1. Produce docs/dev/reports/sample_dependency_scan.txt for non-public engine dependencies used by samples in scope.
2. Produce docs/dev/reports/dependency_cleanup_map.txt with exact source -> approved target mapping.
3. Update sample consumers in scope to approved public/shared surfaces only.
4. Remove only the direct dependency violations resolved by this PR.
5. Keep changes surgical.

Rules:
- samples dependency cleanup only
- no engine logic refactors
- no API redesign
- no behavior changes
- no broad cleanup

Validation:
- impacted imports resolve
- non-public engine dependency violations in scope removed
- runtime/sample navigation not regressed
- impacted tests/smoke pass

Return ZIP:
<project folder>/tmp/PR_06_06_SAMPLE_ENGINE_DEPENDENCY_CLEANUP.zip
