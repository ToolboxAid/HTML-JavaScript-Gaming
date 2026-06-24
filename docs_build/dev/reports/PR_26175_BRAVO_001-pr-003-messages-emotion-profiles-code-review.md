# PR_26175_BRAVO_001-pr-003-messages-emotion-profiles-code-review

## Scope

OWNER override approved: review GitHub PR #3 only.

This report reviews GitHub PR #3, `Pr/PR 26171 006 message emotion profile management`, for the Messages / Emotion Profiles area. It is report-only. No runtime code was changed, no PR was merged or closed, and no branch was deleted.

## Source Evidence

- GitHub PR: https://github.com/ToolboxAid/HTML-JavaScript-Gaming/pull/3
- PR state: open, non-draft, not merged
- GitHub mergeable state: false
- Base branch: `main`
- Head branch: `pr/PR_26171_006-message-emotion-profile-management`
- Base SHA: `64231546e8f6a20810d23c590a9787eed40f63a1`
- Head SHA: `6b83cedd5196c8117ec6deb69f73e91f04080573`
- Review date: 2026-06-24
- Current `main` at review start: `5415f6675d7a0f10931b83368948a83df98d8021`

## Changed Code Files Only

| File | Status | Additions | Deletions | Review Summary |
| --- | --- | ---: | ---: | --- |
| `src/dev-runtime/messages/messages-sqlite-service.mjs` | modified | 54 | 4 | Adds emotion-profile usage queries, reference payloads, aggregate usage counts, and a referenced-profile deactivation guard. |
| `tests/playwright/tools/MessagesTool.spec.mjs` | modified | 37 | 0 | Adds targeted coverage for usage counts and referenced-profile deactivation rejection. |
| `toolbox/messages/index.html` | modified | 5 | 4 | Adds a Usage column to the Emotion Profiles table and changes numeric input step precision. |
| `toolbox/messages/messages.js` | modified | 7 | 1 | Renders usage count and reloads emotion profiles after segment reloads. |

## Full Changed File List

| File | Status | Additions | Deletions |
| --- | --- | ---: | ---: |
| `docs_build/dev/reports/PR_26171_006-message-emotion-profile-management-manual-validation.md` | added | 11 | 0 |
| `docs_build/dev/reports/PR_26171_006-message-emotion-profile-management-validation.txt` | added | 30 | 0 |
| `docs_build/dev/reports/PR_26171_006-message-emotion-profile-management.md` | added | 53 | 0 |
| `docs_build/dev/reports/codex_changed_files.txt` | modified | 8 | 9 |
| `docs_build/dev/reports/codex_review.diff` | modified | 352 | 305 |
| `docs_build/pr/BUILD_PR_26171_006-message-emotion-profile-management.md` | added | 83 | 0 |
| `docs_build/pr/BUILD_PR_26171_008-message-tts-profile-foundation.md` | added | 98 | 0 |
| `docs_build/pr/BUILD_PR_26171_010-message-speech-preview.md` | added | 84 | 0 |
| `docs_build/pr/BUILD_PR_26171_012-message-voice-provider-adapters.md` | added | 86 | 0 |
| `docs_build/pr/BUILD_PR_26171_014-runtime-message-playback-foundation.md` | added | 84 | 0 |
| `docs_build/pr/BUILD_PR_26171_016-midi-studio-roadmap-foundation.md` | added | 74 | 0 |
| `src/dev-runtime/messages/messages-sqlite-service.mjs` | modified | 54 | 4 |
| `tests/playwright/tools/MessagesTool.spec.mjs` | modified | 37 | 0 |
| `toolbox/messages/index.html` | modified | 5 | 4 |
| `toolbox/messages/messages.js` | modified | 7 | 1 |

## Findings

### P1 - PR #3 is stale against current Messages persistence

The primary service change targets `src/dev-runtime/messages/messages-sqlite-service.mjs`, but current `main` no longer has that file. Current `main` has `src/dev-runtime/messages/messages-postgres-service.mjs` and routes Messages through the PostgreSQL service in `src/dev-runtime/server/local-api-router.mjs`.

