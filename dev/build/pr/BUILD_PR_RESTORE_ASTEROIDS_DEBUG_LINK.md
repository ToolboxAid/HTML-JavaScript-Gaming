# BUILD_PR — Restore Asteroids Debug Link

## Purpose
Restore the missing Debug Mode link for Asteroids sample only.

## Scope
- Target: Asteroids (Debug Showcase)
- Add Debug link under preview (or equivalent link group)

## Expected Links
- Play: /games/Asteroids/index.html
- Debug Mode: /games/Asteroids/index.html?debug=1

## Rules
- Only Asteroids sample modified
- No new global patterns
- No metadata restructuring
- No UI/layout changes

## Validation
- Asteroids shows both Play and Debug links
- Debug link includes ?debug=1
- No duplicate links
- No impact to other samples
