# PR_26156_114-117 Tool Image UI Closeout

## Scope
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Fixed remaining Toolbox card image display behavior after the approved asset coverage closeout.
- Kept the change scoped to registry-backed Toolbox card image rendering and the existing targeted tool image lane.
- Did not add local CSS, inline styles, script blocks, page-local image logic, or new image assets.
- Did not modify `start_of_day`.

## Implementation Notes
- `toolbox/toolRegistry.js`
  - Tightened `getToolImageSource()` and `toolImageUsesFallback()` so non-approved image paths fall back instead of being treated as valid.
  - Added `getToolImageDiagnostics()` for registry-level missing/invalid image messages.
- `toolbox/tools-page-accordions.js`
  - Kept Toolbox card preview images registry-driven through `getToolImageSource(tool, "tool")`.
  - Converted Toolbox card badges from `<object>` to registry-backed `<img>` elements using `getToolImageSource(tool, "badge")`.
  - Added shared card-level missing-image diagnostics using existing Theme V2 `status` styling.
  - Runtime image failures now show visible diagnostic text in the affected card and switch that image to `/assets/theme-v2/images/image-missing.svg`.
- `tests/playwright/tools/ToolImageRegistry.spec.mjs`
  - Added registry diagnostic coverage for missing approved badge/tool paths.
  - Updated Toolbox card checks to validate badge `<img>` paths.
  - Added UI coverage proving a visible card diagnostic appears when preview or badge image loading fails.

## Approved Image Paths
- Badge images remain constrained to `/assets/theme-v2/images/badges/`.
- Tool images remain constrained to `/assets/theme-v2/images/tools/`.
- Missing images fall back through the registry/shared renderer to `/assets/theme-v2/images/image-missing.svg`.
- Registry image references with size suffixes remain rejected by the existing targeted lane.

## Theme V2 Gap Findings
- No Theme V2 gap found.
- Existing Theme V2 `status`, card, and image-media classes were sufficient.
- No CSS was added or modified.

## Validation Notes
- Impacted lane: `tool-images`.
- Command: `npm run test:lane:tool-images`.
- Result: PASS, 5 Playwright tests.
- Static checks:
  - `node --check toolbox/toolRegistry.js` - PASS
  - `node --check toolbox/tools-page-accordions.js` - PASS
  - `node --check tests/playwright/tools/ToolImageRegistry.spec.mjs` - PASS
  - Scoped `git diff --check` for changed implementation/test/report files - PASS
- Targeted guard checks:
  - No local CSS, inline styles, script blocks, page-local image logic, or `<object>` badge usage were introduced in the changed files.
  - No `start_of_day` references were introduced in changed files.
  - No approved image registry paths with `-64`, `-1024`, or `-400x225` suffixes were introduced in changed files.

## Manual Test Notes
- Toolbox page was exercised by the targeted Playwright lane at `/toolbox/index.html?role=admin`.
- The Game Design Toolbox card loaded its preview and badge image from registry-approved paths.
- Complete image coverage rendered without visible diagnostics.
- Simulated preview image failure displayed `Tool image missing; fallback shown.` in the card.
- Simulated badge image failure displayed `Badge image missing; fallback shown.` in the card.
- Representative Tool Display Mode pages continued to consume registry badge/tool images.

## Skipped Lanes
- Full samples smoke: skipped by request.
- Broad Project Workspace / Toolbox navigation suites: skipped because this PR only changes Toolbox image UI behavior and the existing `tool-images` lane directly owns that surface.
- Archive validation: skipped because archive content was not modified.
