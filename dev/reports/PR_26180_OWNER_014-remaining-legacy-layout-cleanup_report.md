# PR_26180_OWNER_014 Remaining Legacy Layout Cleanup Report

## Executive Summary

PR_26180_OWNER_014 audits the remaining tracked repository layout after the `www/`, `api/`, and `dev/` migration stack. The only tracked browser-served root file found in scope was `favicon.svg`, which is now under `www/favicon.svg` while public references remain `/favicon.svg`.

The PR also documents environment file placement policy: local `.env` files remain user/environment-owned at the repository root and are never deployed; production uses deployment-managed environment variables/secrets; `www/` must not contain secrets; `api/` reads environment values from `process.env` and the deployment environment.

## Scope Decision

- Browser-served favicon moved from repository root to `www/`.
- Public favicon URL `/favicon.svg` preserved.
- `src/` retained as an active transition namespace because tracked browser, API, dev tooling, and tests still import from it.
- No `.env` files moved into `www/` or `api/`.
- No runtime/API/UI/database behavior changed.

## Root Audit

Tracked root entries are limited to standard repository metadata/config plus `api/`, `dev/`, `src/`, and `www/`. Ignored local folders/files such as local `.env*`, generated workspace outputs, and dependency folders are not part of this PR and were not staged.

Additional standard root files retained as repository configuration/history:

- `.codex/`
- `.gitattributes`
- `.githooks/`
- `.gitignore`
- `AGENTS.md`
- `LICENSE`

## src/ Audit

`src/` is not empty and remains referenced by current `www/`, `api/`, `dev/tests/`, and `dev/tools/` surfaces. Current Project Instructions document `src/advanced`, `src/api`, `src/engine`, `src/shared`, `src/tools`, and `src/dev-runtime/admin` as legacy transition buckets pending explicit follow-up migration. This PR does not move or delete `src/`.

## File Evidence

- `www/favicon.svg`: browser-served favicon location after the move.
- `dev/tests/dev-runtime/StaticWebRootCompatibility.test.mjs`: verifies `/favicon.svg` resolves to `www/favicon.svg`.
- `dev/scripts/PS/deploy/WebsiteRepoDeploymentCommon.ps1`: deployment include list now references `www/favicon.svg`.
- `dev/build/ProjectInstructions/repository/canonical_repository_structure.md`: documents root `.env`, `www/`, and `api/` environment ownership.
- `dev/build/ProjectInstructions/addendums/environment_configuration_standards.md`: adds the runtime placement policy for environment values.

## Remaining Technical Debt

The PowerShell deployment helper still contains broader legacy include defaults such as root `index.html`, `games`, `samples`, `src`, and `tools`. This PR updates only the tracked favicon path because changing the broader deploy staging semantics would be a separate deployment-layout PR.

## Owner Recommendation

Keep this PR focused as the remaining legacy layout cleanup pass. Follow with the final layout validation PR after stacked dependencies land.
