# BUILD_PR_<NAME>

## Purpose
<single-sentence purpose copied and tightened from PLAN>

## Scope
Primary target files:
- <exact target 1>
- <exact target 2>

Allowed nearby reads:
- <small related area only if required>

## Required implementation
- <exact change 1>
- <exact change 2>

## Acceptance criteria
- <criterion 1>
- <criterion 2>

## Validation
Run only:
- <command 1>
- <command 2>

## Non-goals
- no unrelated refactor
- no repo-wide scan
- no tooling changes unless explicitly required

## Working tree rule
If the tree is already dirty, ignore unrelated files and modify only the scoped files for this PR purpose.
