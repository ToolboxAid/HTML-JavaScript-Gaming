# Codex Artifact and Reporting Standard

## Purpose

Standardize Codex deliverables, completion reporting, and artifact generation.

## ZIP Artifact Requirement

Every Codex execution must produce a repo-structured ZIP artifact and the required reports.

This applies regardless of result:

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

Minimum ZIP contents:

- changed or preserved repo files from the run, stored at repo-relative paths
- required reports under `docs_build/dev/reports/`

Optional:

- summary.md
- changed-files.txt
- findings.md
- validation.txt
- generated artifacts

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
- What Mr. Q should manually test
- Whether the PR is part of a stacked MVP sequence
- Previous PR dependency
- Next PR dependency

The report must answer:

```text
What can Mr. Q test after applying this ZIP?
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
tests/toolbox/text-to-speech/functional.spec.mjs - updated
```

Do not report:
- markdown
- documentation
- reports
- notes
- README updates

unless explicitly requested.

## No ZIP Means Incomplete

A task is not considered complete until the ZIP artifact is generated and reported.

If execution stops before implementation, validation, or commit, the stop result must still include the repo-structured ZIP and reports that document the hard stop, blocker, validation failure, or no-change result.
