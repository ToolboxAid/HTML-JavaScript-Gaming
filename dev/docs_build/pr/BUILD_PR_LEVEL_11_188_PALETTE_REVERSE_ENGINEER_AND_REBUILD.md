# BUILD_PR_LEVEL_11_188_PALETTE_REVERSE_ENGINEER_AND_REBUILD

## Purpose
Reverse engineer the legacy Palette Browser behavior, preserve it as `Palette Browser-v1`, and rebuild Palette Browser as the first clean Tool v2 implementation using session-backed palette data only.

## Prior PR Baseline
This BUILD continues the PR 11.187 restart lane:

- stop patching legacy Workspace Manager and legacy tool shell code
- Tool v2 lane only
- Palette first
- session-backed shared data
- reverse engineer before rebuild
- move old tool to `<Tool Name>-v1`
- do not copy old implementation code

## Hard Scope
Modify only files required for this PR:

- `toolbox/Palette Browser/**`
- `toolbox/Palette Browser-v1/**`
- `toolbox/common/**`
- `docs_build/pr/**`
- `docs_build/dev/**`
- `docs_build/dev/reports/**`
- `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status markers only, if an existing matching roadmap item is found

Do not modify:

- schemas
- samples
- games
- old Workspace Manager
- legacy tools other than moving Palette Browser to `Palette Browser-v1`
- `src/shared/toolbox/**`
- `start_of_day/**`

## Naming Rules
Visible tool name remains:

```text
Palette Browser / Manager
```

Do not show `v2` in the UI. `v2` may appear only in docs, report names, comments needed for development clarity, and log messages.

Legacy folder rename rule:

```text
toolbox/Palette Browser/
-> toolbox/Palette Browser-v1/
```

## Shared Foundation Rule
Treat `src/shared/toolbox/` as deprecated for new Tool v2 work.

Create new shared foundation under:

```text
toolbox/common/
```

Required files:

```text
toolbox/common/toolLayout.css
toolbox/common/sessionContext.js
toolbox/common/toolContract.js
```

Do not import from:

- `src/shared/toolbox/platformShell.js`
- `src/shared/toolbox/assetUsageIntegration.js`
- old shared handoff modules
- tool alias registries

## Architecture Rule
No code may be just a stream of functions in a single file.

For the rebuilt Palette Browser, controls must be represented by focused classes or modules that manage specific UI/control responsibilities. Keep scope small and do not introduce framework-level abstractions.

## Data Model
Support only these data paths:

1. Workspace URL loads data, writes session, then launches tool.
2. Tool URL loads explicit palette data, writes session, then tool reads session.
3. Tool from Workspace session reads session using `hostContextId`.

No fallback/default data is allowed.

## Workspace Launch Rule
Do not launch Workspace with `?tool=`.
Do not auto-open a tool from URL.
Workspace opens clean.
User selects Palette Browser / Manager manually.
Workspace writes session context.
Palette Browser reads session context.

## Palette Input Contract
Palette Browser reads `paletteJson` from session.

The accepted conceptual shape is intentionally narrow:

```text
paletteJson.name
paletteJson.colors[]
```

A color entry may be treated as a displayable swatch only if it provides an explicit color value supported by the existing palette data observed during reverse engineering.

Do not invent hidden defaults.
Do not normalize unrelated schema shapes.
Do not reach into samples, games, or Workspace Manager to guess missing data.

## Required Reverse Engineering Report
Create:

```text
docs_build/dev/reports/pr_11_188_palette_reverse_engineering.md
```

The report must document:

- legacy files inspected
- legacy inputs, especially `paletteJson`
- UI sections found in the old tool
- behavior to keep conceptually
- behavior to delete
- legacy systems avoided
- final rebuilt Palette Browser contract
- validation performed

## Rebuild Requirements
Create clean Palette Browser files:

```text
toolbox/Palette Browser/index.html
toolbox/Palette Browser/main.js
toolbox/Palette Browser/styles.css
```

The rebuilt tool must:

- read `paletteJson` from session
- show palette name
- show swatches
- show swatch count
- show explicit empty state when no palette session data exists
- show explicit error state when session data is malformed
- use `toolbox/common/toolLayout.css`
- use `toolbox/common/sessionContext.js`
- use `toolbox/common/toolContract.js`
- avoid `platformShell`
- avoid shared handoff
- avoid fallback data
- avoid hidden defaults

## Menu Rules
Each Tool v2 screen has two menu zones:

```text
menuTool
menuWorkspace
```

`menuTool` contains controls specific to the current tool launch.
`menuWorkspace` contains controls that update workspace session/context only.
Do not expose import/export controls unless this PR explicitly implements and validates them.
For Palette Browser in this PR, keep menus minimal and only show controls that are actually implemented.

## Sidebar Accordion Planning Requirement
In the reverse engineering report, add a section named:

```text
Sidebar Accordion Control Type Plan
```

Document the initial Palette-first control groups:

- Context
- Palette
- Display
- Validation
- Workspace

For each group, list only controls that are needed by the rebuilt Palette Browser. Mark future groups as deferred, not implemented.

## Required Logs
Emit these logs from the rebuilt Palette Browser lifecycle:

```text
[PALETTE_V2_ENTRY]
[SESSION_CONTEXT_READ]
[PALETTE_V2_CONTRACT_LOADED]
```

## Roadmap Rule
Roadmap file:

```text
docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md
```

If an existing roadmap item clearly matches Tool v2 or Palette v2 rebuild work, update status only:

```text
[ ] -> [.] or [.] -> [x]
```

Do not add, delete, rewrite, reflow, rename, or paraphrase roadmap text.
If no exact matching item exists, leave the roadmap untouched and document that decision in the report.

## Validation Commands
Run targeted validation only.

Required:

```powershell
node --check "toolbox/common/sessionContext.js"
node --check "toolbox/common/toolContract.js"
node --check "toolbox/Palette Browser/main.js"
```

Run a targeted browser/tool launch check if an existing tool-specific test or local launch path exists.

Do not run full samples smoke by default.
Full samples smoke is skipped unless Codex determines this PR changed shared sample loading broadly.

## Acceptance Criteria
Done means:

- `toolbox/Palette Browser-v1/` contains the legacy Palette Browser files
- `toolbox/Palette Browser/` contains the clean rebuilt Palette Browser
- rebuilt Palette Browser reads session-backed `paletteJson`
- palette name, swatches, and count render from session data
- missing session shows empty state
- malformed session shows error state
- no fallback/default palette data exists
- no `platformShell` usage in rebuilt Palette Browser
- no `src/shared/toolbox/**` imports in rebuilt Palette Browser or new common files
- no schema/sample/game changes
- reverse engineering report exists
- targeted validation results are recorded
- full samples smoke run/skip decision is recorded with reason
