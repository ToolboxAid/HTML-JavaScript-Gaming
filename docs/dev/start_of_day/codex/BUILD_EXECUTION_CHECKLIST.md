# Codex BUILD Execution Checklist

Before writing code:
- Did I read the current BUILD doc?
- Is the PR purpose singular and clear?
- Are target files explicit?
- Are roadmap edits limited to bracket states only?
- Are start_of_day files untouched?
- Am I limiting reads to target files and immediate dependencies only?
- On Windows, am I using Node.js or Python for path/rename/ZIP work unless PowerShell is explicitly required?
- If PowerShell is required, am I using `Join-Path` or `[System.IO.Path]::Combine(...)` instead of interpolation?

Before finishing:
- Did I keep scope tight?
- Did I avoid unrelated refactors?
- Did I avoid opportunistic cleanup outside scope?
- Did I run only the requested validation or proof?
- Did I package a repo-structured delta ZIP under `<project folder>/tmp/`?
- Did I verify the ZIP exists at the exact requested path?
- Did I avoid staging ZIP files in `<project folder>/tmp/`?
- Did I clearly report what changed?
- Did I avoid silent retries after parse or shell errors?

## Enforcement
If any precondition fails:
- stop
- report the blocker
- do not improvise
