# PLAN PR_26175_OWNER_052-project-work-inventory

Source of truth: user request `PLAN_PR PR_26175_OWNER_052-project-work-inventory`.

## Purpose
Create a permanent all-team Project Work Inventory.

## Scope
Primary target files:
- `docs_build/dev/reports/PR_26175_OWNER_052-project-work-inventory.md`
- `docs_build/pr/PLAN_PR_26175_OWNER_052-project-work-inventory.md`
- `docs_build/dev/reports/PR_26175_OWNER_052-project-work-inventory_branch-validation.md`
- `docs_build/dev/reports/PR_26175_OWNER_052-project-work-inventory_requirement-checklist.md`
- `docs_build/dev/reports/PR_26175_OWNER_052-project-work-inventory_validation-lane.md`
- `docs_build/dev/reports/PR_26175_OWNER_052-project-work-inventory_manual-validation-notes.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

Input files:
- `docs_build/dev/reports/PR_26175_OWNER_all-pr-outstanding-audit.md`
- `tmp/local_branches.txt`
- `tmp/local_not_merged.txt`
- `tmp/remote_branches.txt`
- `tmp/remote_not_merged.txt`
- `tmp/pr_audit_all.json`
- `tmp/stash_list.txt`
- `tmp/stash0_files.txt`
- `tmp/main_verify_head.txt`
- `tmp/main_verify_status.txt`
- `tmp/main_verify_sync.txt`

## Required Changes
- Group all work by PRE-TEAM, MASTER, OWNER, ALFA, ALPHA, BETA, BRAVO, CHARLIE, DELTA, GAMMA (Retired), GOLF, and UNKNOWN.
- Classify every PR, branch, and stash item by status.
- Provide team, PR number where available, branch/stash name, status, incomplete reason, and recommendation for every incomplete or non-complete item.
- Preserve the work as documentation/report-only.

## Validation
Run only:
- `git status --short --branch`
- `git rev-list --left-right --count origin/main...HEAD`
- `git diff --name-only`
- `git diff --check`
- Targeted report section checks for all required team headings and guardrail notes.

## Non-goals
- Do not delete branches.
- Do not close PRs.
- Do not modify product files.
- Do not alter stashes.
- Do not create feature work.
