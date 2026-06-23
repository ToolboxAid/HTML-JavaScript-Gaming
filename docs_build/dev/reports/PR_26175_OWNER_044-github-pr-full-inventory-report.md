# PR_26175_OWNER_044-github-pr-full-inventory-report

OWNER override approved: complete GitHub PR inventory audit only.

## Summary

Audit/report only. GitHub was used as authority for open and draft PR state. No PRs were closed, no branches were deleted, no PRs were merged, and no runtime code was modified.

- Repository: ToolboxAid/HTML-JavaScript-Gaming
- Source API: https://api.github.com/repos/ToolboxAid/HTML-JavaScript-Gaming/pulls?state=open&per_page=100&sort=created&direction=asc
- Open PRs found: 36
- Open ready PRs: 3
- Open draft PRs: 33
- Raw JSON: `docs_build/dev/reports/PR_26175_OWNER_044-github-pr-full-inventory-report-raw-github-prs.json`
- Raw text: `docs_build/dev/reports/PR_26175_OWNER_044-github-pr-full-inventory-report-raw-github-prs.txt`

## Branch Validation

| Check | Result | Evidence |
|---|---|---|
| Returned to main after PR 1 | PASS | Checked out `main` after opening PR #124. |
| Pulled latest main | PASS | `git pull --ff-only` reported already up to date. |
| Current branch | PASS | `PR_26175_OWNER_044-github-pr-full-inventory-report` |
| Expected branch | PASS | `PR_26175_OWNER_044-github-pr-full-inventory-report` |
| Base sync before branch creation | PASS | main `6d94477bb0ae9f63dd1466dbb89e4a437b8749b0`; origin/main `6d94477bb0ae9f63dd1466dbb89e4a437b8749b0` |
| Worktree before report generation | PASS | Clean before creating PR 2 branch. |

## Requirement Checklist

| Requirement | Result | Notes |
|---|---|---|
| Audit/report only | PASS | Generated report artifacts only. |
| Use GitHub as authority | PASS | Fetched current open PRs from GitHub REST API. |
| Report all open and draft PRs | PASS | 36 open PRs listed; 33 are drafts. |
| Include number/title/branch/author/state/dates/age/team/chain/recommendation | PASS | All columns present in inventory table and raw text. |
| Team mapping supports Alfa | PASS | ALFA and ALPHA naming variants map to Team Alfa. |
| Team mapping supports Bravo | PASS | Bravo and Messages/Emotion terms map to Team Bravo. |
| Team mapping supports Charlie | PASS | Charlie terms map to Team Charlie. |
| Team mapping supports Delta | PASS | Delta terms map to Team Delta. |
| Team mapping supports Gamma | PASS | Gamma and SQLite/GAMMA chain terms map to Team Gamma. |
| Team mapping supports OWNER | PASS | OWNER and legacy MASTER terms map to Team OWNER. |
| Team mapping supports Unknown/Needs Owner Decision | PASS | Unmapped PRs are flagged as Unknown/Needs Owner Decision. |
| Group PRs by team | PASS | See grouped by team section. |
| Group PRs by dependency chain | PASS | See grouped by dependency chain section. |
| Report Alfa/Alpha variants together | PASS | ALFA and ALPHA variants are grouped in Alfa/Alpha chains. |
| Identify merge-review candidates | PASS | See candidate lists. |
| Identify defer candidates | PASS | See candidate lists. |
| Identify close-candidate review list | PASS | See candidate lists. |
| Identify stale branch candidates | PASS | See candidate lists. |
| Identify owner decisions required | PASS | See candidate lists. |
| Do not close PRs | PASS | No close action performed. |
| Do not delete branches | PASS | No branch deletion performed. |
| Do not merge PRs | PASS | No merge performed. |
| Do not modify runtime code | PASS | Only reports/raw inventory files changed. |
| Required reports and ZIP | PASS | Required report files and `tmp/PR_26175_OWNER_044-github-pr-full-inventory-report_delta.zip` generated. |

## Validation Lane Report

| Lane | Result | Evidence |
|---|---|---|
| GitHub inventory lane | PASS | Full API response saved to raw JSON and text files. |
| Completeness lane | PASS | All fetched PRs appear in the inventory table, team groups, and chain groups. |
| Scope lane | PASS | Report/raw audit files only; no runtime code. |
| Whitespace lane | PASS | `git diff --check` completed successfully. |
| ZIP lane | PASS | ZIP created at `tmp/PR_26175_OWNER_044-github-pr-full-inventory-report_delta.zip` and verified. |

## Full Open PR Inventory

