# BUILD_PR_DEBUG_SURFACES_NETWORK_SUPPORT

## Purpose
Build an authoritative docs-only bundle for shared network support implementation readiness.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: define implementation-ready network support contracts for APPLY.

## Build Scope
- shared network panel inventory
- shared network provider inventory
- optional shared network presets
- adapter boundaries and ownership
- adoption modes and naming rules
- validation and rollback strategy

## Authoritative Shared Inventory
Panels:
- `panel.net.connection`
- `panel.net.latency`
- `panel.net.replication`
- `panel.net.divergence`
- `panel.net.events`

Providers:
- `provider.net.connection.snapshot`
- `provider.net.latency.snapshot`
- `provider.net.replication.snapshot`
- `provider.net.divergence.snapshot`
- `provider.net.events.snapshot`

Optional presets:
- `preset.net.status`
- `preset.net.replication`
- `preset.net.diagnostics`

## Target Structure
```text
engine/
  debug/
    standard/
      network/
        index.js
        shared/
        providers/
        panels/
        presets/
```

## Boundary Contract
Shared layer:
- transport/protocol-agnostic descriptors and registration entry points.

Local adapters:
- all protocol and transport extraction logic.
- all authority-model specifics.

## Hard Exclusions
- protocol-specific implementations
- packet inspectors
- auth tooling
- matchmaking tooling
- deep inspectors

## Validation Targets
- panel/provider/preset ids are deterministic and namespaced
- shared docs remain transport-agnostic
- adapter boundaries are explicit and enforceable
- apply sequence remains additive and non-destructive

## Rollback Strategy
If APPLY scope grows beyond summary-level:
1. keep ids and target structure stable
2. reduce to connection + latency first
3. defer replication/divergence/events details to follow-on PR

## Next Command
`APPLY_PR_DEBUG_SURFACES_NETWORK_SUPPORT`
