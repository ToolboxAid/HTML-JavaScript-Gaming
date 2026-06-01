# Theme V2 Governance Validation

Task: PR_26152_021-theme-v2-css-governance

Scope:
- Governance documentation only.
- No GameFoundryStudio page migration.
- No runtime, CSS, HTML, or JavaScript behavior changes.

Changed files:
- `docs/dev/PROJECT_INSTRUCTIONS.md`
- `docs/dev/reports/theme_v2_governance_validation.md`
- `docs/dev/reports/codex_changed_files.txt`
- `docs/dev/reports/codex_review.diff`
- `docs/dev/commit_comment.txt`

Validation performed:
- Ran `git diff --check -- docs/dev/PROJECT_INSTRUCTIONS.md`.
  - Result: Passed.
  - Note: Git reported a line-ending normalization warning only.
- Ran targeted documentation validation for `docs/dev/PROJECT_INSTRUCTIONS.md`.
  - Verified the Theme V2 Governance section exists exactly once.
  - Verified `theme/v2` is documented as the only approved styling surface for new GameFoundryStudio work.
  - Verified deprecated CSS is documented as compatibility-only.
  - Verified no page-local CSS and no tool-local CSS rules exist.
  - Verified inline style, `<style>` block, JavaScript-generated styling, hardcoded values, duplicate styling, and deprecated selector copy/paste restrictions exist.
  - Verified allowed Theme V2 token, component, class toggling, deprecated CSS removal, and consolidation guidance exists.
  - Verified exception documentation requires file, reason, and follow-up plan.
  - Verified migration order exists:
    1. Home
    2. Company pages
    3. Admin pages
    4. Account pages
    5. Tools index
    6. Tool families
    7. Games
    8. Samples

Explicitly not run:
- No repo-wide tests.
- No tests outside GameFoundryStudio.
- No full samples smoke test.
- No runtime tests because this PR is governance-only documentation.

Result: Passed.
