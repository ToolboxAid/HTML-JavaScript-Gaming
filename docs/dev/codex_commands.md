# Codex Commands — PR 11.76

Model: GPT-5.4
Reasoning: high

```powershell
codex exec --model gpt-5.4 --reasoning high "Apply PR 11.76. Move all utility files from src/engine/utils to src/shared/utils unless a file is proven to be engine-runtime code. Do not cherry-pick only duplicates. Update all imports. Do not create aliases or wrappers. Remove old duplicate files. Produce reports under docs/dev/reports and a ZIP artifact at tmp/PR_11_76_ENGINE_UTILS_TO_SHARED_UTILS.zip. Run targeted validation only."
```

## Required validation commands

```powershell
# find remaining old imports
Select-String -Path .\src\*.js, .\src\**\*.js, .\samples\**\*.js, .\tools\**\*.js -Pattern "src/engine/utils|engine/utils|../engine/utils|../../engine/utils|../../../engine/utils" -ErrorAction SilentlyContinue

# list remaining engine utils files
Get-ChildItem .\src\engine\utils -Recurse -File -ErrorAction SilentlyContinue
```
