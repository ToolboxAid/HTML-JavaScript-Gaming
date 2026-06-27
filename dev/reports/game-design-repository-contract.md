# Game Design Repository Contract

PR: PR_26155_068-076-game-design-rebuild

Status: PASS

## Contract

Game Design now uses `toolbox/game-design/game-design-mock-repository.js` as an in-memory, SQL-shaped mock repository abstraction.

Tables:
- `game_design_documents`
- `game_design_validation_items`
- `game_design_capability_demos`

The repository consumes Project Workspace mock project context through `createProjectWorkspaceMockRepository()` and never introduces a real database, auth, cloud, or persistence layer.

## Fields

`game_design_documents` stores:
- `id`
- `projectId`
- `projectPurpose`
- `gameType`
- `genre`
- `playStyle`
- `designSummary`
- `capabilityDemoAuthoring`
- `capabilityDemoNotes`
- `status`
- `updatedAt`

`game_design_validation_items` stores actionable missing-field rows by `projectId`.

`game_design_capability_demos` stores project-owned capability demo authoring metadata by `projectId`.

## Validation Notes

Impacted lane: `game-design`.

Skipped lanes:
- `project-workspace`: Game Design depends on active project context, but the new Game Design lane directly exercises that dependency through the Project Workspace mock repository.
- `workspace-contract`: skipped because shared launch/header/template wiring did not change.
- `samples`: skipped because samples are out of scope.

Theme V2 gap findings: none.
