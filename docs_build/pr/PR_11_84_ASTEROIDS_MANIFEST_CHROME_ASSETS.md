# PR 11.84 — Asteroids Manifest Chrome Assets

## Purpose
Update the Asteroids `game.manifest.json` file so Workspace/Game launch uses declared manifest assets instead of guessed chrome asset paths.

## Required change
Find the Asteroids manifest, expected path:

```text
games/Asteroids/game.manifest.json
```

Update or add the manifest asset entries so they resolve to:

```json
"image.asteroids.bezel": {
  "path": "/games/Asteroids/assets/images/bezel1.png",
  "kind": "image",
  "source": "workspace-manager"
},
"image.asteroids.background": {
  "path": "/games/Asteroids/assets/images/deluxe.png",
  "kind": "image",
  "source": "workspace-manager"
}
```

## Guardrails
- Do not add guessed fallback paths.
- Do not modify other games.
- Do not create placeholder image files.
- Do not change shared asset-loading behavior in this PR.
- Preserve existing manifest structure and ordering as much as possible.

## Validation
Run targeted checks only:

```powershell
Test-Path .\games\Asteroids\assets\images\bezel1.png
Test-Path .\games\Asteroids\assets\images\deluxe.png
Select-String -Path .\games\Asteroids\game.manifest.json -Pattern "bezel1.png|deluxe.png"
```

Then open Asteroids through Workspace Manager and verify no request is made for:

```text
/games/Asteroids/assets/images/bezel.png
/games/Asteroids/assets/images/background.png
```

## Acceptance
- Asteroids manifest references `bezel1.png` for bezel.
- Asteroids manifest references `deluxe.png` for background.
- No hardcoded fallback asset paths are introduced.
- Targeted validation report is written under `docs_build/dev/reports`.
