# PR_26177_OWNER_050-environment-governance-model Requirement Checklist

- [x] Establish `Local (VS Code) -> DEV -> IST -> UAT -> PROD` as the official environment model.
- [x] Define the environment invariance rule.
- [x] State the deployable artifact is identical across all environments.
- [x] State only `.env` values and environment-managed secret values differ.
- [x] Define one shared API/service contract across all environments.
- [x] Define Supabase Auth as required for every environment.
- [x] Define Postgres as required for every environment.
- [x] Define Cloudflare R2 as required for every environment.
- [x] Define R2 top-level prefix `/local/`.
- [x] Define R2 top-level prefix `/dev/`.
- [x] Define R2 top-level prefix `/ist/`.
- [x] Define R2 top-level prefix `/uat/`.
- [x] Define R2 top-level prefix `/prod/`.
- [x] Document that all environments receive approved guest seed data for all tools.
- [x] State SQLite is deprecated/retired.
- [x] State SQLite is not an active runtime database.
- [x] Review `.env.example`.
- [x] Update `.env.example` comments/placeholders to match the official model.
- [x] Keep scope documentation/governance only except `.env.example` comments/placeholders.
- [x] Make no runtime code changes.
- [x] Make no UI changes.
- [x] Make no engine core changes.
- [x] Make no `start_of_day` folder changes.
- [x] Do not run Playwright because no runtime files changed.
- [x] Produce PR-specific report.
- [x] Produce branch validation report.
- [x] Produce validation lane report.
- [x] Produce manual validation notes.
- [x] Produce instruction compliance checklist.
- [x] Produce `codex_review.diff`.
- [x] Produce `codex_changed_files.txt`.
- [x] Produce repo-structured ZIP under `tmp/`.
- [x] Resolve merge conflicts against `origin/main` only.
- [x] Preserve OWNER_050 environment governance decisions after conflict resolution.
- [x] Refresh repo-structured ZIP after conflict resolution.

## Result

PASS
