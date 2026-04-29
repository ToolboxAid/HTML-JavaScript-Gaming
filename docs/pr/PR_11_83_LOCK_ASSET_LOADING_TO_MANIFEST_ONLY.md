# PR 11.83 — Lock Asset Loading To Manifest Only

## Purpose
Prevent game/tool launch code from requesting guessed asset paths such as `bezel.png`, `background.png`, sample defaults, or hidden fallback assets that are not explicitly declared in the owning manifest.

## Scope
- Game launch/chrome image loading
- Workspace Manager game/tool asset display paths
- Manifest-driven asset lookup helpers if present
- Targeted validation only

## Required behavior
1. Treat `game.manifest.json` as the source of truth for game assets.
2. Only request an asset URL when the manifest explicitly declares that asset.
3. If an optional asset is missing from the manifest, render a safe empty state.
4. Do not hardcode or guess these paths:
   - `/games/<Game>/assets/images/bezel.png`
   - `/games/<Game>/assets/images/background.png`
   - any other convention-only asset path
5. Do not add silent fallback data or hidden default assets.
6. Do not create aliases, bridge helpers, or compatibility shims.

## Specific known failure to fix
SolarSystem currently logs 404 requests similar to:

```text
GET /games/SolarSystem/assets/images/bezel.png 404
GET /games/SolarSystem/assets/images/background.png 404
```

Those requests must stop unless SolarSystem declares those assets in its `game.manifest.json`.

## Implementation direction
- Locate the launch/chrome code that currently derives bezel/background image URLs by convention.
- Replace convention-derived path construction with manifest lookup.
- Support existing manifest asset entries such as:

```json
"image.asteroids.bezel": {
  "path": "/games/Asteroids/assets/images/bezel.png",
  "kind": "image",
  "source": "workspace-manager"
}
```

- Prefer an explicit manifest key lookup when keys are known.
- Otherwise scan manifest asset entries for `kind: "image"` and a semantic key suffix/name such as `bezel` or `background`.
- If no matching manifest asset exists, return `null` and skip image rendering/requesting.

## Out of scope
- Do not create missing image files.
- Do not add placeholder images.
- Do not change game art.
- Do not refactor the manifest schema unless required for the fix.
- Do not modify unrelated games/tools.

## Acceptance
- SolarSystem no longer requests nonexistent `bezel.png` or `background.png`.
- Asteroids or any game with manifest-declared chrome assets still displays those assets.
- No hardcoded convention fallback remains for game chrome assets.
- Targeted browser validation shows no missing image 404s for affected game launch path.
