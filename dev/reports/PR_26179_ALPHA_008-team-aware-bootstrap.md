# PR_26179_ALPHA_008-team-aware-bootstrap

## Purpose

Implement team-aware local bootstrap commands using the new `dev/bootstrap/` structure.

## Summary

- Added `npm run dev:bootstrap` as the primary local bootstrap command.
- Kept `npm run dev:local-api` as a legacy API-only alias through the new bootstrap orchestrator.
- Added `npm run dev:api` and `npm run dev:web` startup commands.
- Added `dev/bootstrap/start-dev.mjs` to load `.env`, resolve team ports, print diagnostics, start requested API/web processes, and optionally launch a browser.
- Added `dev/bootstrap/team-port-config.mjs` with owner/default, alpha, bravo, charlie, gamma, and beta port mappings.
- Added targeted tests for team mapping, unknown team validation, CLI modes, environment loading, diagnostics, and package scripts.
- Updated canonical Project Instructions state/structure docs so `dev/bootstrap/` is an approved development workspace folder.

## Scope Boundary

- No production pages changed.
- No API/database contract changes.
- No browser storage changes.
- Existing local API runtime server behavior is preserved; the new bootstrap orchestrator passes selected local ports through environment variables before startup.

## Branch Validation

PASS - Branch `PR_26179_ALPHA_008-team-aware-bootstrap` created from clean synced `main`.

## Manual Validation Notes

Manual startup was not left running. CLI behavior is covered by targeted Node tests and syntax checks. Optional browser launch is implemented through `--open` and defaults to disabled.
