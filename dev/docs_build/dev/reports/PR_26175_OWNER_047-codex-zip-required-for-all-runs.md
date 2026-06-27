# PR_26175_OWNER_047 Codex ZIP Required For All Runs

## Summary
This governance-only PR clarifies that every completed Codex run must produce a repo-structured ZIP under `tmp/`, including implementation PRs, audit PRs, report-only PRs, validation-only PRs, governance/cleanup runs, and EOD closeouts.

No runtime code changed.

## Located Governance Files
| File | Role | Change |
| --- | --- | --- |
| `docs_build/dev/PROJECT_INSTRUCTIONS.md` | Authoritative root project instructions for Codex outputs, report requirements, ZIP standard, PR completion, and EOD hard stops. | Updated |
| `docs_build/dev/ProjectInstructions/addendums/pr_workflow.md` | PR workflow addendum for standard PR execution rules. | Updated |
| `docs_build/dev/ProjectInstructions/addendums/multi_team.md` | Multi-team and EOD closeout addendum. | Updated |
| `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md` | Index for the append-first Project Instructions operating system. | Reviewed; no output rules to update |
| `docs_build/dev/ProjectInstructions/TEAM_START_COMMANDS.md` | Team start and EOD reminder text. | Reviewed; no output rules to update |

## Requirement Checklist
| Requirement | Result | Evidence |
| --- | --- | --- |
| Use main branch only | PASS | Branch validation confirmed current branch is `main`. |
| Scope governance docs only | PASS | Changed files are governance docs and required reports only. |
| No runtime code changes | PASS | No `src/`, `assets/`, `toolbox/`, or test runtime files changed. |
| Locate active governance files | PASS | Active output rules found in root instructions, PR workflow addendum, and EOD multi-team addendum. |
| Require ZIP for every completed Codex run | PASS | Root instructions now require ZIPs for every completed Codex run. |
| Cover implementation, audit, report-only, validation-only, and EOD runs | PASS | Root instructions and PR/EOD addendums list those run types. |
| ZIP includes changed/preserved repo files | PASS | Root ZIP standard and PR/EOD addendums require inclusion of all changed or preserved repo files. |
| ZIP does not replace reports | PASS | Root instructions and addendums state ZIPs do not replace `docs_build/dev/reports/` files. |
| Existing reports remain required | PASS | Root report rules explicitly preserve `codex_review.diff`, `codex_changed_files.txt`, PR/EOD report, branch validation, requirement checklist, validation lane report, and manual validation notes. |
| No-change runs still produce ZIP | PASS | Root instructions and PR/EOD addendums require a ZIP containing the PR/EOD no-change report unless the run hard-stopped before outputs. |
| Required reports created | PASS | This report, `codex_review.diff`, and `codex_changed_files.txt` were created/updated. |
| Repo-structured ZIP under `tmp/` | PASS | ZIP created at `tmp/PR_26175_OWNER_047-codex-zip-required-for-all-runs_delta.zip`. |

## Branch Validation
| Check | Result | Evidence |
| --- | --- | --- |
| Current branch is `main` | PASS | `git branch --show-current` returned `main`. |
| Branch validation recorded | PASS | This section records PASS/FAIL branch evidence. |

## Validation Lane Report
| Lane | Result | Evidence |
| --- | --- | --- |
| Docs-only validation | PASS | Changed paths are limited to `docs_build/dev/` governance and report files. |
| Playwright impacted | PASS | No; governance docs only. |
| Runtime validation | PASS | Not applicable; no runtime files changed. |

## Manual Validation Notes
| Step | Result | Notes |
| --- | --- | --- |
| Reviewed root output rules | PASS | Confirmed required report and ZIP sections remain present and now apply to all completed Codex runs. |
| Reviewed PR workflow addendum | PASS | Confirmed completed PR runs require `tmp/` ZIP output. |
| Reviewed EOD addendum | PASS | Confirmed EOD reports must include ZIP path and closeouts must produce a ZIP. |
| Verified report preservation rule | PASS | ZIP language states reports remain required under `docs_build/dev/reports/`. |

## Changed Files
| File | Purpose |
| --- | --- |
| `docs_build/dev/PROJECT_INSTRUCTIONS.md` | Clarifies required reports and universal completed-run ZIP output. |
| `docs_build/dev/ProjectInstructions/addendums/pr_workflow.md` | Adds PR workflow ZIP output rule for completed Codex PR runs. |
| `docs_build/dev/ProjectInstructions/addendums/multi_team.md` | Adds EOD ZIP path/report expectations and closeout ZIP rule. |
| `docs_build/dev/reports/PR_26175_OWNER_047-codex-zip-required-for-all-runs.md` | PR-specific report with branch validation, checklist, validation lane, and manual notes. |
| `docs_build/dev/reports/codex_review.diff` | Required review diff artifact. |
| `docs_build/dev/reports/codex_changed_files.txt` | Required changed-files artifact. |

## ZIP
| Artifact | Result |
| --- | --- |
| `tmp/PR_26175_OWNER_047-codex-zip-required-for-all-runs_delta.zip` | PASS - repo-structured ZIP containing changed repo files from this run. |
