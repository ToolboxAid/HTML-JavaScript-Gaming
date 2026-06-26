# PR_26177_OWNER_007-project-instructions-single-source-eod-lock

Date: 2026-06-26
Branch: PR_26177_OWNER_007-project-instructions-single-source-eod-lock
Scope: Project Instructions single-source governance, EOD main lock, branch lifecycle governance, and docs_build/dev root cleanup
Status: PASS

## Summary

- Established docs_build/dev/ProjectInstructions/ as the only active Project Instructions source.
- Added canonical Branch Lifecycle governance: START, WORK, END.
- Documented START, WORK, END branch lifecycle and mandatory hard stops.
- Deleted duplicate active instruction files from docs_build/dev root.
- Deleted stale one-off PR/restart files listed by OWNER review from docs_build/dev root.
- Added docs_build/dev/pr/ and moved PR-specific root docs there, including this PR's PLAN_PR.md and BUILD_PR.md.
- Moved active governance/contract root docs into docs_build/dev/ProjectInstructions/addendums/.
- Moved audit outputs into docs_build/dev/reports/audits/.
- Deleted stale one-off bundle metadata from docs_build/dev root.
- Corrected project-instructions/** scope so the PR only adds a tiny deprecated pointer README there.
- Preserved project-instructions/addendums/** unchanged in the PR; unique current governance content is carried by docs_build/dev/ProjectInstructions/addendums/.
- Confirmed docs_build/dev root no longer contains active loose instruction, audit, contract, or PR files.
- No product/runtime, start_of_day, feature, or legacy SQLite file changes were made.

## Moved To ProjectInstructions SSoT

- docs_build/dev/workspace_v2_playwright_gate.md -> docs_build/dev/ProjectInstructions/addendums/workspace_v2_playwright_gate.md
- docs_build/dev/samples2tools_adapter_guidance.md -> docs_build/dev/ProjectInstructions/addendums/samples2tools_adapter_guidance.md
- docs_build/dev/koti_layout_contract.md -> docs_build/dev/ProjectInstructions/addendums/koti_layout_contract.md

## Moved To PR Folder

- docs_build/dev/PLAN_PR.md -> docs_build/dev/pr/PLAN_PR.md
- docs_build/dev/BUILD_PR.md -> docs_build/dev/pr/BUILD_PR.md
- docs_build/dev/plan_pr_tool_workspace_manifest_boundaries.md -> docs_build/dev/pr/plan_pr_tool_workspace_manifest_boundaries.md
- docs_build/dev/pr_*.md -> docs_build/dev/pr/pr_*.md

## Moved To Audit Reports

- docs_build/dev/security-audit.md -> docs_build/dev/reports/audits/security-audit.md
- docs_build/dev/component-audit.md -> docs_build/dev/reports/audits/component-audit.md
- docs_build/dev/css-audit.md -> docs_build/dev/reports/audits/css-audit.md

## Deleted Root Files

Deleted duplicate active instruction files:
- docs_build/dev/PROJECT_INSTRUCTIONS.md
- docs_build/dev/PROJECT_MULTI_PC.txt

Deleted stale one-off root files:
- docs_build/dev/BUILD_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md
- docs_build/dev/PLAN_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md
- docs_build/dev/codex_commands.md
- docs_build/dev/codex_rules.md
- docs_build/dev/commit_comment.txt
- docs_build/dev/next_command.txt (local untracked/ignored stale file, removed from disk)
- docs_build/dev/NEXT_RESTART.md
- docs_build/dev/restart_notes_11_105.md
- docs_build/dev/restart_notes_11_110.md
- docs_build/dev/restart_notes_11_111.md
- docs_build/dev/restart_notes_11_112.md
- docs_build/dev/restart_notes_11_116.md
- docs_build/dev/restart_notes_11_118.md
- docs_build/dev/restart_notes_11_119.md
- docs_build/dev/restart_notes_11_120.md
- docs_build/dev/restart_notes_11_121.md
- docs_build/dev/restart_notes_11_122.md
- docs_build/dev/restart_notes_11_123.md
- docs_build/dev/bundle_readme.md
- docs_build/dev/validation_checklist.txt

## Ambiguous Old Docs Handling

- Reviewed loose root docs before moving or deleting them.
- Moved active/contract content into docs_build/dev/ProjectInstructions/addendums/.
- Moved one-off PR docs into docs_build/dev/pr/ instead of deleting them by filename.
- Moved audit outputs into docs_build/dev/reports/audits/.
- Removed project-instructions/addendums/** edits from the PR so old files remain historical reference, not a second active source.
- Added only project-instructions/README.md as a tiny deprecated pointer to docs_build/dev/ProjectInstructions/.

## Validation

- PASS: current branch is PR_26177_OWNER_007-project-instructions-single-source-eod-lock.
- PASS: docs_build/dev root file list is empty after cleanup.
- PASS: targeted path checks confirm duplicate root instruction files, moved root files, and listed stale one-off files are absent.
- PASS: project-instructions/** PR diff is limited to project-instructions/README.md.
- PASS: active moved governance/contract docs are indexed in docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md and README.txt.
- PASS: targeted grep found no active duplicate ProjectInstructions source-of-truth claim outside the active source.
- PASS: targeted grep confirmed canonical lifecycle language appears in active governance docs.
- PASS: product/runtime and start_of_day changed-file check returned no files.
- PASS: git diff --check.
- PASS: Playwright not run because this PR changes documentation/governance only.

## Artifact

- tmp/PR_26177_OWNER_007-project-instructions-single-source-eod-lock_delta.zip
