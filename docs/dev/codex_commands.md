MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply PR 11.47.

Classify complex JSON files from the audit (especially palette.json and tile-map docs).

Do NOT change code or JSON in this PR.

For each selected JSON:
- determine if it is loaded indirectly (manifest/workspace/tool loader)
- confirm visible effect in UI
- classify as:
  INDIRECTLY USED
  UNUSED
  UNCERTAIN

Focus areas:
- samples/**/sample.*.palette.json
- samples/**/sample-*-tile-map-editor-document.json

Do NOT:
- delete or move files
- modify tools
- run full samples test

Validation:
No runtime changes expected.

Output:
docs/dev/reports/PR_11_47_complex_json_classification.md
