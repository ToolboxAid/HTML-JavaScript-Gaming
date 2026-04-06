# LEVEL_SVG_EDITOR_ENABLEMENT_RULES

## Primary Rule
Nothing else is enabled until the required selection exists, except startup/file actions.

## Allowed Before Selection
- New
- Load
- Load Sample
- Open existing SVG/project
- basic view-only navigation if already open

## Disabled Until Valid Selection
- Paint apply
- Stroke apply
- most edit actions
- shape property edits
- transform actions
- delete selected element
- advanced styling controls

## Selection Gates
- color-dependent actions require an active palette selection
- object-dependent actions require an active SVG element selection
- drawing actions require the active tool and valid stored style state
