# Game Design Project Purpose Flow

PR: PR_26155_068-076-game-design-rebuild

Status: PASS

## Purpose Flow

Game Design reads the active project purpose from the Project Workspace mock repository and displays it in the Project Context accordion.

Supported seeded purposes:
- Game Project
- Capability Demo
- Learning Project
- Template Project

Game Design does not own project identity. Project identity and purpose remain owned by Project Workspace.

## Manual Test Notes

Open:
- `toolbox/game-design/index.html`
- `toolbox/game-design/index.html?project=gravity-demo`

Expected:
- default route shows Demo Project with purpose `Game Project`.
- `?project=gravity-demo` shows Gravity Demo with purpose `Capability Demo`.
- Project purpose is reflected in the saved Game Design output.
