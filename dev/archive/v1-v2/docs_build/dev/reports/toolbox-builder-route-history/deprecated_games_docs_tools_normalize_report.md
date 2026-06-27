# PR_26154_003 Deprecated Games, Docs, Tools Normalize Report

## Summary

Implemented `PR_26154_003-deprecated-games-docs-tools-normalize` as a path, documentation, and registration normalization pass.

- Renamed `games/` to `archive/v1-v2/games/`.
- Kept `archive/v1-v2/games/` playable as deprecated reference games.
- Excluded deprecated game validation from active automated game test scripts.
- Moved public-site implementation docs out of `/docs/` and into `/docs_build/`.
- Moved root tool pages into `toolbox/<toolname>/index.html`.
- Updated active Theme V2, tool index, workspace registration, helper, schema, and validation references that consumed the moved paths.
- Did not modify `start_of_day` folders.
- Did not run full samples smoke.

## Folder Moves

| Source | Destination | Status |
| --- | --- | --- |
| `games/` | `archive/v1-v2/games/` | moved |
| `docs/design/` | `docs_build/design/` | moved |
| `docs/reference/` | `docs_build/reference/` | moved |
| `docs/release/` | `docs_build/release/` | moved |
| `docs/tools/` | `docs_build/tools/` | moved |
| `toolbox/schemas/docs/` | `docs_build/schemas/docs/` | moved |

Note: root `schemas/docs/` did not exist in the current workspace. The schema documentation present under `toolbox/schemas/docs/` was moved to `docs_build/schemas/docs/`.

## Tool Surface Moves

| Old path | New path | Page title/name standard |
| --- | --- | --- |
| `toolbox/ai-assistant.html` | `toolbox/ai-assistant/index.html` | AI Assistant |
| `toolbox/animation-studio.html` | `toolbox/animation/index.html` | Animation |
| `toolbox/asset-studio.html` | `toolbox/assets/index.html` | Assets |
| `toolbox/builder.html` | `toolbox/builder/index.html` | Tool Builder |
| `toolbox/code-studio.html` | `toolbox/code/index.html` | Custom Extensions |
| `toolbox/creator.html` | `toolbox/creator/index.html` | Tool Creator |
| `toolbox/game-builder.html` | `toolbox/game-builder/index.html` | Game Builder |
| `toolbox/game-design-studio.html` | `toolbox/game-design/index.html` | Game Design |
| `toolbox/input-studio.html` | `toolbox/input/index.html` | Input |
| `toolbox/localization-studio/` | `toolbox/localization/` | Localization |
| `toolbox/midi-studio.html` | `toolbox/midi/index.html` | MIDI |
| `toolbox/object-vector-studio.html` | `toolbox/object-vector/index.html` | Object Vector |
| `toolbox/palette-manager.html` | `toolbox/palette/index.html` | Palette Manager |
| `toolbox/particle-studio.html` | `toolbox/particles/index.html` | Particles |
| `toolbox/publisher.html` | `toolbox/publish/index.html` | Publish |
| `toolbox/sound-studio.html` | `toolbox/sound/index.html` | Sound |
| `toolbox/storage-inspector.html` | `toolbox/storage/index.html` | Storage Inspector |
| `toolbox/world-vector-studio.html` | `toolbox/world-vector/index.html` | World Vector |
| `toolbox/groups/configuration-admin.html` | `toolbox/configuration-admin/index.html` | Settings and Admin |

The `toolbox/` root now retains only `toolbox/index.html` as a root HTML page.

## Path Adjustments

### Theme V2 and Navigation

- Updated Theme V2 route mapping in `assets/theme/v2/js/gamefoundry-partials.js`.
- Updated shared Theme V2 header/footer partial links for moved tool pages.
- Corrected public Reference route from `docs_build/reference.html` to `docs/reference.html`.
- Kept public Games navigation on `arcade/index.html`; deprecated playable reference games live under `archive/v1-v2/games/` and are not the active public games hub.

### Tool Index and Registration

- Updated `toolbox/tools-page-accordions.js` to link cards to `toolbox/<toolname>/index.html`.
- Updated the Theme V2 copy of the tool accordion data.
- Updated root card coverage metadata in `src/shared/contracts/tools/toolContractsIndex.js`.
- Updated Workspace/root future-state validation expectations for concise tool labels.

### Deprecated Games

- Updated active helpers and tests that manage path contracts to use `archive/v1-v2/games/` where they intentionally refer to deprecated playable references.
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
| `npm run test:workspace-manager:games` | PASS | Command reports SKIP because deprecated `archive/v1-v2/games` are excluded from active automated tests. |
| Active changed-file static validation | PASS | 49 JS/MJS files syntax-checked, 10 JSON files parsed, 25 active HTML files checked. |
| `node toolbox/dev/checkSharedExtractionGuard.mjs` | PASS | Baseline matched: 1273 files scanned, 759 expected violations. |
| Targeted path/reference validation | PASS with WARN | Required moved folders, public docs, tool routes, start_of_day status, and deprecated game test exclusion passed. |
| `git diff --check` | PASS | No whitespace errors. |

## Warnings

- Historical generated reports under `docs_build/reports/` still contain `games/` prose from earlier PR evidence.
- Retired game tests under `tests/games/` and old Playwright game/tool specs still contain legacy `games/` imports and fixture references. They are excluded from active validation and were not migrated into `archive/v1-v2/games` tests.
- Deprecated `toolbox/old_*` folders retain legacy `games/` assumptions by design. Their runtime code was not modified except for the companion path adjustment needed by `toolbox/old_localization-studio/index.html`.
- Legacy PowerShell scaffolding helpers retain old `games/` assumptions and were not part of the requested Node/JS validation route.

## Samples Decision

Full samples smoke test was skipped per request. This PR changes root IA, deprecated game placement, docs placement, and tool launch paths; it does not request broad sample validation.

## Manual Validation Notes

1. Open `toolbox/index.html` and confirm each root tool card opens its `toolbox/<toolname>/index.html` destination.
2. Open `toolbox/_tool_template-v2/index.html` and confirm Theme V2 CSS, partials, favicon, and scripts load from root paths.
3. Open `archive/v1-v2/games/index.html` and confirm the deprecated games index remains reachable.
4. Open `docs/index.html`, `docs/faq.html`, `docs/reference.html`, and `docs/support.html` and confirm `/docs/` remains user-facing only.
