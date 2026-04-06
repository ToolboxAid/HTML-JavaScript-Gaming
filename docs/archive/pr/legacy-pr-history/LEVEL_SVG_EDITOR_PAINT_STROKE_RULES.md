# LEVEL_SVG_EDITOR_PAINT_STROKE_RULES

## Core Rule
Paint and Stroke must use the existing palette selection workflow.

## Required Behavior
- user selects a palette color first
- selected color becomes the active Paint or Stroke value
- active Paint and Stroke values are stored in editor state
- once selected, Paint and Stroke remain unchanged until the user intentionally picks a different color
- drawing new shapes uses the currently stored Paint and Stroke values
- selecting another object must not silently overwrite the stored active Paint or Stroke

## UX Intent
Color choice should feel deliberate and stable, not transient.