| PR | Title | Branch | Author | State | Created | Updated | Age | Team mapping | Dependency chain | Recommendation | Dependency note |
|---|---|---|---|---|---|---|---:|---|---|---|---|
| #3 | Pr/PR 26171 006 message emotion profile management | pr/PR_26171_006-message-emotion-profile-management | ToolboxAid | open ready | 2026-06-20T01:02:11Z | 2026-06-20T01:08:39Z | 4d 2h | Team Bravo | BRAVO_MESSAGES_EMOTION_CHAIN | owner-decision-required | Bravo Messages/Emotion singleton or early chain; owner/team decision required. |
| #26 | PR_26171_ALPHA_046 game hub table standard rebuild | pr/26171-ALPHA-046-game-hub-table-standard-rebuild | ToolboxAid | open ready | 2026-06-20T22:13:09Z | 2026-06-20T22:20:37Z | 3d 5h | Team Alfa | PR_26171_ALPHA_LEGACY_CHAIN | close-candidate-review | Legacy Alpha chain; compare against newer Alfa/Alpha stack before merge or close. |
| #30 | PR_26171_GAMMA_006-sqlite-deprecation-audit | pr/26171-GAMMA-006-sqlite-deprecation-audit | ToolboxAid | open draft | 2026-06-20T23:03:05Z | 2026-06-20T23:03:49Z | 3d 4h | Team Gamma | PR_26171_GAMMA_SQLITE_CHAIN | close-candidate-review | Gamma/SQLite report chain; likely order #30 -> #43 -> #50. |
| #41 | PR_26171_ALPHA_048 idea project journey execution flow | pr/26171-ALPHA-048-idea-project-journey-execution-flow | ToolboxAid | open ready | 2026-06-21T01:31:13Z | 2026-06-21T01:36:33Z | 3d 2h | Team Alfa | PR_26171_ALPHA_LEGACY_CHAIN | close-candidate-review | Legacy Alpha chain; compare against newer Alfa/Alpha stack before merge or close. |
| #43 | PR_26171_GAMMA_021-sqlite-active-runtime-removal-plan | team/GAMMA/admin | ToolboxAid | open draft | 2026-06-21T03:26:52Z | 2026-06-21T03:26:52Z | 3d 0h | Team Gamma | PR_26171_GAMMA_SQLITE_CHAIN | close-candidate-review | Gamma/SQLite report chain; likely order #30 -> #43 -> #50. |
| #50 | PR_26171_GAMMA_028-final-sqlite-clean-status-report | pr/26171-GAMMA-028-final-sqlite-clean-status-report | ToolboxAid | open draft | 2026-06-21T16:18:04Z | 2026-06-21T16:18:04Z | 2d 11h | Team Gamma | PR_26171_GAMMA_SQLITE_CHAIN | merge-review-candidate | Gamma/SQLite report chain; likely order #30 -> #43 -> #50. |
| #51 | PR_26172_MASTER_001-project-instructions-readme-and-root | pr/26172-MASTER-001-project-instructions-readme-and-root | ToolboxAid | open draft | 2026-06-21T17:26:20Z | 2026-06-21T17:26:20Z | 2d 10h | Team OWNER | PROJECT_INSTRUCTIONS_GOVERNANCE_CHAIN | owner-decision-required | Governance/history-sensitive chain; owner decision required before merge or close. |
| #85 | [codex] Add Project Instructions governance addendums | codex/canonical-repository-structure-instructions | ToolboxAid | open draft | 2026-06-22T15:38:03Z | 2026-06-22T15:44:53Z | 1d 12h | Unknown/Needs Owner Decision | PROJECT_INSTRUCTIONS_GOVERNANCE_CHAIN | owner-decision-required | Governance/history-sensitive chain; owner decision required before merge or close. |
| #96 | PR_26174_ALFA_002-game-hub-project-intake-display | pr/26174-ALFA-002-game-hub-project-intake-display | ToolboxAid | open draft | 2026-06-22T18:17:24Z | 2026-06-22T18:17:24Z | 1d 9h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #97 | PR_26174_ALFA_003-game-hub-journey-bootstrap | pr/26174-ALFA-003-game-hub-journey-bootstrap | ToolboxAid | open draft | 2026-06-22T18:27:42Z | 2026-06-22T18:27:42Z | 1d 9h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #98 | PR_26174_ALFA_004-game-hub-progress-count-model | pr/26174-ALFA-004-game-hub-progress-count-model | ToolboxAid | open draft | 2026-06-22T18:34:08Z | 2026-06-22T18:34:08Z | 1d 9h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #99 | PR_26174_ALFA_005-idea-project-validation-polish | pr/26174-ALFA-005-idea-project-validation-polish | ToolboxAid | open draft | 2026-06-22T20:53:36Z | 2026-06-22T20:53:36Z | 1d 7h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #100 | PR_26174_ALFA_006-game-hub-empty-and-error-states | pr/26174-ALFA-006-game-hub-empty-and-error-states | ToolboxAid | open draft | 2026-06-22T20:57:11Z | 2026-06-22T20:57:11Z | 1d 7h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #101 | PR_26174_ALFA_007-game-journey-count-ui-polish | pr/26174-ALFA-007-game-journey-count-ui-polish | ToolboxAid | open draft | 2026-06-22T21:01:21Z | 2026-06-22T21:01:21Z | 1d 6h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #102 | PR_26174_ALFA_008-alpha-stack-final-validation | pr/26174-ALFA-008-alpha-stack-final-validation | ToolboxAid | open draft | 2026-06-22T21:05:21Z | 2026-06-22T21:05:21Z | 1d 6h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #103 | PR_26174_ALFA_009-game-hub-parent-child-table-layout | pr/26174-ALFA-009-game-hub-parent-child-table-layout | ToolboxAid | open draft | 2026-06-22T21:51:58Z | 2026-06-22T21:51:58Z | 1d 6h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #104 | PR_26174_ALFA_010-game-hub-source-idea-child-table-polish | pr/26174-ALFA-010-game-hub-source-idea-child-table-polish | ToolboxAid | open draft | 2026-06-22T21:55:00Z | 2026-06-22T21:55:00Z | 1d 6h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #105 | PR_26174_ALFA_011-game-hub-readiness-output-child-table | pr/26174-ALFA-011-game-hub-readiness-output-child-table | ToolboxAid | open draft | 2026-06-22T21:59:02Z | 2026-06-22T21:59:02Z | 1d 6h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #106 | PR_26174_ALFA_012-game-hub-parent-child-final-validation | pr/26174-ALFA-012-game-hub-parent-child-final-validation | ToolboxAid | open draft | 2026-06-22T22:03:26Z | 2026-06-22T22:03:26Z | 1d 5h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #107 | PR_26174_ALFA_013-game-hub-game-row-child-rows | pr/26174-ALFA-013-game-hub-game-row-child-rows | ToolboxAid | open draft | 2026-06-22T22:28:49Z | 2026-06-22T23:09:28Z | 1d 5h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #108 | PR_26174_ALFA_014-game-hub-parent-columns-center | pr/26174-ALFA-014-game-hub-parent-columns-center | ToolboxAid | open draft | 2026-06-22T23:49:52Z | 2026-06-22T23:49:52Z | 1d 4h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #109 | PR_26174_ALFA_015-game-hub-actions-and-setup-cleanup | pr/26174-ALFA-015-game-hub-actions-and-setup-cleanup | ToolboxAid | open draft | 2026-06-23T00:27:42Z | 2026-06-23T00:27:42Z | 1d 3h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #110 | PR_26174_ALFA_016-game-hub-row-edit-add-selected-state | pr/26174-ALFA-016-game-hub-row-edit-add-selected-state | ToolboxAid | open draft | 2026-06-23T00:56:52Z | 2026-06-23T01:04:05Z | 1d 3h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #111 | PR_26174_ALFA_017-game-hub-guest-save-and-crew-cleanup | pr/26174-ALFA-017-game-hub-guest-save-and-crew-cleanup | ToolboxAid | open draft | 2026-06-23T01:18:50Z | 2026-06-23T01:18:50Z | 1d 2h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #112 | PR_26174_ALFA_018-game-selection-button-state | pr/26174-ALFA-018-game-selection-button-state | ToolboxAid | open draft | 2026-06-23T01:29:58Z | 2026-06-23T01:29:58Z | 1d 2h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #113 | PR_26174_ALFA_019-game-hub-selected-button-and-crew-label | pr/26174-ALFA-019-game-hub-selected-button-and-crew-label | ToolboxAid | open draft | 2026-06-23T01:51:00Z | 2026-06-23T01:51:00Z | 1d 2h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #114 | PR_26174_ALFA_020-game-hub-idea-board-cleanup | pr/26174-ALFA-020-game-hub-idea-board-cleanup | ToolboxAid | open draft | 2026-06-23T02:48:01Z | 2026-06-23T02:48:01Z | 1d 1h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #115 | PR_26174_ALFA_021-idea-board-status-filter-table-polish | pr/26174-ALFA-021-idea-board-status-filter-table-polish | ToolboxAid | open draft | 2026-06-23T15:57:57Z | 2026-06-23T15:57:57Z | 12h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #116 | PR_26174_ALFA_022-idea-board-status-dropdown-fix | pr/26174-ALFA-022-idea-board-status-dropdown-fix | ToolboxAid | open draft | 2026-06-23T17:39:07Z | 2026-06-23T17:39:07Z | 10h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | defer-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #117 | PR_26174_ALFA_EOD-workstream-closeout | pr/26174-ALFA-EOD-workstream-closeout | ToolboxAid | open draft | 2026-06-23T17:56:54Z | 2026-06-23T17:56:54Z | 10h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | close-candidate-review | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #118 | PR_26174_ALFA_EOD-final-closeout | pr/26174-ALFA-EOD-final-closeout | ToolboxAid | open draft | 2026-06-23T18:08:07Z | 2026-06-23T18:10:12Z | 9h | Team Alfa | PR_26174_ALFA_ALPHA_STACK | merge-review-candidate | Stacked Alfa/Alpha chain; review in sequence #96 -> #97 -> #98 -> #99 -> #100 -> #101 -> #102 -> #103 -> #104 -> #105 -> #106 -> #107 -> #108 -> #109 -> #110 -> #111 -> #112 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118. |
| #120 | [codex] PR_26175_ALFA_003 toolbox status bar single row polish | codex/pr-26175-alfa-003-toolbox-status-bar-single-row-polish | ToolboxAid | open draft | 2026-06-23T21:00:28Z | 2026-06-23T21:11:06Z | 6h | Team Alfa | PR_26175_ALFA_ALPHA_CHAIN | defer-candidate | Current PR_26175 Alfa/Alpha chain; preserve order #120 -> #121 -> #122. |
| #121 | [codex] PR_26175_ALFA_004 game hub completion status audit | codex/pr-26175-alfa-004-game-hub-completion-status-audit | ToolboxAid | open draft | 2026-06-23T21:35:20Z | 2026-06-23T21:35:20Z | 6h | Team Alfa | PR_26175_ALFA_ALPHA_CHAIN | defer-candidate | Current PR_26175 Alfa/Alpha chain; preserve order #120 -> #121 -> #122. |
| #122 | [codex] PR_26175_ALFA_005 game hub audit findings cleanup | codex/pr-26175-alfa-005-game-hub-audit-findings-cleanup | ToolboxAid | open draft | 2026-06-23T22:16:08Z | 2026-06-23T22:16:08Z | 5h | Team Alfa | PR_26175_ALFA_ALPHA_CHAIN | defer-candidate | Current PR_26175 Alfa/Alpha chain; preserve order #120 -> #121 -> #122. |
| #123 | [codex] PR_26175_OWNER_042 GitHub PR inventory audit | PR_26175_OWNER_042-github-pr-inventory-audit | ToolboxAid | open draft | 2026-06-23T22:18:21Z | 2026-06-23T22:18:21Z | 5h | Team OWNER | PR_26175_OWNER_GOVERNANCE_REPORTS | merge-review-candidate | OWNER governance/report chain; #124 follows #123 in GitHub creation order. |
| #124 | [codex] PR_26175_OWNER_043 team registry Gamma Delta alignment | PR_26175_OWNER_043-team-registry-gamma-delta-alignment | ToolboxAid | open draft | 2026-06-23T22:33:43Z | 2026-06-23T22:33:43Z | 5h | Team OWNER | PR_26175_OWNER_GOVERNANCE_REPORTS | merge-review-candidate | OWNER governance/report chain; #124 follows #123 in GitHub creation order. |

