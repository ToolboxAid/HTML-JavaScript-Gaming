# PLAN_PR_10_25_SAMPLE_METADATA_SSOT_DUPLICATE_EVIDENCE_FIX

Purpose: remove duplicate samples.index.metadata.json SSoT confusion caused by report evidence snapshots.

Scope:
- Preserve live SSoT: samples/metadata/samples.index.metadata.json
- Remove or clearly demote duplicate evidence copy under docs_build/dev/reports/**/repo_relative/samples/metadata/
- Ensure runtime/tools reference only the live SSoT
- Do not rewrite sample metadata content
- Do not modify start_of_day folders

Acceptance:
- Only one live SSoT exists for sample index metadata
- Report evidence does not look like a second runtime source
- Validation report documents old duplicate path and final handling
