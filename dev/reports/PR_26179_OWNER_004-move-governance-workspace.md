# PR_26179_OWNER_004-move-governance-workspace

Status: PASS
Team: OWNER
Branch: PR_26179_OWNER_004-move-governance-workspace
Base branch: PR_26179_OWNER_003-dev-root-shell
Scope: Governance workspace path move plus path-reference updates required by the move
Updated: 2026-06-27 14:45:52

## Purpose

Move the non-deployable governance workspace under `dev/` while keeping production/public sections at repository root.

## Changes

- Moved tracked `docs_build/` content to `dev/build/`.
- Moved tracked `archive/` content to `dev/archive/`.
- Moved root `project-instructions/` to `dev/project-instructions/` as deprecated reference only.
- Updated active Project Instructions, PR workflow references, package scripts, validation scripts, and tests to use moved `dev/build/...` and `dev/archive/...` paths.
- Updated dev-runtime Admin Notes paths to the existing moved archive source at `dev/archive/docs_build/dev/admin-notes/`.
- Updated dev-only toolbox imports and guard baselines so moved validation scripts resolve from `dev/build/dev/toolbox/`.
- Updated database seed, package-decision, report-writer, and asset-ownership validation paths to the moved governance workspace.
- Preserved root `docs/`, `games/`, and `toolbox/` ownership.

## Scope Confirmation

- `docs/` remains root production Docs & Help.
- `games/` remains root public game discovery.
- `toolbox/` remains root Creator toolbox/workspace.
- No Creator-writeable repo folder was introduced.
- No runtime/business logic was moved into `dev/`.
- `src/dev-runtime` changes are path-reference updates to keep dev-only Admin Notes, guest seed, and package-decision reads resolving after the workspace move.
- No product runtime, API contract, database schema, or Creator data ownership behavior was changed.

## Validation Summary

- Branch validation: PASS, current branch is `PR_26179_OWNER_004-move-governance-workspace`.
- Root tracked workspace check: PASS, 0 tracked files remain under root `docs_build/`, `archive/`, or `project-instructions/`.
- Root directory presence check: PASS, root `docs_build/`, `archive/`, and `project-instructions/` are absent.
- Moved destination check: PASS, `dev/build/`, `dev/archive/`, and `dev/project-instructions/` exist.
- Old-root active reference search: PASS for moved `docs_build/dev`, `docs_build/database`, `docs_build/codex`, and Admin Notes paths in touched active files.
- `node -e "JSON.parse(...)"` for `package.json`: PASS.
- `node --check` on changed JS/MJS files: PASS.
- `python -m py_compile scripts/engine_usage_audit.py`: PASS.
- `node --test tests/dev-runtime/AdminNotesBoundary.test.mjs tests/tools/DevConsoleIntegration.test.mjs`: PASS, 9 tests passed.
- `node dev/build/dev/toolbox/checkSharedExtractionGuard.selftest.mjs`: PASS.
- `npm run check:shared-extraction-guard`: PASS against refreshed moved-path baseline, 761 existing baseline violations tracked.
- `node dev/build/dev/toolbox/checkDocsStructureGuard.mjs`: PASS.
- `node dev/build/dev/toolbox/checkPhase24CloseoutExecutionGuard.mjs`: PASS.
- `node scripts/validate-asset-ownership-strategy.mjs`: PASS.
- `git diff --check HEAD -- .`: PASS.
- Playwright: Not run as a full lane; no UI/runtime behavior was intentionally changed. Path expectation tests were updated and targeted node tests passed.

## Non-Gating Observations

- `node dev/build/dev/toolbox/checkIntentionalAliasLedgerGuard.mjs` still reports pre-existing alias ledger debt unrelated to this path move.
- `node dev/build/dev/toolbox/checkInternalBarrelGuard.mjs` still reports pre-existing barrel policy debt unrelated to this path move.

## ZIP

Repo-structured ZIP: `tmp/PR_26179_OWNER_004-move-governance-workspace_delta.zip`
