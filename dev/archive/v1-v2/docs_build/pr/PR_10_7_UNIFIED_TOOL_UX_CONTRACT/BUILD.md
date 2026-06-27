# BUILD_PR_10_7_UNIFIED_TOOL_UX_CONTRACT

## Definitions

### Layout Zones (MANDATORY)
1. Left Panel: Data/Asset list
2. Center Canvas: Main work area
3. Right Panel: Properties / Controls
4. Top Bar: Tool name + context actions

### State Lifecycle (MANDATORY)
- INIT: tool mounted, no data
- LOADING: fetching manifest/input
- READY_EMPTY: no data → show empty state
- READY_SELECTED: first item auto-selected
- INTERACTING: user modifying

### Selection Rules
- First valid item MUST auto-select
- Selection MUST be visually highlighted
- Selection MUST persist (no reset unless explicit)

### Control Enablement
- Controls enabled ONLY when selection exists
- Disabled state must be visually obvious (not silent)

### Empty State (NO FALLBACK DATA)
- Show message: "No data loaded"
- Show instruction: "Load or create asset"
- No hidden defaults

### Workspace Contract
- Tool must:
  - not auto-close
  - not reset on focus change
  - not reload without explicit action

## Deliverables
- docs_build/pr/* (this bundle)
- Codex applies contract across tools in-place
