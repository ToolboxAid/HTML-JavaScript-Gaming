MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply PR 11.43.

Use PR 11.41 audit output as the source of truth:
docs/dev/reports/PR_11_41_sample_json_ownership_audit.md

Goal:
Perform the first targeted cleanup batch for deferred sample JSON ownership findings.

Important:
Do NOT run the full samples smoke test by default.
It takes about 20 minutes.

Testing policy:
- Prefer targeted sample-specific tests only.
- Run syntax checks for changed JS files.
- Run targeted smoke only for samples changed by this PR.
- Run full samples smoke only if this PR changes shared sample launch infrastructure or a broad shared loader.

Cleanup policy:
For deferred PR 11.41 items:
- KEEP + WIRE if JSON belongs to current executable sample and can be visibly used.
- MOVE / REHOME if JSON clearly belongs to a different sample/tool.
- DELETE only if stale/obsolete and coverage remains elsewhere.
- CREATE / UPDATE CORRECT SAMPLE if coverage would otherwise be lost.
- DEFER if ownership is uncertain.

Sample 1902:
- remains exempt
- do not apply single-tool ownership cleanup to 1902

Batch selection:
- Choose the smallest safe batch from the deferred 11.41 list.
- Prefer items with clear ownership and low blast radius.
- Do not attempt to fix all deferred items at once.

Do NOT:
- run full samples test unless justified
- add hidden fallback/default data
- create decorative JSON
- change unrelated tool logic
- undo SVG Asset Studio rename
- touch start_of_day folders

Validation:
Run:
- node --check for changed JS files
- targeted sample/tool smoke for changed samples only

If a full test is required, explain why in the report before running it.

Reports:
Write:
docs/dev/reports/PR_11_43_cleanup_batch_1.md
docs/dev/reports/PR_11_43_validation.txt

Report must include:
- source PR 11.41 findings used
- resolved JSON items
- action taken for each
- coverage preserved statement
- deferred items remaining
- exact targeted tests run
- whether full suite was skipped and why
