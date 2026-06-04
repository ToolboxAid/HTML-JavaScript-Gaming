# PR_26155_015 Toolbox Build Path Model

## Scope

- Defined the static Build Path model on the existing Toolbox renderer.
- Kept Build Path as a page mode on the Toolbox surface.
- Did not add tools, CSS, database behavior, persistence, save/load, or runtime build logic.

## Build Path

The current static path is:

1. Project Workspace
2. Game Design
3. Game Configuration
4. Required Tool Path
5. Build Game
6. Game Testing
7. Publish

`Build Game` and `Game Testing` are path milestones in this wireframe, not new tool cards.

## Side / Capability Tools

These remain side/capability tools and are not blockers unless a future registry rule explicitly requires them:

- AI Assistant
- Storage Inspector
- Settings
- Learn
- Cloud
- Marketplace

## Validation Notes

- PASS: targeted affected-page browser check confirmed all Build Path stages are visible.
- PASS: targeted affected-page browser check confirmed Build Path is not a tool card.
- PASS: `npm run test:workspace-v2` using the legacy command name for the Project Workspace test lane.
- PASS: Arcade is absent from the Toolbox surface.
- PASS: no CSS was added or modified.
- PASS: `git diff --check`.

## Manual Notes

- Clicked Build Path mode in the affected-page browser check.
- Confirmed the path uses existing tool tiles and milestone notes.
- Confirmed side/capability tools are not shown as required blockers by default.
