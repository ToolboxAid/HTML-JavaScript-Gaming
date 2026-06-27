# BUILD_PR_LEVEL_11_78_ENGINE_UTILS_REFERENCE_CLOSURE

## Purpose
Close the remaining broken references after moving engine utils to shared utils.

The prior move left literal references to:

- `src/shared/utils/`
- `/src/shared/utils/`

These must be rewritten to shared utils everywhere.

## Scope
- Search the entire repo for both literal forms:
  - `src/shared/utils/`
  - `/src/shared/utils/`
- Replace with:
  - `src/shared/utils/`
  - `/src/shared/utils/`
- Include import strings, dynamic import strings, HTML module paths, config paths, docs_build/dev command references only when executable/runtime relevant.
- Do not add aliases, shims, or placeholder files under `src/engine/utils`.
- Do not restore moved files.

## Required commands
Use PowerShell from repo root.

1. Baseline count:

```powershell
$patterns = @('src/shared/utils/','/src/shared/utils/')
$hits = Select-String -Path .\* -Recurse -Pattern $patterns -SimpleMatch -ErrorAction SilentlyContinue |
  Where-Object { $_.Path -notmatch '\\.git\\|\\tmp\\|docs\\dev\\reports\\' }
$hits | Select-Object Path,LineNumber,Line | Format-Table -AutoSize
"Remaining engine util references: $($hits.Count)"
```

2. Rewrite source files carefully.

Use a controlled rewrite over text files only. Preserve line endings where practical.

3. Verification gate:

```powershell
$patterns = @('src/shared/utils/','/src/shared/utils/')
$hits = Select-String -Path .\* -Recurse -Pattern $patterns -SimpleMatch -ErrorAction SilentlyContinue |
  Where-Object { $_.Path -notmatch '\\.git\\|\\tmp\\|docs\\dev\\reports\\|docs\\pr\\BUILD_PR_LEVEL_11_78_ENGINE_UTILS_REFERENCE_CLOSURE.md|docs\\dev\\codex_commands.md|docs\\dev\\commit_comment.txt' }
if ($hits.Count -ne 0) {
  $hits | Select-Object Path,LineNumber,Line | Format-Table -AutoSize
  throw "PR 11.78 failed: src/engine/utils references remain."
}
```

## Acceptance
- Zero runtime/source occurrences of `src/shared/utils/` remain.
- Zero runtime/source occurrences of `/src/shared/utils/` remain.
- `FixedTicker.js` no longer requests `/src/shared/utils/invariant.js`.
- Workspace Manager launches without 404s for engine utils.
- No aliases or shims are created.
