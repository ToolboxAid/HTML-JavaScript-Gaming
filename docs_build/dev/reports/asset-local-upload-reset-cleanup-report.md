# Asset Local Upload Reset Cleanup Report

PR:
- PR_26156_159-asset-local-upload-reset-cleanup

## Scope

Updated the active Asset Tool mock/local storage behavior:
- `.gitignore`
- `toolbox/assets/assets-mock-repository.js`
- `toolbox/assets/assets.js`
- `toolbox/assets/index.html`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`

This PR builds on the active Asset Tool import correction stack already present in the working tree.

No archived V1/V2 files were modified.
No `start_of_day` folders were modified.
No site assets, Theme V2 assets, archive files, or unrelated project folders are deleted.

## Local Simulated Upload Boundary

The current Asset Tool is browser-only and has no backend filesystem writer in scope.

This PR models local simulated upload through the Asset Tool mock repository:
- Stored paths now use `projects/<projectId>/<assetRole>/<usage>/<filename>`.
- Mock DB storage rows represent the simulated local files.
- Reset deletes only mock file/storage metadata for the active project folder.
- `.gitignore` now includes `projects/` so future real local project asset output is not tracked by Git.

No real disk deletion is performed by browser JavaScript.

## Storage Path

New storage path format:

`projects/<projectId>/<assetRole>/<usage>/<filename>`

Project id:
- Asset Tool storage resolves the demo project to the ULID `01K8M3K0EX7V5A3W9Q2Y6R4T1B`.
- Storage path generation rejects missing or non-ULID project ids.

Examples:
- `projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/image/sprite/player.png`
- `projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/audio/music/theme.mp3`

## Reset Behavior

`Reset Asset Library` now:
- Requires an active ULID project id.
- Clears active project mock file records under `projects/<projectId>/`.
- Clears active project asset metadata from:
  - `asset_library_items`
  - `asset_storage_objects`
  - `asset_import_events`
  - `asset_validation_items`
- Leaves role metadata intact.
- Does not silently reseed demo assets.
- Reports deleted file and folder counts.

Visible success example:

`Reset Asset Library deleted 5 files and 8 folders under projects/01K8M3K0EX7V5A3W9Q2Y6R4T1B/.`

Visible failure example:

`Reset Asset Library blocked: no active projectId.`

## Validation

Impacted lane:
- `asset-tool`

Commands run:
- `node --check toolbox/assets/assets-mock-repository.js`
- `node --check toolbox/assets/assets.js`
- `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `node ./scripts/run-targeted-test-lanes.mjs --lane asset-tool`

Results:
- Asset Tool lane passed: 5/5 Playwright tests.
- Changed runtime JavaScript V8 coverage was generated.
- Changed runtime JavaScript guardrail warnings: none.

Targeted assertions added:
- Local simulated upload paths render under `projects/<ULID>/`.
- Project id is ULID-shaped.
- Reset clears active project asset metadata.
- Reset reports deleted file/folder count.
- Reset without active project fails visibly.
- Active reset does not reference `assets/projects/`.

Skipped lanes:
- Workspace, Project Workspace, Game Design, Game Configuration, Build Path, Tools Progress, Tool Navigation, Tool Display Mode, Tool Images, Tool Runtime, Game Runtime, Integration, Engine Src, and Samples.

Skipped-lane rationale:
- Changes are limited to Asset Tool local/mock storage and reset behavior.
- No shared launch/navigation behavior changed.
- No sample JSON or sample loader/framework behavior changed.
- Full samples smoke was skipped by request and because samples were not changed.

Manual test notes:
- Open `toolbox/assets/index.html`.
- Confirm Storage Path format shows `projects/<projectId>/<assetRole>/<usage>/<filename>`.
- Upload an Image/Audio/Video/Data asset and confirm stored paths use `projects/<ULID>/...`.
- Click `Reset Asset Library` and confirm the log reports deleted file/folder counts.
- Confirm Library Records clears after reset.
- Open `toolbox/assets/index.html?handoff=missing`, click `Reset Asset Library`, and confirm the visible no-active-project failure.
