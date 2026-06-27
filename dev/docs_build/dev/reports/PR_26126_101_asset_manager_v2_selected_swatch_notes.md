# PR_26126_101 Asset Manager V2 Selected Swatch Notes

## Selected State
- Palette color swatches now re-render with a visible selected state after click.
- The selected swatch button receives `is-selected` and `aria-pressed="true"`.
- The selected swatch outer button border uses white.
- The selected swatch color indicator border also uses white.

## Scope
- The swatch name, tooltip, palette metadata, Color path, and Color ID generation are unchanged.
- The selected state follows the current normalized palette swatch by hex and name.

## Validation
- Playwright validates the selected UAT sample palette swatch has `aria-pressed="true"`.
- Playwright validates the selected swatch button border and inner color indicator border are white.
