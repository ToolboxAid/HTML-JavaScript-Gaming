# PR_26154_003 Deprecated Games, Docs, Tools Normalize Report

## Summary

Implemented `PR_26154_003-deprecated-games-docs-tools-normalize` as a path, documentation, and registration normalization pass.

- Renamed `games/` to `old_games/`.
- Kept `old_games/` playable as deprecated reference games.
- Excluded deprecated game validation from active automated game test scripts.
- Moved public-site implementation docs out of `/docs/` and into `/docs_build/`.
- Moved root tool pages into `tools/<toolname>/index.html`.
- Updated active Theme V2, tool index, workspace registration, helper, schema, and validation references that consumed the moved paths.
- Did not modify `start_of_day` folders.
- Did not run full samples smoke.

## Folder Moves

| Source | Destination | Status |
| --- | --- | --- |
| `games/` | `old_games/` | moved |
| `docs/design/` | `docs_build/design/` | moved |
| `docs/reference/` | `docs_build/reference/` | moved |
| `docs/release/` | `docs_build/release/` | moved |
| `docs/tools/` | `docs_build/tools/` | moved |
| `tools/schemas/docs/` | `docs_build/schemas/docs/` | moved |

Note: root `schemas/docs/` did not exist in the current workspace. The schema documentation present under `tools/schemas/docs/` was moved to `docs_build/schemas/docs/`.

## Tool Surface Moves

| Old path | New path | Page title/name standard |
| --- | --- | --- |
| `tools/ai-assistant.html` | `tools/ai-assistant/index.html` | AI Assistant |
| `tools/animation-studio.html` | `tools/animation/index.html` | Animation |
| `tools/asset-studio.html` | `tools/assets/index.html` | Assets |
| `tools/builder.html` | `tools/builder/index.html` | Tool Builder |
| `tools/code-studio.html` | `tools/code/index.html` | Custom Extensions |
| `tools/creator.html` | `tools/creator/index.html` | Tool Creator |
| `tools/game-builder.html` | `tools/game-builder/index.html` | Game Builder |
| `tools/game-design-studio.html` | `tools/game-design/index.html` | Game Design |
| `tools/input-studio.html` | `tools/input/index.html` | Input |
| `tools/localization-studio/` | `tools/localization/` | Localization |
| `tools/midi-studio.html` | `tools/midi/index.html` | MIDI |
| `tools/object-vector-studio.html` | `tools/object-vector/index.html` | Object Vector |
| `tools/palette-manager.html` | `tools/palette/index.html` | Palette Manager |
| `tools/particle-studio.html` | `tools/particles/index.html` | Particles |
| `tools/publisher.html` | `tools/publish/index.html` | Publish |
| `tools/sound-studio.html` | `tools/sound/index.html` | Sound |
| `tools/storage-inspector.html` | `tools/storage/index.html` | Storage Inspector |
| `tools/world-vector-studio.html` | `tools/world-vector/index.html` | World Vector |
| `tools/groups/configuration-admin.html` | `tools/configuration-admin/index.html` | Settings and Admin |

The `tools/` root now retains only `tools/index.html` as a root HTML page.

## Path Adjustments

### Theme V2 and Navigation

- Updated Theme V2 route mapping in `src/engine/theme/v2/assets/js/gamefoundry-partials.js`.
- Updated shared Theme V2 header/footer partial links for moved tool pages.
- Corrected public Reference route from `docs_build/reference.html` to `docs/reference.html`.
- Kept public Games navigation on `arcade/index.html`; deprecated playable reference games live under `old_games/` and are not the active public games hub.

### Tool Index and Registration

- Updated `tools/tools-page-accordions.js` to link cards to `tools/<toolname>/index.html`.
- Updated the Theme V2 copy of the tool accordion data.
- Updated root card coverage metadata in `src/shared/contracts/tools/toolContractsIndex.js`.
- Updated Workspace/root future-state validation expectations for concise tool labels.

### Deprecated Games

- Updated active helpers and tests that manage path contracts to use `old_games/` where they intentionally refer to deprecated playable references.
- Updated asset pipeline helpers, manifest path helpers, vector template helpers, and launch SSoT helpers to avoid assuming active `games/`.
- Updated package scripts so game validation commands call `scripts/skip-deprecated-game-tests.mjs`.
- Removed active `tests/games` imports from `tests/run-tests.mjs`.

### Docs and Build Docs

- Kept `/docs/` user-facing only:
  - `docs/index.html`
  - `docs/faq.html`
  - `docs/reference.html`
  - `docs/support.html`
  - `docs/README.md`
- Moved build, design, reference, release, tool, PR, workflow, governance, schema-doc, and report documentation under `/docs_build/`.
- Updated active docs and scripts from old `docs/dev`, `docs/pr`, and schema-doc paths to the new `docs_build` locations where they were part of the active workflow.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm run test:workspace-v2` | PASS | 2 Playwright tests passed for root tools surface and Tool Template V2 root Theme V2 loading. |
| `npm run test:workspace-manager:games` | PASS | Command reports SKIP because deprecated `old_games` are excluded from active automated tests. |
| Active changed-file static validation | PASS | 49 JS/MJS files syntax-checked, 10 JSON files parsed, 25 active HTML files checked. |
| `node tools/dev/checkSharedExtractionGuard.mjs` | PASS | Baseline matched: 1273 files scanned, 759 expected violations. |
| Targeted path/reference validation | PASS with WARN | Required moved folders, public docs, tool routes, start_of_day status, and deprecated game test exclusion passed. |
| `git diff --check` | PASS | No whitespace errors. |

## Warnings

- Historical generated reports under `docs_build/reports/` still contain `games/` prose from earlier PR evidence.
- Retired game tests under `tests/games/` and old Playwright game/tool specs still contain legacy `games/` imports and fixture references. They are excluded from active validation and were not migrated into `old_games` tests.
- Deprecated `tools/old_*` folders retain legacy `games/` assumptions by design. Their runtime code was not modified except for the companion path adjustment needed by `tools/old_localization-studio/index.html`.
- Legacy PowerShell scaffolding helpers retain old `games/` assumptions and were not part of the requested Node/JS validation route.

## Samples Decision

Full samples smoke test was skipped per request. This PR changes root IA, deprecated game placement, docs placement, and tool launch paths; it does not request broad sample validation.

## Manual Validation Notes

1. Open `tools/index.html` and confirm each root tool card opens its `tools/<toolname>/index.html` destination.
2. Open `tools/_templates-v2/index.html` and confirm Theme V2 CSS, partials, favicon, and scripts load from root paths.
3. Open `old_games/index.html` and confirm the deprecated games index remains reachable.
4. Open `docs/index.html`, `docs/faq.html`, `docs/reference.html`, and `docs/support.html` and confirm `/docs/` remains user-facing only.
