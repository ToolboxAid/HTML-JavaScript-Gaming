PR-020 — review and acceptance

### Review Checklist

- patch touches only the six target `engine/game` export files
- all changes are comments or runtime-neutral markers only
- no import lines change
- no executable statements change
- no export names change
- no file paths change
- no caller updates are required
- wording matches documented compatibility posture
- wording does not imply approved removal or near-term breakage

### Acceptance Criteria

The first code PR is acceptable if:
- every file-level change is removable with zero runtime effect
- documented intent becomes clearer to maintainers
- compatibility-retained exports remain fully intact
- the diff is small and trivially reviewable
- the PR passes directly against PR-018 guardrails

### Failure Conditions

Reject the first code PR if:
- it changes logic or execution order
- it rewrites imports
- it renames exports or files
- it adds cleanup unrelated to the alignment comments
- it creates any ambiguity about caller safety
