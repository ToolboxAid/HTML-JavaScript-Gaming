# PR_26171_071 Main Merge Conflict Recovery Report

## Scope

Recover `main` from an active merge conflict and unrelated staged work before continuing Message/TTS PRs.

## Instruction Compliance

| Item | Result | Evidence |
| --- | --- | --- |
| Stayed on main | PASS | Recovery ran on `main`; no feature branch was used. |
| Read project instructions | PASS | Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before cleanup. |
| Read multi-team gate | PASS | Read `docs_build/dev/PROJECT_MULTI_PC.txt` before cleanup. |
| Recovery scope exception | PASS | Dirty/merge state was expected and explicitly in scope for this recovery PR. |
| Message/TTS implementation | PASS | No Message/TTS implementation work was performed by this PR. |

## Merge State Found

- Active merge source: `decd37141d09cd8e2ff609da3c25404f1ed6c682` from `origin/main`.
- Conflicted files:

```text
docs_build/dev/reports/codex_changed_files.txt
docs_build/dev/reports/codex_review.diff
```

## Cleanup Actions

1. Saved pre-cleanup status, conflicted file list, untracked file list, and recovery patch artifacts.
2. Preserved local commit `390912b56` with branch `recovery/pr-26171-046-preserve-390912b56`.
3. Ran `git merge --abort` to safely stop the active merge.
4. Confirmed the active merge was removed and unrelated staged PR_26171_044 / PR_26171_067 payload was no longer staged on `main`.
5. Ran `git pull --rebase origin main` to sync latest `origin/main` while replaying the preserved governance commit.
6. Resolved the expected singleton report conflicts during rebase by keeping the preserved PR_26171_046 side, then continued the rebase.
7. Wrote PR_26171_071 recovery evidence reports and delta ZIP.

## Sync Result

- Latest `origin/main` at cleanup time: `decd37141d09cd8e2ff609da3c25404f1ed6c682`.
- Rebased local governance commit on `main`: `7dfb6ea5f14e23f87d556bc7448e35cd95866d48`.
- Current status before final recovery commit:

```text
## main...origin/main [ahead 1]
?? docs_build/dev/reports/PR_26171_071-conflicted-files-before-cleanup.txt
?? docs_build/dev/reports/PR_26171_071-recovery-precleanup.patch.md
?? docs_build/dev/reports/PR_26171_071-status-before-cleanup.txt
?? docs_build/dev/reports/PR_26171_071-untracked-files-before-cleanup.txt
```

## Validation

Validation commands required by this PR are recorded in `PR_26171_071-manual-validation-notes.md`.

## ZIP Evidence

- ZIP path: `tmp/PR_26171_071-main-merge-conflict-recovery_delta.zip`.
- ZIP contents:
  - docs_build/dev/reports/codex_review.diff
  - docs_build/dev/reports/codex_changed_files.txt
  - docs_build/dev/reports/PR_26171_071-merge-conflict-recovery-report.md
  - docs_build/dev/reports/PR_26171_071-preserved-local-commit-report.md
  - docs_build/dev/reports/PR_26171_071-discarded-unrelated-work-report.md
  - docs_build/dev/reports/PR_26171_071-manual-validation-notes.md
  - docs_build/dev/reports/PR_26171_071-recovery-precleanup.patch.md
  - docs_build/dev/reports/PR_26171_071-status-before-cleanup.txt
  - docs_build/dev/reports/PR_26171_071-conflicted-files-before-cleanup.txt
  - docs_build/dev/reports/PR_26171_071-untracked-files-before-cleanup.txt
