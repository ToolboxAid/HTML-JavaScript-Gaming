# BUILD_PR_LEVEL_20_21_REPAIR_WORKSPACE_MOUNT_CONTAINER_PAGER

## Purpose

Repair Workspace Manager by treating `tools/Workspace Manager/index.html` as the tool-host shell and ensuring the selected tool/workspace surface is loaded into:

```html
<div data-tool-host-mount-container class="tool-host-workspace__mount"></div>
```

## User Diagnosis

The current `tools/Workspace Manager/index.html` is:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Workspace Manager</title>
  <link rel="stylesheet" href="./toolHost.css" />
</head>
<body class="tool-host-page">
  <main class="tool-host-workspace">
    <section class="tool-host-pager" aria-label="Workspace tool pager">
      <button type="button" data-tool-host-prev class="tool-host-pager__button">[PREV]</button>
      <span data-tool-host-current-label class="tool-host-pager__name">No tool available</span>
      <button type="button" data-tool-host-next class="tool-host-pager__button">[NEXT]</button>
      <select id="tool-host-select" data-tool-host-select class="tool-host-pager__select" tabindex="-1" aria-hidden="true"></select>
    </section>
    <div data-tool-host-mount-container class="tool-host-workspace__mount"></div>
  </main>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

The issue is likely that the pager was added to the host shell, but nothing meaningful is being mounted into `data-tool-host-mount-container`.

## Scope

One PR purpose only:

- keep the current host shell structure
- use the pager as the host-level tool selector
- ensure the active selected tool/workspace surface is mounted into `data-tool-host-mount-container`
- do not try to rebuild the outer Workspace Manager page chrome inside `index.html`
- do not add another header/banner

## Required Behavior

For:

```text
tools/Workspace Manager/index.html?gameId=Breakout&mount=game
```

Workspace Manager host shell must:

- render pager at the top of the host shell
- resolve explicit `gameId`
- derive the available tool list for that game
- default pager label to the first available tool name
- mount/load the first available tool into `data-tool-host-mount-container`
- Prev/Next changes selected tool
- Prev/Next remounts/loads selected tool into `data-tool-host-mount-container`
- the mount container must not remain blank
- if mount fails, show visible diagnostic inside `data-tool-host-mount-container`

## Placement Rule

Do not move pager into the mounted tool page.

Pager belongs in the host shell.

Mounted content belongs inside:

```text
[data-tool-host-mount-container]
```

Do not inject pager into the Toolbox Aid site header or mounted tool content.

## Mount Container Rule

`data-tool-host-mount-container` must always show one of:

1. mounted selected tool/workspace content
2. visible diagnostic explaining why mount failed

It must never be blank for valid game-launched context.

## First Tool Rule

For this PR, first available tool selection is required and approved:

- first tool in available list is selected on load
- first tool is mounted into the mount container on load
- this is not considered a fallback anti-pattern for this PR

## Still Forbidden

Codex must NOT:

- restore `gameId || game`
- use legacy `game` query fallback
- use hidden fallback routing
- leave mount container blank
- create another header/banner
- move pager into mounted content
- use dropdown + Select Tool + Mount flow
- change sample `Open <tool>` behavior
- change game `Open with Workspace Manager` behavior
- modify unrelated tools/games/samples
- modify `start_of_day`
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
- stale memory reuse
- label-text route guessing
- DOM-order route guessing

## Required Validation

Create:

- `docs/dev/reports/workspace_manager_mount_container_pager_validation.md`

Validation must include:

- changed files
- proof `data-tool-host-mount-container` is found
- proof valid game-launched URL mounts selected tool content into that container
- proof first available tool is selected on load
- proof first available tool is mounted on load
- proof Prev/Next changes current label
- proof Prev/Next remounts selected tool into mount container
- proof blank mount container cannot occur silently
- proof visible diagnostic appears inside mount container on mount failure
- proof `gameId || game` fallback is not restored
- proof samples remain untouched
- anti-pattern self-check

## Acceptance

- Host shell renders.
- Pager stays in host shell.
- Mount container loads selected tool content.
- Mount container is not blank.
- Prev/Next updates and remounts tools.
