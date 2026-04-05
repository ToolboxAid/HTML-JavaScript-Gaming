Toolbox Aid
David Quesenberry
04/05/2026
PLAN_BUILD_PR_DEV_CONSOLE_COMMAND_PACKS.md

# PLAN + BUILD PR
Dev Console Command Packs (Combined)

## Objective
Define AND implement a namespaced command-pack system for the dev console in a single PR cycle to reduce iteration overhead.

---

## What This Will Deliver
- Namespaced commands (scene.*, render.*, entity.*, etc.)
- Central command registry
- Pack-based modular structure
- Improved help system
- Standard output format
- No engine core changes

---

## Implementation (Codex MUST do)

### Create
tools/dev/devConsoleCommandRegistry.js

Responsibilities:
- register command packs
- resolve commands
- expose:
  - execute(command, context)
  - getHelp(topic)

---

### Create command packs
tools/dev/commandPacks/

- sceneCommandPack.js
- renderCommandPack.js
- entityCommandPack.js
- debugCommandPack.js
- hotReloadCommandPack.js
- validationCommandPack.js

Each pack:
- id
- commands[]
- handler functions
- help metadata

---

### Update
tools/dev/devConsoleIntegration.js

- route all commands through registry
- remove any flat command handling
- keep input system unchanged

---

### Help System
Must support:
- help
- help scene
- help scene.info

---

### Output Contract
Each command returns:
{
  status: "ok" | "error",
  title: string,
  lines: string[]
}

---

## Constraints
- NO engine core changes
- Sample-level only
- No UI rewrite
- Keep combo keys unchanged
- Keep commit_comment.txt header-free

---

## Acceptance Criteria
- Commands grouped and working
- help system functional
- no regression in console
- clean separation of packs

---

## Output
<project>/tmp/PLAN_BUILD_PR_DEV_CONSOLE_COMMAND_PACKS_delta.zip
