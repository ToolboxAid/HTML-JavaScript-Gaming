Toolbox Aid
David Quesenberry
04/06/2026
tools/dev/server-dashboard/README.md

# Server Dashboard Foundation (Docs-First)

## Purpose
Define a read-only server dashboard foundation that remains decoupled from console and overlay internals and is integrated at sample level only.

## Scope
- foundation docs for server dashboard structure
- no engine core API changes
- no transport implementation
- no docker/container implementation
- no operator mutation controls

## Planned Units
- `serverDashboardHost.js`
- `serverDashboardRegistry.js`
- `serverDashboardProviders.js`
- `serverDashboardRenderer.js`

## Responsibility Boundaries
### Host
- start/stop lifecycle
- refresh/poll scheduling
- coordinate providers, registry, and renderer
- no direct console/overlay ownership

### Registry
- deterministic section registration and ordering
- immutable section descriptors
- no runtime mutation logic

### Providers
- read-only telemetry snapshot normalization
- connection/session/player/network summary aggregation
- no writes to runtime, transport, or state

### Renderer
- minimal dashboard shell rendering
- summary rows and player rows
- safe empty-state rendering
- no refresh ownership and no write operations

## Decoupling Requirements
- dashboard can run with console closed
- dashboard can run with overlay hidden
- console and overlay must not manage dashboard internals
- dashboard must not change combo key behavior

## Initial Foundation Data Shape
- connection/session counts
- latency summary
- RX bytes summary
- TX bytes summary
- last refresh timestamp
- per-player status rows

## Integration Rule
Sample-level integration only. Engine core remains unchanged in this slice.

---

## Enhancement Slice (Docs-First)

This enhancement slice extends the foundation with read-only view contracts:
- player statistics view
- latency view
- RX bytes view
- TX bytes view
- connection/session counts
- per-player status rows
- refresh/update strategy
- debug-only access rules

### Enhancement Rules
- remain decoupled from console and overlay internals
- keep all provider flows read-only
- keep dashboard-local rendering responsibilities
- keep integration sample-level
