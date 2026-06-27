# BUILD_PR_LEVEL_11_188_PALETTE_MANAGER_REVERSE_ENGINEER_AND_REBUILD

## Purpose
Reverse engineer the legacy Palette Browser / Manager behavior, preserve the legacy implementation as `toolbox/Palette Browser-v1/`, and rebuild the first clean Tool v2 screen as **Palette Manager**.

This PR is the Palette-first Tool v2 migration entry point. It must not patch Workspace Manager v1, legacy tools, samples, games, or schemas.

## Prior PR Baseline
This BUILD continues from PR 11.187 and the PR 11.188 restart lane:

- Tool v2 lane only.
- Palette first.
- Session-backed data only.
- Reverse engineer before rebuild.
- Move old tool to `<Tool Name>-v1`.
- Do not copy old implementation code.
- Do not wire new Tool v2 screens into Workspace Manager v1.

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
- Workspace Manager v1 wiring
- legacy tools other than moving Palette Browser to `Palette Browser-v1`
- `src/shared/toolbox/**`
- `start_of_day/**`

## Visible Naming Rule
The visible tool name is now:

```text
Palette Manager
```

Apply this display name everywhere visible in the rebuilt Tool v2 lane, including:

- document title
- page header
- menu labels
- empty/error state labels
- ARIA labels
- any visible launch label created by this PR
- reverse-engineering and acceptance language that refers to the rebuilt tool

Do not show these visible names in the rebuilt UI:

```text
Palette Browser / Manager
Palette Browser v2
Palette Manager v2
```

`v2` may appear only in documentation/dev notes, report names, internal PR language, and required log identifiers.

Legacy folder rename rule remains:

```text
toolbox/Palette Browser/
-> toolbox/Palette Browser-v1/
```

The replacement clean tool folder remains:

```text
toolbox/Palette Browser/
```

because this PR is intentionally preserving repo route continuity while changing the visible product name to Palette Manager.

## Tool v2 Separation Rule
New Tool v2 code must be 100% separated from Workspace Manager v1.

Do not:

- import Workspace Manager v1 files
- call Workspace Manager v1 functions
- add new Workspace Manager v1 tool launch wiring
- add `?tool=` launch behavior
- auto-open Palette Manager from Workspace URL
- bridge through legacy handoff code
- use tool aliases
- use `src/shared/toolbox/`
- patch Workspace Manager v1 to support Palette Manager

Workspace opens clean. The user manually selects Palette Manager from the clean Tool v2 flow once Tool v2 workspace selection exists. For this PR, Palette Manager must be directly testable through explicit session data only, without adding Workspace Manager v1 integration.

## Header and Accordion Rule
Use the visual/header pattern from the repo root page:

```text
/index.html
```

The rebuilt Palette Manager must include:

- a top header derived from the root `/index.html` visual pattern
- a collapsible accordion control that hides/shows the header/details area
- no `platformShell`
- no old shared shell header
- no legacy fullscreen header behavior

The accordion must be owned by the new Tool v2 layout foundation under `toolbox/common/`, not by `src/shared/toolbox/`.

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

For the rebuilt Palette Manager, controls must be represented by focused classes or modules that manage specific UI/control responsibilities.

Minimum expected class/module responsibilities:

- app/controller bootstrap
- session/context read
- contract validation
- header accordion behavior
- menuTool/menuWorkspace control rendering
- palette swatch rendering
- empty/error state rendering

Keep scope small. Do not introduce a framework or repo-wide abstraction.

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
User selects Palette Manager manually.
Workspace writes session context only after the clean Tool v2 workspace flow exists.
Palette Manager reads session context.

## Palette Input Contract
Palette Manager reads `paletteJson` from session.

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
docs_build/dev/reports/pr_11_188_palette_manager_reverse_engineering.md
```

The report must document:

- legacy files inspected
- legacy inputs, especially `paletteJson`
- UI sections found in the old tool
- behavior to keep conceptually
- behavior to delete
- legacy systems avoided
- visible rename from Palette Browser / Manager to Palette Manager
- final rebuilt Palette Manager contract
- validation performed

## Rebuild Requirements
Create clean Palette Manager files in the preserved route folder:

```text
toolbox/Palette Browser/index.html
toolbox/Palette Browser/main.js
toolbox/Palette Browser/styles.css
```

The rebuilt tool must:

- display the visible name `Palette Manager`
- read `paletteJson` from session
- show palette name
- show swatches
- show swatch count
- show explicit empty state when no palette session data exists
- show explicit error state when session data is malformed
- use `toolbox/common/toolLayout.css`
- use `toolbox/common/sessionContext.js`
- use `toolbox/common/toolContract.js`
- use the header pattern from `/index.html`
- include an accordion that can hide/show the header/details region
- avoid `platformShell`
- avoid shared handoff
- avoid fallback data
- avoid hidden defaults
- avoid Workspace Manager v1 wiring

## Menu Rules
Each Tool v2 screen has two menu zones:

```text
menuTool
menuWorkspace
```

`menuTool` contains controls specific to the current tool launch.
`menuWorkspace` contains controls that update workspace session/context only.
Only controls for the specific launch are shown.
Workspace controls update only the workspace context.
Do not expose import/export controls unless this PR explicitly implements and validates them.
For Palette Manager in this PR, keep menus minimal and only show controls that are actually implemented.

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

For each group, list only controls that are needed by the rebuilt Palette Manager. Mark future groups as deferred, not implemented.

## Required Logs
Emit these logs from the rebuilt Palette Manager lifecycle:

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

If an existing roadmap item clearly matches Tool v2 or Palette Manager rebuild work, update status only:

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

Also run the smallest available targeted tool test if one exists for Palette or tool launch validation.

Do not run the full samples smoke test unless Codex can prove this PR modified shared sample loader/framework behavior. This PR should not modify that behavior.

## Acceptance Criteria
- Legacy implementation is preserved under `toolbox/Palette Browser-v1/`.
- Rebuilt visible tool name is `Palette Manager` everywhere visible in this PR.
- Rebuilt tool folder exists at `toolbox/Palette Browser/`.
- Rebuilt tool reads only session-backed `paletteJson`.
- Empty state is explicit and actionable.
- Malformed state is explicit and actionable.
- Header follows the repo root `/index.html` pattern.
- Header/details accordion can hide/show that region.
- `toolbox/common/` is used for new Tool v2 foundation.
- `src/shared/toolbox/` is not used by new Tool v2 files.
- Workspace Manager v1 is not modified or wired to Palette Manager.
- No schema, sample, or game files are changed.
- No fallback/default palette data exists.
- Required lifecycle logs are emitted.
- Targeted validation passes.
- Full samples smoke test is skipped with documented reason unless unexpectedly required.
