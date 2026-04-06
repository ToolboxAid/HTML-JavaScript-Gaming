# APPLY_PR_DEBUG_SURFACES_NETWORK_SUPPORT

## Purpose
Apply the approved shared network support layer in a small, boundary-safe implementation step.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: implement summary-level shared network providers, panels, and optional presets.

## Apply Scope
### Create shared providers
- `provider.net.connection.snapshot`
- `provider.net.latency.snapshot`
- `provider.net.replication.snapshot`
- `provider.net.divergence.snapshot`
- `provider.net.events.snapshot`

### Create shared panels
- `panel.net.connection`
- `panel.net.latency`
- `panel.net.replication`
- `panel.net.divergence`
- `panel.net.events`

### Create optional shared presets
- `preset.net.status`
- `preset.net.replication`
- `preset.net.diagnostics`

### Keep local
- transport/protocol adapters
- authority extraction
- stack-specific scene/debug mappings

## Execution Order
1. providers
2. panels (provider-driven only)
3. optional presets
4. shared registration entry points
5. local adapter harness validation

## Rules
- preserve existing provider/panel/preset conventions
- keep adoption opt-in
- keep shared layer transport-agnostic
- no deep inspectors
- no protocol-specific implementation
- no packet inspectors
- no auth/matchmaking tooling

## Validation
- run syntax checks for touched modules
- validate with local adapter harness or sample integration
- verify shared layer consumes provider snapshots only

## Apply Outcome Contract
- additive, non-destructive changes only
- no engine-core rewrites
- no project-specific adapter logic moved into shared layer
