# PR_26175_OWNER_048 PR Open To Closed Main Return Governance

## Summary
This governance-only PR defines the active PR lifecycle as:

`PR Open -> Building -> Validation -> Approved -> Merged -> Main Verified -> Closed`

It clarifies that PR Open is the first active lifecycle state, that BUILD_PR work requires a PR name and active branch/PR identity unless explicitly marked `PLAN_ONLY`, and that Closed is valid only after the merge/no-merge decision, push, main return, clean/synced repo state, branch disposition, required reports, and required ZIP all pass.

No runtime code changed.

## Located Active Governance Files
| File | Role | Change |
| --- | --- | --- |
| `docs_build/dev/PROJECT_INSTRUCTIONS.md` | Root instructions for PLAN_PR -> BUILD_PR -> APPLY_PR, required reports, PR completion, ZIP output, and EOD hard stops. | Updated |
| `docs_build/dev/ProjectInstructions/addendums/pr_workflow.md` | Standard PR workflow and sequencing rules. | Updated |
| `docs_build/dev/ProjectInstructions/addendums/team_start_and_release.md` | Team start and release-readiness governance. | Updated |
| `docs_build/dev/ProjectInstructions/addendums/team_release_readiness.md` | Team release-readiness gate. | Updated |
| `docs_build/dev/ProjectInstructions/addendums/branch_context_governance.md` | Branch context, stop conditions, and return-to-main rules. | Updated |
| `docs_build/dev/ProjectInstructions/addendums/branch_lock_governance.md` | Active work branch lock and branch disposition rules. | Updated |
| `docs_build/dev/ProjectInstructions/addendums/multi_team.md` | Multi-team and EOD closeout governance. | Updated |
| `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md` | Active team registry and sequential PR execution rules. | Updated |

## Requirement Checklist
| Requirement | Result | Evidence |
| --- | --- | --- |
| Use main branch only | PASS | `git branch --show-current` returned `main`. |
| Governance docs only | PASS | Changed paths are limited to `docs_build/dev/` governance and report files. |
| No runtime code changes | PASS | No `src/`, `assets/`, `toolbox/`, runtime, or Playwright test files changed. |
| Locate active PR workflow / team release / branch governance docs | PASS | Active files are listed in this report. |
| Add lifecycle states in required order | PASS | Root instructions and PR workflow define `PR Open -> Building -> Validation -> Approved -> Merged -> Main Verified -> Closed`. |
| Define PR Open | PASS | Root and PR workflow define PR Open as the first active lifecycle state after PR/branch identity exists. |
| Block BUILD_PR without PR identity unless PLAN_ONLY | PASS | Root, PR workflow, and branch context governance include the hard stop. |
| Define Closed gates | PASS | Root and PR workflow list merge/no-merge reason, push, main branch, final commit, clean worktree, sync `0/0`, no untracked files, branch disposition, reports, and ZIP. |
| Add previous-PR hard stop | PASS | Root, PR workflow, team start, branch context, branch lock, and team assignment registry now require previous PR Closed unless a stacked PR chain is documented. |
| Add final closeout output | PASS | Root and multi-team closeout require `FINAL REPOSITORY STATE` fields. |
| Preserve PLAN_PR -> BUILD_PR -> APPLY_PR language | PASS | Existing workflow language remains and is clarified as separate from lifecycle status. |
| Create required reports | PASS | This report, `codex_review.diff`, and `codex_changed_files.txt` are created/updated. |
| Create repo-structured ZIP under `tmp/` | PASS | Planned artifact path: `tmp/PR_26175_OWNER_048-pr-open-to-closed-main-return-governance_delta.zip`. |

## Branch Validation
| Check | Result | Evidence |
| --- | --- | --- |
| Current branch is `main` | PASS | Branch command returned `main`. |
| Worktree before edits | PASS | Worktree was clean at start. |
| Local/origin sync before edits | WARN | Local `main` was already ahead of `origin/main` by 1 prior governance commit. |

## Validation Lane Report
| Lane | Result | Evidence |
| --- | --- | --- |
| Docs-only validation | PASS | Path check returned only `docs_build/dev/` changed files. |
| Whitespace validation | PASS | `git diff --check` passed. |
| Playwright impacted | PASS | No; governance docs only. |
| Runtime validation | PASS | Not applicable; no runtime files changed. |

## Manual Validation Notes
| Step | Result | Notes |
| --- | --- | --- |
| Reviewed root workflow language | PASS | PLAN_PR -> BUILD_PR -> APPLY_PR remains preserved and lifecycle gate is additive. |
| Reviewed PR workflow addendum | PASS | Standard flow now begins with PR branch/identity and PR Open before build work. |
| Reviewed team release docs | PASS | Team start/release gates now block new PR starts until previous PR is Closed unless stacked. |
| Reviewed branch governance docs | PASS | Branch context and lock rules now require PR identity, main return before Closed, and branch disposition. |
| Reviewed EOD governance | PASS | Final repository state block and Closed gate are required in closeout. |

## Final Closeout Output Added To Governance
```text
FINAL REPOSITORY STATE:
- Branch
- Worktree
- Local/origin sync
- PR number/name
- PR status
- Merge/final commit
- Branch disposition
- ZIP path
- Closeout PASS/FAIL
```

## Changed Files
| File | Purpose |
| --- | --- |
| `docs_build/dev/PROJECT_INSTRUCTIONS.md` | Adds lifecycle gate, PR Open/Closed definitions, previous-PR hard stop, final-state output, and completion clarification. |
| `docs_build/dev/ProjectInstructions/addendums/pr_workflow.md` | Adds lifecycle states, standard flow updates, and Closed gates. |
| `docs_build/dev/ProjectInstructions/addendums/team_start_and_release.md` | Adds previous-PR Closed check and release/Closed readiness rules. |
| `docs_build/dev/ProjectInstructions/addendums/team_release_readiness.md` | Adds lifecycle, previous-PR, and final closeout readiness requirements. |
| `docs_build/dev/ProjectInstructions/addendums/branch_context_governance.md` | Adds PR identity, previous-PR, and Closed branch context checks. |
| `docs_build/dev/ProjectInstructions/addendums/branch_lock_governance.md` | Adds PR Open/Closed branch lock and disposition rules. |
| `docs_build/dev/ProjectInstructions/addendums/multi_team.md` | Adds final repository state block and EOD Closed gate. |
| `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md` | Adds registry and sequential PR Closed rules. |
| `docs_build/dev/reports/PR_26175_OWNER_048-pr-open-to-closed-main-return-governance.md` | Required PR-specific report. |
| `docs_build/dev/reports/codex_review.diff` | Required review diff artifact. |
| `docs_build/dev/reports/codex_changed_files.txt` | Required changed-files artifact. |

## ZIP
| Artifact | Result |
| --- | --- |
| `tmp/PR_26175_OWNER_048-pr-open-to-closed-main-return-governance_delta.zip` | PASS - repo-structured ZIP created for this run. |
