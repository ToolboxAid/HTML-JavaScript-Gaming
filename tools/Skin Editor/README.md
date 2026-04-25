# Skin Editor

Skin Editor is a JSON-based skin workflow tool for:

- Breakout
- Pong
- Solar System
- Bouncing Ball

It supports loading active skin payloads, importing/exporting JSON, applying browser-local overrides for live game previews, and clearing overrides to return to default game skin files.

## Runtime Behavior

- Games load skin from local override first (if present).
- If no override exists, games load the default skin file under `games/<Game>/assets/skins/default.json`.
- Workspace mode can resolve skin file paths via each game's `workspace.asset-catalog.json`.

## Typical Flow

1. Choose a game in Skin Editor.
2. Click `Load Active Skin`.
3. Edit JSON and click `Apply Skin Override`.
4. Open the game and verify.
5. Export JSON when ready.
