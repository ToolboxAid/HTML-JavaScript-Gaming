# AGENTS.md

## Workflow
- PLAN -> BUILD -> APPLY
- BUILD is the normal Codex phase
- One PR purpose only
- Smallest scoped valid implementation only

## Repo Rules
- Follow the BUILD doc as source of truth
- Read exact target files first
- Avoid repo-wide scans unless exact targets require them
- Stop and report on ambiguity
- Do not modify engine core unless explicitly in scope
- Do not modify start_of_day folders unless explicitly requested

## Windows Execution
- Prefer Node.js or Python for file operations, rename work, path handling, and ZIP work
- Avoid PowerShell for path-heavy work unless explicitly required
- If PowerShell is required, use Join-Path or [System.IO.Path]::Combine(...)

## Packaging
- Every BUILD must produce a repo-structured delta ZIP
- ZIP output path: <project folder>/tmp/<TASK_NAME>_delta.zip
- Do not stage ZIP files from <project folder>/tmp/

## BUILD Quality
- Exact targets required
- Exact validation required
- No vague wording
- No unrelated cleanup
- Prefer testable vertical slices
