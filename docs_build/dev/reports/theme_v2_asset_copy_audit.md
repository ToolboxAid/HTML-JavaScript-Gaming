# PR_26152_272 Theme V2 Asset Copy Audit

## Scope

- Audited copy readiness from `GameFoundryStudio/assets` to `src/engine/theme/v2`.
- Compared files by relative path and SHA-256 content hash where both sides exist.
- No files were copied, replaced, deleted, or deprecated.
- No CSS was added.
- No samples or Toolbox rebuild work was performed.

## Directory Status

| Path | Status |
|---|---|
| `GameFoundryStudio/assets` | Exists |
| `src/engine/theme/v2` | Missing |

## Summary

| Category | Count |
|---|---:|
| Files only in `GameFoundryStudio/assets` | 146 |
| Files only in `src/engine/theme/v2` | 0 |
| Files in both and identical | 0 |
| Files in both but different | 0 |
| Files that would overwrite destination content if copied | 0 |

## Recommended Action Counts

| Recommendation | Count |
|---|---:|
| copy-new | 13 |
| skip-identical | 0 |
| review-different | 117 |
| keep-destination | 0 |
| deprecated-source | 16 |

## Findings

- The destination directory is missing, so there are no destination-only, identical, different, or overwrite candidates in this audit.
- Source files under `css/theme/v2/` are marked `copy-new` because they are the direct Theme V2 source candidates.
- Source files under other `css/` paths are marked `deprecated-source` for copy-readiness purposes because V1/legacy CSS must not be copied into Theme V2.
- Non-CSS source files are marked `review-different` because ownership under `src/engine/theme/v2` requires review before copy.
- `GameFoundryStudio/assets` is not marked deprecated by this audit.

## Files Only In GameFoundryStudio Assets

