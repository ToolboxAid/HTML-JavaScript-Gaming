# BUILD_PR_LEVEL_12_14_RUNTIME_LAUNCH_DIRECTORY_RENAME

## Purpose
Rename misleading `tests/` runtime execution folder to a clearer `launch/` directory for real server execution.

## Problem
`tests/` implies validation-only usage, but these `.mjs` files are actual runtime entry points.

## Solution
Rename:
- samples/phase-13/1319/server/

To:
- samples/phase-13/1319/server/

## File Moves
- samples/phase-13/1319/server/realNetworkServer.mjs → samples/phase-13/1319/server/realNetworkServer.mjs
- samples/phase-13/1319/server/realNetworkDashboard.mjs → samples/phase-13/1319/server/realNetworkDashboard.mjs

## Update References
- all docs
- runbook
- commands
- scripts

## New Canonical Command
node samples/phase-13/1319/server/realNetworkServer.mjs

## Rules
- no logic changes
- no behavior changes
- rename + path updates only

## Validation
- server starts from new path
- sample 1319 connects
- dashboard works
- no references to old tests path

## Acceptance
- launch/ used instead of tests/
- commands intuitive and clear
