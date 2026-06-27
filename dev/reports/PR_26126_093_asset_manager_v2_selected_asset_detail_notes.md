# PR_26126_093 Asset Manager V2 Selected Asset Detail Notes

## UI Placement
- Selected asset metadata moved out of the preview card.
- Asset metadata now appears in a dedicated `Selected Asset Detail` accordion under the Assets panel.
- The preview card now focuses on media or inspection rendering.

## Detail Fields
- The selected detail control renders:
  - `type/kind`
  - `ID`
  - `Type`
  - `Kind`
  - `Role`
  - `Path`
  - `Final ID`

## Related Controls
- Asset Controls `ID` is now disabled and visibly grayed out.
- `Path` remains read-only.
- Stretch Override is now a bordered fieldset matching the Type, Pick Asset, and History group styling.
- Stretch Override remains visible only when Role is `bezel`.

## Validation
- Playwright validates the selected detail rows after asset insertion.
- Playwright validates the disabled ID field and the bordered Stretch Override group.
