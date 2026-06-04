# PR 11.51 - Controlled JSON Cleanup

## Purpose
Continue the audit-driven sample JSON cleanup lane with the smallest safe executable change.

## Scope
- Run `scripts/PS/audit-sample-json-js-references.ps1`.
- Select exactly 2 `NO` JSON items from safe tool-specific cleanup targets.
- Manually validate both files before removal.
- Remove only files proven unused by direct and broader reference checks.
- Do not touch shared, palette, tile-map-editor, sample 1902, roadmap text, or framework files.

## Required Selection Rules
Allowed candidates:
- tool-specific JSON only
- profiler, replay, pipeline, 3D tools, or equivalent isolated tool payloads
- currently reported as `NO` by the audit script
- no direct JS reference
- no broader repo reference except audit output/report text

Blocked candidates:
- `palette.json`
- `tile-map-editor-document.json`
- anything under sample 1902
- shared loader/framework files
- manifests used indirectly
- uncertain candidates

## Validation Commands
```powershell
.\scripts\PS\audit-sample-json-js-references.ps1

# For each candidate filename:
Select-String -Path .\samples\**\*.js -Pattern "<filename>"
Select-String -Path .\* -Recurse -Pattern "<filename>"
```

## Apply Rule
If either candidate has uncertainty, keep it and choose another safe `NO` item.

## Acceptance
- Exactly 2 safe unused JSON files removed.
- Audit `NO count` is reduced by 2 or evidence explains why a candidate was kept.
- Targeted validation completed.
- Full samples smoke test skipped unless shared loader/framework files were modified.
