# Codex Artifact and Reporting Standard

## Purpose

Standardize Codex deliverables, completion reporting, and artifact generation.

## ZIP Artifact Requirement

Every Codex task must produce a ZIP artifact.

Applies to:
- Success
- Failure
- Stop Gate
- Partial Completion
- Review Deliverables
- Governance Deliverables

Minimum ZIP contents:
- summary.md

Optional:
- changed-files.txt
- findings.md
- validation.txt
- generated artifacts

## Completion Reporting

Codex responses must include:
- ZIP filename
- ZIP location
- PR number(s)
- Merge commit(s)
- Validation results

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
