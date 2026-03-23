# PLAN — Game Roadmap and Tools Hub

## Goal
Document the build direction before starting Pong, improve the games launcher so it shows both current playable titles and the planned arcade roadmap, and add a dedicated tools hub that explains which creation tools exist now and which ones are next.

## Scope
- Update `games/index.html` to separate live games from planned roadmap entries.
- Add `tools/index.html` as the entry point for the repo toolchain.
- Update root `index.html` so the new Games Hub and Tools Hub are visible from the main landing page.
- Keep this pass docs-first and navigation-focused. No engine or gameplay behavior changes.

## Notes
- Pong remains the next game build.
- The tools page should clearly call out Sprite Editor as live and Tilemap Editor as the next major tool.
- Palette workflow should move toward shared `palettesList` data so editing tools and runtime asset data stay consistent.
