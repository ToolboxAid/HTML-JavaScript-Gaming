# Toolbox Tile Layout Polish

Stack item: `PR_26155_023-toolbox-tile-layout-polish`

## Summary

- Moved the tool category/content cluster under the Open Tool button on Toolbox tiles.
- Replaced duplicate visible category text with the existing content cluster text.
- Removed the separate card-level `.kicker` category row from generated tool cards.
- Made preview images clickable through the same route as the Open Tool button.
- Added reusable Theme V2 `.card-media-link` styling for preview-image hover.

## Theme V2 Gap Finding

- Existing Theme V2 card media styling supported static media but did not include a reusable linked preview-media hover affordance.
- Added the reusable pattern to `assets/theme-v2/css/panels.css`.
- No page-local CSS, tool-local CSS, inline styles, or style blocks were added.

## Validation Notes

- Targeted Playwright checks verify that card preview links match Open Tool routes.
- Targeted Playwright checks verify that preview hover changes the image transform.
- Targeted Playwright checks verify that generated Toolbox cards no longer contain duplicate `.kicker` category rows.
- `npm run test:workspace-v2` passed.

## Manual Test Notes

- Toolbox tiles keep the existing card structure.
- The preview image for the Assets tile routes to `/toolbox/assets/index.html`, matching Open Tool.
- Category display appears once per tile through the content cluster under the Open Tool button.
