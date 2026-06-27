# PR_26172_OWNER_032-github-hygiene-audit-template

## Scope

Add GitHub hygiene audit template/process for recommendation-only cleanup review.

## Team Ownership

- TEAM token: OWNER
- Ownership classification: governance / workflow governance
- TEAM ownership result: PASS

## Files Changed

- docs_build/dev/PROJECT_INSTRUCTIONS.md
- docs_build/dev/ProjectInstructions/addendums/multi_team.md
- docs_build/dev/reports/codex_changed_files.txt
- docs_build/dev/reports/codex_review.diff
- docs_build/dev/reports/PR_26172_OWNER_032-github-hygiene-audit-template.md
- docs_build/dev/reports/PR_26172_OWNER_032-github-hygiene-audit-template-manual-validation-notes.md
- docs_build/dev/reports/PR_26172_OWNER_032-github-hygiene-audit-template-instruction-compliance-checklist.md

## Change Summary

- Added GitHub Hygiene Audit governance to require an audit-only first pass.
- Defined audit targets for open PRs, draft PRs, merged PR branches, stale remote branches, and stale local branches.
- Added recommendation values: keep, close, delete local, delete remote, defer.
- Prohibited branch deletion and PR closure without explicit owner approval.
- Added command expectations and required cleanup audit report fields.

## Validation

- git diff --check: PASS
- Verified GitHub Hygiene Audit governance exists: PASS
- Verified audit targets and recommendation values exist: PASS
- Verified no branch deletion or PR closing without owner approval: PASS
- Verified no conflicting governance wording: PASS
- Verified EOD closeout remains authoritative: PASS

## Skipped Lanes

- Playwright: skipped because this is docs/governance-only.
- Samples: skipped because no runtime, sample, or UI files changed.
