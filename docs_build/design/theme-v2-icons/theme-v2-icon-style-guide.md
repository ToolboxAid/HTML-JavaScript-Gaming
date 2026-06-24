# Theme V2 Icon Style Guide

## Purpose
Provide the approved validation and usage language for shared Theme V2 SVG icons.

The SVG files in `assets/theme-v2/svg/` are the authoritative Theme V2 icon source.

## Artwork Authority
The SVG artwork is user-authored and approved.

Do not regenerate, redesign, simplify, optimize, or redraw these SVG files during validation-only PRs.

If a required SVG is missing, report validation failure instead of generating a replacement.

Do not replace the SVG files with CSS-only or JS-only icon generation.

## SVG Validation Standard
Every required SVG must be a standalone file under `assets/theme-v2/svg/`.

Every required SVG must be well-formed XML.

Every required SVG must use:
- `viewBox="0 0 24 24"`
- `fill="none"`
- `stroke="currentColor"`
- `stroke-linecap="round"`
- `stroke-linejoin="round"`

The approved files may include additional SVG attributes or path geometry as authored. Validation should not inspect, simplify, optimize, or rewrite artwork geometry.

## Required Icon Files
- `gfs-chevron-left.svg`
- `gfs-chevron-right.svg`
- `gfs-chevron-up.svg`
- `gfs-chevron-down.svg`
- `gfs-add.svg`
- `gfs-subtract.svg`
- `gfs-trash.svg`
- `gfs-close.svg`
- `gfs-warning.svg`
- `gfs-error.svg`
- `gfs-success.svg`
- `gfs-info.svg`
- `gfs-fullscreen.svg`
- `gfs-exit-fullscreen.svg`
- `gfs-menu.svg`
- `gfs-search.svg`
- `gfs-settings.svg`

## Naming Rules
Use `trash` naming instead of `delete`.

Use `fullscreen` and `exit-fullscreen` naming.

Do not add `expand`, `collapse`, or `delete` SVG names in this registry.