## Grouped By Team

### Team Alfa

- #26: PR_26171_ALPHA_046 game hub table standard rebuild (open ready, close-candidate-review, branch `pr/26171-ALPHA-046-game-hub-table-standard-rebuild`)
- #41: PR_26171_ALPHA_048 idea project journey execution flow (open ready, close-candidate-review, branch `pr/26171-ALPHA-048-idea-project-journey-execution-flow`)
- #96: PR_26174_ALFA_002-game-hub-project-intake-display (open draft, defer-candidate, branch `pr/26174-ALFA-002-game-hub-project-intake-display`)
- #97: PR_26174_ALFA_003-game-hub-journey-bootstrap (open draft, defer-candidate, branch `pr/26174-ALFA-003-game-hub-journey-bootstrap`)
- #98: PR_26174_ALFA_004-game-hub-progress-count-model (open draft, defer-candidate, branch `pr/26174-ALFA-004-game-hub-progress-count-model`)
- #99: PR_26174_ALFA_005-idea-project-validation-polish (open draft, defer-candidate, branch `pr/26174-ALFA-005-idea-project-validation-polish`)
- #100: PR_26174_ALFA_006-game-hub-empty-and-error-states (open draft, defer-candidate, branch `pr/26174-ALFA-006-game-hub-empty-and-error-states`)
- #101: PR_26174_ALFA_007-game-journey-count-ui-polish (open draft, defer-candidate, branch `pr/26174-ALFA-007-game-journey-count-ui-polish`)
- #102: PR_26174_ALFA_008-alpha-stack-final-validation (open draft, defer-candidate, branch `pr/26174-ALFA-008-alpha-stack-final-validation`)
- #103: PR_26174_ALFA_009-game-hub-parent-child-table-layout (open draft, defer-candidate, branch `pr/26174-ALFA-009-game-hub-parent-child-table-layout`)
- #104: PR_26174_ALFA_010-game-hub-source-idea-child-table-polish (open draft, defer-candidate, branch `pr/26174-ALFA-010-game-hub-source-idea-child-table-polish`)
- #105: PR_26174_ALFA_011-game-hub-readiness-output-child-table (open draft, defer-candidate, branch `pr/26174-ALFA-011-game-hub-readiness-output-child-table`)
- #106: PR_26174_ALFA_012-game-hub-parent-child-final-validation (open draft, defer-candidate, branch `pr/26174-ALFA-012-game-hub-parent-child-final-validation`)
- #107: PR_26174_ALFA_013-game-hub-game-row-child-rows (open draft, defer-candidate, branch `pr/26174-ALFA-013-game-hub-game-row-child-rows`)
- #108: PR_26174_ALFA_014-game-hub-parent-columns-center (open draft, defer-candidate, branch `pr/26174-ALFA-014-game-hub-parent-columns-center`)
- #109: PR_26174_ALFA_015-game-hub-actions-and-setup-cleanup (open draft, defer-candidate, branch `pr/26174-ALFA-015-game-hub-actions-and-setup-cleanup`)
- #110: PR_26174_ALFA_016-game-hub-row-edit-add-selected-state (open draft, defer-candidate, branch `pr/26174-ALFA-016-game-hub-row-edit-add-selected-state`)
- #111: PR_26174_ALFA_017-game-hub-guest-save-and-crew-cleanup (open draft, defer-candidate, branch `pr/26174-ALFA-017-game-hub-guest-save-and-crew-cleanup`)
- #112: PR_26174_ALFA_018-game-selection-button-state (open draft, defer-candidate, branch `pr/26174-ALFA-018-game-selection-button-state`)
- #113: PR_26174_ALFA_019-game-hub-selected-button-and-crew-label (open draft, defer-candidate, branch `pr/26174-ALFA-019-game-hub-selected-button-and-crew-label`)
- #114: PR_26174_ALFA_020-game-hub-idea-board-cleanup (open draft, defer-candidate, branch `pr/26174-ALFA-020-game-hub-idea-board-cleanup`)
- #115: PR_26174_ALFA_021-idea-board-status-filter-table-polish (open draft, defer-candidate, branch `pr/26174-ALFA-021-idea-board-status-filter-table-polish`)
- #116: PR_26174_ALFA_022-idea-board-status-dropdown-fix (open draft, defer-candidate, branch `pr/26174-ALFA-022-idea-board-status-dropdown-fix`)
- #117: PR_26174_ALFA_EOD-workstream-closeout (open draft, close-candidate-review, branch `pr/26174-ALFA-EOD-workstream-closeout`)
- #118: PR_26174_ALFA_EOD-final-closeout (open draft, merge-review-candidate, branch `pr/26174-ALFA-EOD-final-closeout`)
- #120: [codex] PR_26175_ALFA_003 toolbox status bar single row polish (open draft, defer-candidate, branch `codex/pr-26175-alfa-003-toolbox-status-bar-single-row-polish`)
- #121: [codex] PR_26175_ALFA_004 game hub completion status audit (open draft, defer-candidate, branch `codex/pr-26175-alfa-004-game-hub-completion-status-audit`)
- #122: [codex] PR_26175_ALFA_005 game hub audit findings cleanup (open draft, defer-candidate, branch `codex/pr-26175-alfa-005-game-hub-audit-findings-cleanup`)

