# PR 11.96 Validation Checklist

## Required searches
- Search for `asset-browser.assets.media`
- Search for `.assets.media`
- Search for `media.audio`
- Search for `media.images`
- Search for `media.fonts`
- Search for `media.svg`

Remaining matches must be only historical docs_build/reports, not runtime/tool/schema/sample 1902 code.

## Manual checks
- Sample 1902 Workspace Manager loads.
- SVG Asset Studio asset list is populated and visible.
- Asteroids loads manifest background/bezel/font.
- No 404s for guessed chrome assets.

## Test decision
Full samples suite skipped unless loader changes prove broad enough to require it.
