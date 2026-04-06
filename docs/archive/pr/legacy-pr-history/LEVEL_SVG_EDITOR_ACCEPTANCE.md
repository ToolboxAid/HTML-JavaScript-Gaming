# LEVEL_SVG_EDITOR_ACCEPTANCE

## Acceptance Criteria
- Paint and Stroke use the existing palette select-and-draw workflow
- active Paint/Stroke values persist after selection
- active values do not change unless the user changes them
- disabled controls remain disabled until the required selection exists
- used colors appear as swatches above the palette
- swatch clicks behave like fast palette selection
- no engine core API changes

## Non-Goals
- redesigning the overall palette model
- adding complex gradient/material systems in this PR