### Team Bravo

- #3: Pr/PR 26171 006 message emotion profile management (open ready, owner-decision-required, branch `pr/PR_26171_006-message-emotion-profile-management`)

### Team Gamma

- #30: PR_26171_GAMMA_006-sqlite-deprecation-audit (open draft, close-candidate-review, branch `pr/26171-GAMMA-006-sqlite-deprecation-audit`)
- #43: PR_26171_GAMMA_021-sqlite-active-runtime-removal-plan (open draft, close-candidate-review, branch `team/GAMMA/admin`)
- #50: PR_26171_GAMMA_028-final-sqlite-clean-status-report (open draft, merge-review-candidate, branch `pr/26171-GAMMA-028-final-sqlite-clean-status-report`)

### Team OWNER

- #51: PR_26172_MASTER_001-project-instructions-readme-and-root (open draft, owner-decision-required, branch `pr/26172-MASTER-001-project-instructions-readme-and-root`)
- #123: [codex] PR_26175_OWNER_042 GitHub PR inventory audit (open draft, merge-review-candidate, branch `PR_26175_OWNER_042-github-pr-inventory-audit`)
- #124: [codex] PR_26175_OWNER_043 team registry Gamma Delta alignment (open draft, merge-review-candidate, branch `PR_26175_OWNER_043-team-registry-gamma-delta-alignment`)

