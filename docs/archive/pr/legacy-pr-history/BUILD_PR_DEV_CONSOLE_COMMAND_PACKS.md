Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_DEV_CONSOLE_COMMAND_PACKS.md

# BUILD PR
Dev Console Command Packs

## Source Of Truth
- Plan input: `docs/pr/PLAN_PR_DEV_CONSOLE_COMMAND_PACKS.md`
- Workflow: `PLAN_PR -> BUILD_PR -> APPLY_PR`
- This BUILD is docs-only and defines implementation-ready contracts without shipping runtime code.

## Objective
Define a namespaced command-pack model for the existing dev console so command registration, help output, validation, and output formatting are consistent and scalable.

## Scope
- Define command-pack and command registry shape
- Define built-in help behavior for pack and command discovery
- Define output contract for command execution results
- Define validation conventions and error surface
- Keep future implementation scope limited to `tools/dev` and optional tests

## Out Of Scope
- No engine core changes
- No runtime refactor beyond command-registry adoption path
- No autocomplete feature requirement in this slice
- No multi-sample rollout in this slice

## Implementation Boundaries (Future Apply Scope)
- Allowed implementation folders:
  - `tools/dev/`
  - optional `tests/tools/`
- Not allowed:
  - `engine/`
  - runtime core rewrites
  - unrelated tools/samples/games

## Command Registry Shape
Use a registry composed of command packs.

### Command Pack Contract
- `packId`: string (namespace token, example: `scene`)
- `label`: string (human-readable title)
- `description`: string
- `commands`: array of command definitions
- `contextRequirements` (optional): array of required context keys

### Command Contract
- `name`: full namespaced command, example `scene.info`
- `summary`: short command description
- `usage`: usage string
- `arguments` (optional): argument spec array
- `handler(context, args)`: execution handler
- `outputHint` (optional): formatting hint (`text`, `table`, `json`)
- `validate(args, context)` (optional): pre-execution validator

## Help Behavior Contract
Support these forms:
- `help`
  - lists command packs and basic usage
- `help <pack>`
  - lists commands inside that pack
- `help <full.command>`
  - shows command summary, usage, args, validation notes

Behavior rules:
- Unknown pack/command returns structured error output (not silent fail)
- Help output is stable and deterministic (sorted by pack then command name)

## Command Output Contract
All command executions should normalize to:
- `status`: `ready | failed`
- `title`: string
- `lines`: string array
- `details` (optional): structured payload object
- `code` (optional): machine-readable error/result code

Output conventions:
- Success uses `status=ready`
- Validation/lookup failures use `status=failed` with explicit `code`
- Empty output should still return at least one user-facing line

## Validation Conventions
Normalize these cases:
- Unknown command
  - `code=COMMAND_NOT_FOUND`
- Unknown pack in help
  - `code=COMMAND_PACK_NOT_FOUND`
- Invalid arguments
  - `code=INVALID_COMMAND_ARGS`
- Missing context dependencies
  - `code=MISSING_COMMAND_CONTEXT`
- Handler failure
  - `code=COMMAND_EXECUTION_FAILED`

Validation behavior:
- Reject invalid command execution before handler call when possible
- Return structured non-silent failure with actionable message

## Suggested Pack Coverage
- `scene.*`
- `render.*`
- `entity.*`
- `debug.*`
- `input.*`
- `hotreload.*`
- `validation.*`

## Future Candidate Files (Implementation Phase)
- `tools/dev/commandPacks/sceneCommandPack.js`
- `tools/dev/commandPacks/renderCommandPack.js`
- `tools/dev/commandPacks/entityCommandPack.js`
- `tools/dev/commandPacks/debugCommandPack.js`
- `tools/dev/commandPacks/inputCommandPack.js`
- `tools/dev/commandPacks/hotReloadCommandPack.js`
- `tools/dev/commandPacks/validationCommandPack.js`
- `tools/dev/devConsoleCommandRegistry.js`
- `tools/dev/devConsoleIntegration.js`
- Optional tests under `tests/tools/`

## Acceptance Criteria
- Namespaced command pack model documented
- Registry and command definition shape documented
- Help behavior documented for global/pack/command modes
- Output contract documented and standardized
- Validation conventions documented with explicit error codes
- Future scope constrained to `tools/dev` and optional tests
- No engine-core change requirements introduced

## Manual Validation Checklist
- Confirm pack and command schema is complete enough to implement directly
- Confirm help behavior covers global, pack, and command views
- Confirm output contract supports both human and structured tooling usage
- Confirm validation conventions avoid silent failures
- Confirm no implementation scope leaks outside `tools/dev` and optional tests

## Packaging
Expected BUILD delta ZIP:
- `<project folder>/tmp/BUILD_PR_DEV_CONSOLE_COMMAND_PACKS_delta.zip`
