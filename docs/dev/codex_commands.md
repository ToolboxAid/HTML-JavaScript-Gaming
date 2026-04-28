# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: medium

Apply PR_10_24_SAMPLE_JSON_DESTINATION_NORMALIZATION.

Required:
- Check all JSON files under samples/ for misleading destination hints.
- Replace any sample-owned `games/<project>/...` destination with sample-local paths.
- Remove/replace sample destination hints that point to nonexistent `config/` folders.
- Specifically fix sample 1413 Asset Browser / Import Hub suggested destination from `games/<project>/config/` to a valid sample-local path.
- Preserve asset catalogs, source paths, IDs, schemas, and tool identities.
- Do not modify game-owned JSON under games/.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_10_24_SAMPLE_JSON_DESTINATION_NORMALIZATION_report.md.
- Return ZIP artifact at tmp/PR_10_24_SAMPLE_JSON_DESTINATION_NORMALIZATION_delta.zip.
