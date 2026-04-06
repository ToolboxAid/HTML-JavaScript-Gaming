# APPLY_PR_PLUGIN_SYSTEM

## Purpose
Apply plugin system contracts exactly as defined by PLAN and BUILD docs.

## Apply Scope
- implement `PluginRegistry`, `PluginContext`, and `CapabilityDescriptor` seams
- implement lifecycle ordering and isolation behavior
- implement optional/lazy loading paths
- expose only approved registration APIs

## Apply Rules
- no scope expansion beyond BUILD contract
- preserve engine/runtime separation
- no direct runtime mutation paths for plugins
- no breaking changes to existing behavior

## Apply Validation
- lifecycle hooks execute in strict order
- plugin failures remain isolated
- registration/discovery APIs are deterministic
- lazy activation and unload flows are validated

## Output
<project folder>/tmp/APPLY_PR_PLUGIN_SYSTEM_delta.zip
