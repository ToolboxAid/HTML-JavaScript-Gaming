# PR_26177_OWNER_051-environment-configuration-standards

## Purpose

Define the official Game Foundry Studio environment configuration standards that build on the OWNER_050 environment model.

## Source Of Truth

This `BUILD_PR.md` and the user request are the source of truth for `PR_26177_OWNER_051-environment-configuration-standards`.

## Exact Scope

- Governance/documentation only.
- Build on OWNER_050 environment model.
- Standardize environment file names:
  - `.env.local`
  - `.env.dev`
  - `.env.ist`
  - `.env.uat`
  - `.env.prod`
- Treat `.env.prd` as legacy technical debt only.
- Add `GAMEFOUNDRY_ENVIRONMENT` allowed values:
  - `local`
  - `dev`
  - `ist`
  - `uat`
  - `prod`
- Keep `GAMEFOUNDRY_ENVIRONMENT_LABEL` display-only.
- Document that only `.env` values and environment-managed secrets differ.
- Document that the deployable artifact must remain identical.
- Document one shared API/service contract.
- Document feature flags cannot create permanent environment-specific behavior.
- Review `.env.example` comments/placeholders only.
- Do not change runtime behavior.
- Create required Codex reports under `docs_build/dev/reports/`.
- Create repo-structured delta ZIP under `tmp/`.

## Exact Targets

- `docs_build/dev/BUILD_PR.md`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/ProjectInstructions/README.txt`
- `docs_build/dev/ProjectInstructions/addendums/environment_configuration_standards.md`
- `docs_build/dev/ProjectInstructions/addendums/environment_governance_model.md`
- `docs_build/dev/ProjectInstructions/addendums/release_gate.md`
- `.env.example`
- `docs_build/dev/reports/PR_26177_OWNER_051-environment-configuration-standards.md`
- `docs_build/dev/reports/PR_26177_OWNER_051-environment-configuration-standards_branch-validation.md`
- `docs_build/dev/reports/PR_26177_OWNER_051-environment-configuration-standards_requirement-checklist.md`
- `docs_build/dev/reports/PR_26177_OWNER_051-environment-configuration-standards_validation-lane.md`
- `docs_build/dev/reports/PR_26177_OWNER_051-environment-configuration-standards_manual-validation-notes.md`
- `docs_build/dev/reports/PR_26177_OWNER_051-environment-configuration-standards_instruction-compliance-checklist.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Out Of Scope

- No runtime code changes.
- No UI changes.
- No engine core changes.
- No `start_of_day` folder changes.
- No actual `.env`, `.env.local`, `.env.dev`, `.env.ist`, `.env.uat`, `.env.prod`, or `.env.prd` secret/value file edits.
- No API implementation changes.
- No storage implementation changes.
- No database migration or DDL changes.
- No feature flag implementation changes.

## Validation

Run exactly:

```powershell
git diff --check
```

Playwright is not required unless runtime files change.

## Artifact

Create repo-structured delta ZIP:

```text
tmp/PR_26177_OWNER_051-environment-configuration-standards_delta.zip
```
