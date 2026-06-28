# Codex Artifact and Reporting Standard

## Purpose

Standardize Codex deliverables, completion reporting, and artifact generation.

## Codex Completion Contract

Every Codex execution must produce at least one repository-structured ZIP artifact and the required reports.

Each PR attempted by Codex must produce exactly one ZIP artifact representing that PR's final outcome.

Missing ZIP means the Codex run is incomplete and did not complete correctly.

Canonical ZIP location:

```text
dev/workspace/zips/
```

ZIP outcome suffixes:

- `_delta.zip` = success
- `_REVIEW.zip` = review-only
- `_FAILED.zip` = validation or execution failure
- `_HARD_STOP.zip` = governance or precondition hard stop

## Stacked PR Rule

Stacked PR work produces one ZIP per attempted PR.

If PR 1 succeeds and PR 2 hard-stops, produce:

```text
PR_...001-..._delta.zip
PR_...002-..._HARD_STOP.zip
```

Do not start later stacked PRs after a failure or hard stop.

## ZIP Contents

Success ZIP contents must include:

- changed files
- diff
- PR report
- validation report
- requirement checklist

Failing PR ZIP contents must include:

- hard stop or failure report
- branch/worktree status
- validation output if run
- requirement checklist
- changed files and diff if changes occurred

Review-only ZIP contents must include:

- review report
- branch/worktree status
- requirement checklist or review checklist when applicable
- supporting evidence files when applicable

## Applicability

The Codex Completion Contract applies regardless of result:

- success
- completion
- partial completion
- hard stop
- blocked
- validation failure
- new information discovered
- no files changed
- review deliverables
- governance deliverables

No exceptions.

Minimum repository-structured ZIP rules:

- changed, preserved, or outcome evidence repo files from the run, stored at repo-relative paths
- required reports under `dev/reports/`

Reports must remain flat under `dev/reports/`. Use descriptive filenames that include the PR, team, runner, or lane context instead of nested team or runner report folders.

Optional:

- summary.md
- changed-files.txt
- findings.md
- validation.txt
- generated artifacts

Generated non-report artifacts must live under `dev/workspace/`.

## Codex Reports

- `dev/reports/` contains the authoritative Codex reports for the repository.
- Reports committed to `main` are the official record.
- Reports generated during a PR are expected to be committed as part of that PR.
- Once merged into `main`, those report versions become the canonical repository history.
- Do not delete report files solely to obtain a clean worktree.
- Do not add `dev/reports/` to `.gitignore`.
- Continue storing ZIPs under `dev/workspace/zips/`.

## Completion Reporting

Codex responses must include:

- ZIP filename
- ZIP location
- repo-structured ZIP path
- reports
- changed file list
- PR number(s)
- Merge commit(s)
- Validation results
- branch, worktree, and local/origin sync status when relevant

## Tool MVP PR Report Requirements

Every tool MVP PR report must include:
- Product Owner testable outcome
- What Playwright tests
- What the Product Owner should manually test
- Whether the PR is part of a stacked MVP sequence
- Previous PR dependency
- Next PR dependency

The report must answer:

```text
What can the Product Owner test after applying this ZIP?
```

If a tool MVP PR has no Playwright lane, the report must state why and list the manual Product Owner validation instead.

## Code Change Reporting

When a ZIP is uploaded, report executable code changes only.

Report format:

```text
{relative path} - {added|updated|deleted}
```

Examples:

```text
toolbox/text-to-speech/index.html - updated
assets/toolbox/text-to-speech/js/index.js - added
dev/tests/toolbox/text-to-speech/functional.spec.mjs - updated
```

Do not report:
- markdown
- documentation
- reports
- notes
- README updates

unless explicitly requested.

## No ZIP Means Incomplete

A task is not considered complete until the required ZIP artifact or artifacts are generated and reported.

If execution stops before implementation, validation, or commit, the stop result must still include the repo-structured ZIP and reports that document the hard stop, blocker, validation failure, or no-change result.
