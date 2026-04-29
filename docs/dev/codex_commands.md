# Codex Commands — PR 11.65

Model: GPT-5.4
Reasoning: high

```powershell
# From repo root
.\scripts\PS\audit-sample-json-js-references.ps1

# Codex task:
# Implement PR 11.65 exactly as described in docs/pr/PR_11_65_PALETTE_JSON_RECONSTRUCTION.md.
# Reconstruct palette JSON files from existing sample JS color/palette data.
# Update affected sample JS files to reference those palette JSON files.
# Keep scope palette-related only.
# Preserve existing behavior.
# Do not add defaults/fallbacks.
# Do not run the full samples suite.
# Write evidence to docs/dev/reports/pr_11_65_palette_reconstruction_report.md.

# Required final checks
.\scripts\PS\audit-sample-json-js-references.ps1
```

## Validation Required
- Syntax check changed JS/JSON files.
- Re-run audit and capture before/after counts.
- Open or targeted-check only affected samples/tools.
- Full sample suite skipped because this is targeted palette asset reconstruction.