### Unknown/Needs Owner Decision

- #85: [codex] Add Project Instructions governance addendums (open draft, owner-decision-required, branch `codex/canonical-repository-structure-instructions`)

## Grouped By Dependency Chain

### BRAVO_MESSAGES_EMOTION_CHAIN

- #3: Pr/PR 26171 006 message emotion profile management -> owner-decision-required; branch `pr/PR_26171_006-message-emotion-profile-management`

### PR_26171_ALPHA_LEGACY_CHAIN

- #26: PR_26171_ALPHA_046 game hub table standard rebuild -> close-candidate-review; branch `pr/26171-ALPHA-046-game-hub-table-standard-rebuild`
- #41: PR_26171_ALPHA_048 idea project journey execution flow -> close-candidate-review; branch `pr/26171-ALPHA-048-idea-project-journey-execution-flow`

### PR_26171_GAMMA_SQLITE_CHAIN

- #30: PR_26171_GAMMA_006-sqlite-deprecation-audit -> close-candidate-review; branch `pr/26171-GAMMA-006-sqlite-deprecation-audit`
- #43: PR_26171_GAMMA_021-sqlite-active-runtime-removal-plan -> close-candidate-review; branch `team/GAMMA/admin`
- #50: PR_26171_GAMMA_028-final-sqlite-clean-status-report -> merge-review-candidate; branch `pr/26171-GAMMA-028-final-sqlite-clean-status-report`

