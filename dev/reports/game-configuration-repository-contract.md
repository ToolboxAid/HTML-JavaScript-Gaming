# Game Configuration Repository Contract

PR: PR_26155_080-game-configuration-repository-contract

## Summary
- Added `toolbox/game-configuration/game-configuration-mock-repository.js`.
- The repository is SQL-shaped and table-style, with `game_configuration_documents` and `game_configuration_validation_items` tables.
- The UI consumes the repository abstraction through create/get/update/validate/reset methods by `projectId`.
- No real database, auth, cloud, browser storage, or persistence behavior was added.

## Contract Methods
- `createConfiguration(projectId, input)`
- `getConfiguration(projectId)`
- `updateConfiguration(projectId, input)`
- `validateConfiguration(projectId, input)`
- `resetConfiguration(projectId)`
- `resetAll()`
- `getGameDesignHandoff()`
- `getProjectProgressHandoff()`
- `getSnapshot()`
- `getTables()`

## Validation Notes
- Impacted lane: `game-configuration`.
- Targeted Game Design handoff check: `GameDesignMockRepository.spec.mjs --grep "saves and updates design fields"`.
- Skipped lanes: `workspace-contract`, `project-workspace`, `tool-runtime`, `game-runtime`, `integration`, `engine-src`, `samples`.
- Skipped-lane rationale: this PR changes one Toolbox tool runtime, its repository abstraction, its targeted tests, and Game Configuration copy in the existing Toolbox renderer. Shared launch, parser, DB, engine, and sample behavior did not change.
- Theme V2 gap findings: none.
