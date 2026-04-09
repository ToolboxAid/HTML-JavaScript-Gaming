# BUILD_PR_PLUGIN_SYSTEM

## Purpose
Build a docs-only, implementation-ready plugin system bundle from `PLAN_PR_PLUGIN_SYSTEM`.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## Build Scope
- define plugin contracts
- define plugin registration APIs
- define extension hooks
- define isolation and capability boundaries
- define loading and activation strategy

## Constraints
- docs-only
- no runtime code changes
- no engine refactor
- no breaking API changes in this build slice

## Plugin Contracts (authoritative)
1. `PluginRegistry`
- register/unregister plugin descriptors
- enumerate plugin metadata and status
- enforce lifecycle order and duplicate protection

2. `PluginContext`
- approved public APIs only
- read-only access to src/engine/debug snapshots
- bounded command/panel/provider registration helpers

3. `CapabilityDescriptor`
- capability id and version
- required vs optional capability flags
- compatibility metadata

## Lifecycle Contract
Ordered hooks:
1. `init(context)`
2. `activate(context)`
3. `deactivate(context)`
4. `dispose(context)`

Rules:
- hooks are optional but order is strict
- failures are isolated per plugin
- deactivation/dispose must be idempotent

## Isolation Rules
- no direct runtime mutation from plugins
- plugins use approved public seams only
- no cross-plugin direct coupling
- capability checks required before activation

## Loading Model
- optional loading by config/feature flag
- lazy activation on demand
- explicit unload path for teardown testing

## Registration APIs (docs contract)
- `registerPlugin(descriptor)`
- `unregisterPlugin(pluginId)`
- `listPlugins()`
- `activatePlugin(pluginId)`
- `deactivatePlugin(pluginId)`

## Extension Hook Targets
- command pack extension hook
- panel extension hook
- provider extension hook

## Validation Targets
- lifecycle ordering and idempotence are documented
- isolation boundaries are explicit
- loading model is optional/lazy and bounded
- registration APIs are stable and deterministic
- no runtime code changes in this BUILD bundle

## Apply Handoff
`APPLY_PR_PLUGIN_SYSTEM` should implement only approved contracts and keep scope constrained to plugin lifecycle and registration seams.
