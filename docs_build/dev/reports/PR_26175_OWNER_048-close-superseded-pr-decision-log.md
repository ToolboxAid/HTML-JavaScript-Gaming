# PR_26175_OWNER_048-close-superseded-pr-decision-log

## Scope

Create an OWNER decision log for superseded PR closure candidates.

This PR is report-only. It does not close PRs, delete branches, merge branches, or modify runtime code.

## GitHub Authority Snapshot

| PR | GitHub State | Draft | Mergeable | Branch | Team |
| --- | --- | --- | --- | --- | --- |
| #3 | open | no | no | `pr/PR_26171_006-message-emotion-profile-management` | Team Bravo |
| #51 | open | yes | no | `pr/26172-MASTER-001-project-instructions-readme-and-root` | Team OWNER |

## Decision Log

| PR number | Team | Reason | Replacement / current direction | Owner approval required before closure |
| --- | --- | --- | --- | --- |
| #3 | Team Bravo | Close as superseded by the current PostgreSQL Messages direction. PR #3 targets the older SQLite Messages lane and includes changes against `src/dev-runtime/messages/messages-sqlite-service.mjs`, while current `main` no longer has that file and does have `src/dev-runtime/messages/messages-postgres-service.mjs`. Current Project Instructions also state SQLite is deprecated, no new SQLite implementations or dependencies are allowed, new persistence work targets PostgreSQL, and PRs introducing SQLite should be rejected. | Continue Messages / Emotion Profiles work through the current PostgreSQL-backed Messages implementation and Team Bravo ownership lane. Treat PR #3 as historical evidence, not a merge candidate. | YES. A later explicit OWNER approval is required before closing PR #3. |
| #51 | Team OWNER | Close as superseded by the current Project Instructions governance state. PR #51 bootstraps an older ProjectInstructions root using `MASTER override` wording and placeholder structure. Current `main` already contains the active `docs_build/dev/ProjectInstructions/` operating system, OWNER override wording, addendums, team assignment governance, archive history, and current active-team records. | Preserve current Project Instructions on `main` as the active governance source of truth. Treat PR #51 as historical bootstrap evidence, not a merge candidate. | YES. A later explicit OWNER approval is required before closing PR #51. |

## Closure Preconditions

- PASS: Closure candidates are documented only; no GitHub PR closure action was taken.
- PASS: Branch cleanup is out of scope; no branch deletion action was taken.
- PASS: Runtime code is out of scope; no runtime files were modified.
- PASS: Closure remains owner-controlled and requires a future explicit OWNER instruction.
- PASS: Historical PR references are preserved.

## Requirement Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| Start from clean, synchronized `main` before branch creation | PASS | Hard-stop gate passed before creating `PR_26175_OWNER_048-close-superseded-pr-decision-log`; `main...origin/main` was `0 0`. |
| Read all Project Instructions | PASS | Reviewed `docs_build/dev/ProjectInstructions/` governance before producing the report. |
| Create decision log for PR #3 | PASS | Included PR number, team, reason, replacement/current direction, and owner approval requirement. |
| Create decision log for PR #51 | PASS | Included PR number, team, reason, replacement/current direction, and owner approval requirement. |
| Do not close PRs | PASS | No GitHub close action performed. |
| Do not delete branches | PASS | No branch deletion performed. |
| Do not modify runtime code | PASS | Report-only changes under `docs_build/dev/reports/`. |
| Produce required reports | PASS | `codex_review.diff`, `codex_changed_files.txt`, and this decision log are included. |
| Create repo-structured ZIP under `tmp/` | PASS | ZIP artifact created as `tmp/PR_26175_OWNER_048-close-superseded-pr-decision-log_delta.zip`. |

## Validation Lane Report

- PASS: GitHub PR #3 refreshed from GitHub authority; state is open, non-draft, not mergeable.
- PASS: GitHub PR #51 refreshed from GitHub authority; state is open, draft, not mergeable.
- PASS: Current `main` contains `src/dev-runtime/messages/messages-postgres-service.mjs`.
- PASS: Current `main` does not contain `src/dev-runtime/messages/messages-sqlite-service.mjs`.
- PASS: Current Project Instructions include PostgreSQL-only persistence direction and OWNER-controlled PR closure governance.
- PASS: Report scope limited to documentation under `docs_build/dev/reports/`.
- PASS: No runtime validation was required because this PR changes no runtime behavior.

## Manual Validation Notes

- Confirmed PR #3 should remain a closure candidate only, pending future OWNER approval, because the active Messages direction is PostgreSQL-backed and the PR's SQLite lane is superseded.
- Confirmed PR #51 should remain a closure candidate only, pending future OWNER approval, because the active Project Instructions state already exists on `main` and supersedes the older MASTER bootstrap.
- Confirmed no PRs were merged or closed during this task.
- Confirmed no branches were deleted during this task.
- Confirmed no runtime code paths were edited.

## Required Artifacts

- `docs_build/dev/reports/PR_26175_OWNER_048-close-superseded-pr-decision-log.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`
- `tmp/PR_26175_OWNER_048-close-superseded-pr-decision-log_delta.zip`
