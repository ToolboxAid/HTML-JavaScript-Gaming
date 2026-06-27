# PR_26152_056 Tool Shell Flex Center Layout Validation

## Scope
- Read docs_build/dev/PROJECT_INSTRUCTIONS.md before implementation.
- Changed only the active reusable public tool-shell layout CSS used by the affected root public shell pages.
- Affected behavior surface: the 11 root /toolbox/*.html pages that use .tool-workspace and tool-display-mode.js side-column collapse controls.
- /toolbox/index.html was validated as the root Tools entry/link surface.
- No tool HTML, JavaScript, data, images, partials, Admin, Account, Company, Games, Samples, or root index files were changed.
- No page-local CSS, tool-local CSS, inline style/script/event handlers, or new component behavior were added.

## Implementation
- Updated GameFoundryStudio/assets/css/gamefoundrystudio.css .tool-workspace grid tracks.
- Open side columns now use the same fixed approved width already used by focus mode: 280px.
- Collapsed side columns use the existing fixed rail width: 56px.
- Center column now uses minmax(0, 1fr) so it flexes to fill available horizontal space.
- The existing focus-mode grid tracks were left unchanged.

## Targeted Browser Validation
Command: inline Node static server plus Playwright Chromium targeted to /toolbox/index.html and the affected root shell pages.
Viewport: 1440 x 960.

Validated pages:
- /toolbox/ai-assistant.html
- /toolbox/animation-studio.html
- /toolbox/asset-studio.html
- /toolbox/code-studio.html
- /toolbox/input-studio.html
- /toolbox/midi-studio.html
- /toolbox/object-vector-studio.html
- /toolbox/palette-manager.html
- /toolbox/particle-studio.html
- /toolbox/sound-studio.html
- /toolbox/storage-inspector.html

Measured result on every affected shell page:
- Initial open layout: 280px / 584px / 280px.
- Left collapsed: 56px / 808px / 280px.
- Left reopened: 280px / 584px / 280px.
- Right collapsed: 280px / 808px / 56px.
- Right reopened: 280px / 584px / 280px.
- Both collapsed: 56px / 1032px / 56px.
- Final reopened: 280px / 584px / 280px.

PASS - Left column stayed fixed at 280px when open.
PASS - Right column stayed fixed at 280px when open.
PASS - Collapsed left rail measured 56px.
PASS - Collapsed right rail measured 56px.
PASS - Left collapse expanded the center column from 584px to 808px.
PASS - Right collapse expanded the center column from 584px to 808px.
PASS - Both collapsed expanded the center column to the maximum measured width of 1032px.
PASS - Reopening columns restored both side columns to 280px and did not resize them beyond the approved width.
PASS - Center header remained h2 Workspace on every affected page.
PASS - Center image, display-mode badge, and display-mode character image loaded on every affected page.
PASS - Existing vertical accordions closed and reopened on every affected page.
PASS - No browser console errors, request failures, 404s, or 403s were detected.
PASS - /toolbox/index.html rendered, loaded 18 tile images, and contained links to all 11 affected root shell pages.

## Static Validation
PASS - git diff --check HEAD~1 HEAD -- GameFoundryStudio/assets/css/gamefoundrystudio.css.
PASS - git diff --name-only HEAD~1 HEAD reported only GameFoundryStudio/assets/css/gamefoundrystudio.css.
PASS - git diff --name-only HEAD~1 HEAD across tools, GameFoundryStudio/assets/js, GameFoundryStudio/assets/partials, GameFoundryStudio/assets/css/theme/v2, Admin, Account, Company, Games, Samples, and root index returned no files.
PASS - No inline style/script/event handlers or imageDataUrl references were introduced.

## Tests Intentionally Not Run
- No repo-wide tests were run.
- No tests outside affected root Tools/GameFoundryStudio paths were run.
- No Admin, Account, Company, Games, Samples, root index, or first-class runtime tool pages were exercised beyond static scope checks.

## Samples Decision
- SKIP because this PR changes only the root public tool-shell layout behavior and does not affect samples.
