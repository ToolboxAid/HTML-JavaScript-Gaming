# PR_26132_020-object-vector-studio-v2-selection-paint-controls

## Scope

Updates Object Vector Studio V2 selection, object typing, hierarchy display, paint/stroke controls, and direct schema/runtime references only. No sample JSON changes and no World Vector Studio V2 changes.

## Changes

- Replaced asset category with one singular Object type field that uses type-ahead suggestions from existing object types and tags.
- Moved Object Actions to the bottom of the Objects accordion: Add, Rename, Duplicate, Delete.
- Updated Rename so the object name and object id change together.
- Reworked the Objects list into an `objects > object > shape` hierarchy with left-aligned text, selected object/shape highlighting, vertical scrolling, and icon-only eye/lock controls.
- Removed the duplicated shape list from Object Details and removed duplicated preview shape buttons that already exist in the left control surface.
- Moved z-order and grouping controls between Shape/Tools separators and kept shape tool buttons square with updated rectangle/circle/ellipse stroke weight and a five-sided polygon icon.
- Added Select deselect behavior: clicking Select with a selected shape clears shape selection.
- Added center mouse-wheel zoom on the Object Preview work surface.
- Removed Current Color from Palette and added selected-color visual emphasis on the active swatch.
- Implemented Paint and Stroke click behavior on shapes, including fill/stroke application, shift additive selection, alt eyedropper sampling, color swap, and default colors shortcuts.
- Added keyboard shortcuts: `V` Select, `F` Paint/Fill, `S` Stroke, `I` Eyedropper, `X` Swap fill/stroke, and `D` Default colors.
- Updated Object Vector Studio V2 docs to state that the paint/stroke model can scale later into shaders, gradients, patterns, neon, SVG export, and runtime rendering.
- Updated Object Vector Studio V2 schema and direct runtime/schema services so `category` is rejected and durable object payloads use the singular `type` field.

## Validation

Playwright impacted: Yes.

Commands run:

- `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- `node --check tools/object-vector-studio-v2/js/bootstrap.js`
- `node --check tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "shows Object Vector Studio V2 layout shell"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "supports Object Vector Studio V2 asset library inheritance"`
- `npm run test:workspace-v2`
- `npx playwright test --config tools/object-vector-studio-v2/playwright.config.mjs --reporter=list`

Result:

- Focused Workspace Manager V2 Object Vector Studio checks passed.
- Full Workspace Manager V2 suite passed: 45 passed.
- Tool-local Object Vector Studio V2 suite passed: 4 passed.
- Playwright V8 coverage refreshed at `docs/dev/reports/playwright_v8_coverage.txt`.
- Full samples smoke test skipped per request; this PR is limited to Object Vector Studio V2 UI/control behavior and direct schema/runtime references, with Workspace V2 and tool-local Playwright coverage covering the impacted surface.

## Playwright Coverage

Validates:

- Singular Object type type-ahead and asset category removal.
- Rename updates object id.
- Object/shape hierarchy selection and selected highlighting.
- Icon-only eye/lock controls and Objects container scrolling.
- Object Details no longer duplicates the shape list.
- Object Preview no longer duplicates shape action buttons.
- Shape z-order/group controls are between Shape/Tools separators.
- Selected color visual effect.
- Center mouse-wheel zoom.
- Select deselect behavior.
- Paint/stroke click behavior and keyboard shortcuts.

Expected pass behavior:

- Object Vector Studio V2 exposes one object type, displays a usable object/shape hierarchy, applies paint/stroke controls to selected shapes, and keeps schema/runtime payloads free of asset category data.

Expected fail behavior:

- Invalid object/category payload drift, missing palette, missing selection, locked object edits, and invalid transforms log visible/actionable WARN/FAIL entries and do not partially mutate or render invalid state.

## Manual Validation

1. Open `tools/object-vector-studio-v2/index.html`.
2. Load a valid Object Vector payload and runtime/session palette.
3. Confirm Object type is a single type-ahead field and no asset category control is visible.
4. Add and rename an object, then confirm the object id changes with the name.
5. Create shapes, select them from the Objects hierarchy, and confirm selected object/shape highlighting.
6. Use eye/lock icons on object tiles and shape rows.
7. Select Paint or Stroke, click shapes, and confirm fill/stroke values update.
8. Use `V`, `F`, `S`, `I`, `X`, and `D` shortcuts and confirm the Status Log records the operation.
9. Mouse-wheel over the center work surface and confirm zoom changes.

Expected outcome:

- Object Vector Studio V2 presents the requested hierarchy, selection, paint/stroke, and keyboard control model with no duplicated Object Details/Preview controls and no asset category payload persistence.

## Out Of Scope

- No sample JSON changes.
- No World Vector Studio V2 changes.
- No new major feature systems beyond the requested selection/paint control behavior.
- No full samples smoke test.
