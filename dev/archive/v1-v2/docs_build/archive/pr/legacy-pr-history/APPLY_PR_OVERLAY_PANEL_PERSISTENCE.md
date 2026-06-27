# APPLY_PR_OVERLAY_PANEL_PERSISTENCE

## Objective
Apply overlay panel persistence in a focused, sample-level implementation while preserving public boundaries and runtime authority.

## Apply Scope
- add/plug persistence adapter at debug/sample level
- restore known panel enabled/disabled state on startup
- save state after approved operator state-change commands
- keep registry as runtime source of truth

## Guardrails
- no engine core changes
- no direct panel object mutation from persistence
- no persistence reads/writes inside panel renderers
- no save path outside public operator/registry APIs

## Apply Checklist
1. Register default panels first.
2. Load persistence snapshot from adapter.
3. Validate snapshot contract/version.
4. Apply known panel IDs only.
5. Ignore unknown IDs safely.
6. Save on approved operator state-change commands only.
7. Preserve deterministic command outputs and existing key bindings.

## Validation Checklist
- state survives reload for known panels
- unknown IDs ignored safely
- corrupt/missing snapshot handled safely
- registry remains authoritative at runtime
- no engine core files changed

## Expected Outcome
Overlay panel enabled/disabled state persists reliably for the sample path without breaking Dev Console vs Debug Overlay separation.
