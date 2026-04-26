MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Implement PR 8.3 as a docs-guided, schema-compliant palette generation cleanup.

REPO REALITY:
- There are no samples/**/config.json files.
- There are no samples/**/*.palette.json files in the current layout.
- Do not assume either exists.
- Generate palette documents from colors actually used by each sample.

STEPS:
1. Read docs/pr/PR_8.3_SAMPLE_COLOR_PALETTE_GENERATION.md.
2. Read docs/pr/sample_palette_generation_rules.md.
3. Use workspace.manifest as the source of truth for sample/tool ownership.
4. Scan sample folders for explicit color values in existing sample JSON and local sample asset metadata.
5. Generate schema-compliant palette documents from discovered colors.
6. Add $schema references to generated palette documents.
7. Validate generated palette documents against tools/schemas/palette.schema.json.
8. Remove or update any stale docs that refer to nonexistent samples/**/config.json or samples/**/*.palette.json.
9. Do not add validation utility modules.
10. Do not modify runtime behavior.
11. Do not modify start_of_day.

ACCEPTANCE:
- Generated palettes reflect actual colors used by samples.
- No invented colors.
- No stale config.json / palette.json assumptions.
- No validation utilities added.
- No runtime files modified.
- No start_of_day files modified.