### PR_26174_ALFA_ALPHA_STACK

- #96: PR_26174_ALFA_002-game-hub-project-intake-display -> defer-candidate; branch `pr/26174-ALFA-002-game-hub-project-intake-display`
- #97: PR_26174_ALFA_003-game-hub-journey-bootstrap -> defer-candidate; branch `pr/26174-ALFA-003-game-hub-journey-bootstrap`
- #98: PR_26174_ALFA_004-game-hub-progress-count-model -> defer-candidate; branch `pr/26174-ALFA-004-game-hub-progress-count-model`
- #99: PR_26174_ALFA_005-idea-project-validation-polish -> defer-candidate; branch `pr/26174-ALFA-005-idea-project-validation-polish`
- #100: PR_26174_ALFA_006-game-hub-empty-and-error-states -> defer-candidate; branch `pr/26174-ALFA-006-game-hub-empty-and-error-states`
- #101: PR_26174_ALFA_007-game-journey-count-ui-polish -> defer-candidate; branch `pr/26174-ALFA-007-game-journey-count-ui-polish`
- #102: PR_26174_ALFA_008-alpha-stack-final-validation -> defer-candidate; branch `pr/26174-ALFA-008-alpha-stack-final-validation`
- #103: PR_26174_ALFA_009-game-hub-parent-child-table-layout -> defer-candidate; branch `pr/26174-ALFA-009-game-hub-parent-child-table-layout`
- #104: PR_26174_ALFA_010-game-hub-source-idea-child-table-polish -> defer-candidate; branch `pr/26174-ALFA-010-game-hub-source-idea-child-table-polish`
- #105: PR_26174_ALFA_011-game-hub-readiness-output-child-table -> defer-candidate; branch `pr/26174-ALFA-011-game-hub-readiness-output-child-table`
- #106: PR_26174_ALFA_012-game-hub-parent-child-final-validation -> defer-candidate; branch `pr/26174-ALFA-012-game-hub-parent-child-final-validation`
- #107: PR_26174_ALFA_013-game-hub-game-row-child-rows -> defer-candidate; branch `pr/26174-ALFA-013-game-hub-game-row-child-rows`
- #108: PR_26174_ALFA_014-game-hub-parent-columns-center -> defer-candidate; branch `pr/26174-ALFA-014-game-hub-parent-columns-center`
- #109: PR_26174_ALFA_015-game-hub-actions-and-setup-cleanup -> defer-candidate; branch `pr/26174-ALFA-015-game-hub-actions-and-setup-cleanup`
- #110: PR_26174_ALFA_016-game-hub-row-edit-add-selected-state -> defer-candidate; branch `pr/26174-ALFA-016-game-hub-row-edit-add-selected-state`
- #111: PR_26174_ALFA_017-game-hub-guest-save-and-crew-cleanup -> defer-candidate; branch `pr/26174-ALFA-017-game-hub-guest-save-and-crew-cleanup`
- #112: PR_26174_ALFA_018-game-selection-button-state -> defer-candidate; branch `pr/26174-ALFA-018-game-selection-button-state`
- #113: PR_26174_ALFA_019-game-hub-selected-button-and-crew-label -> defer-candidate; branch `pr/26174-ALFA-019-game-hub-selected-button-and-crew-label`
- #114: PR_26174_ALFA_020-game-hub-idea-board-cleanup -> defer-candidate; branch `pr/26174-ALFA-020-game-hub-idea-board-cleanup`
- #115: PR_26174_ALFA_021-idea-board-status-filter-table-polish -> defer-candidate; branch `pr/26174-ALFA-021-idea-board-status-filter-table-polish`
- #116: PR_26174_ALFA_022-idea-board-status-dropdown-fix -> defer-candidate; branch `pr/26174-ALFA-022-idea-board-status-dropdown-fix`
- #117: PR_26174_ALFA_EOD-workstream-closeout -> close-candidate-review; branch `pr/26174-ALFA-EOD-workstream-closeout`
- #118: PR_26174_ALFA_EOD-final-closeout -> merge-review-candidate; branch `pr/26174-ALFA-EOD-final-closeout`

### PR_26175_ALFA_ALPHA_CHAIN

