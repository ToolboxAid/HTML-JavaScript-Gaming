# PR_26156_125 Tool Group Color Correction Pass Report

## Scope

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Treated `PR_26156_124` as incomplete because active tool page side panels still retained fixed left/right header color classes and the shared panel styling did not visibly apply the Toolbox group color to the full side panel treatment.
- Used `toolbox/index.html` Group tab rendering source in `toolbox/tools-page-accordions.js` as the source of truth:
  - `toolColorGroups` maps tool labels to Toolbox groups.
  - `groupClassMap` maps Toolbox groups to `tool-group-*` classes.
- Updated all active `toolbox/<tool>/index.html` pages so side columns keep the correct group class and their `tool-column-header` elements no longer carry fixed legacy color classes.
- Added reusable Theme V2 side-panel styling in `assets/theme-v2/css/panels.css` so `.tool-column[class*="tool-group-"]` uses `--tool-group-color` and `--tool-group-accent` for panel border, header background/border, accordion borders, and summary text.
- Did not modify `toolbox/index.html`.
- Did not modify archived V1/V2 pages.
- Did not modify `start_of_day` folders.
- Did not add raw color values to tool pages.
- Did not add page-local CSS, tool-local CSS, inline styles, style blocks, script blocks, or inline event handlers.

## Before/After Table

