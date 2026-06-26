# PR_26177_OWNER_050-environment-governance-model

## Purpose

Establish the official Game Foundry Studio environment governance model and align the active configuration example comments/placeholders with that model.

## Source Of Truth

This `BUILD_PR.md` and the user request are the source of truth for `PR_26177_OWNER_050-environment-governance-model`.

## Exact Scope

- Documentation/governance only unless `.env.example` comment or placeholder updates are required.
- Establish `Local (VS Code) -> DEV -> IST -> UAT -> PROD` as the official environment model.
- Define the environment invariance rule: the deployable artifact is identical across all environments; only `.env` values and environment-managed secret values differ.
- Define one shared API/service contract across all environments.
- Define Supabase Auth, Supabase Postgres, and Cloudflare R2 as required for every environment.
- Define R2 top-level prefixes:
  - `/local/`
  - `/dev/`
  - `/ist/`
  - `/uat/`
  - `/prod/`
- Define that all environments receive approved guest seed data for all tools.
- State SQLite is deprecated/retired and is not an active runtime database.
- Review `.env.example` and update comments/placeholders to match the official model.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/BUILD_PR.md`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/README.txt`
- `docs_build/dev/ProjectInstructions/addendums/environment_governance_model.md`
- `docs_build/dev/ProjectInstructions/addendums/postgres_only.md`
- `docs_build/dev/ProjectInstructions/addendums/release_gate.md`
- `docs_build/dev/admin-notes/index.txt`
- `.env.example`
- `docs_build/dev/reports/PR_26177_OWNER_050-environment-governance-model.md`
- `docs_build/dev/reports/PR_26177_OWNER_050-environment-governance-model_branch-validation.md`
- `docs_build/dev/reports/PR_26177_OWNER_050-environment-governance-model_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_OWNER_050-environment-governance-model_validation-lane.md`
- `docs_build/dev/reports/PR_26177_OWNER_050-environment-governance-model_manual-validation-notes.md`
- `docs_build/dev/reports/PR_26177_OWNER_050-environment-governance-model_instruction-compliance-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No runtime code changes.
- No UI changes.
- No engine core changes.
- No `start_of_day` folder changes.
- No `.env`, `.env.dev`, `.env.ist`, `.env.uat`, or `.env.prd` secret/value edits.
- No API implementation changes.
- No storage implementation changes.
- No database migration or DDL changes.

## Validation

Run exactly:

```powershell
git diff --check
```

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_OWNER_050-environment-governance-model_delta.zip
```
