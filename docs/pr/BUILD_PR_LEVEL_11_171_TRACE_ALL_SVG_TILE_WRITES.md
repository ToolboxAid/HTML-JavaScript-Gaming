# BUILD_PR_LEVEL_11_171_TRACE_ALL_SVG_TILE_WRITES

## Purpose
Add full trace logging for every write/update to the SVG Workspace tile to determine:
- if the value is ever set correctly
- where it is overwritten
- which code path owns the final state

## Scope
Logging only. No behavior changes.

## Requirements

### 1. Trace all tile writes
In `tools/Workspace Manager/main.js`:
- Wrap every function that sets:
  - asset label
  - status label
  - tile title
- Add log:

console.log("[SVG_TILE_WRITE]", {
  source: "<function name>",
  toolId,
  hostContextId,
  assetLabel,
  statusLabel,
  timestamp: Date.now()
});

### 2. Trace workspaceShell output
In `tools/shared/workspaceShell.js`:
- After normalized state is created:

console.log("[WORKSPACE_SHELL_STATE]", state);

### 3. Trace postMessage channel
- Log send:

console.log("[SVG_POSTMESSAGE_SEND]", payload);

- Log receive in Workspace Manager:

console.log("[SVG_POSTMESSAGE_RECEIVE]", payload);

### 4. Trace legacy paths (IMPORTANT)
In any remaining:
- platformShell badge update
- shared handoff reads

Add:

console.log("[LEGACY_BADGE_WRITE]", {...});

### 5. No filtering
Do NOT debounce, merge, or suppress logs.

### 6. No logic changes
Do not change behavior. Only observe.

## Acceptance
- Console shows:
  - WORKSPACE_SHELL_STATE
  - SVG_POSTMESSAGE_SEND
  - SVG_POSTMESSAGE_RECEIVE
  - SVG_TILE_WRITE
  - LEGACY_BADGE_WRITE (if still firing)
- Identify:
  - if correct value appears then gets overwritten
  - or never appears at all

## Goal
Find the exact line that sets `Asset: none` last.
