# PR_26155_030 Learn Wireframe Pages

## Summary

- Replaced `learn/index.html` with a Theme V2 Learn wireframe hub.
- Added static Learn tool wireframe pages:
  - `learn/project-workspace/index.html`
  - `learn/game-design/index.html`
  - `learn/game-configuration/index.html`
  - `learn/assets/index.html`
  - `learn/colors/index.html`
  - `learn/objects/index.html`
  - `learn/worlds/index.html`
  - `learn/audio/index.html`
  - `learn/publish/index.html`
- Removed stale `toolbox/learn/index.html` so Learn is no longer a Toolbox tool.

## Learn Index Sections

- Search documentation
- Browse by tool
- Tutorials
- Videos
- Examples
- FAQ

## Tool Learn Page Sections

- Overview
- Quick Start
- Common Tasks
- Related Documentation
- Related Videos
- Examples

## Scope Notes

- Pages are fake/static wireframes only.
- No real search implementation was added.
- No video embeds were added.
- No DB, auth, persistence, or runtime behavior was added.
- No CSS was added or modified.

## Validation Notes

- Playwright targeted checks load `learn/index.html` and every new `learn/*/index.html` page.
- Playwright verifies shared header/footer, required wireframe headings, no inline script/style/event styling, no video embeds, no failed requests, and no console page errors.
- `npm run test:workspace-v2`: PASS, 3 tests.
- `git diff --check`: PASS.

## Manual Test Notes

- Confirmed all Learn pages use `assets/theme-v2/css/theme.css`.
- Confirmed top-level Learn navigation remains in the shared header.
- Confirmed Learn is not rendered as a Toolbox tile, group, or submenu item.
