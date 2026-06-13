# PR_26163_082-lazy-project-id-creation

## Branch Validation

- PASS: Current branch is `main`.
- PASS: Expected branch is `main`.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before changes.
- PASS: Assets no longer creates a project id during page load, session init, guest init, or tool launch. `toolbox/assets/assets.js` no longer calls the setup helper during normal launch.
- PASS: Project Path remains empty/placeholder before project creation or upload. Initial UI text is `No project path yet` in `toolbox/assets/index.html`.
- PASS: Authenticated upload resolves an existing current project id first through `ensureUploadProject()`.
- PASS: Authenticated upload with no current project id creates exactly one project id at upload start.
- PASS: `projects/<projectId>/` is created only when the first uploaded file is written.
- PASS: Guest upload still blocks with `Uploads require a Game Foundry account.` plus `Sign In` and `Create Account` actions.
- PASS: Guest upload creates no project id and no project folder.
- PASS: Existing project id is reused for later uploads in the same authenticated session.
- PASS: The old fallback project id `01K8M3K0EX7V5A3W9Q2Y6R4T1B` is not used by the active Assets project-id creation path.
- PASS: `/projects/` path safety, duplicate blocking, delete-file behavior, and upload diagnostics remain covered by the targeted Assets tests.
- PASS: `codex_review.diff` is generated as readable UTF-8 text.

## Implementation Evidence

- `toolbox/assets/assets.js:283` returns `No project path yet` when no project id exists.
- `toolbox/assets/assets.js:1061` gates upload save through `saveUploadBatch`.
- `toolbox/assets/assets.js:1062` blocks guest uploads before project creation.
- `toolbox/assets/assets.js:1068` calls `repository.ensureUploadProject()` only after the upload action is authenticated and files are selected.
- `toolbox/assets/index.html:60` initializes the Project Path display as `No project path yet`.
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js:274` generates lazy project ids.
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js:641` defines `ensureUploadProject()`.
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js:642` blocks explicit guest sessions from creating upload project ids.
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js:651` reuses an existing configured/owned project id before creating a new id.
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js:662` creates a new upload project id only when needed.
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js:1671` creates an upload project id for validated upload records only.

## Lazy Project Id Evidence

- PASS: New Assets page/tool launch does not create a project id. Playwright test `Assets upload writes to the project folder before creating a record and Image View renders the file` captures project folders before launch and confirms they are unchanged before upload.
- PASS: Project Path before upload shows `Path: No project path yet`.
- PASS: Authenticated upload with no current project id creates one generated id at upload start. Playwright test `Assets authenticated upload lazily creates one project id when no current project exists` verifies no folder exists on launch, then verifies uploaded files are written under the generated id.
- PASS: Existing project id is reused for later uploads. The upload/write Playwright test uploads a second image and verifies the same project id is retained.
- PASS: First file write creates the asset-type folder through the existing guarded write path. Targeted tests verify `projects/<projectId>/image/` exists only after the write succeeds.

## Guest No-Project Evidence

- PASS: Guest upload is blocked in UI before project creation.
- PASS: Explicit guest sessions are also blocked in the mock repository.
- PASS: Playwright test `Assets guest upload action shows account prompt and creates no record` verifies:
  - Project Path remains `Path: No project path yet`.
  - The account-required prompt appears.
  - No asset record is created.
  - Project folders are unchanged.

## Search Evidence

- PASS: Scoped active Assets search found no exact old fallback id:
  - Command: `rg -n "01K8M3K0EX7V5A3W9Q2Y6R4T1B|DEMO_ASSET_PROJECT_ID|Path: projects/" toolbox/assets src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js tests/playwright/tools/AssetToolMockRepository.spec.mjs`
  - Result: no matches.
- PASS: Active Assets code has only the explicit setup helper definition remaining:
  - Command: `rg -n "makeReadyGameConfiguration\\(" toolbox/assets/assets.js src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js tests/playwright/tools/AssetToolMockRepository.spec.mjs`
  - Result: one definition in the repository file, no active page-launch call.
- NOTE: A broader non-report search still finds the old id in `tests/playwright/tools/ObjectsTool.spec.mjs` as an Objects sprite fixture and in historical docs. Those are outside this PR's Assets lazy project creation path and do not create projects on session start.

## Impacted Lanes

- Assets tool runtime/UI.
- Assets dev-runtime mock repository.
- Assets Playwright coverage.
- Workspace V2 contract lane, because it is explicitly required by this PR.

## Skipped Lanes

- Full samples smoke: SKIP by request. No sample JSON, runtime sample, or production game behavior was changed.
- Engine runtime input lanes: SKIP because this PR only changes Assets project-id/upload behavior.
- Account/User Controls lanes: SKIP because this PR does not change account profile behavior beyond preserving the existing guest upload prompt.

## Validation Performed

- PASS: `git branch --show-current` -> `main`.
- PASS: `node --check toolbox/assets/assets.js`.
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`.
- PASS: `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`.
- PASS: `git diff --check -- toolbox/assets/assets.js toolbox/assets/index.html src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js tests/playwright/tools/AssetToolMockRepository.spec.mjs docs_build/dev/reports/playwright_v8_coverage_report.txt` with only existing CRLF normalization warnings for touched files.
- PASS: `npm run test:workspace-v2` -> 5 passed.
- PASS: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --workers=1 --reporter=list` -> 15 passed.

## Playwright Result

- PASS: Targeted Assets Playwright: 15 passed.
- PASS: Workspace V2 lane: 5 passed.

## V8 Coverage

- PASS: `toolbox/assets/assets.js` collected by browser V8 coverage at 92%.
- WARN: `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js` is Node/dev-runtime code and is not collected by browser V8 coverage. It is covered by the targeted repository and upload Playwright behaviors.
- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Manual Validation Steps

1. Launch `toolbox/assets/index.html` in a fresh authenticated session.
2. Confirm the centered Project Path reads `Path: No project path yet`.
3. Confirm no new folder appears under `projects/`.
4. Select an Image upload file.
5. Confirm upload auto-starts, one project id is created, and `projects/<projectId>/image/<filename>` is written.
6. Upload a second Image and confirm it reuses the same project id.
7. Launch as guest and select an upload file.
8. Confirm the account-required prompt appears and no project id or project folder is created.

## Samples Decision

- SKIP: Full samples smoke was not run because the request explicitly says not to run full samples smoke and this PR does not change samples.
