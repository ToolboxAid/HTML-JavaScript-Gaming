# Codex Commands — PR 11.83

Model: GPT-5.4
Reasoning: high

```text
Run BUILD_PR_LEVEL_11_83_LOCK_ASSET_LOADING_TO_MANIFEST_ONLY.

Implement a targeted fix so Workspace Manager/game launch asset loading uses game.manifest.json as the only source of truth for game chrome assets. Do not guess /games/<Game>/assets/images/bezel.png or background.png. Do not add fallback assets. Do not add aliases or pass-through shims.

Tasks:
1. Find code that derives game chrome image paths by convention, especially bezel/background.
2. Replace convention-derived URLs with explicit manifest asset lookup.
3. If a manifest does not declare an optional chrome asset, skip rendering/requesting that image and show safe empty state.
4. Preserve games that already declare chrome assets in game.manifest.json.
5. Search the repo for remaining hardcoded or derived references to /assets/images/bezel.png and /assets/images/background.png and remove convention-only loading paths.
6. Run targeted validation only:
   - launch SolarSystem and verify no bezel/background 404s
   - launch a game with declared manifest chrome assets, such as Asteroids if available, and verify declared assets still load
   - run syntax/import checks for changed JS files
7. Write evidence to docs/dev/reports/asset_manifest_only_validation.md.
8. If roadmap status is touched, status-only update only.

Return a ZIP artifact at <project folder>/tmp/PR_11_83_LOCK_ASSET_LOADING_TO_MANIFEST_ONLY.zip.
```
