---
name: repo-build
description: Use when executing a single BUILD_PR in this repository that must stay surgically scoped, validate exactly what the BUILD asks, and package a repo-structured delta ZIP under <project folder>/tmp/.
---

Follow this workflow:

1. Read the active BUILD_PR document first.
2. Confirm the PR purpose is singular.
3. Read only exact target files and immediate dependencies.
4. Implement only the approved BUILD scope.
5. Run only the requested validation.
6. Report exact files changed, exact validation performed, and exact ZIP path.
7. Package a repo-structured delta ZIP under <project folder>/tmp/.
8. Stop after BUILD output is complete.

Fail fast if:
- the BUILD doc is vague
- target files are missing or contradictory
- the request expands beyond one PR purpose
- the exact ZIP path is missing
- the result would not be testable
