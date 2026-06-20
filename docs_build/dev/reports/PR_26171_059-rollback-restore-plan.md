# PR_26171_059 Rollback Restore Plan

## Purpose

Commit the clean recovery state from latest `main` and document the work that must be restored after rollback.

This PR is documentation-only. It does not reapply implementation work, does not reuse the disconnected PC branch, and does not cherry-pick broad contaminated history.

## Baseline Evidence

- Verified starting branch: `main`.
- Removed leftover local-only PR_26171_057 report artifacts before branching.
- Pulled latest `origin/main` with a fast-forward update.
- Recovery baseline commit used for this PR branch: `20fd280c608917b960b3080484a5d28c51990ccb`.
- Created scoped branch: `pr/26171-059-rollback-restore-plan`.
- No runtime, toolbox, engine, API, or test implementation files are changed by this PR.

## Restore List After Rollback

1. Local API sign-in recovery
   - Inspect the sign-in page and its external JavaScript first.
   - Remove preview-disabled sign-in behavior.
   - Use the configured API URL instead of hardcoded preview-disabled behavior.
   - Submit email and password to the Local API session auth endpoint used by `npm run dev:local-api`.
   - On valid DEV credentials, create a Local API session and redirect to the expected signed-in destination.
   - On invalid credentials, show a visible actionable error.
   - Keep Continue Browsing for guest browsing.
   - Do not create fake login.
   - Do not use browser-owned auth as the source of truth.
   - Do not create custom password tables.
   - Do not change Create Account or Password Reset beyond keeping placeholders safe.

2. Env diagnostics and runtime ports
   - Print all env keys one per row.
   - Mask secrets.
   - Print the active site, API, and database ports.

3. Toolbox image restoration
   - Restore valid toolbox images.
   - Remove excessive `image-missing.svg` fallbacks.
   - Keep image restoration scoped to real existing assets or approved replacements.

4. Text To Speech engine/audio rebuild
   - Use `old_text2speech-V2` as the functionality sample.
   - Move reusable Text To Speech engine code to `src/engine/audio/`.
   - Make `toolbox/text-to-speech/` consume the reusable engine module.
   - Restore old controls, options, and features from the working sample.
   - Do not use the wrong `tools/text2speech/` path.
   - Do not ship placeholder Text To Speech shell work that does not restore functionality.

5. Game Journey table correction
   - Add row under the table.
   - Support inline edit row behavior.
   - Treat Note Tree as a subtable.
   - Show metadata in table columns.
   - Ensure system notes cannot be deleted.

6. Game Journey post-rollback verification
   - Confirm friendly descriptions.
   - Confirm dashboard, targets, and insights only if those surfaces are still present on clean `main`.
   - Reapply missing approved Journey work only from clean `main`.

## Reapply Rules

- Every reapply PR starts from clean `main`.
- Every reapply PR gets its own branch.
- Every reapply PR is scoped to one approved purpose.
- Do not reuse the disconnected branch.
- Do not merge the disconnected branch.
- Do not cherry-pick broad PC commits.
- Prefer file-level or diff-level reapplication for approved scoped changes.
- Exclude wrong-path work such as `tools/text2speech/`.
- Exclude placeholder Text To Speech shell work.
- Exclude unrelated report churn.
- Run targeted validation only after each reapply PR implements its scoped change.

## Approved Reapply Order

1. Local API sign-in recovery.
2. Env diagnostics and runtime ports.
3. Toolbox image restoration.
4. Text To Speech engine/audio rebuild from the old working Text To Speech sample.
5. Game Journey table corrections if still missing.
6. Game Journey post-rollback verification and approved follow-up only if still needed.

## Discarded Contaminated Work

- Disconnected PC branch history.
- Broad cherry-picks from contaminated commits.
- Wrong-path `tools/text2speech/` work.
- Placeholder Text To Speech shell work.
- Unrelated report churn.
- Any implementation work not revalidated from clean `main`.

## Validation Boundary

This PR is limited to docs/static validation. It intentionally does not run Local API sign-in validation, Text To Speech runtime validation, toolbox image runtime validation, or Project Workspace validation because implementation reapply is out of scope for PR_26171_059.
