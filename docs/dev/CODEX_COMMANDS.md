MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement PR_01_02_REPO_STRUCTURE_APPLY.

Use:
- docs/dev/reports/move_map.txt
- docs/dev/reports/validation_checklist.txt

Rules:
- Apply only the mapped moves
- Update only the imports/paths required by those moves
- No logic refactors
- No broad repo cleanup
- No deletes unless explicitly mapped

Validation:
- imports resolve
- structure matches move_map
- no unresolved live sample links
- runtime harness phase matcher remains intact

Return ZIP:
<project folder>/tmp/PR_01_02_REPO_STRUCTURE_APPLY.zip
