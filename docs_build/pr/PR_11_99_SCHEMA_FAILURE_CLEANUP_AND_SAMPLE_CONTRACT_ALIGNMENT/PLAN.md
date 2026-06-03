# PR_11_99_SCHEMA_FAILURE_CLEANUP_AND_SAMPLE_CONTRACT_ALIGNMENT PLAN

## Purpose
Normalize the strict-schema failures produced by PR 11.98 without weakening schema contracts.

## Scope
- Fix invalid sample JSON payloads reported by `docs_build/dev/reports/sample_json_schema_validation.csv`.
- Keep tool schemas strict: no unknown fields, no alias keys, no legacy `$schema` sample payload markers when rejected by the target schema.
- Keep games validation intact; do not edit game manifests unless a new failing row proves it is required.
- Keep sample 1902 aligned with Workspace Manager and asset-browser flat `assets` contract.
- Update only roadmap status markers if execution-backed.

## Out of Scope
- No schema loosening.
- No runtime fallback data.
- No hardcoded hidden asset paths.
- No repo-wide refactor.
- No start_of_day folder changes.

## Acceptance
- Tool schemas remain valid / 0 invalid.
- Game manifests remain valid / 0 invalid.
- Sample JSON has fewer invalid rows than PR 11.98, preferably 0 if safely fixable.
- Sample 1902 targeted smoke with tools passes.
- Report lists changed files and full-samples smoke decision.
