MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply PR 11.44.

Proceed automatically. Do not ask for confirmation.

Use the current repo state and reports from:
- docs/dev/reports/PR_11_41_sample_json_ownership_audit.md
- docs/dev/reports/PR_11_43_cleanup_batch_1.md
- docs/dev/reports/PR_11_43_validation.txt

Goal:
Resolve the next smallest safe batch of deferred sample JSON ownership findings.

Batch rules:
- Select 2–4 deferred items only.
- Select items with obvious ownership and low blast radius.
- Prefer sample-local JSON/sample-local executable fixes.
- Preserve sample-to-tool/use-case coverage.
- Do not touch sample 1902 except to confirm exemption.
- If an item becomes ambiguous during inspection, defer it and choose another safe item.

Allowed actions:
- KEEP + WIRE: JSON belongs to this sample and can be visibly used there.
- MOVE / REHOME: JSON clearly belongs to another sample/tool.
- DELETE: JSON is stale/obsolete and coverage remains elsewhere.
- CREATE / UPDATE CORRECT SAMPLE: needed to preserve coverage.
- DEFER: ownership uncertain.

Hard rules:
- Do not blindly force JSON into a mismatched sample.
- Do not create hidden fallback/default data.
- Do not create decorative JSON.
- Do not run full samples smoke by default.
- Do not undo SVG Asset Studio rename.
- Do not rename tools.
- Do not modify start_of_day folders.
- Do not change shared sample launch infrastructure unless unavoidable.

Testing policy:
Full samples smoke takes about 20 minutes.
Do NOT run it unless this PR changes shared sample loader/framework or impacts many samples broadly.

Run targeted validation only:
- node --check for changed JS files
- targeted sample/tool smoke for changed samples only

If full suite is required, document the reason before running it.

Reports:
Write:
docs/dev/reports/PR_11_44_cleanup_batch_2.md
docs/dev/reports/PR_11_44_validation.txt

The cleanup report must include:
- source 11.41 deferred findings used
- items selected
- action taken for each
- files changed
- coverage preserved statement
- sample 1902 exemption confirmed
- deferred items remaining

The validation report must include:
- exact targeted tests run
- full samples smoke skipped/run
- reason for skip/run
- results

Commit comment:
Use docs/dev/commit_comment.txt