- #120: [codex] PR_26175_ALFA_003 toolbox status bar single row polish -> defer-candidate; branch `codex/pr-26175-alfa-003-toolbox-status-bar-single-row-polish`
- #121: [codex] PR_26175_ALFA_004 game hub completion status audit -> defer-candidate; branch `codex/pr-26175-alfa-004-game-hub-completion-status-audit`
- #122: [codex] PR_26175_ALFA_005 game hub audit findings cleanup -> defer-candidate; branch `codex/pr-26175-alfa-005-game-hub-audit-findings-cleanup`

### PR_26175_OWNER_GOVERNANCE_REPORTS

- #123: [codex] PR_26175_OWNER_042 GitHub PR inventory audit -> merge-review-candidate; branch `PR_26175_OWNER_042-github-pr-inventory-audit`
- #124: [codex] PR_26175_OWNER_043 team registry Gamma Delta alignment -> merge-review-candidate; branch `PR_26175_OWNER_043-team-registry-gamma-delta-alignment`

### PROJECT_INSTRUCTIONS_GOVERNANCE_CHAIN

- #51: PR_26172_MASTER_001-project-instructions-readme-and-root -> owner-decision-required; branch `pr/26172-MASTER-001-project-instructions-readme-and-root`
- #85: [codex] Add Project Instructions governance addendums -> owner-decision-required; branch `codex/canonical-repository-structure-instructions`

## Candidate Lists

### Merge-Review Candidates

- #50: PR_26171_GAMMA_028-final-sqlite-clean-status-report (Team Gamma, open draft, branch `pr/26171-GAMMA-028-final-sqlite-clean-status-report`)
- #118: PR_26174_ALFA_EOD-final-closeout (Team Alfa, open draft, branch `pr/26174-ALFA-EOD-final-closeout`)
- #123: [codex] PR_26175_OWNER_042 GitHub PR inventory audit (Team OWNER, open draft, branch `PR_26175_OWNER_042-github-pr-inventory-audit`)
- #124: [codex] PR_26175_OWNER_043 team registry Gamma Delta alignment (Team OWNER, open draft, branch `PR_26175_OWNER_043-team-registry-gamma-delta-alignment`)

### Defer Candidates

- #96: PR_26174_ALFA_002-game-hub-project-intake-display (Team Alfa, open draft, branch `pr/26174-ALFA-002-game-hub-project-intake-display`)
- #97: PR_26174_ALFA_003-game-hub-journey-bootstrap (Team Alfa, open draft, branch `pr/26174-ALFA-003-game-hub-journey-bootstrap`)
- #98: PR_26174_ALFA_004-game-hub-progress-count-model (Team Alfa, open draft, branch `pr/26174-ALFA-004-game-hub-progress-count-model`)
- #99: PR_26174_ALFA_005-idea-project-validation-polish (Team Alfa, open draft, branch `pr/26174-ALFA-005-idea-project-validation-polish`)
- #100: PR_26174_ALFA_006-game-hub-empty-and-error-states (Team Alfa, open draft, branch `pr/26174-ALFA-006-game-hub-empty-and-error-states`)
- #101: PR_26174_ALFA_007-game-journey-count-ui-polish (Team Alfa, open draft, branch `pr/26174-ALFA-007-game-journey-count-ui-polish`)
- #102: PR_26174_ALFA_008-alpha-stack-final-validation (Team Alfa, open draft, branch `pr/26174-ALFA-008-alpha-stack-final-validation`)
- #103: PR_26174_ALFA_009-game-hub-parent-child-table-layout (Team Alfa, open draft, branch `pr/26174-ALFA-009-game-hub-parent-child-table-layout`)
- #104: PR_26174_ALFA_010-game-hub-source-idea-child-table-polish (Team Alfa, open draft, branch `pr/26174-ALFA-010-game-hub-source-idea-child-table-polish`)
- #105: PR_26174_ALFA_011-game-hub-readiness-output-child-table (Team Alfa, open draft, branch `pr/26174-ALFA-011-game-hub-readiness-output-child-table`)
- #106: PR_26174_ALFA_012-game-hub-parent-child-final-validation (Team Alfa, open draft, branch `pr/26174-ALFA-012-game-hub-parent-child-final-validation`)
- #107: PR_26174_ALFA_013-game-hub-game-row-child-rows (Team Alfa, open draft, branch `pr/26174-ALFA-013-game-hub-game-row-child-rows`)
- #108: PR_26174_ALFA_014-game-hub-parent-columns-center (Team Alfa, open draft, branch `pr/26174-ALFA-014-game-hub-parent-columns-center`)
- #109: PR_26174_ALFA_015-game-hub-actions-and-setup-cleanup (Team Alfa, open draft, branch `pr/26174-ALFA-015-game-hub-actions-and-setup-cleanup`)
- #110: PR_26174_ALFA_016-game-hub-row-edit-add-selected-state (Team Alfa, open draft, branch `pr/26174-ALFA-016-game-hub-row-edit-add-selected-state`)
- #111: PR_26174_ALFA_017-game-hub-guest-save-and-crew-cleanup (Team Alfa, open draft, branch `pr/26174-ALFA-017-game-hub-guest-save-and-crew-cleanup`)
- #112: PR_26174_ALFA_018-game-selection-button-state (Team Alfa, open draft, branch `pr/26174-ALFA-018-game-selection-button-state`)
- #113: PR_26174_ALFA_019-game-hub-selected-button-and-crew-label (Team Alfa, open draft, branch `pr/26174-ALFA-019-game-hub-selected-button-and-crew-label`)
- #114: PR_26174_ALFA_020-game-hub-idea-board-cleanup (Team Alfa, open draft, branch `pr/26174-ALFA-020-game-hub-idea-board-cleanup`)
- #115: PR_26174_ALFA_021-idea-board-status-filter-table-polish (Team Alfa, open draft, branch `pr/26174-ALFA-021-idea-board-status-filter-table-polish`)
- #116: PR_26174_ALFA_022-idea-board-status-dropdown-fix (Team Alfa, open draft, branch `pr/26174-ALFA-022-idea-board-status-dropdown-fix`)
- #120: [codex] PR_26175_ALFA_003 toolbox status bar single row polish (Team Alfa, open draft, branch `codex/pr-26175-alfa-003-toolbox-status-bar-single-row-polish`)
- #121: [codex] PR_26175_ALFA_004 game hub completion status audit (Team Alfa, open draft, branch `codex/pr-26175-alfa-004-game-hub-completion-status-audit`)
- #122: [codex] PR_26175_ALFA_005 game hub audit findings cleanup (Team Alfa, open draft, branch `codex/pr-26175-alfa-005-game-hub-audit-findings-cleanup`)

