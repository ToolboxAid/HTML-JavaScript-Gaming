# Toolbox Banner And Image Polish

Stack item: `PR_26155_027-toolbox-banner-and-image-polish`

## Summary

- Added the existing Theme V2 `callout` class to the role banner container.
- Preserved the single-line clickable banner text for Guest, Creator, and Admin roles.
- Kept preview images linked to the same route as the Open Tool button.
- Updated shared Theme V2 card media overflow so hover scale/rotate is not clipped.

## Theme V2 Gap Findings

- Banner background did not require new CSS; existing Theme V2 `callout` styling covered it.
- Existing preview hover styling already lived in shared Theme V2 `panels.css`, but the media/link containers clipped the hover transform.
- Adjusted the reusable Theme V2 card media pattern in `assets/theme-v2/css/panels.css`.
- No inline styles, style blocks, page-local CSS, or tool-local CSS were added.

## Validation Notes

- Targeted Playwright checks verify Guest, Creator, and Admin banners render with a non-transparent background.
- Targeted Playwright checks verify preview image hover applies scale/rotate and the relevant containers use visible overflow.
- Targeted Playwright checks verify preview image click opens the same tool route as Open Tool.
- `npm run test:workspace-v2` passed.

## Manual Test Notes

- Guest banner: `GUEST VIEW • Preview only • Sign in to create`.
- Creator banner: `CREATOR VIEW • Project tools enabled • Switch to Admin View`.
- Admin banner: `ADMIN VIEW • Planned tools visible • Switch to Creator View`.
- The Assets preview image routes to `/toolbox/assets/index.html`, matching Open Tool.
