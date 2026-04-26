# BUILD_PR_LEVEL_20_23_MOVE_TOOL_HOST_PAGER_INSIDE_MOUNT_CONTAINER

## Purpose

Move the `tool-host-pager` section out of the Workspace Manager host-shell top level and into the `data-tool-host-mount-container` content area.

## Exact User Correction

The problem is structural.

Current incorrect host shell:

```html
<main class="tool-host-workspace">
  <section class="tool-host-pager" aria-label="Workspace tool pager">
    ...
  </section>
  <div data-tool-host-mount-container class="tool-host-workspace__mount"></div>
</main>
```

Because `tool-host-pager` is a sibling before the mount container, it renders at the top of the screen.

Required structure/behavior:

```html
<main class="tool-host-workspace">
  <div data-tool-host-mount-container class="tool-host-workspace__mount">
    <!-- mounted Workspace Manager content -->
    <!-- tool-host-pager is rendered INSIDE this content, above Editors -->
  </div>
</main>
```

## Scope

One PR purpose only:

- remove `section.tool-host-pager` from the top-level host shell in `tools/Workspace Manager/index.html`
- ensure pager markup is created/rendered inside `data-tool-host-mount-container`
- place the pager inside mounted Workspace Manager content above Editors
- keep pager behavior wired to existing Prev/Next/current-label/select behavior
- preserve game context and mounted tool behavior

## Required HTML Result

`tools/Workspace Manager/index.html` must no longer contain this top-level sibling before the mount container:

```html
<section class="tool-host-pager" aria-label="Workspace tool pager">
```

The host shell should keep only the mount container under the main shell, unless existing required shell elements already belong there:

```html
<body class="tool-host-page">
  <main class="tool-host-workspace">
    <div data-tool-host-mount-container class="tool-host-workspace__mount"></div>
  </main>
  <script type="module" src="./main.js"></script>
</body>
```

## Required Runtime Behavior

For:

```text
tools/Workspace Manager/index.html?gameId=Bouncing-ball&mount=game
```

Runtime must:

- render Workspace Manager content inside `data-tool-host-mount-container`
- render the pager inside that mount container
- place pager above the Editors section/card grid
- not render pager at the top of the screen
- not render pager before Toolbox Aid shared header/site chrome
- select first available tool on load
- show selected tool name between `[PREV]` and `[NEXT]`
- Prev/Next changes selected/mounted tool

## Required Pager Markup

Pager may use the same attributes/classes, but must be generated inside the mount container:

```html
<section class="tool-host-pager" aria-label="Workspace tool pager">
  <button type="button" data-tool-host-prev class="tool-host-pager__button">[PREV]</button>
  <span data-tool-host-current-label class="tool-host-pager__name">...</span>
  <button type="button" data-tool-host-next class="tool-host-pager__button">[NEXT]</button>
  <select id="tool-host-select" data-tool-host-select class="tool-host-pager__select" tabindex="-1" aria-hidden="true"></select>
</section>
```

But this section must be a descendant of:

```html
[data-tool-host-mount-container]
```

## Forbidden Changes

Codex must NOT:

- leave `tool-host-pager` as a sibling before mount container
- create a second duplicate pager
- place pager above the site header/chrome
- append pager to `document.body`
- restore dropdown + Select Tool + Mount workflow
- restore `gameId || game`
- change samples behavior
- change game `Open with Workspace Manager` behavior
- modify unrelated tools/games/samples
- modify `start_of_day`
- broad refactor Workspace Manager

## User-Approved Behavior

For this PR:

- first available tool is selected on page load
- selected tool is mounted/active on page load

## Required Validation

Create:

- `docs/dev/reports/tool_host_pager_inside_mount_container_validation.md`

Validation must include:

- changed files
- proof `tools/Workspace Manager/index.html` no longer has top-level `section.tool-host-pager`
- proof `section.tool-host-pager` is rendered inside `[data-tool-host-mount-container]`
- proof pager appears above Editors/card grid inside mounted content
- proof pager is not above Toolbox Aid site header/chrome
- proof first available tool selected/mounted on load
- proof Prev/Next changes selected/mounted tool
- proof `gameId || game` fallback is not restored
- proof samples remain untouched
- anti-pattern self-check

## Acceptance

- `tool-host-pager` is no longer outside the mount container.
- Pager appears inside mounted Workspace Manager content.
- Pager appears above Editors.
- Pager is no longer at the top of the screen.
