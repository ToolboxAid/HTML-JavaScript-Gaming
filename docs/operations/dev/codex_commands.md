# Codex Command — BUILD_PR_LEVEL_20_4_TOOL_LAUNCH_SSOT_AND_EXTERNAL_MEMORY_RESET

Run Codex with injected rules and build doc. Do not run Codex free-form.

```powershell
$rules = Get-Content "docs/dev/codex_rules.md" -Raw
$build = Get-Content "docs/pr/BUILD_PR_LEVEL_20_4_TOOL_LAUNCH_SSOT_AND_EXTERNAL_MEMORY_RESET.md" -Raw
codex run "$rules`n`n$build"
```

Expected artifact:
`tmp/BUILD_PR_LEVEL_20_4_TOOL_LAUNCH_SSOT_AND_EXTERNAL_MEMORY_RESET.zip`