| Active tool | Expected group | Expected color token/class | Previous page value | Corrected page value |
| --- | --- | --- | --- | --- |
| AI Assistant | AI | tool-group-ai<br>--tool-group-color: var(--purple) | side: tool-group-ai <br> tool-group-ai<br>headers: molten-orange <br> forge-gold | side: tool-group-ai <br> tool-group-ai<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Project Workspace | Build/Create | tool-group-build-create<br>--tool-group-color: var(--red) | side: tool-group-build-create <br> tool-group-build-create<br>headers: electric-blue <br> forge-gold | side: tool-group-build-create <br> tool-group-build-create<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Game Design | Design | tool-group-design<br>--tool-group-color: var(--pink) | side: tool-group-design <br> tool-group-design<br>headers: molten-orange <br> forge-gold | side: tool-group-design <br> tool-group-design<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Game Configuration | Build/Create | tool-group-build-create<br>--tool-group-color: var(--red) | side: tool-group-build-create <br> tool-group-build-create<br>headers: molten-orange <br> forge-gold | side: tool-group-build-create <br> tool-group-build-create<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Assets | Design | tool-group-design<br>--tool-group-color: var(--pink) | side: tool-group-design <br> tool-group-design<br>headers: molten-orange <br> forge-gold | side: tool-group-design <br> tool-group-design<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Colors | Design | tool-group-design<br>--tool-group-color: var(--pink) | side: tool-group-design <br> tool-group-design<br>headers: molten-orange <br> forge-gold | side: tool-group-design <br> tool-group-design<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Fonts | Design | tool-group-design<br>--tool-group-color: var(--pink) | side: tool-group-design <br> tool-group-design<br>headers: molten-orange <br> forge-gold | side: tool-group-design <br> tool-group-design<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Sprites | Design | tool-group-design<br>--tool-group-color: var(--pink) | side: tool-group-design <br> tool-group-design<br>headers: molten-orange <br> forge-gold | side: tool-group-design <br> tool-group-design<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Characters | Design | tool-group-design<br>--tool-group-color: var(--pink) | side: tool-group-design <br> tool-group-design<br>headers: molten-orange <br> forge-gold | side: tool-group-design <br> tool-group-design<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Objects | Design | tool-group-design<br>--tool-group-color: var(--pink) | side: tool-group-design <br> tool-group-design<br>headers: molten-orange <br> forge-gold | side: tool-group-design <br> tool-group-design<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Worlds | Design | tool-group-design<br>--tool-group-color: var(--pink) | side: tool-group-design <br> tool-group-design<br>headers: molten-orange <br> forge-gold | side: tool-group-design <br> tool-group-design<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Animations | Design | tool-group-design<br>--tool-group-color: var(--pink) | side: tool-group-design <br> tool-group-design<br>headers: molten-orange <br> forge-gold | side: tool-group-design <br> tool-group-design<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Audio | Audio | tool-group-audio<br>--tool-group-color: var(--orange) | side: tool-group-audio <br> tool-group-audio<br>headers: molten-orange <br> forge-gold | side: tool-group-audio <br> tool-group-audio<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Music | Audio | tool-group-audio<br>--tool-group-color: var(--orange) | side: tool-group-audio <br> tool-group-audio<br>headers: molten-orange <br> forge-gold | side: tool-group-audio <br> tool-group-audio<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Voices | Audio | tool-group-audio<br>--tool-group-color: var(--orange) | side: tool-group-audio <br> tool-group-audio<br>headers: molten-orange <br> forge-gold | side: tool-group-audio <br> tool-group-audio<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Videos | Audio | tool-group-audio<br>--tool-group-color: var(--orange) | side: tool-group-audio <br> tool-group-audio<br>headers: molten-orange <br> forge-gold | side: tool-group-audio <br> tool-group-audio<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Build Game | Build/Create | tool-group-build-create<br>--tool-group-color: var(--red) | side: tool-group-build-create <br> tool-group-build-create<br>headers: molten-orange <br> forge-gold | side: tool-group-build-create <br> tool-group-build-create<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Game Testing | Play | tool-group-play<br>--tool-group-color: var(--green) | side: tool-group-play <br> tool-group-play<br>headers: molten-orange <br> forge-gold | side: tool-group-play <br> tool-group-play<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Controls | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: molten-orange <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Hitboxes | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: molten-orange <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Saved Data | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: molten-orange <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Debug | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: molten-orange <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Performance | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: molten-orange <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Events | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: molten-orange <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Publish | Marketplace | tool-group-marketplace<br>--tool-group-color: var(--gold) | side: tool-group-marketplace <br> tool-group-marketplace<br>headers: molten-orange <br> forge-gold | side: tool-group-marketplace <br> tool-group-marketplace<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Marketplace | Marketplace | tool-group-marketplace<br>--tool-group-color: var(--gold) | side: tool-group-marketplace <br> tool-group-marketplace<br>headers: molten-orange <br> forge-gold | side: tool-group-marketplace <br> tool-group-marketplace<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Community | Marketplace | tool-group-marketplace<br>--tool-group-color: var(--gold) | side: tool-group-marketplace <br> tool-group-marketplace<br>headers: molten-orange <br> forge-gold | side: tool-group-marketplace <br> tool-group-marketplace<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Languages | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: molten-orange <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Achievements | Play | tool-group-play<br>--tool-group-color: var(--green) | side: tool-group-play <br> tool-group-play<br>headers: molten-orange <br> forge-gold | side: tool-group-play <br> tool-group-play<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Ratings | Play | tool-group-play<br>--tool-group-color: var(--green) | side: tool-group-play <br> tool-group-play<br>headers: molten-orange <br> forge-gold | side: tool-group-play <br> tool-group-play<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Cloud | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: electric-blue <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Custom Extensions | Build/Create | tool-group-build-create<br>--tool-group-color: var(--red) | side: tool-group-build-create <br> tool-group-build-create<br>headers: molten-orange <br> forge-gold | side: tool-group-build-create <br> tool-group-build-create<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| MIDI | Audio | tool-group-audio<br>--tool-group-color: var(--orange) | side: tool-group-audio <br> tool-group-audio<br>headers: molten-orange <br> forge-gold | side: tool-group-audio <br> tool-group-audio<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Particles | Audio | tool-group-audio<br>--tool-group-color: var(--orange) | side: tool-group-audio <br> tool-group-audio<br>headers: molten-orange <br> forge-gold | side: tool-group-audio <br> tool-group-audio<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Audio Effects | Audio | tool-group-audio<br>--tool-group-color: var(--orange) | side: tool-group-audio <br> tool-group-audio<br>headers: molten-orange <br> forge-gold | side: tool-group-audio <br> tool-group-audio<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Voice Capture | Audio | tool-group-audio<br>--tool-group-color: var(--orange) | side: tool-group-audio <br> tool-group-audio<br>headers: molten-orange <br> forge-gold | side: tool-group-audio <br> tool-group-audio<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Voice Output | Audio | tool-group-audio<br>--tool-group-color: var(--orange) | side: tool-group-audio <br> tool-group-audio<br>headers: molten-orange <br> forge-gold | side: tool-group-audio <br> tool-group-audio<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Users | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: molten-orange <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Environments | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: molten-orange <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Game Migration | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: molten-orange <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |
| Platform Settings | Platform | tool-group-platform<br>--tool-group-color: var(--electric-blue) | side: tool-group-platform <br> tool-group-platform<br>headers: molten-orange <br> forge-gold | side: tool-group-platform <br> tool-group-platform<br>headers: token-inherited <br> token-inherited<br>panel CSS: group token border/header |

## Validation

Impacted lane:

- `tool-runtime` - active tool page UI/color lane.

Commands and checks run:

- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- before/after active tool page audit against Toolbox Group tab mapping
- `npm run test:lane:tool-runtime`
- `git diff --check`
- changed-file static validation for archive/start_of_day paths and inline style/script/event-handler additions
- active tool header scan confirmed no legacy fixed `tool-column-header` color classes remain
- `toolbox/index.html` diff check confirmed no changes

Results:

- Before audit: 41 active pages retained fixed header color classes such as `molten-orange`, `forge-gold`, or `electric-blue` even where the side column wrapper class matched the group.
- After audit: 41 active pages use group-token side columns and token-inherited headers.
- Targeted lane: `npm run test:lane:tool-runtime` passed, 5 Playwright tests.
- Changed-file/static validation: passed.
- Full samples smoke: skipped by request.

Skipped lanes:

- Full samples smoke: skipped by request.
- Broad workspace/full-suite validation: skipped because the change is scoped to active tool side-panel markup, reusable Theme V2 panel styling for `.tool-column[class*="tool-group-"]`, and targeted Playwright coverage for the active tool page UI/color lane.
