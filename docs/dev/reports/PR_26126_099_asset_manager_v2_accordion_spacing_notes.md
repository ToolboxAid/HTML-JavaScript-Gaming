# PR_26126_099 Asset Manager V2 Accordion Spacing Notes

## History Accordion
- History now uses the shared `accordion-v2` header/body markup with `assetHistoryContent`.
- The History header is bound by the existing Asset Manager V2 accordion controller.
- Collapsing History hides the body, updates `aria-expanded`, updates the icon state, and reduces the accordion section height.
- History remains outside Asset Controls and directly under the Asset Controls accordion in the left panel.

## Spacing
- Open accordions now size to content by default instead of flexing to fill all available panel height.
- Output Summary and Status keep explicit fill behavior where their panel layout depends on it.
- Asset Controls, Assets, and Selected Asset Detail no longer carry measurable trailing body gap after their final visible child.

## Scope Guard
- No asset schema files were changed.
- Import/export behavior was not changed.
- Asset path handling was not changed.
- Sample JSON files were not modified.

## Validation
- `npm run test:workspace-v2` validates History collapse/expand behavior and trailing spacing for Asset Controls, Assets, and Selected Asset Detail.
