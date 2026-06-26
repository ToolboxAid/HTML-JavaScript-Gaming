# PR_26177_OWNER_007-project-instructions-single-source-eod-lock Requirement Checklist

- PASS: Audited repo for ProjectInstructions / project instructions duplicates.
- PASS: Active source is docs_build/dev/ProjectInstructions/.
- PASS: Legacy docs_build/dev/PROJECT_INSTRUCTIONS.md is marked deprecated.
- PASS: Legacy root project-instructions/ folder is marked deprecated.
- PASS: Legacy root addendums are migrated into the active addendum tree.
- PASS: Active team start/governance docs reference only docs_build/dev/ProjectInstructions/.
- PASS: Added EOD command sequence.
- PASS: Added required EOD output: On branch main, clean worktree, 0 0.
- PASS: Added Next Day Start command sequence.
- PASS: Added team branch creation rule requiring main, clean worktree, 0 0, and matching published EOD SHA.
- PASS: Added START RULE with main clean/synced/EOD SHA gate and no commits on main.
- PASS: Added WORK RULE requiring Codex to remain, commit, and push only on the PR branch.
- PASS: Added hard stops for unexpected branch changes and current branch main before commit.
- PASS: Added END RULE requiring PR branch push, merge to main, main checkout/fetch/pull, clean 0 0 confirmation, and EOD SHA recording.
- PASS: Did not modify start_of_day folders.
- PASS: Did not modify product/runtime files.
- PASS: Did not remove, move, or overwrite legacy SQLite files.
- PASS: Did not start feature work.