Current Project Instructions also state that SQLite is deprecated, new persistence work targets PostgreSQL, and PRs introducing SQLite should be rejected. Merging PR #3 as-is would either fail to apply cleanly or reintroduce a deprecated service path. This is a blocking merge risk.

### P1 - The PR mixes the PR_006 implementation with future workstream BUILD specs

PR #3 adds PR_008, PR_010, PR_012, PR_014, and PR_016 BUILD files alongside the PR_006 implementation. GitHub already has a P1 review comment asking to split these future specs out of this PR. This violates the one-purpose PR rule and can pollute later review lanes with unmerged planning changes.

### P2 - API payload expands reference details and should be reviewed against the current contract

The patch adds `references`, `messageUsageCount`, `segmentUsageCount`, and `usageCount` to emotion profile payloads. That is a reasonable product direction, but it changes the API shape and exposes message and segment labels/previews in the profile response. In current main, similar behavior exists in the PostgreSQL service, so PR #3 should not be the vehicle for this API contract.

### P2 - Targeted validation passed, but the required workspace lane failed

The PR report says targeted syntax, direct service probing, and a Messages Playwright path passed. It also says `npm run test:workspace-v2` failed. Even if those failures were outside the Messages scope at the time, the current merge decision should not ignore that validation gap.

## Runtime Impact

Runtime impact is high if merged as-is. The PR changes the Messages service layer, API payloads surfaced through the Messages tool, and UI behavior. It also touches a SQLite service file that is absent on current `main`, while the current app uses PostgreSQL-backed Messages code.

## DB/API Impact

- Adds two usage queries per emotion profile in the SQLite service.
- Adds aggregate usage fields to emotion profile API payloads.
- Adds `references` details containing message and segment reference information.
- Blocks active-to-inactive changes when a profile has references.
- Does not add a delete endpoint.
- Conflicts with the current PostgreSQL-only persistence direction.

## UI Impact

- Adds a Usage column to the Emotion Profiles table.
- Updates the loading row colspan from 3 to 4.
- Renders usage count in `toolbox/messages/messages.js`.
- Refreshes emotion profile state and select options after segment reload.
- Changes volume, pitch, and rate input step values from `0.05` to `0.01`.

UI risk is moderate. The usage column is useful, but table layout and edit/select state should be retested against the current Theme V2 Messages UI.

## Theme V2 Compliance

PASS with review note. The code patch does not add inline styles, inline scripts, page-local CSS, or tool-local CSS. The UI changes are table markup and existing DOM rendering changes. A visual check is still recommended because the added Usage column changes table density.

## Auth/Session Impact

No direct auth or session files are touched. The PR uses existing Local API paths. Auth/session risk is low, but any future rework should validate the Messages tool under the current session model because current workspace validation previously reported session-related failures outside the Messages scope.

## Browser-Owned Data Risk

Low direct risk. The patch does not add `localStorage`, browser-owned persistence, or persisted browser-only message state. Data remains server-owned through the Local API/service boundary.

## Deletion/In-Use Guard Risk

The active-to-inactive guard is directionally correct: referenced Emotion Profiles should not be deactivated while messages or segments still reference them. Remaining risks:

- The guard lives in the stale SQLite service in PR #3.
- There is no database-level constraint shown in the PR.
- The PR does not address delete behavior beyond saying no delete endpoint was added.
- The current PostgreSQL service already contains a comparable in-use guard, so the PR is superseded for this behavior.

## Test Coverage

Covered in PR #3:

- Usage counts for one message reference and one segment reference.
- API rejection when deactivating a referenced `Urgent` profile.
- UI diagnostic when attempting to deactivate that referenced profile.
- Active status remains after rejected deactivation.

Not sufficiently covered for merge:

- Current PostgreSQL service path on `main`.
- Empty and multi-profile usage aggregation.
- Unreferenced profile deactivation remains allowed.
- Table layout or visual regression after adding the Usage column.
- Full workspace lane is not green in the PR evidence.

