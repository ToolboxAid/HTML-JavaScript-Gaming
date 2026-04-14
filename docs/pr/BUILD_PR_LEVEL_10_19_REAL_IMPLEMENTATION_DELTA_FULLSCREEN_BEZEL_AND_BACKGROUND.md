# BUILD_PR_LEVEL_10_19_REAL_IMPLEMENTATION_DELTA_FULLSCREEN_BEZEL_AND_BACKGROUND

## Purpose
Force a real implementation delta for Asteroids fullscreen bezel and gameplay-only background rendering.

## Why this PR exists
Previous bundles did not produce a meaningful runtime delta in Git.
This PR corrects that by requiring actual changed implementation files in the returned ZIP, not docs-only packaging.

Assumed asset paths are correct:

- `games/Asteroids/assets/images/background.png`
- `games/Asteroids/assets/images/bezel.png`

No subfolders are involved.

## Required runtime behavior

### A. `backgroundImage`
- Dedicated class/module name: `backgroundImage`
- Uses `games/<gameId>/assets/images/background.png`
- Drawn to canvas
- Drawn only during gameplay states
- Drawn immediately after clear and before all other world/gameplay content
- Not drawn during attract/title/select-player/menu/non-gameplay screens

### B. `fullscreenBezel`
- Dedicated class/module name: `fullscreenBezel`
- Uses `games/<gameId>/assets/images/bezel.png`
- Rendered at HTML/container level above the canvas
- Only visible while fullscreen is active
- Must be visually visible on screen, not merely present in the DOM

## Required implementation delta
The returned ZIP must contain real changed source files if needed, such as:
- runtime/game integration files
- render pipeline files
- DOM/fullscreen host files
- focused tests/validation files

This PR is not complete if the ZIP only contains docs.

## Required validation evidence
Implementation must prove:
- background renders in gameplay only
- bezel appears on screen in fullscreen
- bezel is above the canvas
- games without those files do not break

## Packaging rule
Return a repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_10_19_REAL_IMPLEMENTATION_DELTA_FULLSCREEN_BEZEL_AND_BACKGROUND.zip`

The ZIP must include:
1. changed implementation files
2. changed tests/validation files
3. docs/pr/*
4. docs/dev/codex_commands.md
5. docs/dev/commit_comment.txt
6. docs/dev/reports/*

If no implementation files are changed, this PR is considered failed.
