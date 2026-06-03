Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_DEV_CONSOLE_COMMAND_PACKS.md

# PLAN PR
Dev Console Command Packs

## Objective
Plan a scalable command-pack system for the interactive dev console so commands are grouped, discoverable, easier to validate,
and easier to expand without turning the console into a flat list of unrelated commands.

## What This Gives You
- Structured command namespaces instead of one growing flat command list
- Easier discovery with grouped help output
- Cleaner implementation boundaries for future commands
- Safer expansion without rewriting the existing console runtime
- Better testability per command pack
- A path toward scriptable debugging and automation later

## Example Command Packs
- scene.*
  - scene.info
  - scene.reload
  - scene.list
- render.*
  - render.stats
  - render.layers
  - render.pipeline
- entity.*
  - entity.count
  - entity.list
  - entity.inspect
- debug.*
  - debug.toggle
  - debug.reset
  - debug.state
- input.*
  - input.last
  - input.map
- hotreload.*
  - hotreload.enable
  - hotreload.disable
  - hotreload.status
- validation.*
  - validation.status
  - validation.errors
  - validation.warnings

## Scope
- Define command-pack structure
- Define registration model
- Define command help/grouping behavior
- Define validation and output conventions
- Keep implementation scoped to tools/dev and the existing console runtime path
- Preserve current sample-level integration and engine-safe boundaries

## Non-Goals
- No engine core changes
- No runtime rewrite of the console from scratch
- No autocomplete requirement in this PR
- No multi-sample rollout
- No scripting language yet

## Existing Foundation
Already in place:
- interactive console UI
- canvas HUD renderer
- dev console runtime
- combo-key controls
- sample integration

## Planned Design
### 1. Command Pack Model
Commands are grouped into named packs.
Each pack exposes:
- pack id
- display label
- commands
- help text
- optional shared context requirements

### 2. Command Definition Shape
Each command should define:
- full command name
- summary
- usage
- handler
- output type or formatting hint
- optional validation rules

### 3. Built-In Help Behavior
Help should support:
- help
- help scene
- help render
- help entity.count

### 4. Output Conventions
Standardize output so commands return:
- status
- title
- lines
- optional structured details payload

### 5. Validation Conventions
Standardize:
- unknown command handling
- invalid argument handling
- missing context handling

## Candidate Files
Expected future implementation focus:
- tools/dev/commandPacks/
  - sceneCommandPack.js
  - renderCommandPack.js
  - entityCommandPack.js
  - debugCommandPack.js
  - hotReloadCommandPack.js
  - validationCommandPack.js
- tools/dev/devConsoleCommandRegistry.js
- tools/dev/devConsoleIntegration.js
- optional tests under tests/tools/

## Acceptance Criteria
- command packs are defined cleanly
- grouped help behavior is specified
- output contract is standardized
- validation rules are specified
- existing console architecture can adopt packs without rewrite
- no engine core files are involved

## Validation
- review command-pack layout
- verify namespace consistency
- verify help behavior specification
- verify output contract consistency
- verify no engine coupling introduced

## Deliverable
Create BUILD_PR_DEV_CONSOLE_COMMAND_PACKS as a docs-only, repo-structured delta.
