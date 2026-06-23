# PR_26175_OWNER_042-github-pr-inventory-audit

OWNER override approved: GitHub PR inventory audit only.

## Summary

GitHub PR inventory audit only. No runtime code, branch deletion, PR closure, or merge action was performed. GitHub API was used as authority for open PR state.

- Repository: ToolboxAid/HTML-JavaScript-Gaming
- Source API: https://api.github.com/repos/ToolboxAid/HTML-JavaScript-Gaming/pulls?state=open&per_page=100&sort=created&direction=asc
- Open PRs found: 33
- Open ready PRs: 3
- Open draft PRs: 30
- Classification counts: keep 2, merge-review 2, close-candidate 5, defer 21, needs-owner-decision 3

## Branch Validation

| Check | Result | Evidence |
|---|---|---|
| Started from main | PASS | main and origin/main were synced at `6d94477bb0ae9f63dd1466dbb89e4a437b8749b0` before branch restart. |
| Current branch | PASS | `PR_26175_OWNER_042-github-pr-inventory-audit` |
| Expected branch | PASS | `PR_26175_OWNER_042-github-pr-inventory-audit` |
| Branch base commit | PASS | HEAD `6d94477bb0ae9f63dd1466dbb89e4a437b8749b0`; main `6d94477bb0ae9f63dd1466dbb89e4a437b8749b0`; origin/main `6d94477bb0ae9f63dd1466dbb89e4a437b8749b0` |
| Worktree before report generation | PASS | Clean after approved scratch cleanup and branch restart. |
| Local/origin sync before branch restart | PASS | main == origin/main at `6d94477bb0ae9f63dd1466dbb89e4a437b8749b0` |

## Requirement Checklist

| Requirement | Result | Notes |
|---|---|---|
| Audit GitHub PR list only | PASS | Used GitHub PR API; report-only output. |
| Use GitHub as authority | PASS | Source API listed above; no local branch guesses used for PR state. |
| List open PRs | PASS | 33 open PRs listed below. |
| List draft PRs | PASS | Draft status included per PR; 30 draft PRs found. |
| List branch names | PASS | Head branch included per PR. |
| List age | PASS | Age calculated from GitHub `created_at` as of 2026-06-23. |
| List title | PASS | Title included per PR. |
| List owner/team | PASS | Derived from PR naming and governance ownership model; ambiguous entries flagged. |
| List status | PASS | Status column shows open ready vs open draft. |
| Classify each PR | PASS | Classification column uses keep, merge-review, close-candidate, defer, or needs-owner-decision. |
| Identify dependency/order risks | PASS | See dependency/order risks section. |
| Identify stale branch cleanup candidates | PASS | See stale cleanup candidates section; recommendation-only. |
| Do not close PRs | PASS | No PR close action performed. |
| Do not delete branches | PASS | No branch deletion performed. |
| Do not merge PRs | PASS | No merge performed. |
| Do not modify runtime code | PASS | Only reports were generated. |
| Produce required reports | PASS | This report, `codex_review.diff`, and `codex_changed_files.txt` generated. |
| Create repo-structured ZIP under tmp/ | PASS | `tmp/PR_26175_OWNER_042-github-pr-inventory-audit_delta.zip` generated after report creation. |

## Validation Lane Report

| Lane | Result | Evidence |
|---|---|---|
| GitHub inventory | PASS | Fetched open PRs from GitHub API; 33 returned. |
| Scope validation | PASS | Generated reports only; no runtime code paths changed. |
| Branch validation | PASS | Expected branch and clean main sync confirmed before branch creation. |
| Diff whitespace validation | PASS | `git diff --check` completed successfully; Git emitted only a CRLF normalization warning for the generated diff file. |
| ZIP validation | PASS | `tmp/PR_26175_OWNER_042-github-pr-inventory-audit_delta.zip` created and verified to contain repo-structured `docs_build/dev/reports/...` entries. |

## Open PR Inventory

