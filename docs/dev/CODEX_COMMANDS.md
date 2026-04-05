Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

# Codex Commands

## Recommended model
- MODEL: GPT-5.4
- REASONING: high

## Command
Create APPLY_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD as the implementation PR for the approved runtime scene loader and hot reload contract.

Requirements:
- follow PLAN_PR -> BUILD_PR -> APPLY_PR exactly
- implement only what is defined in BUILD_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD
- keep changes surgical and architecture-safe
- preserve locked public engine mappings
- include deterministic load/reload ordering
- include structured validation and error behavior
- include focused tests for valid/invalid/reload-order/composition-reload paths
- update docs/dev reports after validation

Output zip path:
- <project folder>/tmp/APPLY_PR_RUNTIME_SCENE_LOADER_AND_HOT_RELOAD_delta.zip
