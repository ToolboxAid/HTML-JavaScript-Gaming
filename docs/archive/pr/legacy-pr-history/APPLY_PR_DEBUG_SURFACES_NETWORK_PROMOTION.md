Toolbox Aid
David Quesenberry
04/06/2026
APPLY_PR_DEBUG_SURFACES_NETWORK_PROMOTION.md

# APPLY_PR_DEBUG_SURFACES_NETWORK_PROMOTION

## Purpose
Apply the approved network promotion by introducing shared reusable network debug modules and rebinding sample network plugins to shared bootstrap logic.

## Apply Rules
- no engine core implementation changes
- keep sample-specific feeds/scenarios/adapters project-owned
- keep data flow read-only for network providers and dashboard pieces
- keep dashboard decoupled from console/overlay internals
- no combo-key behavior changes

## Ordered Apply Sequence
1. Add `src/engine/debug/network` shared modules (shared/provider/panel/command/bootstrap).
2. Add read-only dashboard and diagnostics helpers under `src/engine/debug/network`.
3. Export shared network layer through `src/engine/debug/index.js`.
4. Rebind Sample A/B/C debug plugin factories through shared network bootstrap.
5. Run targeted import and smoke checks.

## Validation
- all added modules import successfully
- Sample A/B/C plugins still return provider/panel/command packs
- provider descriptors remain read-only
- dashboard host run-once behavior succeeds with normalized snapshots
- no changes to engine core APIs

## Rollback
If promotion causes regressions:
- revert `src/engine/debug/network` additions
- restore direct plugin object construction in sample debug plugin files
- keep sample-level behavior as pre-promotion baseline
