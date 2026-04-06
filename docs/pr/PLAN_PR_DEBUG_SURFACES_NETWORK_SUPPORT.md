# PLAN_PR_DEBUG_SURFACES_NETWORK_SUPPORT

## Objective
Plan the first reusable, opt-in network support layer for the debug surfaces platform.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: define the summary-level shared network support contract.

## Goals
- Define shared network panel inventory.
- Define shared network provider inventory.
- Define optional shared network preset inventory.
- Define adapter boundaries between shared and project-specific layers.
- Define adoption models, naming conventions, and target structure.

## In Scope
- Shared network panel descriptors (summary-level only).
- Shared network provider descriptor contracts (read-only snapshots).
- Optional shared network presets (visibility + optional ordering only).
- Public adapter boundaries and ownership model.

## Out of Scope
- Protocol-specific implementations.
- Transport-specific implementations.
- Packet inspectors.
- Auth and matchmaking tooling.
- Deep inspectors.

## Shared Network Panels (v1)
- `panel.net.connection`
- `panel.net.latency`
- `panel.net.replication`
- `panel.net.divergence`
- `panel.net.events`

## Shared Network Providers (v1)
- `provider.net.connection.snapshot`
- `provider.net.latency.snapshot`
- `provider.net.replication.snapshot`
- `provider.net.divergence.snapshot`
- `provider.net.events.snapshot`

Provider guardrails:
- read-only snapshots only
- deterministic shape/version fields
- no runtime mutation in provider contracts

## Optional Shared Network Presets (v1)
- `preset.net.status`
- `preset.net.replication`
- `preset.net.diagnostics`

## Adapter Boundaries
Shared layer (`engine/debug`):
- shared network panel/provider/preset descriptors
- shared registration seams

Project/sample/tool layer:
- protocol/transport adapter implementations
- authority model extraction
- stack-specific mappings and visuals

Hard rule:
- shared layer never imports transport/protocol internals.

## Adoption Models
Minimal:
- one network provider + one panel.

Standard:
- full shared network providers/panels + optional shared presets.

Hybrid:
- shared network base + project-specific adapter extensions.

## Naming Conventions
- Panel ids: `panel.net.<domain>`
- Provider ids: `provider.net.<domain>.snapshot`
- Preset ids: `preset.net.<name>`

## Target Structure
```text
engine/
  debug/
    standard/
      network/
        panels/
        providers/
        presets/
```

## Validation Goals
- Shared network inventory is explicit and transport-agnostic.
- Adapter boundaries remain explicit and enforce local ownership.
- Scope remains summary-level and opt-in.

## Next Commands
1. `BUILD_PR_DEBUG_SURFACES_NETWORK_SUPPORT`
2. `APPLY_PR_DEBUG_SURFACES_NETWORK_SUPPORT`