| PR | Title | Branch | Age | Owner/team | Status | Classification | Notes |
|---|---|---|---:|---|---|---|---|
| #3 | Pr/PR 26171 006 message emotion profile management | pr/PR_26171_006-message-emotion-profile-management | 4d 3h | Team Bravo | open ready | needs-owner-decision | Ownership, relevance, or supersession cannot be confirmed from PR list alone. |
| #26 | PR_26171_ALPHA_046 game hub table standard rebuild | pr/26171-ALPHA-046-game-hub-table-standard-rebuild | 3d 6h | Team Alfa | open ready | close-candidate | Appears superseded or overlapped by newer reports/stack entries; do not close without explicit owner decision. |
| #30 | PR_26171_GAMMA_006-sqlite-deprecation-audit | pr/26171-GAMMA-006-sqlite-deprecation-audit | 3d 5h | Team Charlie (legacy GAMMA/compliance) | open draft | close-candidate | Appears superseded or overlapped by newer reports/stack entries; do not close without explicit owner decision. |
| #41 | PR_26171_ALPHA_048 idea project journey execution flow | pr/26171-ALPHA-048-idea-project-journey-execution-flow | 3d 2h | Team Alfa | open ready | close-candidate | Appears superseded or overlapped by newer reports/stack entries; do not close without explicit owner decision. |
| #43 | PR_26171_GAMMA_021-sqlite-active-runtime-removal-plan | team/GAMMA/admin | 3d 1h | Team Charlie (legacy GAMMA/compliance) | open draft | close-candidate | Appears superseded or overlapped by newer reports/stack entries; do not close without explicit owner decision. |
| #50 | PR_26171_GAMMA_028-final-sqlite-clean-status-report | pr/26171-GAMMA-028-final-sqlite-clean-status-report | 2d 12h | Team Charlie (legacy GAMMA/compliance) | open draft | merge-review | Draft appears to be the latest summary/final report for its lane; owner merge review needed before any action. |
| #51 | PR_26172_MASTER_001-project-instructions-readme-and-root | pr/26172-MASTER-001-project-instructions-readme-and-root | 2d 11h | Team OWNER (legacy MASTER wording) | open draft | needs-owner-decision | Ownership, relevance, or supersession cannot be confirmed from PR list alone. |
| #85 | [codex] Add Project Instructions governance addendums | codex/canonical-repository-structure-instructions | 1d 12h | Needs owner/team decision | open draft | needs-owner-decision | Ownership, relevance, or supersession cannot be confirmed from PR list alone. |
| #96 | PR_26174_ALFA_002-game-hub-project-intake-display | pr/26174-ALFA-002-game-hub-project-intake-display | 1d 10h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #97 | PR_26174_ALFA_003-game-hub-journey-bootstrap | pr/26174-ALFA-003-game-hub-journey-bootstrap | 1d 10h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #98 | PR_26174_ALFA_004-game-hub-progress-count-model | pr/26174-ALFA-004-game-hub-progress-count-model | 1d 9h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #99 | PR_26174_ALFA_005-idea-project-validation-polish | pr/26174-ALFA-005-idea-project-validation-polish | 1d 7h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #100 | PR_26174_ALFA_006-game-hub-empty-and-error-states | pr/26174-ALFA-006-game-hub-empty-and-error-states | 1d 7h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #101 | PR_26174_ALFA_007-game-journey-count-ui-polish | pr/26174-ALFA-007-game-journey-count-ui-polish | 1d 7h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #102 | PR_26174_ALFA_008-alpha-stack-final-validation | pr/26174-ALFA-008-alpha-stack-final-validation | 1d 7h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #103 | PR_26174_ALFA_009-game-hub-parent-child-table-layout | pr/26174-ALFA-009-game-hub-parent-child-table-layout | 1d 6h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #104 | PR_26174_ALFA_010-game-hub-source-idea-child-table-polish | pr/26174-ALFA-010-game-hub-source-idea-child-table-polish | 1d 6h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #105 | PR_26174_ALFA_011-game-hub-readiness-output-child-table | pr/26174-ALFA-011-game-hub-readiness-output-child-table | 1d 6h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #106 | PR_26174_ALFA_012-game-hub-parent-child-final-validation | pr/26174-ALFA-012-game-hub-parent-child-final-validation | 1d 6h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #107 | PR_26174_ALFA_013-game-hub-game-row-child-rows | pr/26174-ALFA-013-game-hub-game-row-child-rows | 1d 6h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #108 | PR_26174_ALFA_014-game-hub-parent-columns-center | pr/26174-ALFA-014-game-hub-parent-columns-center | 1d 4h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #109 | PR_26174_ALFA_015-game-hub-actions-and-setup-cleanup | pr/26174-ALFA-015-game-hub-actions-and-setup-cleanup | 1d 4h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #110 | PR_26174_ALFA_016-game-hub-row-edit-add-selected-state | pr/26174-ALFA-016-game-hub-row-edit-add-selected-state | 1d 3h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #111 | PR_26174_ALFA_017-game-hub-guest-save-and-crew-cleanup | pr/26174-ALFA-017-game-hub-guest-save-and-crew-cleanup | 1d 3h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #112 | PR_26174_ALFA_018-game-selection-button-state | pr/26174-ALFA-018-game-selection-button-state | 1d 3h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #113 | PR_26174_ALFA_019-game-hub-selected-button-and-crew-label | pr/26174-ALFA-019-game-hub-selected-button-and-crew-label | 1d 2h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #114 | PR_26174_ALFA_020-game-hub-idea-board-cleanup | pr/26174-ALFA-020-game-hub-idea-board-cleanup | 1d 1h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #115 | PR_26174_ALFA_021-idea-board-status-filter-table-polish | pr/26174-ALFA-021-idea-board-status-filter-table-polish | 12h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #116 | PR_26174_ALFA_022-idea-board-status-dropdown-fix | pr/26174-ALFA-022-idea-board-status-dropdown-fix | 10h | Team Alfa | open draft | defer | Part of stacked ALFA workstream; defer until dependency order is owner-approved. |
| #117 | PR_26174_ALFA_EOD-workstream-closeout | pr/26174-ALFA-EOD-workstream-closeout | 10h | Team Alfa | open draft | close-candidate | Appears superseded or overlapped by newer reports/stack entries; do not close without explicit owner decision. |
| #118 | PR_26174_ALFA_EOD-final-closeout | pr/26174-ALFA-EOD-final-closeout | 10h | Team Alfa | open draft | merge-review | Draft appears to be the latest summary/final report for its lane; owner merge review needed before any action. |
| #120 | [codex] PR_26175_ALFA_003 toolbox status bar single row polish | codex/pr-26175-alfa-003-toolbox-status-bar-single-row-polish | 7h | Team Alfa | open draft | keep | Recent PR_26175 draft; keep active until owner reviews current lane. |
| #121 | [codex] PR_26175_ALFA_004 game hub completion status audit | codex/pr-26175-alfa-004-game-hub-completion-status-audit | 6h | Team Alfa | open draft | keep | Recent PR_26175 draft; keep active until owner reviews current lane. |

