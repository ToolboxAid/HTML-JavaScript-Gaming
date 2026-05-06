# PR_26126_091 Asset Manager V2 Inspector Behavior Notes

Date: 2026-05-06

## Selected Asset Preview

- Tile hover remains a metadata tooltip only.
- Tile click selects the asset, loads it into Asset Controls, and renders the selected asset in the center preview region.
- The preview renders ID, Type, Kind, Role, and Path metadata.
- Image assets render an image preview.
- Audio and video assets render controls with `preload="metadata"` and no `autoplay`.
- Font assets render a font sample using a generated `@font-face`.
- Shader, data, and localization assets render inspection panels.

## Source Helper

- Preview rendering is centralized in `src/shared/assets/assetPreviewHelpers.js`.
- Asset Manager V2 imports that helper rather than reusing Asset Browser logic.
- The Playwright/V8 coverage report includes `src/shared/assets/assetPreviewHelpers.js` at 100%.

## Validation

- `npm run test:workspace-v2`: passed, 10 tests.
- Playwright validates tile click preview selection, image preview, audio no-autoplay behavior, and helper rendering modes for image, audio, video, font, shader, data, and localization.
