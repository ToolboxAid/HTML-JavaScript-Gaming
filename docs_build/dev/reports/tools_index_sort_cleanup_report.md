# PR_26154_014 Tools Index Sort Cleanup Report

Task: `PR_26154_014-tools-index-sort-cleanup`

## Scope

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Kept `tools/index.html` layout and markup unchanged.
- Updated the active Tools index data source: `tools/tools-page-accordions.js`.
- Preserved existing group assignments and tool names.
- Did not touch `old_games/`, `old_samples/`, or `start_of_day/`.
- Did not run full samples smoke validation.

## Ordering Changes

`tools/index.html` loads `tools-page-accordions.js`, so the visible grouped order is controlled by `tools/tools-page-accordions.js`.

Alphabetized group order:

1. AI
2. Assets
3. Audio
4. Colors
5. Input
6. Objects
7. Worlds

Alphabetized tool order by group:

| Group | Tool Order |
| --- | --- |
| AI | AI Assistant |
| Assets | Arcade, Cloud, Localization, Marketplace, Publish, Storage Inspector |
| Audio | MIDI, Sound |
| Colors | Palette Manager |
| Input | Input |
| Objects | Animation, Assets, Custom Extensions, Object Vector |
| Worlds | Game Builder, Game Design, Particles, World Vector |

## Targeted Path Cleanup

| File | Previous Path | Updated Path | Reason |
| --- | --- | --- | --- |
| `tools/tools-page-accordions.js` | `../assets/theme/v2/images/tools/localization.png` | `../assets/theme/v2/images/tools/localization-studio.png` | Active Tools index image validation found the previous file missing; the existing matching Localization tile asset is `localization-studio.png`. |

No tool hrefs were renamed or reassigned.

## Validation

- PASS: `node --check tools/tools-page-accordions.js`.
- PASS: Targeted order validator confirmed group order is alphabetical.
- PASS: Targeted order validator confirmed every group sorts tool tiles alphabetically by visible tool name.
- PASS: Targeted link/path validator resolved 19 tool href/image references and 4 `tools/index.html` local refs.
- PASS: Targeted stale reference check found no `GameFoundryStudio/`, `src/engine/theme/`, `assets/theme/v2/assets/`, `assets/theme/v2/images/games/`, or `favicon.ico` references in the active Tools index files.
- PASS: Static validation covered changed HTML/JS/CSS/JSON/Markdown paths.
- PASS: `git diff --check`.
- PASS: `git status --short -- start_of_day old_games old_samples` returned no output.
- SKIPPED: `npm run test:workspace-v2`; active Workspace V2 launch/navigation behavior was not changed.
- SKIPPED: old games, old samples, and full samples smoke tests per request.

## Notes

- The active Tools index loads `tools/tools-page-accordions.js`.
- A separate historical helper copy at `assets/theme/v2/js/tools-page-accordions.js` is not imported by `tools/index.html`; it was not changed in this scoped PR.
