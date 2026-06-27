# PR_26156_142-147 Asset Roles and Storage Stacked Report

Generated: 2026-06-05

## Scope

Stacked PRs:
- `PR_26156_142-asset-roles-reference-audit`
- `PR_26156_143-asset-storage-contract`
- `PR_26156_144-asset-role-library-model`
- `PR_26156_145-asset-upload-workflow`
- `PR_26156_146-asset-project-storage-integration`
- `PR_26156_147-asset-validation-playwright`

Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. Continued from `PR_26156_136-141`.

Archive reference use:
- Read `archive/v1-v2/tools/old_asset-manager-v2/README.md`.
- Read `archive/v1-v2/tools/old_asset-manager-v2/js/assetManagerMetadata.js`.
- Read `archive/v1-v2/tools/old_asset-manager-v2/js/assetPreviewHelpers.js`.
- Read `archive/v1-v2/tools/old_asset-manager-v2/js/services/AssetSchemaValidator.js`.
- Read `archive/v1-v2/tools/old_asset-manager-v2/js/controls/AssetFormControl.js`.
- Used archive material only to identify behavior expectations. No archive code was copied. No archived V1/V2 files were modified.

No new CSS was added. No `start_of_day` folders were modified.

## PR_26156_142 Role Audit

| Role | Supported file types | Expected preview behavior | Validation needs | DB fields |
| --- | --- | --- | --- | --- |
| Audio | `.mp3`, `.wav`, `.ogg`, `.m4a`; audio MIME types | Browser audio metadata preview | MIME/extension match, non-zero size, project storage path | id, projectId, ownerProjectId, assetRole, originalName, storedPath, mimeType, size, checksum, createdAt, updatedAt |
| Color | `.json` palette metadata | Swatch metadata preview | Hex/name metadata, deferred upload ownership | same uploaded metadata fields when implemented |
| Data | `.json`, `.csv`, `.txt` | Text metadata preview | Format/schema declaration, deferred upload ownership | same uploaded metadata fields when implemented |
| Font | `.woff`, `.woff2`, `.ttf`, `.otf` | Font sample preview | Font format validation, deferred upload ownership | same uploaded metadata fields when implemented |
| Image | `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`; image MIME types | Image metadata preview | MIME/extension match, non-zero size, project storage path | id, projectId, ownerProjectId, assetRole, originalName, storedPath, mimeType, size, checksum, createdAt, updatedAt |
| Localization | `.json`, `.po`, `.pot`, `.xliff`, `.xlf` | Localization key summary preview | Locale/format metadata, deferred upload ownership | same uploaded metadata fields when implemented |
| Shader | `.glsl`, `.vert`, `.frag`, `.wgsl` | Shader source metadata preview | Stage metadata and render ownership, deferred upload ownership | same uploaded metadata fields when implemented |
| Video | `.mp4`, `.webm`, `.mov`; video MIME types | Browser video metadata preview | MIME/extension match, non-zero size, project storage path | id, projectId, ownerProjectId, assetRole, originalName, storedPath, mimeType, size, checksum, createdAt, updatedAt |

## PR_26156_143 Storage Contract

Project-owned upload storage is represented by generated metadata paths:

`assets/projects/<projectId>/<assetRole>/<fileName>`

Examples:
- `assets/projects/demo-project/image/player.png`
- `assets/projects/demo-project/video/intro.mp4`
- `assets/projects/demo-project/audio/theme.mp3`

User/project uploads are separated from:
- `assets/theme-v2`
- public site images
- app chrome and Theme V2 assets

The mock repository stores metadata only. It does not persist file bytes, cloud state, auth state, or real database records.

## PR_26156_144 Role Library Model

Implemented in `toolbox/assets/assets-mock-repository.js`:
- `ASSET_ROLE_DEFINITIONS` covers all eight roles.
- `asset_role_definitions` table represents role metadata.
- `asset_library_items` stores project asset records.
- `asset_storage_objects` stores generated project storage metadata.
- `asset_import_events` stores upload/import events.
- `asset_validation_items` stores actionable validation findings.

Implemented visible diagnostics in `toolbox/assets/index.html` and `toolbox/assets/assets.js`:
- Asset Role Coverage table lists every role.
- Role diagnostics list reports missing/invalid metadata or ready state.
- DB Metadata panel shows original name, stored path, role, MIME type, size, checksum, and owner project.

## PR_26156_145 Upload Workflow

Implemented upload workflow first for:
- Image
- Video
- Audio

Upload validation checks:
- active project and ready Game Configuration handoff
- asset role
- usage
- file name
- extension
- MIME type
- non-zero size
- max size
- generated storage path under the project-owned storage root

Non-upload roles remain represented but fail visibly as planned when uploaded:
- Color
- Data
- Font
- Localization
- Shader

## PR_26156_146 Project Workspace Integration

The Asset Tool requires active project context through the existing Game Configuration handoff. Missing or invalid project/configuration context:
- hides the upload form
- shows the missing-requirements overlay
- keeps the library blocked
- does not create a silent fallback project
- does not write a global/site asset path

Project Workspace lane was run because project-owned storage depends on active project context.

## PR_26156_147 Targeted Playwright

Updated `tests/playwright/tools/AssetToolMockRepository.spec.mjs` to cover:
- SQL-shaped role/storage/metadata tables
- all eight role definitions
- visible role listing and diagnostics
- active project handoff
- Image upload metadata and preview
- Video upload metadata and preview
- Audio upload metadata and preview
- no raw JSON output
- no embedded data URL contract field in repository tables
- visible extension/MIME validation failures
- planned-role upload failure for Color
- project-required upload overlay and hidden form

## Validation

Impacted lanes:
- `asset-tool`
- `project-workspace`

Executed:
- `node --check toolbox/assets/assets-mock-repository.js`
- `node --check toolbox/assets/assets.js`
- `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `node ./scripts/run-targeted-test-lanes.mjs --lane asset-tool --lane project-workspace`
- `git diff --check`

Results:
- Project Workspace lane: PASS, 8 tests.
- Asset Tool lane: PASS, 4 tests.
- `git diff --check`: PASS. Git reported line-ending warnings only for edited files.

Skipped lanes:
- Full samples smoke skipped because no sample JSON, sample loader, or sample runtime framework behavior changed.
- Game Design, Game Configuration, Build Path, Tools Progress, tool navigation, tool images, tool runtime, engine, integration, games, and samples lanes skipped because this stack only changed the Asset Tool page/repository/test and its Project Workspace handoff validation.

Theme V2 gaps:
- None. Existing Theme V2 tables, cards, panels, buttons, status, and form table classes were sufficient.
