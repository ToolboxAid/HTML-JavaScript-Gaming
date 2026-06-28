# PLAN_PR_<NAME>

## Purpose
State the single PR purpose in 1-2 sentences.

## Scope
Primary target files:
- <exact file 1>
- <exact file 2>

Allowed nearby reads:
- <small related area only if needed>

## Required changes
- <change 1>
- <change 2>
- <change 3>

## Acceptance criteria
- <criterion 1>
- <criterion 2>
- <criterion 3>

## Validation
Run only:
- <command 1>
- <command 2>

## Non-goals
- no repo-wide cleanup
- no unrelated refactor
- no tooling changes unless explicitly required
- no engine core API redesign unless explicitly required

## Working tree rule
If the tree is already dirty, ignore unrelated files and modify only the scoped files for this PR purpose.