## Dependency And Order Risks

- ALFA PRs #96 through #116 are a stacked workstream. They should not be merged out of sequence without owner approval because later PR bodies explicitly reference prior branches or cumulative validation.
- #117 and #118 are EOD/final closeout reports for the ALFA stack. #118 appears to supersede #117 for final owner review, making #117 a close-candidate only after owner confirmation.
- Older ALFA PRs #26 and #41 overlap the later PR_26174 ALFA stack and should be reviewed for supersession before any merge decision.
- SQLite/GAMMA report PRs #30, #43, and #50 appear sequential. #50 is the likely final status report; #30 and #43 are close-candidates if owner confirms #50 contains the retained decision trail.
- Governance docs PRs #51 and #85 overlap ProjectInstructions material now present on main. They need an owner decision before merge or closure because instruction preservation rules prohibit silent deletion or weakening.
- #3 lacks a clear current team/stack relation from the PR list alone. Treat as needs-owner-decision before merge, closure, or branch cleanup.
- #120 and #121 are recent PR_26175 drafts. Keep active unless owner decides to merge-review, stack, or supersede them.

## Stale Branch Cleanup Candidates

Recommendation-only. No branch deletion was performed.

| PR | Branch | Age signal | Classification | Reason |
|---|---|---|---|---|
| #3 | pr/PR_26171_006-message-emotion-profile-management | 4d 3h since update | needs-owner-decision | Ownership, relevance, or supersession cannot be confirmed from PR list alone. |
| #26 | pr/26171-ALPHA-046-game-hub-table-standard-rebuild | 3d 6h since update | close-candidate | Appears superseded or overlapped by newer reports/stack entries; do not close without explicit owner decision. |
| #30 | pr/26171-GAMMA-006-sqlite-deprecation-audit | 3d 5h since update | close-candidate | Appears superseded or overlapped by newer reports/stack entries; do not close without explicit owner decision. |
| #41 | pr/26171-ALPHA-048-idea-project-journey-execution-flow | 3d 2h since update | close-candidate | Appears superseded or overlapped by newer reports/stack entries; do not close without explicit owner decision. |
| #43 | team/GAMMA/admin | 3d 1h since update | close-candidate | Appears superseded or overlapped by newer reports/stack entries; do not close without explicit owner decision. |
| #117 | pr/26174-ALFA-EOD-workstream-closeout | 10h since update | close-candidate | Appears superseded or overlapped by newer reports/stack entries; do not close without explicit owner decision. |

## Manual Validation Notes

- Manually verified the user-approved cleanup removed only prior generated scratch files before returning to main.
- Manually verified main was pulled with `--ff-only` and already up to date before branch restart.
- Manually verified the audit scope remained report-only.
- Manual owner review is still required before closing PRs, deleting branches, or merging any PR in this inventory.

## Governance Notes

- OWNER override is documented above.
- GitHub remains authoritative for PR state.
- This audit does not change active team assignments, backlog status, runtime code, or Project Instructions.
- Classification is advisory and intentionally conservative where supersession cannot be proven from the PR list alone.
