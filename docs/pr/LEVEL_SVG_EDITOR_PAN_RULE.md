# LEVEL_SVG_EDITOR_PAN_RULE

## Rule
Remove the Pan button from the SVG Background Editor UI.

## Replacement Behavior
- middle mouse drag performs canvas pan
- wheel zoom remains unchanged if already supported
- pan should work in both edit and selection contexts where safe

## UX Intent
Panning is a navigation gesture, not a primary tool mode.
The button is redundant when middle mouse already owns that behavior.
