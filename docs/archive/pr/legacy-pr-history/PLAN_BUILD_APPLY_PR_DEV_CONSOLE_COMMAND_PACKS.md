Toolbox Aid
David Quesenberry
04/05/2026

# PLAN + BUILD + APPLY PR
Dev Console Command Packs (Full Cycle)

## Objective
Plan, build, and apply a command pack system in one execution.

## Deliverables
- Command registry
- Command packs (scene, render, entity, debug, hotReload, validation)
- Integration wired
- Help system
- Standard output format

## Implementation
Codex must:
1. Create tools/dev/devConsoleCommandRegistry.js
2. Create tools/dev/commandPacks/*
3. Update devConsoleIntegration.js to use registry
4. Remove flat command logic
5. Ensure help works:
   - help
   - help scene
   - help scene.info

## Output format
{
  status,
  title,
  lines[]
}

## Constraints
- No engine core changes
- Sample-level only
- Keep combo keys unchanged

## Validation
- Commands execute
- Help works
- No regressions

## Output
<project>/tmp/PLAN_BUILD_APPLY_PR_DEV_CONSOLE_COMMAND_PACKS_delta.zip
