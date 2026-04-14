MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_10_23_RESTORE_MASTER_ROADMAP_STATUS_ONLY`.

1. Restore this exact file from git history:
   `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

2. Use the last known good FULL version from repo history.
   - Do NOT reconstruct manually
   - Do NOT use a shortened replacement
   - Do NOT write a fresh roadmap
   - Do NOT accept any restore under 600 lines

3. After restore, apply ONLY status-marker updates.
   Allowed changes:
   - `[ ]`
   - `[x]`
   - `[.]`

4. Forbidden changes:
   - no text rewrites
   - no formatting changes
   - no new sections
   - no deleted sections
   - no line collapsing
   - no summary replacement

5. Validation is REQUIRED:
   - report the git source used for restore
   - report restored line count
   - fail the task if the file is not 600+ lines before status-only edits

6. Final packaging step is REQUIRED:
   - package ALL changed files into this exact repo-structured ZIP:
     `<project folder>/tmp/BUILD_PR_LEVEL_10_23_RESTORE_MASTER_ROADMAP_STATUS_ONLY.zip`

Hard rules:
- exact historical restore
- status-only update after restore
- no unrelated repo changes
- no missing ZIP
