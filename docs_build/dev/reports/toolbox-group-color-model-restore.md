# Toolbox Group Color Model Restore

PR bundle:
- PR_26155_093-toolbox-group-color-model-restore

## Restored Model

The restored Toolbox group/color model is:

| Color | Group |
| --- | --- |
| Purple | AI |
| Orange | Audio |
| Red | Build/Create |
| Pink | Design |
| Gold | Marketplace |
| Blue | Platform |
| Green | Play |

This model is independent from Project Build Path progress.

## Separation From Build Path

- Toolbox Group view is for category/color browsing.
- Project Build Path is for workflow order, project readiness, and "What should I do next?" guidance.
- Build Path remains project-specific and workflow-ordered.
- Publish remains required and is never allowed to render as `N/A`.

## Registry Mapping

Representative mappings:
- AI Assistant -> AI / Purple
- Audio, Music, Voices, Videos, MIDI, Particles, Audio Effects, Voice Capture, Voice Output -> Audio / Orange
- Project Workspace, Game Configuration, Build Game, Custom Extensions -> Build/Create / Red
- Game Design, Assets, Colors, Fonts, Sprites, Characters, Objects, Worlds, Animations -> Design / Pink
- Publish, Marketplace, Community -> Marketplace / Gold
- Controls, Hitboxes, Saved Data, Debug, Performance, Events, Languages, Cloud -> Platform / Blue
- Game Testing, Achievements, Ratings -> Play / Green

## Theme V2 Gap Findings

No new Theme V2 gap was found.

The change reused existing Theme V2 color tokens and updated shared group classes in `assets/theme-v2/css/colors.css`. No page-local CSS, tool-local CSS, inline styles, or style blocks were added.

## Validation

- PASS `npm run test:lane:tools-progress`
- PASS `npm run test:workspace-v2`
- PASS fixed-string searches for removed Project Progress navigation/route references
- PASS active touched-surface scan for forbidden `Studio` wording except `GameFoundryStudio`
- PASS active touched-surface scan confirming Arcade is absent from Toolbox
