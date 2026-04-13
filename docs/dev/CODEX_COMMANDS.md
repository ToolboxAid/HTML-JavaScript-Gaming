PR Naming Rule:
ALL PRs MUST follow:
PR_<SECTION>_<STEP>_<SHORT_NAME>

Reject any PR name that does not follow this format.

MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement PR_03_03_SHARED_SELECTORS_CONTRACTS.

Goal:
Standardize selector usage and contract boundaries onto shared state/public reader surfaces with no behavior or API changes.

Target areas:
- src/shared/state/
- public selector/read boundary surfaces

Focus:
- getState
- getSimulationState
- getReplayState
- getEditorState
- public selector/read boundaries

Required steps:
1. Produce docs/dev/reports/selector_usage_scan.txt for selector variants and consumers in scope.
2. Produce docs/dev/reports/contract_map.txt with exact source -> standardized target mapping.
3. Standardize consumers in scope onto shared selector/contract surfaces.
4. Remove only obsolete duplicate selector/contract implementations within this PR scope.
5. Keep changes surgical.

Rules:
- selector/contract work only
- no number/string/id helper extraction
- no broad cleanup
- no API changes
- no behavior changes

Validation:
- impacted imports resolve
- duplicate selector variants in scope removed or redirected
- impacted tests/smoke pass

Return ZIP:
<project folder>/tmp/PR_03_03_SHARED_SELECTORS_CONTRACTS.zip
