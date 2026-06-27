# Integration Notes

## Expected Boundaries
- `StateTimelineBuffer` remains sample-scoped
- `ReconciliationLayerAdapter` remains an adapter layer, not engine API
- Model owns input-history capture and replay execution
- Scene owns user-facing trigger bindings only
- Debug plugin consumes model state and does not compute replay logic

## Non-Goals
- No rollback netcode across shared engine
- No server reconciliation service
- No Docker or dashboard work
