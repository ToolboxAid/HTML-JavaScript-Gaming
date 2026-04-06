# Codex BUILD Execution Checklist

Before writing code:
- Did I read the current BUILD doc?
- Is the PR purpose singular and clear?
- Are target files explicit?
- Are roadmap edits limited to bracket states only?
- Are start_of_day files untouched?
- Am I limiting reads to target files and immediate dependencies only?

Before finishing:
- Did I keep scope tight?
- Did I avoid unrelated refactors?
- Did I avoid opportunistic cleanup outside scope?
- Did I run only the requested validation or proof?
- Did I package a repo-structured delta ZIP under `<project folder>/tmp/`?
- Do not stage ZIP files in `<project folder>/tmp/`
- Did I clearly report what changed?

## Enforcement
If any precondition fails:
- stop
- report the blocker
- do not improvise
