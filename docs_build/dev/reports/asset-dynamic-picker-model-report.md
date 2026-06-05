# PR_26156_160-163 Asset Dynamic Picker Model Report

## Scope
- Built stacked PRs in order:
  - `PR_26156_160-asset-dynamic-picker-model`
  - `PR_26156_161-asset-color-palette-picker`
  - `PR_26156_162-asset-file-picker-role-behavior`
  - `PR_26156_163-asset-dynamic-picker-validation`
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.
- Used archived Asset Manager V2 files as behavior reference only:
  - `archive/v1-v2/tools/old_asset-manager-v2/js/controls/AssetFormControl.js`
  - `archive/v1-v2/tools/old_asset-manager-v2/js/assetManagerMetadata.js`
  - `archive/v1-v2/tools/old_asset-manager-v2/js/services/WorkspaceBridge.js`
- Did not copy archived/reference code.
- Did not modify archived V1/V2 files.
- Did not modify `start_of_day`.
- Added no CSS.

## PR_26156_160 Dynamic Picker Model
- Added explicit Asset Tool picker modes:
  - `file`
  - `palette`
  - `managed-tool`
  - `advanced`
- Made picker mode visible in the Import Asset form.
- Updated role changes to refresh:
  - Usage options.
  - File `accept` values.
  - Visible picker mode.
  - File/palette picker visibility.
  - Import diagnostics.
- Removed silent fallback from non-file roles.

## PR_26156_161 Color Palette Picker
- Color now uses `palette` picker mode.
- Color hides the file picker.
- Color shows a visible palette color picker row.
- Color keeps Usage visible for palette category assignment.
- Color shows `Palette Tool required.` when no active Project Workspace palette exists.
- Project Workspace palette handoff remains future work; no Project Workspace implementation was changed in this PR.

## PR_26156_162 File Picker Role Behavior
- File picker remains visible only for:
  - Image
  - Audio
  - Video
  - Font
- File `accept` values now update by selected file role:
  - Image: `.png,.jpg,.jpeg,.webp,.gif,.svg`
  - Audio: `.mp3,.wav,.ogg,.m4a`
  - Video: `.mp4,.webm,.mov`
  - Font: `.ttf,.otf,.woff,.woff2`
- Data now uses `managed-tool` mode with `Data/Table Tool required.`
- Localization now uses `managed-tool` mode with `Localization Tool required.`
- Shader now uses `advanced` mode.
- Shader is hidden from normal users and appears only with Admin/Advanced mode.
- Storage Path remains generated/read-only as:
  - `projects/<projectId>/<assetRole>/<usage>/<filename>`
- The active demo project id remains the ULID:
  - `01K8M3K0EX7V5A3W9Q2Y6R4T1B`

## PR_26156_163 Validation
- Updated targeted Asset Tool Playwright coverage for:
  - Dynamic picker switching.
  - Color hiding file picker and showing Palette Tool requirement.
  - Image/Audio/Video/Font file picker visibility and `accept` values.
  - Data/Localization managed-tool diagnostics.
  - Shader admin/advanced-only visibility.
  - No normal-user import/export JSON workflow.
- Preserved existing upload success coverage for Image, Video, and Audio.
- Preserved project-owned path and reset coverage from prior PRs.

## Validation Notes
- Impacted lane: `asset-tool`.
- Ran:
  - `node --check toolbox/assets/assets-mock-repository.js`
  - `node --check toolbox/assets/assets.js`
  - `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
  - `node ./scripts/run-targeted-test-lanes.mjs --lane asset-tool`
  - `Select-String -Path toolbox/assets/index.html,toolbox/assets/assets.js -Pattern '<style|style=|<script(?![^>]*\\bsrc=)|on(click|change|input|submit)=' -CaseSensitive:$false`
- Result:
  - Targeted Asset Tool lane passed: 5/5.
  - Changed-file syntax checks passed.
  - Inline style/script/event-handler scan passed.

## Skipped Lanes
- Project Workspace palette handoff lane skipped because this PR only adds the missing palette diagnostic and does not change Project Workspace behavior.
- Full samples smoke skipped by request and because samples were not changed.
- Broad workspace/navigation lanes skipped because no shared launch, navigation, Theme V2 CSS, parser, DB, or cross-tool runtime behavior changed.

## Manual Test Notes
- Verified through the targeted Playwright lane:
  - Asset page loads without console/page/request failures.
  - Normal role view hides Shader.
  - Admin role view exposes Shader in `advanced` picker mode.
  - Color uses `palette` picker mode and shows Palette Tool required.
  - Data and Localization use `managed-tool` diagnostics.
  - File-based roles show file picker and role-specific `accept` values.
  - Normal user-facing output does not add import/export JSON workflow.

## Theme V2 Gap Findings
- No Theme V2 gap found.
- Existing Theme V2 form table/layout classes supported the added picker rows.
- No new CSS was added.
