# PR_26126_092 Asset Manager V2 Palette Picker Notes

## Picker Mode
- The control label and button now read `Pick Asset`.
- File-backed types keep using the file picker and the selected Type accept filter.
- `Color` disables the file input and opens the palette picker instead.
- Tool mode without a Workspace V2 palette reports the missing palette colors in Status only.

## Palette Source
- Color picker swatches are read from the active Workspace V2 manifest at `tools["palette-browser"].swatches`.
- The picker does not include an arbitrary color input.
- Swatches render from the active palette only and use 20px visual swatches.

## Roles And Sorting
- Color roles are `hud`, `text`, `background`, `border`, `accent`, `warning`, `success`, `danger`, `shadow`, and `highlight`.
- The default Color role is `hud`.
- Changing the Color role regenerates the asset ID and revalidates the selected palette color.
- Sorting controls are available for Hue, Saturation, Brightness, Name, and Tag.

## Validation
- Playwright validates the Type radio list is alphabetized with Color included.
- Playwright validates file picker versus palette picker behavior, no arbitrary color input, 20px swatches, Name and Tag sorting, role changes, Status messages, and Workspace V2 insertion.