## Playwright Recommendation

Do not rely on the old PR #3 Playwright result for a current merge. If the behavior is still desired, retest on a fresh PostgreSQL-based branch from current `main` with:

- Targeted Messages tool Playwright coverage for usage count display.
- API/service test coverage for referenced and unreferenced Emotion Profile active-state changes.
- A visual/table-density check for the Emotion Profiles table.
- The current workspace validation lane required by Project Instructions.

## Merge/Hold/Close Recommendation

Recommendation: close PR #3 as superseded after OWNER approval.

Reason:

- It is not mergeable on GitHub.
- It targets a removed SQLite service path.
- Current governance says PostgreSQL is the active persistence direction.
- Current `main` already has Messages PostgreSQL usage-count and in-use guard behavior.
- It mixes future BUILD specs into a PR_006 implementation branch.

Do not merge PR #3. If owner wants any missing behavior from PR #3 retained, create a fresh Bravo branch from current `main` and implement only the missing PostgreSQL-backed Messages/Emotion Profiles behavior.

## Requirement Checklist

| Requirement | Result | Notes |
| --- | --- | --- |
| Start from main | PASS | Started from clean `main` at `5415f6675d7a0f10931b83368948a83df98d8021`. |
| Hard stop if not main, dirty, or unsynced | PASS | Gate passed: branch `main`, clean worktree, local/origin `0 0`. |
| Read all Project Instructions | PASS | Read `docs_build/dev/ProjectInstructions/` before report generation. |
| Review GitHub PR #3 only | PASS | Report covers only PR #3. |
| Pull PR #3 diff | PASS | Used GitHub PR metadata and file diff data for PR #3. |
| Include changed code files only | PASS | Included dedicated changed-code-files table. |
| Include full changed file list | PASS | Included all 15 changed files with status and line counts. |
| Include runtime impact | PASS | Included. |
| Include DB/API impact | PASS | Included. |
| Include UI impact | PASS | Included. |
| Include Theme V2 compliance | PASS | Included. |
| Include auth/session impact | PASS | Included. |
| Include browser-owned data risk | PASS | Included. |
| Include deletion/in-use guard risk | PASS | Included. |
| Include test coverage | PASS | Included. |
| Include Playwright recommendation | PASS | Included. |
| Include merge/hold/close recommendation | PASS | Included: close as superseded after OWNER approval. |
| Do not merge PR #3 | PASS | No merge performed. |
| Do not close PR #3 | PASS | No close performed. |
| Do not delete branches | PASS | No branch deletion performed. |
| Do not modify runtime code | PASS | Only report artifacts changed. |
| Create repo-structured ZIP under `tmp/` | PASS | Required path: `tmp/PR_26175_BRAVO_001-pr-003-messages-emotion-profiles-code-review_delta.zip`. |

## Validation Lane Report

| Validation | Result | Evidence |
| --- | --- | --- |
| Branch gate | PASS | Branch created after clean/synced `main` gate passed. |
| GitHub PR metadata | PASS | Fetched PR #3 metadata from GitHub. |
| GitHub PR file list | PASS | Fetched all changed files for PR #3 from GitHub. |
| Current-main persistence comparison | PASS | Confirmed current `main` has `messages-postgres-service.mjs` and does not have `messages-sqlite-service.mjs`. |
| Report-only scope check | PASS | Only required report files changed. |
| Runtime tests | NOT RUN | Report-only PR; no runtime code changed. |
| Playwright tests | NOT RUN | Report-only PR; no UI/runtime code changed. |
| Samples | NOT RUN | Report-only PR; no samples changed. |

## Manual Validation Notes

- Confirmed PR #3 remains open and non-draft.
- Confirmed PR #3 is not mergeable on GitHub.
- Confirmed PR #3 has an existing P1 review note for mixed future BUILD specs.
- Confirmed current Project Instructions prohibit new SQLite persistence work.
- Confirmed current main already contains PostgreSQL-backed Messages usage count and referenced-profile guard behavior.
