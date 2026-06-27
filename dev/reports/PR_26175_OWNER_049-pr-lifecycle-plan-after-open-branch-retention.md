# PR_26175_OWNER_049 PR Lifecycle Plan After Open Branch Retention

## Summary
This governance-only PR updates the PR lifecycle to:

`PR Open -> Plan -> Build -> Validation -> Approved -> Merged -> Main Verified -> Closed`

It clarifies that PR Open creates the tracked PR identity and source branch, Plan happens after PR Open on that same branch, all subsequent work stays tied to the same PR identity, and source branches are retained by default after merge and closeout.

No runtime code changed.

## Requirement Checklist
| Requirement | Result | Evidence |
| --- | --- | --- |
| Use main branch only | PASS | `git branch --show-current` returned `main`. |
| Update lifecycle order exactly | PASS | Root and PR workflow governance now list `PR Open`, `Plan`, `Build`, `Validation`, `Approved`, `Merged`, `Main Verified`, `Closed`. |
| PR Open creates tracked PR identity and branch | PASS | Root and PR workflow governance define PR Open as tracked PR identity plus source branch before Plan. |
| Plan happens on same PR branch | PASS | Root, PR workflow, branch lock, team start, and registry guidance state Plan uses the same PR branch. |
| Build, validation, reports, closeout tied to same PR identity | PASS | Root, PR workflow, branch lock, multi-team, and registry guidance state the same PR identity and source branch remain authoritative. |
| Closed does not require branch deletion | PASS | Branch disposition is now recorded as `retained`; retention is default after merge and closeout. |
| Branch disposition records retained | PASS | Closed gates and closeout steps record source branch disposition as `retained`. |
| Closed requires merged/pushed | PASS | Root and PR workflow Closed gates require PR merged and changes pushed. |
| Closed requires back on main and main synced 0/0 | PASS | Root, PR workflow, branch context, and EOD closeout require current branch `main` and local/origin sync `0/0`. |
| Closed requires clean worktree | PASS | Root, PR workflow, branch context, and EOD closeout require clean worktree and no untracked files. |
| Closed requires reports complete | PASS | Root and PR workflow Closed gates require reports. |
| Closed requires ZIP complete | PASS | Root and PR workflow Closed gates require repo-structured ZIP under `tmp/`. |
| Closed requires backlog updated | PASS | Root, PR workflow, and multi-team closeout require backlog updated. |
| Closed requires tool state updated when applicable | PASS | Root, PR workflow, and multi-team closeout require tool state updated when applicable. |
| Docs/governance only | PASS | Changed files are under `docs_build/dev/` governance and report paths. |
| No runtime code | PASS | No `src/`, `assets/`, `toolbox/`, runtime, or Playwright test files changed. |
| Required reports created | PASS | This report, `codex_review.diff`, and `codex_changed_files.txt` are created/updated. |
| Repo-structured ZIP under `tmp/` | PASS | ZIP path is `tmp/PR_26175_OWNER_049-pr-lifecycle-plan-after-open-branch-retention_delta.zip`. |

## Branch Validation
| Check | Result | Evidence |
| --- | --- | --- |
| Current branch is `main` | PASS | Branch command returned `main`. |
| Start sync | PASS | `main...origin/main` was `0/0` before edits. |
| Start worktree | PASS | Worktree was clean before edits. |

## Validation Lane Report
| Lane | Result | Evidence |
| --- | --- | --- |
| Docs-only validation | PASS | Changed paths are limited to `docs_build/dev/`. |
| Whitespace validation | PASS | `git diff --check` passed. |
| Playwright impacted | PASS | No; governance docs only. |
| Runtime validation | PASS | Not applicable; no runtime files changed. |

## Manual Validation Notes
| Step | Result | Notes |
| --- | --- | --- |
| Reviewed lifecycle order | PASS | Active lifecycle order now includes Plan after PR Open and Build after Plan. |
| Reviewed branch retention rule | PASS | Source branches are retained by default and branch disposition records `retained`. |
| Reviewed same-branch rule | PASS | Plan, Build, validation, reports, ZIP packaging, and closeout stay on the same PR identity and source branch. |
| Reviewed Closed gates | PASS | Closed requires merged/pushed, main verified, clean/synced repo, reports, ZIP, backlog, and applicable tool state. |

## Changed Files
| File | Purpose |
| --- | --- |
| `docs_build/dev/PROJECT_INSTRUCTIONS.md` | Updates root lifecycle order, Plan/Build definitions, Closed gates, final output fields, and retention default. |
| `docs_build/dev/ProjectInstructions/addendums/pr_workflow.md` | Updates PR flow, lifecycle states, same-branch rule, Closed gates, and branch retention rule. |
| `docs_build/dev/ProjectInstructions/addendums/branch_context_governance.md` | Updates Closed branch disposition to retained. |
| `docs_build/dev/ProjectInstructions/addendums/branch_lock_governance.md` | Adds same-branch and retention-by-default rules. |
| `docs_build/dev/ProjectInstructions/addendums/multi_team.md` | Updates EOD closeout to record retained source branch, backlog/tool-state status, and retention-by-default cleanup governance. |
| `docs_build/dev/ProjectInstructions/addendums/team_release_readiness.md` | Updates release readiness lifecycle order and closeout output fields. |
| `docs_build/dev/ProjectInstructions/addendums/team_start_and_release.md` | Updates team flow to Plan and Build on the same PR branch. |
| `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md` | Updates active registry and sequential PR rules for same-branch Plan/Build and retained branch disposition. |
| `docs_build/dev/reports/PR_26175_OWNER_049-pr-lifecycle-plan-after-open-branch-retention.md` | Required PR-specific report. |
| `docs_build/dev/reports/codex_review.diff` | Required review diff artifact. |
| `docs_build/dev/reports/codex_changed_files.txt` | Required changed-files artifact. |

## ZIP
| Artifact | Result |
| --- | --- |
| `tmp/PR_26175_OWNER_049-pr-lifecycle-plan-after-open-branch-retention_delta.zip` | PASS - repo-structured ZIP created for this run. |
