# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: medium

Apply PR_11_12_REBUILD_SAMPLE_1902_WORKSPACE_ALL_TOOLS.

Required:
- Rebuild sample 1902 as a clean Workspace all-tools integration sample.
- Delete `samples/phase-19/1902/sample.1902.palette.json`; there should be no palette sidecar.
- Normalize `sample.1902.workspace-all-tools.json` into a single clear workspace manifest/payload with one source of truth.
- Remove duplicated palette/config/payload sections and unrelated garbage payloads.
- Ensure Workspace recognizes every active workspace-supported tool, not only Palette.
- Sample 1902 page primary action must open Workspace with the all-tools manifest, not just standalone tool links.
- Standalone tool samples remain separate and unchanged.
- Do not add fallback/default/hidden data.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_11_12_REBUILD_SAMPLE_1902_WORKSPACE_ALL_TOOLS_report.md.
- Return ZIP artifact at tmp/PR_11_12_REBUILD_SAMPLE_1902_WORKSPACE_ALL_TOOLS_delta.zip.
