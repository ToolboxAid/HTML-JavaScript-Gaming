# Theme V2 Ownership Validation

Task: PR_26152_022-theme-v2-ownership-rules

Scope:
- GameFoundryStudio governance documentation only.
- No runtime changes.
- No page migrations.
- No CSS, HTML, JavaScript, tool, game, or sample changes.

Changed files:
- `docs/dev/PROJECT_INSTRUCTIONS.md`
- `docs/dev/reports/theme_v2_ownership_validation.md`
- `docs/dev/reports/codex_changed_files.txt`
- `docs/dev/reports/codex_review.diff`
- `docs/dev/commit_comment.txt`

Validation performed:
- Ran `git diff --check -- docs/dev/PROJECT_INSTRUCTIONS.md`.
  - Result: Passed.
  - Note: Git reported a line-ending normalization warning only.
- Ran targeted documentation validation for `docs/dev/PROJECT_INSTRUCTIONS.md`.
  - Verified `Theme V2 File Ownership` exists exactly once.
  - Verified the owned styling root is documented as `GameFoundryStudio/assets/css/theme/v2/`.
  - Verified approved styling surfaces are listed:
    - `theme.css`
    - `colors.css`
    - `controls.css`
    - `typography.css`
    - `spacing.css`
    - `buttons.css`
    - `forms.css`
    - `panels.css`
    - `accordion.css`
    - `status.css`
    - `tables.css`
    - `dialogs.css`
    - `layout.css`
  - Verified ownership rules state that pages and tools consume `theme/v2` and do not define styling.
  - Verified new CSS files outside `theme/v2` are prohibited.
  - Verified styling requests must become reusable `theme/v2` patterns.
  - Verified missing patterns must be documented as design-system gaps.
  - Verified no page-specific styling is allowed unless approved and promoted into `theme/v2`.
  - Verified `Design System Gap Process` exists exactly once.
  - Verified the five-step gap process exists:
    1. Document the gap.
    2. Identify affected pages/tools.
    3. Add reusable `theme/v2` pattern.
    4. Reuse everywhere.
    5. Do not implement locally.

Explicitly not run:
- No repo-wide tests.
- No tests outside GameFoundryStudio.
- No full samples smoke test.
- No runtime tests because this PR is governance-only documentation.

Result: Passed.