| Path | Status | Recommendation | Would overwrite |
|---|---|---|---|
| `css/base.css` | source-only | deprecated-source | No |
| `css/colors.css` | source-only | deprecated-source | No |
| `css/controls.css` | source-only | deprecated-source | No |
| `css/gamefoundrystudio.css` | source-only | deprecated-source | No |
| `css/pages.css` | source-only | deprecated-source | No |
| `css/styles.css` | source-only | deprecated-source | No |
| `css/theme/v2/accordion.css` | source-only | copy-new | No |
| `css/theme/v2/buttons.css` | source-only | copy-new | No |
| `css/theme/v2/colors.css` | source-only | copy-new | No |
| `css/theme/v2/controls.css` | source-only | copy-new | No |
| `css/theme/v2/dialogs.css` | source-only | copy-new | No |
| `css/theme/v2/forms.css` | source-only | copy-new | No |
| `css/theme/v2/layout.css` | source-only | copy-new | No |
| `css/theme/v2/panels.css` | source-only | copy-new | No |
| `css/theme/v2/spacing.css` | source-only | copy-new | No |
| `css/theme/v2/status.css` | source-only | copy-new | No |
| `css/theme/v2/tables.css` | source-only | copy-new | No |
| `css/theme/v2/theme.css` | source-only | copy-new | No |
| `css/theme/v2/typography.css` | source-only | copy-new | No |
| `css/tokens.css` | source-only | deprecated-source | No |
| `css/tools.css` | source-only | deprecated-source | No |
| `css/tools/grouping/ai-learning.css` | source-only | deprecated-source | No |
| `css/tools/grouping/build-create.css` | source-only | deprecated-source | No |
| `css/tools/grouping/community-marketplace.css` | source-only | deprecated-source | No |
| `css/tools/grouping/content-assets.css` | source-only | deprecated-source | No |
| `css/tools/grouping/development-system.css` | source-only | deprecated-source | No |
| `css/tools/grouping/media-audio.css` | source-only | deprecated-source | No |
| `css/tools/grouping/platform-cloud.css` | source-only | deprecated-source | No |
| `css/tools/grouping/play.css` | source-only | deprecated-source | No |
| `images/ChatGPT Image May 30, 2026, 07_57_30 PM.png` | source-only | review-different | No |
| `images/ChatGPT Image May 30, 2026, 07_57_30 PM2.png` | source-only | review-different | No |
| `images/badges/ai-assistant.png` | source-only | review-different | No |
| `images/badges/animation-studio.png` | source-only | review-different | No |
| `images/badges/arcade.png` | source-only | review-different | No |
| `images/badges/asset-studio.png` | source-only | review-different | No |
| `images/badges/cloud-studio.png` | source-only | review-different | No |
| `images/badges/code-studio.png` | source-only | review-different | No |
| `images/badges/configuration-admin.png` | source-only | review-different | No |
| `images/badges/game-builder.png` | source-only | review-different | No |
| `images/badges/game-design-studio.png` | source-only | review-different | No |
| `images/badges/input-studio.png` | source-only | review-different | No |
| `images/badges/learn-studio.png` | source-only | review-different | No |
| `images/badges/localization-studio.png` | source-only | review-different | No |
| `images/badges/marketplace.png` | source-only | review-different | No |
| `images/badges/midi-studio.png` | source-only | review-different | No |
| `images/badges/object-vector-studio.png` | source-only | review-different | No |
| `images/badges/palette-manager.png` | source-only | review-different | No |
| `images/badges/particle-studio.png` | source-only | review-different | No |
| `images/badges/publish-studio.png` | source-only | review-different | No |
| `images/badges/settings-studio.png` | source-only | review-different | No |
| `images/badges/sound-studio.png` | source-only | review-different | No |
| `images/badges/storage-inspector.png` | source-only | review-different | No |
| `images/badges/world-vector-studio.png` | source-only | review-different | No |
| `images/characters/ai-assistant.png` | source-only | review-different | No |
| `images/characters/animation-studio.png` | source-only | review-different | No |
| `images/characters/arcade.png` | source-only | review-different | No |
| `images/characters/asset-studio.png` | source-only | review-different | No |
| `images/characters/cloud-studio.png` | source-only | review-different | No |
| `images/characters/code-studio.png` | source-only | review-different | No |
| `images/characters/configuration-admin.png` | source-only | review-different | No |
| `images/characters/game-builder.png` | source-only | review-different | No |
| `images/characters/game-design-studio.png` | source-only | review-different | No |
| `images/characters/input-studio.png` | source-only | review-different | No |
| `images/characters/learn-studio.png` | source-only | review-different | No |
| `images/characters/localization-studio.png` | source-only | review-different | No |
| `images/characters/marketplace.png` | source-only | review-different | No |
| `images/characters/match-format.png` | source-only | review-different | No |
| `images/characters/midi-studio.png` | source-only | review-different | No |
| `images/characters/object-vector-studio.png` | source-only | review-different | No |
| `images/characters/palette-manager.png` | source-only | review-different | No |
| `images/characters/particle-studio.png` | source-only | review-different | No |
| `images/characters/publish-studio.png` | source-only | review-different | No |
| `images/characters/settings-studio.png` | source-only | review-different | No |
| `images/characters/sound-studio.png` | source-only | review-different | No |
| `images/characters/storage-inspector.png` | source-only | review-different | No |
| `images/characters/world-vector-studio.png` | source-only | review-different | No |
| `images/favicon.svg` | source-only | review-different | No |
| `images/forge-bot-single.png` | source-only | review-different | No |
| `images/forge-bot.svg` | source-only | review-different | No |
| `images/forgebot.png` | source-only | review-different | No |
| `images/foundry-bot.png` | source-only | review-different | No |
| `images/game-foundry-mascot-sheet.png` | source-only | review-different | No |
| `images/game-foundry-studio-logo.png` | source-only | review-different | No |
| `images/game-foundry-tools-poster.png` | source-only | review-different | No |
| `images/games/game-forgequest.svg` | source-only | review-different | No |
| `images/games/game-iceberg.svg` | source-only | review-different | No |
| `images/games/game-nebula.svg` | source-only | review-different | No |
| `images/games/game-retrobot.svg` | source-only | review-different | No |
| `images/icons/ai-assistant.png` | source-only | review-different | No |
| `images/icons/animation-studio.png` | source-only | review-different | No |
| `images/icons/arcade.png` | source-only | review-different | No |
| `images/icons/asset-studio.png` | source-only | review-different | No |
| `images/icons/cloud-studio.png` | source-only | review-different | No |
| `images/icons/code-studio.png` | source-only | review-different | No |
| `images/icons/game-builder.png` | source-only | review-different | No |
| `images/icons/game-design-studio.png` | source-only | review-different | No |
| `images/icons/input-studio.png` | source-only | review-different | No |
| `images/icons/learn-studio.png` | source-only | review-different | No |
| `images/icons/localization-studio.png` | source-only | review-different | No |
| `images/icons/localization.png` | source-only | review-different | No |
| `images/icons/marketplace.png` | source-only | review-different | No |
| `images/icons/match-format.png` | source-only | review-different | No |
| `images/icons/midi-studio.png` | source-only | review-different | No |
| `images/icons/object-vector-studio.png` | source-only | review-different | No |
| `images/icons/palette-manager.png` | source-only | review-different | No |
| `images/icons/particle-studio.png` | source-only | review-different | No |
| `images/icons/publish-studio.png` | source-only | review-different | No |
| `images/icons/settings-studio.png` | source-only | review-different | No |
| `images/icons/sound-studio.png` | source-only | review-different | No |
| `images/icons/storage-inspector.png` | source-only | review-different | No |
| `images/icons/world-vector-studio.png` | source-only | review-different | No |
| `images/logo-mark.svg` | source-only | review-different | No |
| `images/magic-panel.png` | source-only | review-different | No |
| `images/pixel-smith.png` | source-only | review-different | No |
| `images/spark.png` | source-only | review-different | No |
| `images/tools/ai-assistant.png` | source-only | review-different | No |
| `images/tools/animation-studio.png` | source-only | review-different | No |
| `images/tools/arcade.png` | source-only | review-different | No |
| `images/tools/asset-studio.png` | source-only | review-different | No |
| `images/tools/cloud-studio.png` | source-only | review-different | No |
| `images/tools/code-studio.png` | source-only | review-different | No |
| `images/tools/game-builder.png` | source-only | review-different | No |
| `images/tools/game-design-studio.png` | source-only | review-different | No |
| `images/tools/input-studio.png` | source-only | review-different | No |
| `images/tools/learn-studio.png` | source-only | review-different | No |
| `images/tools/localization-studio.png` | source-only | review-different | No |
| `images/tools/localizaton.png` | source-only | review-different | No |
| `images/tools/marketplace.png` | source-only | review-different | No |
| `images/tools/match_format.png` | source-only | review-different | No |
| `images/tools/midi-studio.png` | source-only | review-different | No |
| `images/tools/object-vector-studio.png` | source-only | review-different | No |
| `images/tools/palette-manager.png` | source-only | review-different | No |
| `images/tools/particle-studio.png` | source-only | review-different | No |
| `images/tools/publish-studio.png` | source-only | review-different | No |
| `images/tools/settings-studio.png` | source-only | review-different | No |
| `images/tools/sound-studio.png` | source-only | review-different | No |
| `images/tools/storage-inspector.png` | source-only | review-different | No |
| `images/tools/world-vector-studio.png` | source-only | review-different | No |
| `js/account-controls.js` | source-only | review-different | No |
| `js/gamefoundry-partials.js` | source-only | review-different | No |
| `js/tool-display-mode.js` | source-only | review-different | No |
| `js/tools-page-accordions.js` | source-only | review-different | No |
| `partials/footer.html` | source-only | review-different | No |
| `partials/header-nav.html` | source-only | review-different | No |
| `partials/page-shell.html` | source-only | review-different | No |
| `partials/tool-shell.html` | source-only | review-different | No |

## Files Only In Src Engine Theme V2

_None._

## Files In Both And Identical

_None._

## Files In Both But Different

_None._

## Files That Would Overwrite Destination Content If Copied

_None._

## Validation

- PASS: `git diff --check`

## Scope Exclusions

- No copy operation performed.
- No destination replacement performed.
- No deletion or deprecation of `GameFoundryStudio/assets`.
- No templates created.
- No new CSS.
- No samples.
- No tool rebuilds.
