# Codex Commands — BUILD_PR_LEVEL_20_13_REMOVE_WORKSPACE_MANAGER_DEFAULT_AND_QUERY_FALLBACKS

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.
Read docs/dev/reports/phase20_recovery_gate_decision.md.
Read docs/dev/reports/phase20_recovery_uat_validation.md.
Read docs/dev/specs/TOOL_LAUNCH_SSOT.md if present.

Execute BUILD_PR_LEVEL_20_13_REMOVE_WORKSPACE_MANAGER_DEFAULT_AND_QUERY_FALLBACKS.

Goal:
Fix only the exact BLOCKED recovery gate issues:
- tools/Workspace Manager/main.js uses default first-item tool selection via toolIds[0]
- tools/Workspace Manager/main.js uses legacy query fallback gameId || game
- docs/dev/specs/TOOL_LAUNCH_SSOT.md is missing

Required changes:
1. In tools/Workspace Manager/main.js:
   - remove default first-item selection via toolIds[0] in the launch path
   - remove legacy query fallback gameId || game
   - require explicit gameId for game-launched Workspace Manager flow
   - missing/invalid gameId must fail visibly
   - no default/fallback tool/workspace selection
   - preserve external launch memory clearing

2. Ensure docs/dev/specs/TOOL_LAUNCH_SSOT.md exists.
   - If missing, restore it with the authoritative launch rules from this BUILD.
   - Do not create a second spec path.

Forbidden:
- broad cleanup
- unrelated refactoring
- changing sample launch labels
- changing game launch labels
- second SSoT
- start_of_day changes
- roadmap text rewrite outside status markers

Validation:
Create docs/dev/reports/workspace_manager_default_query_fallback_removal_validation.md with:
- changed files
- exact removal proof for toolIds[0]
- exact removal proof for gameId || game
- proof gameId is required
- proof missing gameId fails visibly
- proof no first-tool selection remains in touched flow
- proof memory clear remains intact
- proof docs/dev/specs/TOOL_LAUNCH_SSOT.md exists
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_13_REMOVE_WORKSPACE_MANAGER_DEFAULT_AND_QUERY_FALLBACKS.zip
```
