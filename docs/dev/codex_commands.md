# Codex Command - PR 11.98

Model: GPT-5.4
Reasoning: high

Run this from the repo root:

```powershell
codex --model gpt-5.4 --reasoning high "Execute BUILD_PR_LEVEL_11_98_STRICT_SCHEMA_VALIDATION_AND_USAGE_REVIEW exactly. Tighten schemas so unknown fields are rejected, validate tools/workspaces/samples/games, update code that expects loose or legacy schema shapes, and write reports under docs/dev/reports. Do not add fallback/default payloads. Do not run the full samples suite unless required by shared loader changes."
```
