# Codex Command — PR 11.95

Model: GPT-5.4
Reasoning: high

```text
Run BUILD_PR for PR_11_95_FLATTEN_MANIFEST_ASSETS_AND_FIX_LOADERS.

Read docs/pr/PR_11_95_FLATTEN_MANIFEST_ASSETS_AND_FIX_LOADERS.md.

Implement the smallest complete code change that makes asset-browser.assets the single flat manifest source of truth for all asset kinds.

Fix manifests and code together:
- Remove nested asset-browser.assets.media usage.
- Update runtime loaders to read manifest["asset-browser"].assets directly.
- Update Workspace Manager, Asset Browser, and SVG Asset Studio consumers to list assets from the flat map.
- Preserve kind-based filtering for image/font/audio/svg.
- Keep Asteroids bezel path as /games/Asteroids/assets/images/bezel.png.
- Keep Asteroids background path as /games/Asteroids/assets/images/deluxe.png.
- Add/keep font.asteroids.vector-battle under the flat assets map.
- Keep stretchOverride only on image.*.bezel entries.
- Do not add aliases, shims, fallback paths, or media compatibility layers.

After implementation, run targeted validation commands from the PR doc and write findings to docs/dev/reports/PR_11_95_validation.md.

Package changed files into repo-structured ZIP:
<project folder>/tmp/PR_11_95_FLATTEN_MANIFEST_ASSETS_AND_FIX_LOADERS.zip
```
