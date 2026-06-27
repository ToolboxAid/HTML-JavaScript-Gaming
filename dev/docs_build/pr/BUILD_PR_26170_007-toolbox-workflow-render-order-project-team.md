# BUILD PR_26170_007-toolbox-workflow-render-order-project-team

## Purpose
- Fix Toolbox grouped rendering so workflow groups and tiles render in declared creator workflow/source order instead of alphabetical label order.
- Move the existing Users/Team toolbox tile into Create as Project Team.

## Scope
- Update Toolbox grouped renderer ordering logic.
- Update directly required toolbox metadata and Project Team page copy.
- Update targeted Toolbox Playwright expectations.
- Do not change database behavior, persistence behavior, route behavior, auth behavior, Account/Admin Users pages, or full samples.

## Required Behavior
- Toolbox groups render by declared workflow order/source order.
- Create group renders:
  1. Game Workspace
  2. Project Team
  3. Game Configuration
  4. Tags
- Existing Users/Team toolbox tile renders as Project Team under Create.
- Project-specific user/team copy uses Project Team.
- Studio Team remains account-level roster documentation only.

## Validation
- Verify branch is `main`.
- Run targeted Toolbox static/syntax checks.
- Run targeted Toolbox Playwright validation.
- Do not run full samples.

## Required Artifacts
- `docs_build/dev/reports/PR_26170_007-toolbox-workflow-render-order-project-team.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26170_007-toolbox-workflow-render-order-project-team_delta.zip`
