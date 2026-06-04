# BUILD_PR_11_309

## Implementation
- Maintain one baseline active palette source in Workspace V2 state.
- Ensure baseline creation is called on startup and full reset.
- Ensure export materializes `tools.palette-browser` from that source with schema-valid shape.

## Baseline Rule
When missing, initialize a single active palette baseline equivalent to:
- `tools.palette-browser.swatches = []`
(with no extra palette entries and no legacy locations)

## Validation
- `node --check toolbox/workspace-v2/index.js`

## Non-Goals
- No schema file edits
- No palette manager session reintroduction
- No legacy `workspaceSession` / `games[]` shapes
