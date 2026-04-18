# BUILD_PR_LEVEL_12_13_SAMPLE_1319_ROOT_TESTS_AND_PS_RUNBOOK

## Purpose
Normalize sample 1319 runtime test placement by moving executable `.mjs` files from the sample-local tests folder to repo-level `tests/`, and add a step-by-step PowerShell runbook for launching and validating sample 1319 from terminal.

## One PR Purpose Only
1319 runtime test relocation + PowerShell runbook only.

## Current Confirmed Layout
```text
samples/phase-13/1319/
  index.html
  main.js
  game/
    RealNetworkLaunchScene.js
  server/
    docker-compose.yml
    README.md
  tests/
    realNetworkDashboard.mjs
    realNetworkServer.mjs
```

## Required Fix

### A. Move Executable Runtime Files To Repo-Level tests/
Move:
- `samples/phase-13/1319/server/realNetworkServer.mjs`
- `samples/phase-13/1319/server/realNetworkDashboard.mjs`

To repo-level tests home:
- `samples/phase-13/1319/server/realNetworkServer.mjs`
- `samples/phase-13/1319/server/realNetworkDashboard.mjs`

### B. Keep Sample Folder Clean
After relocation:
- `samples/phase-13/1319/server/` keeps config/docs only
- sample-local tests folder should no longer contain executable runtime `.mjs` files
- remove the sample-local tests folder if empty after move

### C. Update All References
Update all affected references, including:
- sample 1319 docs/readme
- docker or launch references if needed
- any validation scripts or helper docs
- any launcher/admin links that mention old sample-local test paths

## Required Documentation Deliverable
Add a step-by-step PowerShell runbook document for 1319.

### Required path
One of these repo docs locations is acceptable, prefer the first:
- `docs/pr/NETWORK_SAMPLE_1319_POWERSHELL_RUNBOOK.md`
or
- `samples/phase-13/1319/server/NETWORK_SAMPLE_1319_POWERSHELL_RUNBOOK.md`

Use the repo docs-first workflow and keep the runbook easy to follow.

## Required Runbook Content
The PowerShell runbook must include:

### 1. Start the real server from repo root
Use repo-level test path, not sample-local tests path.
Example target command shape:
- `node samples/phase-13/1319/server/realNetworkServer.mjs`

### 2. Start a local static file host for samples
From repo root using PowerShell-friendly steps.
Example:
- `python -m http.server 8080`

### 3. Open sample launcher
- `http://127.0.0.1:8080/samples/index.html`

### 4. Open sample 1319 directly
- `http://127.0.0.1:8080/samples/phase-13/1319/index.html`

### 5. Open dashboard
Document the dashboard URL backed by the real runtime.

### 6. Validation steps
Step-by-step user actions:
- start server
- open client 1
- open client 2
- verify connect/session
- verify authoritative updates
- disconnect/reconnect one client
- verify dashboard player/session/RTT/RX/TX updates

### 7. Docker section
Keep docker-compose under:
- `samples/phase-13/1319/server/docker-compose.yml`

Document PowerShell commands for:
- up --build
- down

### 8. Focused validation commands
Document terminal commands from repo root for validation checks using the corrected repo-level runtime paths where needed.

## Important Path Correction
The old command:
- `node samples/phase-13/1319/server/realNetworkServer.mjs`

must be replaced with the new repo-level path.

## Scope Rules
- no logic changes unless strictly required for moved path resolution
- no runtime behavior changes
- no feature expansion
- no 3D work
- no broad sample cleanup beyond this relocation/documentation slice

## Validation Requirements

### Path Validation
- no remaining references to sample-local runtime `.mjs` paths
- repo-level test paths resolve correctly

### Runtime Validation
- `node samples/phase-13/1319/server/realNetworkServer.mjs` starts successfully
- sample 1319 still connects correctly
- dashboard still loads and updates

### Regression Validation
- `samples/index.html` still launches 1319
- no breakage to other samples from path/documentation changes

## Roadmap Rule
Update:
`docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`

Allowed:
- status markers only: `[ ]` `[.]` `[x]`

Forbidden:
- wording edits
- structure edits
- additions
- deletions

## Acceptance Criteria
- executable `.mjs` files moved to repo-level `tests/`
- all references updated
- PowerShell runbook added
- sample 1319 still launches from `samples/index.html`
- server and dashboard still run correctly
- roadmap updated by marker only if execution-backed validation passes
