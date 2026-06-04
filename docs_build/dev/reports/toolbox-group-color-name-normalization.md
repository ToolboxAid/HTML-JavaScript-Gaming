# PR_26155_033 Toolbox Group Color Name Normalization

## Summary

- Normalized dynamic Toolbox group color identifiers to creator-facing group names:
  - `tool-group-create`
  - `tool-group-build`
  - `tool-group-content`
  - `tool-group-media`
  - `tool-group-test`
  - `tool-group-share`
  - `tool-group-account`
- Updated `toolbox/tools-page-accordions.js` and `toolbox/toolRegistry.js` to use the normalized names.
- Kept tile outlines visible with the same group color treatment.

## Theme V2 Gap Findings

- Existing Theme V2 color classes used older names such as `tool-group-build-create`, `tool-group-content-assets`, and `tool-group-development-system`.
- A reusable Theme V2 alias gap existed for the new creator-facing group names.
- Added shared Theme V2 alias selectors in:
  - `assets/theme-v2/css/colors.css`
  - `assets/theme-v2/css/tools/grouping/build-create.css`
  - `assets/theme-v2/css/tools/grouping/content-assets.css`
  - `assets/theme-v2/css/tools/grouping/development-system.css`
  - `assets/theme-v2/css/tools/grouping/media-audio.css`
  - `assets/theme-v2/css/tools/grouping/platform-cloud.css`
  - `assets/theme-v2/css/tools/grouping/community-marketplace.css`
- Older class names remain styled for compatibility with existing tool shells.
- No page-local CSS, tool-local CSS, inline styles, or style blocks were added.

## Validation Notes

- Playwright verifies Assets uses `tool-group-content`.
- Playwright verifies Worlds uses `tool-group-create`.
- Playwright verifies every rendered Toolbox tile still has a `tool-group-*` class and a non-transparent border color.
- `npm run test:workspace-v2`: PASS, 3 Playwright tests.
- `git diff --check`: PASS.

## Manual Test Notes

- Verified Create, Build, Content, Media, Test, Share, and Account groups still render.
- Verified group-color outlines remain visible on Toolbox tiles.
- Verified Learn, Admin, and Arcade boundaries remain unchanged.
