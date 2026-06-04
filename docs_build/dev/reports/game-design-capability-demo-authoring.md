# Game Design Capability Demo Authoring

PR: PR_26155_068-076-game-design-rebuild

Status: PASS

## Behavior

Capability demos remain Project Workspace projects.

Seeded capability demo projects:
- Camera Follow Demo
- Collision Demo
- Gravity Demo

Game Design stores capability demo authoring metadata in `game_design_capability_demos` by `projectId`; it does not create a separate demo project system.

## Manual Test Notes

Open `toolbox/game-design/index.html?project=gravity-demo`.

Expected:
- Gravity Demo is the active project.
- Project Purpose is `Capability Demo`.
- Capability demos are listed as Project Workspace projects.
- Save Game Design keeps `capabilityDemoAuthoring` true in the output.
