# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: low

1. Scan repo:
   - ensure no asset kind equals a tool id
   - ensure no tool id used as asset kind

2. Validate mapping:
   resolveAcceptedAssetKindsForTool is:
   toolId -> asset kinds ONLY

3. Fix violations:
   - replace incorrect asset kinds with canonical types

4. Report:
   docs/dev/reports/tool_vs_asset_kind_11_107.txt
