# BUILD_PR_LEVEL_20_20_ROLLBACK_WORKSPACE_HEADER_AND_ADD_TOOL_PAGER

## Purpose

Rollback the broken Workspace Manager header/banner attempts and restore the page to the pre-header layout, then add only the requested tool pager above the tools/editors section.

## User Direction

The current Workspace Manager page is unacceptable:

- the unwanted header/banner is still present
- only the site image is showing below it
- the normal Workspace Manager content is not loading as expected
- previous attempts must be rolled back

User wants exactly:

```text
load the page the way it was loading prior to this crap show
then place the [prev] <toolname> [next] above the tools
period
roll back this crap
```

## Rollback Anchor

Use the commit immediately before the Workspace Manager header/banner attempts began.

Likely anchor commit comment:

```text
Remove Workspace Manager default and query fallbacks
```

This corresponds to the state after `BUILD_PR_LEVEL_20_13_REMOVE_WORKSPACE_MANAGER_DEFAULT_AND_QUERY_FALLBACKS` and before `BUILD_PR_LEVEL_20_14_WORKSPACE_MANAGER_SHOW_TOOLS_ON_GAME_LAUNCH`.

## Scope

One PR purpose only:

1. Restore Workspace Manager runtime/layout files to the pre-header/broken-banner state.
2. Add one centered pager directly above the existing tools/editors section:

```text
[PREV] <toolname> [NEXT]
```

Do not keep any of the new header/banner/control-area experiments.

## Required Restore Behavior

Workspace Manager must load the way it did before the broken header/banner attempts:

- normal Toolbox Aid shared page/header remains as existing site chrome
- normal Workspace Manager content appears below site chrome
- normal tools/editors section appears
- existing game context/status appears
- no detached Workspace Manager top banner replaces/blocks content
- no blank/partial page with only the site image

## Required New Pager

Directly above the existing tools/editors section, centered, add:

```text
[PREV] <toolname> [NEXT]
```

On page load:

- selected tool name defaults to first available tool in the current game context
- selected tool is active/mounted
- Prev changes to previous available tool
- Next changes to next available tool
- current tool name updates between buttons
- the existing tools/editors section remains visible

## Explicit Rollback Instructions

Codex must inspect git history and restore only the Workspace Manager files affected by the failed 20_14 through 20_19 attempts.

Likely files:

- `tools/Workspace Manager/main.js`
- `tools/Workspace Manager/index.html`
- any Workspace Manager CSS touched by 20_14 through 20_19

Codex must not rollback unrelated files or unrelated successful recovery work.

Use git history to identify exact diffs:

- compare current Workspace Manager files against the commit with comment:
  - `Remove Workspace Manager default and query fallbacks`
- restore those Workspace Manager layout/render files to that state
- then apply only the pager change

## Forbidden Changes

Codex must NOT:

- keep the new Workspace Manager top header/banner/control area
- keep the broken page state where only site image appears
- create another header
- create another banner
- hide normal Workspace Manager content
- use dropdown + Select Tool + Mount workflow
- change samples behavior
- change game `Open with Workspace Manager` behavior
- restore `gameId || game`
- change unrelated tools/games/samples
- modify `start_of_day`
- rewrite roadmap text outside status markers
- broad refactor Workspace Manager

## Anti-Pattern Guards

Do not introduce:

- alias variables
- pass-through variables
- duplicate state
- stored derived state
- vague names
- hidden query fallback
- duplicated launch paths
- silent redirects
- silent caught errors
- legacy query fallback
- stale memory reuse
- label-text route guessing
- DOM-order route guessing

## Required Validation

Create:

- `docs/dev/reports/workspace_manager_rollback_header_and_tool_pager_validation.md`

Validation must include:

- commit hash and commit comment used as rollback anchor
- changed files
- proof failed header/banner/control area is removed
- proof normal Workspace Manager page content loads below site chrome
- proof only requested `[PREV] <toolname> [NEXT]` pager was added
- proof pager appears above existing tools/editors section
- proof first available tool selected/mounted on load
- proof Prev/Next changes selected/mounted tool
- proof `gameId || game` fallback was not restored
- proof samples remain untouched
- anti-pattern self-check

## Acceptance

- Workspace Manager page loads like pre-header state.
- Broken header/banner experiments are gone.
- Normal Workspace Manager tools/editors content is visible.
- `[PREV] <toolname> [NEXT]` appears above tools/editors.
- First available tool is selected/mounted.
- Prev/Next switches tools.
