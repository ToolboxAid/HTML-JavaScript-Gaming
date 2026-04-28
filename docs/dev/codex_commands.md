# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: low

Apply PR_10_23_SAMPLE_IMPORT_DESTINATION_PRESET_FIX.

Required:
- In sample-owned tool JSON presets, replace misleading `games/<project>/...` importDestination values with sample-local paths.
- Cover all samples, including 0204, 1413, and 1505.
- Do not change game-owned workflow presets under games/.
- Preserve asset catalogs, IDs, source paths, schemas, and preview behavior.
- Verify no sample-owned JSON still contains `games/<project>/`.
- Add validation report at docs/dev/reports/PR_10_23_SAMPLE_IMPORT_DESTINATION_PRESET_FIX_report.md.
- Return ZIP artifact at tmp/PR_10_23_SAMPLE_IMPORT_DESTINATION_PRESET_FIX_delta.zip.
