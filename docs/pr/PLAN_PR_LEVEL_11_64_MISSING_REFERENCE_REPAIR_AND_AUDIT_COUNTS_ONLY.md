# PLAN_PR_LEVEL_11_64_MISSING_REFERENCE_REPAIR_AND_AUDIT_COUNTS_ONLY

## Purpose
Repair the remaining sample JSON missing-reference audit issues and update the audit script so count summaries are not followed by a repeated detailed list.

## Current baseline

```text
Sample JSON reference audit complete.
JSON files scanned: 66
Referenced: 42
Missing reference: 24
```

## Scope
- Use `docs/dev/reports/sample_json_js_reference_audit.csv` as the source of truth.
- Repair the 24 remaining `Missing reference` rows.
- If a missing JSON file is only referenced by metadata/index data, remove the stale metadata/index entry.
- If a missing JSON file is referenced by an active sample/tool JS file, either restore/move the correct JSON or update the reference to the correct existing JSON.
- Update `scripts/PS/audit-sample-json-js-references.ps1` so normal output ends after the count summary and does not print the detailed list again.
- Preserve optional detailed output behind a switch/flag if practical.

## Guardrails
- Do not touch `palette.json` unless it is a proven stale metadata-only reference.
- Do not touch `tile-map-editor-document.json` unless it is a proven stale metadata-only reference.
- Do not touch sample 1902 unless the CSV proves a stale metadata-only reference outside active runtime code.
- Do not run the full samples smoke test.
- Do not rewrite roadmap text.
- No broad refactors.

## Acceptance
- Audit output no longer repeats detailed YES/NO rows after counts in default mode.
- `Missing reference` count decreases from 24.
- Any remaining missing references are documented with reason.
- Targeted validation evidence is placed under `docs/dev/reports/`.
