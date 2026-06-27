# Workspace Manager V2

Workspace Manager V2 is the first-class games-only context surface for Workspace V2 tool launch.

It owns the active game, active palette, validated asset registry context, and sessionStorage launch handoff used by workspace-launched V2 tools. Direct production launch uses manifest/toolState context only; temporary `?workspace=UAT` access is owned here and loads the game-manifest-shaped fixture at `tests/fixtures/workspace-v2/uat.manifest.json` before launching tools.
