# BUILD PR — Promotion Gate Observability + Abort Visibility

## Files
- src/advanced/promotion/createPromotionGate.js
- src/engine/debug/panels/PromotionGatePanel.js
- src/shared/state/createPromotionStateSnapshot.js

## Actions
- expose gate status (mode, handoff, abort flag)
- surface minimal data to debug panel (no new subsystem)
- add explicit abort/rollback visibility path

## Constraints
- exact files only
- no replay/timeline/sample changes
