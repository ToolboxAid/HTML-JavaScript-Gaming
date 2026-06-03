# PLAN_PR_LEVEL_11_67_FINAL_SAMPLE_JSON_AUDIT_CLOSURE

## Purpose
Close the remaining sample JSON audit gap after palette reconstruction and metadata-aware cleanup.

## Scope
- Use `docs_build/dev/reports/sample_json_js_reference_audit.csv` as the source of truth.
- Resolve remaining `Missing reference` rows by making each case real, removed, or explicitly documented as a blocker.
- Preserve controlled cleanup rules.
- Include the counts-only audit output behavior requested by the user.

## Required Behavior
For every remaining missing JSON reference in the audit CSV:
1. If the JSON file is palette-related and missing, generate it from colors already present in the matching sample JS file.
2. If the JSON exists but is not detected as referenced, update the matching JS sample to reference the JSON through the existing sample loader pattern.
3. If the only remaining reference is stale metadata/index data, remove the stale metadata/index entry with the JSON cleanup.
4. If a row is ambiguous or shared, do not guess; document it in `docs_build/dev/reports/PR_11_67_blockers.md`.

## Guardrails
- Do not touch `sample 1902` unless the audit CSV proves it is required and the change is a metadata-only correction.
- Do not delete `palette.json` blindly.
- Do not delete `tile-map-editor-document.json`.
- Do not introduce hidden defaults.
- Do not add broad fallback data.
- Do not refactor sample loaders or shared framework code.
- Do not run the full samples suite.

## Acceptance
- Audit runs before and after.
- Final report records before/after:
  - JSON files scanned
  - Referenced
  - Missing reference
- Missing reference count is reduced as much as safely possible.
- Any non-zero remaining count is explained by exact file path and reason.
