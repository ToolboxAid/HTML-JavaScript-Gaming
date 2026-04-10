# Codex Workflow

## On Start
1. Read these files.
2. Treat start_of_day directories as locked.
3. Read the current BUILD doc.
4. Implement only that BUILD scope.
5. Stop immediately if the BUILD doc fails the execution threshold.
6. Prefer Node.js or Python over PowerShell on Windows for path, rename, and ZIP tasks.

## During Work
- open target files first
- read only immediate dependencies when needed
- write code only where the BUILD doc says
- keep diffs small and surgical
- preserve project-specific ownership
- avoid speculative expansion
- avoid opportunistic cleanup/refactor
- for Windows path work, use explicit path APIs rather than interpolated shell strings
- if the BUILD requires PowerShell, use `Join-Path` or `[System.IO.Path]::Combine(...)`

## When Finished
1. run required validation
2. report exact files changed
3. report validation results
4. package a repo-structured delta ZIP under `<project folder>/tmp/`
5. do not stage ZIP files from `<project folder>/tmp/`
6. confirm the ZIP exists at the exact requested path
7. stop after BUILD output is complete

## Do Not
- generate APPLY instructions unless explicitly requested
- redo planning
- modify roadmap wording
- touch start_of_day files
- continue after a failed execution threshold
- silently rerun after a PowerShell parse error

## ✅ BUILD PR Quality Requirement (TESTABILITY)

Every BUILD PR must result in a testable state.

Preferred:
- Vertical slice (feature, flow, or runnable subset)

Avoid:
- Incremental fragments that cannot run

Rule of thumb:
If it cannot be executed or meaningfully validated, it is not a valid BUILD.
