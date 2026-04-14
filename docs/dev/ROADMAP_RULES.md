# Roadmap Rules

## Purpose
Prevent roadmap drift by separating implementation work from roadmap truth updates.

## Ownership
- Implementation PRs build or refactor code.
- Validation PRs verify repo reality against roadmap criteria.
- Roadmap status changes happen only in a dedicated validation or planning PR.

## Status Definitions
- `[x]` Complete: every acceptance criterion is satisfied and evidenced.
- `[.]` In Progress: meaningful partial completion exists, but at least one acceptance criterion is still unmet.
- `[ ]` Not Complete: no sufficient evidence exists to claim progress or completion.

## Evidence Standard
Before changing any roadmap line, collect all of the following:
1. scoped acceptance criteria
2. repo evidence for each criterion
3. a pass/fail checklist
4. missing-items summary
5. recommendation with justification

## Forbidden Shortcuts
Do not move a roadmap line to `[x]` because of:
- folder placeholders
- naming conventions alone
- one-off samples when the line is repo-wide
- inferred intent
- partial migration without runtime boundary proof

## Validator Behavior
Validators must report facts only:
- what files exist
- what boundaries are present
- what criteria pass
- what criteria fail

Validators must not:
- decide roadmap status without explicit acceptance criteria
- broaden scope
- merge multiple roadmap lines into one conclusion

## Review Rule
When there is uncertainty, preserve the stricter status.

## Phase-Based Rule
A line that names multiple games, systems, or structures stays below `[x]` until all named targets are validated.
