# BUILD_PR_11_87_MANIFEST_BACKGROUND_ALWAYS_VISIBLE

## Codex Task
Implement the smallest safe change so manifest-declared backgrounds are always drawn and are not hidden by clear/fill behavior.

## Required Changes

### 1. Background rendering gate
Find the background rendering helper/module, likely near:

```text
src/**/backgroundImage.js
```

Change the logic so a valid manifest-declared background is not restricted to gameplay-only modes.

Required behavior:

```text
if manifest has image.*.background and image loaded:
  draw background for menu/title/attract/gameplay/pause/etc.
else:
  keep existing safe empty/no-background behavior
```

Do not add fallback paths.

### 2. Clear/fill behavior
Find scene code that clears or paints full-screen dark fills before/after background draw, especially:

```text
games/Asteroids/**/AsteroidsGameScene.js
games/Asteroids/**/AsteroidsAttractAdapter.js
```

When a manifest background is present:
- do not paint an opaque clear/fill that hides it
- keep overlays translucent if needed for readability
- preserve foreground UI/text/asteroids/title drawing

### 3. Manifest-only rule
Confirm bezel/background loading only comes from `game.manifest.json` entries like:

```json
"image.asteroids.background": {
  "path": "/games/Asteroids/assets/images/deluxe.png",
  "kind": "image",
  "source": "workspace-manager"
}
```

Remove or reject any newly discovered guessed paths like:

```text
/games/<Game>/assets/images/background.png
/games/<Game>/assets/images/bezel.png
```

### 4. No duplicated SSoT
Do not add background display options under `asset-browser.assets.background`.
Background image behavior belongs to `image.*.background` manifest entries and renderer behavior only.

## Validation
Run targeted validation only:

```text
Asteroids menu state: deluxe.png visible
Asteroids attract state: deluxe.png visible, not hidden by full-screen dark rect
Asteroids gameplay state: deluxe.png visible
Asteroids pause state: deluxe.png visible if pause is available
Browser console: no missing bezel/background 404s
Search: no guessed background/bezel path fallback added
```

Write evidence to:

```text
docs_build/dev/reports/PR_11_87_validation.md
```

## Constraints
- No full sample suite.
- No broad render architecture refactor.
- No hardcoded default assets.
- No alias/pass-through helpers.
- No unrelated file changes.
