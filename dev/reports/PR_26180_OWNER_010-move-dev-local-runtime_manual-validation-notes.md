# PR_26180_OWNER_010 Manual Validation Notes

## Manual Review

- Confirmed `dev/local-runtime/` now owns local bootstrap, team port config, startup diagnostics, and browser launch support.
- Confirmed `dev/scripts/` no longer owns the moved local-runtime entrypoints.
- Confirmed `api/` server application files were not moved.
- Confirmed `www/` browser files were not moved.
- Confirmed package command names remain stable.
- Confirmed no stale active references remain to old `dev/scripts/start-dev.mjs`, `dev/scripts/start-local-api-server.mjs`, `dev/scripts/team-port-config.mjs`, or old `dev/bootstrap` paths.

## Process Notes

- The command smoke harness stopped each npm process after diagnostics printed.
- A remaining listener on `127.0.0.1:5501` was identified as a VS Code utility process, not a leftover validation server.
