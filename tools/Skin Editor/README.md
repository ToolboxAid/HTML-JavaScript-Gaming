# Skin Editor

Skin Editor is a visual-plus-JSON skin workflow tool for:

- Breakout
- Pong
- Solar System
- Bouncing Ball

It supports loading active skin payloads, editing via visual controls (colors, sizing, entities), importing/exporting JSON, applying browser-local overrides for live game previews, and clearing overrides to return to default game skin files.

## Runtime Behavior

- Games load skin from local override first (if present).
- If no override exists, games load the default skin file under `games/<Game>/assets/skins/default.json`.
- Workspace mode can resolve skin file paths via each game's `workspace.asset-catalog.json`.

## Typical Flow

1. Open Skin Editor from a game or sample context.
2. Click `Load Active Skin`.
3. Use visual controls and/or JSON editing.
4. Click `Apply Skin Override`.
5. Open the game and verify.
6. Export JSON when ready.
