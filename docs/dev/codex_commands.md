MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 11.45.

Add the PowerShell script:
scripts/audit-sample-json-js-references.ps1

Purpose:
Recursively walk the samples directory looking for JSON files, then validate each JSON file is referenced by JS files in the same owning sample subtree.

Owning sample root:
samples/<group>/<sample>/

For each:
samples/<group>/<sample>/**/*.json

Scan:
samples/<group>/<sample>/**/*.js
samples/<group>/<sample>/**/*.mjs
samples/<group>/<sample>/**/*.cjs

Check references by:
- JSON filename
- JSON basename
- JSON path relative to sample root with slash styles

Output:
docs/dev/reports/sample_json_js_reference_audit.csv

Do NOT:
- run full sample smoke
- modify samples
- delete JSON
- change runtime code

Validation:
Run:
powershell -ExecutionPolicy Bypass -File scripts/audit-sample-json-js-references.ps1

Document:
docs/dev/reports/PR_11_45_validation.txt

Full samples smoke:
Skip. This is a utility script only.
