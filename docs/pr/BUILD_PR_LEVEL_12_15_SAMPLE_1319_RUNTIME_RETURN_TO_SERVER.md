# BUILD_PR_LEVEL_12_15_SAMPLE_1319_RUNTIME_RETURN_TO_SERVER

## Purpose
Return sample 1319 runtime entry points to the correct sample-local server home:
- `samples/phase-13/1319/server/`

## One PR Purpose Only
Path correction for sample 1319 runtime files only.

## Problem
The prior rename moved executable runtime files to:
- `samples/phase-13/1319/server/`

That is the wrong location for this sample.
Sample 1319 should remain self-contained, with its runtime entry points under:
- `samples/phase-13/1319/server/`

## Required Fix

### Move Files
From:
- `samples/phase-13/1319/server/realNetworkServer.mjs`
- `samples/phase-13/1319/server/realNetworkDashboard.mjs`

To:
- `samples/phase-13/1319/server/realNetworkServer.mjs`
- `samples/phase-13/1319/server/realNetworkDashboard.mjs`

### Remove Wrong Location
After validating the new paths, remove:
- `samples/phase-13/1319/server/`

if it is empty and no longer needed.

## Update References
Update all references to the corrected server-local paths, including:
- `samples/phase-13/1319/server/README.md`
- `samples/phase-13/1319/server/docker-compose.yml`
- `samples/phase-13/1319/index.html`
- `tmp/validate_1319.mjs`
- `docs/pr/NETWORK_SAMPLE_1319_POWERSHELL_RUNBOOK.md`
- any current docs/dev command files or related PR docs that mention `samples/phase-13/1319/server/`

## New Canonical Runtime Commands
From repo root:
- `node samples/phase-13/1319/server/realNetworkServer.mjs`

Dashboard runtime path:
- `samples/phase-13/1319/server/realNetworkDashboard.mjs`

## Rules
- no logic changes
- no behavior changes
- path correction only
- keep sample 1319 self-contained
- keep this PR testable, not commit-only

## Validation

### Path Validation
- no remaining references to `samples/phase-13/1319/server/`
- server-local runtime paths resolve correctly

### Runtime Validation
- `node samples/phase-13/1319/server/realNetworkServer.mjs` starts successfully
- dashboard endpoint still loads
- sample 1319 still connects correctly
- second client can still join
- validate_1319 still passes

### Launcher Validation
- `samples/index.html` still launches sample 1319
- `samples/phase-13/1319/index.html` still loads correctly

### Regression
- no breakage to other sample launcher entries
- no breakage to focused phase-13 networking samples

## Roadmap Rule
Update:
`docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

Allowed:
- status markers only: `[ ]` `[.]` `[x]`

Forbidden:
- wording edits
- structure edits
- additions
- deletions

## Acceptance Criteria
- runtime `.mjs` files live under `samples/phase-13/1319/server/`
- all references updated
- `samples/phase-13/1319/server/` removed if no longer needed
- runtime and dashboard still function
- sample 1319 still launches from `samples/index.html`
