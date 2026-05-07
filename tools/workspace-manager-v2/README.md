# Workspace Manager V2

Workspace Manager V2 is the first-class games-only context surface for Workspace V2 tool launch.

It owns the active game, active palette, schema-ready asset registry context, and sessionStorage launch handoff used by workspace-launched V2 tools. Direct production launch uses session/state context only; temporary `?workspace=UAT` access is owned here and loads `games/_template/workspace-manager-v2-UAT.manifest.json` before launching tools.
