# TOOL_LAUNCH_SSOT.md

## Purpose

This document is the Single Source of Truth for sample, game, tool, and Workspace Manager launch behavior.

No implementation may contradict this file.

## Required Launch Rules

### Samples

All samples that launch a tool MUST launch the tool directly through:

```text
tools/<tool>/index.html
```

Sample launch actions MUST be labeled:

```text
Open <tool>
```

Samples MUST NOT launch tools through duplicated wrapper pages, fallback pages, alternate paths, or implicit default behavior.

### Games

All games that launch tool/workspace functionality MUST launch through:

```text
tools/Workspace Manager/index.html
```

Game launch actions MUST be labeled:

```text
Open with Workspace Manager
```

Games MUST NOT directly launch individual tools unless a future PR explicitly changes this rule.

### Tools

Every tool MUST have an explicit launch target:

```text
tools/<tool>/index.html
```

Each tool launch path MUST be defined once in the launch SSoT.

### Workspace Manager

Workspace Manager MUST launch from:

```text
tools/Workspace Manager/index.html
```

Workspace Manager is the required game-side entry point for tool/workspace flows.

## External Launch Memory Rules

An external launch is any launch that begins from:

- `samples/index.html`
- any sample page
- `games/index.html`
- any game page

External launches MUST clear launch memory before loading the target tool or workspace.

External launches MUST NOT reuse prior tool state, prior workspace state, stale selected tool values, stale selected game values, stale launch context, or prior session carryover.

## Query Contract

For game-to-workspace launch, the accepted game identifier query field is:

```text
gameId
```

Workspace Manager MUST NOT fallback from `gameId` to `game`.

If `gameId` is missing or invalid, launch must fail visibly.

## No Default / No Fallback Rule

The launch system MUST NOT use defaults or fallbacks.

Forbidden:

- default tool
- default workspace
- default route
- fallback route
- fallback tool
- fallback launch mode
- silent redirect
- automatic correction of missing launch data
- first tool selection
- first item selection
- guessing from label text
- guessing from DOM order
- guessing from prior memory
- legacy query fallback such as `gameId || game`

If required launch data is missing, the launch must fail visibly and diagnostically instead of guessing.

## UAT Path

Primary UAT flow:

```text
games/index.html
  -> Open with Workspace Manager
  -> tools/Workspace Manager/index.html?gameId=<id>&mount=game
  -> external memory is cleared
  -> workspace loads explicit game/workspace context
  -> no fallback/default behavior is used
```

Secondary UAT flow:

```text
samples/index.html
  -> Open <tool>
  -> tools/<tool>/index.html
  -> external memory is cleared
  -> tool loads explicit sample/tool context
```

## Status

This spec is authoritative for Phase 20 recovery and all follow-up launch PRs.
