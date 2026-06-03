Toolbox Aid
David Quesenberry
04/05/2026
APPLY_PR_OVERLAY_OPERATOR_COMMANDS.md

# APPLY_PR_OVERLAY_OPERATOR_COMMANDS

## Objective
Apply the implemented overlay operator command pack without expanding beyond this PR purpose.

## Apply Scope
- `tools/dev/commandPacks/overlayCommandPack.js`
- `tools/dev/devConsoleIntegration.js`
- docs and reports for this PR

## Guardrails
- no engine core changes
- no runtime architecture refactor
- no direct console-to-overlay private coupling
- no sample-wide or repo-wide debug framework expansion

## Apply Validation
1. Confirm `overlay.*` commands appear in registry/autocomplete.
2. Confirm deterministic output for list/order/status commands.
3. Confirm safe failure on invalid panel IDs.
4. Confirm show/hide/toggle/showAll/hideAll state changes apply via public APIs.
5. Confirm `node --check` passes for touched JS files.

## Expected Outcome
Operators can inspect and control overlay panel visibility from the Dev Console while maintaining the Dev Console vs Debug Overlay boundary.
