# PR_26177_CHARLIE_009-sprites-legacy-audit-plan

Status: PASS
Team: Charlie
Branch: PR_26177_CHARLIE_009-sprites-legacy-audit-plan
Date: 2026-06-26
Base branch: main
Base commit: 1420bc8b2634b4976da1b35ae33dd5575279f56b

## Scope

This PR audits the legacy `archive/v1-v2/tools/old_Sprite Editor` implementation and creates the Sprites MVP plan. It does not implement runtime behavior.

The current OWNER command assigns this work to Team Charlie. Current Project Instructions normally route creator content tools to Bravo, so this report records the active assignment as an OWNER-scoped Team Charlie execution context for this Sprites batch.

## Legacy Reference Reviewed

Reviewed files:

- `archive/v1-v2/tools/old_Sprite Editor/README.md`
- `archive/v1-v2/tools/old_Sprite Editor/index.html`
- `archive/v1-v2/tools/old_Sprite Editor/main.js`
- `archive/v1-v2/tools/old_Sprite Editor/modules/constants.js`
- `archive/v1-v2/tools/old_Sprite Editor/modules/projectModel.js`
- `archive/v1-v2/tools/old_Sprite Editor/modules/spriteEditorApp.js`
- `archive/v1-v2/tools/old_Sprite Editor/modules/colorUtils.js`
- `archive/v1-v2/tools/old_Sprite Editor/spriteEditor.css`
- `archive/v1-v2/tools/old_Sprite Editor/how_to_use.html`

Current GFS reference files reviewed:

- `toolbox/sprites/index.html`
- `toolbox/colors/index.html`
- `toolbox/assets/index.html`
- `src/shared/toolbox/tool-metadata-inventory.js`
- `docs_build/database/ddl/palette.sql`
- `docs_build/database/ddl/asset.sql`
- `docs_build/database/seed/guest/sprites.json`
- `docs_build/database/seed/guest/palette.json`
- `docs_build/dev/ProjectInstructions/addendums/postgres_only.md`
- `docs_build/dev/ProjectInstructions/addendums/environment_governance_model.md`
- `docs_build/dev/ProjectInstructions/addendums/environment_configuration_standards.md`
- `docs_build/dev/ProjectInstructions/addendums/table_first_ui.md`
- `docs_build/dev/ProjectInstructions/addendums/referenced_asset_protection.md`

## Legacy Findings

The archived tool is a browser-based Sprite Editor, not a current GFS asset management tool. It includes:

- Canvas-first pixel drawing.
- Frame add, duplicate, delete, undo, redo, onion-skin, and playback preview.
- Tool-local project JSON import/export.
- Tool-local asset registry export/import.
- PNG and sprite sheet import/export flows.
- Palette selection from a legacy engine palette list.
- Tool-local palette arrays and recent color arrays.
- Page-local CSS and legacy shell assets.
- Direct browser document ownership of the sprite project model.

Useful behaviors to preserve conceptually:

- Explicit sprite dimensions and file metadata.
- Preview and metadata surfacing.
- Archive/delete safety expectations.
- Asset registry thinking around sprite references.
- Palette dependency awareness.
- Clear unavailable-state messaging when palette data cannot be loaded.

Legacy behaviors rejected for MVP implementation:

- Rebuilding a pixel editor as the MVP.
- Browser-owned sprite records.
- Browser-generated authoritative sprite keys.
- Page-local product data arrays.
- Browser storage as product-data source of truth.
- Tool-local palette color definitions.
- Duplicated Palette/Colors records.
- Legacy `engine/paletteList` as an authoritative color source.
- File-download JSON as authoritative persistence.
- Page-local CSS, inline script patterns, and legacy shell styling.
- Hardcoded named reusable colors inside Sprites.
- Silent fallback data when API, database, storage, or Palette/Colors is unavailable.

## Current Product Position

`toolbox/sprites/index.html` currently exists as a static Theme V2 wireframe. It says no database, persistence, save, load, or runtime behavior is implemented.

The Sprites MVP should therefore complete the existing route as an API-backed asset management tool. It should not become a full image editor. Creation and editing in this MVP means creating and maintaining sprite asset records and metadata, not painting pixels in browser-owned product data.

## Palette/Colors Ownership Rule

Palette/Colors is the authoritative source for reusable colors.

Sprites must:

- Reference Palette/Colors records by API/database key when color linkage is needed.
- Display Palette/Colors unavailable or empty states when the integration is unavailable.
- Keep color names, hex values, reusable swatches, and saved palettes owned by Palette/Colors.

Sprites must not:

- Own reusable color definitions.
- Create reusable colors.
- Duplicate Palette/Colors records.
- Use page-local color arrays.
- Hardcode selectable, reusable, named, or saved colors.
- Persist Palette/Colors data through Sprites-owned records except for approved key references.

## MVP Data Needs

Sprites MVP records should support:

- `key`
- `name`
- `status`
- `category`
- `tags` or `tagKeys`
- `source` or storage reference
- `mimeType`
- `width`
- `height`
- `size`
- `paletteColorKeys` or equivalent Palette/Colors key references
- `usageCount`
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`

Server/API must own:

- ULID key generation.
- Audit timestamps.
- Audit user fields.
- Duplicate detection.
- Archive/delete rules.
- Reference protection.

## MVP PR Plan

### PR_26177_CHARLIE_010-sprites-api-db-foundation

Add the Sprites API and Postgres DDL/DML/seed foundation. Include server-owned keys and audit fields. Define list, read, create, update, archive, delete-safe, and reference contracts. Do not store color definitions.

### PR_26177_CHARLIE_011-sprites-tool-shell

Replace the static Sprites wireframe with the current GFS tool shell and read/list connection. Add loading, empty, and error states. Keep Palette/Colors unavailable state visible if color references are exposed.

### PR_26177_CHARLIE_012-sprites-library-crud

Implement the API-backed Sprites library table and create/edit/archive/delete flow. Guest save redirects to `account/sign-in.html`.

### PR_26177_CHARLIE_013-sprites-import-preview-metadata-palette

Add import/preview/metadata flows only where existing API and storage contracts support them. Show explicit unavailable states when storage or Palette/Colors contracts are not available. Duplicate via API-owned new key.

### PR_26177_CHARLIE_014-sprites-tags-categories-search

Add API/database-backed search, tags, categories, and table filtering. Reuse Tags service contracts when available.

### PR_26177_CHARLIE_015-sprites-reference-protection

Add reference viewer and destructive delete protection. If real references are not yet available, expose an empty contract state and document the limitation.

### PR_26177_CHARLIE_016-sprites-playwright-final-polish

Complete Theme V2 polish, Playwright coverage, no inline CSS/JS verification, navigation verification, Palette/Colors ownership verification, and backlog completion update.

## Validation Summary

- PASS: Project Instructions reviewed.
- PASS: Current branch started from clean, synchronized `main`.
- PASS: Legacy Sprite Editor reference located and reviewed.
- PASS: Current Sprites route located.
- PASS: Palette/Colors ownership rule documented.
- PASS: Rejected legacy patterns documented.
- PASS: No runtime implementation added.
- PASS: No `start_of_day` files changed.

## Follow-Up Constraints For Later PRs

- Later implementation PRs must use the shared API/service contract.
- Later implementation PRs must not split Local API and Public API contracts.
- Later implementation PRs must target Postgres DDL/DML/seed patterns.
- Later implementation PRs must use Theme V2 and external JavaScript.
- Later implementation PRs must preserve Palette/Colors as the color source of truth.
- Later implementation PRs must stop on validation failure before proceeding.
