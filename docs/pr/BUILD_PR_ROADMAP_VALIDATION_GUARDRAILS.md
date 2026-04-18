# BUILD_PR — Roadmap Validation Guardrails

## PR Purpose
Add documentation guardrails so roadmap status changes are based on explicit validation evidence from the repo, not inferred from partial implementation work.

## Scope
This PR is docs-only.

Included:
- roadmap status ownership rules
- validation criteria for `[x]`, `[.]`, `[ ]`
- Codex operating constraints for roadmap checks
- required evidence and report outputs before any roadmap change

Excluded:
- implementation code
- repo restructuring
- roadmap status changes for any current phase
- historical backfill of prior roadmap decisions

## Problem
Roadmap status has drifted because partial PRs were treated like completion. Placeholder folders, isolated game changes, or incomplete migrations have been incorrectly interpreted as phase completion.

## Goal
Create a repeatable validation path:
1. define completion criteria
2. scan repo for evidence
3. report facts only
4. update roadmap only when criteria are fully satisfied

## Guardrails

### 1) Status Ownership
- Roadmap status is not updated by implementation PRs.
- Roadmap status is updated only by a dedicated validation or plan PR.
- Codex may report repo facts, but must not decide final roadmap status.

### 2) Status Meaning
- `[x]` = complete, validated, and evidenced against all stated acceptance criteria for that roadmap line
- `[.]` = partially complete; some acceptance criteria are met, but not all
- `[ ]` = not started, or no sufficient repo evidence exists to claim progress

### 3) Evidence Requirement
A roadmap line may move to `[x]` only when all of the following exist:
- explicit acceptance criteria for that line
- repo evidence that each criterion is satisfied
- validation report listing files or structures that satisfy each criterion
- no known blockers or exceptions left open for that same line

### 4) Prohibited Basis for `[x]`
The following do **not** justify `[x]` by themselves:
- placeholder folders
- future-facing TODO structures
- one game normalized while roadmap line covers multiple games
- partial migration without runtime boundary confirmation
- assumptions based on naming alone

### 5) Required Validator Output
Every roadmap validation pass must produce:
- file tree summary for the scoped area
- per-target checklist with pass/fail evidence
- missing-items list
- explicit recommendation: keep `[ ]`, move to `[.]`, or move to `[x]`

## Phase 08 Specific Validation Pattern
For Games Layer roadmap lines, validate each target separately. Example categories:
- `_template` existence
- per-game boundary structure
- standardized `flow/` pattern
- gameplay vs entities vs levels vs rules vs assets separation
- shared-vs-game ownership boundaries
- named games individually normalized

A repo-wide line cannot be moved to `[x]` unless every required game or structure in that line is validated.

## Codex Execution Rules
Codex may:
- inspect repo structure
- compare files against defined acceptance criteria
- produce validation reports
- identify missing evidence

Codex must not:
- mark roadmap lines complete without explicit instruction
- infer completion from similar patterns
- treat placeholder structure as finished migration
- expand the validation scope beyond the named roadmap line

## Deliverables
- `docs/operations/dev/ROADMAP_RULES.md`
- `docs/operations/dev/codex_commands.md`
- `docs/operations/dev/commit_comment.txt`
- `docs/reports/validation_checklist.txt`
- `docs/reports/change_summary.txt`
- `docs/reports/file_tree.txt`

## Acceptance Criteria
- A written rules file exists defining roadmap status ownership and evidence standards.
- Codex command instructions require facts-only validation behavior.
- Reports define the expected outputs for future roadmap validation runs.
- This PR introduces no implementation code and does not change current roadmap states.
