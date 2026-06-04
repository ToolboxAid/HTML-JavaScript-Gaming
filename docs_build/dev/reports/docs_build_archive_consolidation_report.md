# Docs Build Archive Consolidation Report

Task: `PR_26154_043-docs-build-archive-consolidation`

## Summary

Historical docs_build material that only describes retired builder routes or legacy V1/V2 route migrations was moved under `archive/v1-v2/`. Active governance remains in `docs_build/dev/`, and user-facing docs remain under `docs/`.

## Moved Material

| Source | Destination | Count | Reason |
| --- | --- | ---: | --- |
| `docs_build/dev/reports/*` historical builder/route reports | `archive/v1-v2/docs_build/dev/reports/toolbox-builder-route-history/` | 46 files | Reports explicitly referenced retired `toolbox/builder`, `toolbox/game-builder`, Tool Builder, Game Builder, or legacy GameFoundryStudio tool routes. |
| `docs_build/dev/archive/object-vector-studio-v2/starter-project-template/` | `archive/v1-v2/docs_build/dev/archive/object-vector-studio-v2/starter-project-template/` | 2 files | Existing archive material was still nested inside active docs_build dev ownership. |

## Reference Updates

Updated current docs_build references to point at the new archive paths in:

- `docs_build/dev/reports/model_b_contract_final_cleanup_validation.md`
- `docs_build/dev/reports/object_vector_studio_starter_template_report.md`
- `docs_build/dev/reports/theme_v2_only_css_governance_validation.md`
- `docs_build/dev/reports/theme_v2_template_cleanup_report.md`
- `docs_build/dev/reports/toolbox_footer_template_bundle_report.md`
- `docs_build/dev/reports/tool_contract_bundle_tests_validation.md`
- `docs_build/dev/reports/tool_contract_location_correction_validation.md`
- `docs_build/dev/reports/wave_3_reporting_normalization.md`

## Kept Active

- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- current validation outputs under `docs_build/dev/reports/`
- required reports for this PR stack

## Validation

- PASS: moved report count is 46 files.
- PASS: moved `docs_build/dev/archive` count is 2 files.
- PASS: no current docs_build references remain to moved report paths using the old `docs_build/dev/reports/<filename>` form.
- PASS: `docs_build/dev/archive` no longer exists as an active folder.
- SKIPPED: tests against `archive/v1-v2/`.
- SKIPPED: full samples smoke test.