### Close-Candidate Review List

- #26: PR_26171_ALPHA_046 game hub table standard rebuild (Team Alfa, open ready, branch `pr/26171-ALPHA-046-game-hub-table-standard-rebuild`)
- #30: PR_26171_GAMMA_006-sqlite-deprecation-audit (Team Gamma, open draft, branch `pr/26171-GAMMA-006-sqlite-deprecation-audit`)
- #41: PR_26171_ALPHA_048 idea project journey execution flow (Team Alfa, open ready, branch `pr/26171-ALPHA-048-idea-project-journey-execution-flow`)
- #43: PR_26171_GAMMA_021-sqlite-active-runtime-removal-plan (Team Gamma, open draft, branch `team/GAMMA/admin`)
- #117: PR_26174_ALFA_EOD-workstream-closeout (Team Alfa, open draft, branch `pr/26174-ALFA-EOD-workstream-closeout`)

### Stale Branch Candidates

Recommendation-only. No branch deletion was performed.

- #3: Pr/PR 26171 006 message emotion profile management (Team Bravo, open ready, branch `pr/PR_26171_006-message-emotion-profile-management`)
- #26: PR_26171_ALPHA_046 game hub table standard rebuild (Team Alfa, open ready, branch `pr/26171-ALPHA-046-game-hub-table-standard-rebuild`)
- #30: PR_26171_GAMMA_006-sqlite-deprecation-audit (Team Gamma, open draft, branch `pr/26171-GAMMA-006-sqlite-deprecation-audit`)
- #41: PR_26171_ALPHA_048 idea project journey execution flow (Team Alfa, open ready, branch `pr/26171-ALPHA-048-idea-project-journey-execution-flow`)
- #43: PR_26171_GAMMA_021-sqlite-active-runtime-removal-plan (Team Gamma, open draft, branch `team/GAMMA/admin`)
- #51: PR_26172_MASTER_001-project-instructions-readme-and-root (Team OWNER, open draft, branch `pr/26172-MASTER-001-project-instructions-readme-and-root`)
- #85: [codex] Add Project Instructions governance addendums (Unknown/Needs Owner Decision, open draft, branch `codex/canonical-repository-structure-instructions`)

### Owner Decisions Required

- #3: Pr/PR 26171 006 message emotion profile management (Team Bravo, open ready, branch `pr/PR_26171_006-message-emotion-profile-management`)
- #51: PR_26172_MASTER_001-project-instructions-readme-and-root (Team OWNER, open draft, branch `pr/26172-MASTER-001-project-instructions-readme-and-root`)
- #85: [codex] Add Project Instructions governance addendums (Unknown/Needs Owner Decision, open draft, branch `codex/canonical-repository-structure-instructions`)

## Manual Validation Notes

- Confirmed PR 2 started only after returning to clean, synced `main` following PR 1 draft creation.
- Confirmed GitHub was the authority for open/draft PR state through the REST API response saved in raw JSON.
- Confirmed the mapping treats ALFA and ALPHA as Team Alfa variants and keeps them grouped together.
- Confirmed Gamma/GAMMA PRs are mapped to Team Gamma for this inventory.
- Confirmed no PRs were closed, no branches deleted, no merges performed, and no runtime code modified.
