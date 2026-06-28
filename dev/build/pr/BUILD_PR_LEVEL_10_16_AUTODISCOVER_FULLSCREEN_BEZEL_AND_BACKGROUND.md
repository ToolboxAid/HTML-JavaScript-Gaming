# BUILD_PR_LEVEL_10_16_AUTODISCOVER_FULLSCREEN_BEZEL_AND_BACKGROUND

## Purpose
Implement zero-config asset autodiscovery for fullscreen bezel and optional background image rendering.

## Problem
The bezel is not showing, and the current direction still relies too much on explicit setup.
If a game already has:
- `assets/images/bezel.png`
- or `assets/images/background.png`

the runtime should detect and draw them automatically with no game-specific user code.

## Scope

### Automatic discovery rules
For each game, autodetect these optional image assets under:
`games/<gameId>/assets/images/`

Recognized filenames:
- `bezel.png`
- `background.png`

No additional game wiring should be required.

### Render behavior

#### Background
If `background.png` exists:
- draw automatically
- treat as screen-sized image content
- draw before world/gameplay
- keep behavior minimal and stable
- no camera/parallax dependency unless separately designed later

#### Bezel
If `bezel.png` exists:
- draw automatically
- bezel should only render in fullscreen mode
- bezel is screen-space only
- draw after gameplay/HUD by default
- no user-added per-game code required

### Render order
Default order:
1. optional autodiscovered `background.png`
2. game/world render
3. HUD/overlay as currently defined
4. optional autodiscovered fullscreen `bezel.png`

### Architectural rules
- Do not route bezel through Parallax
- Do not require per-game bootstrap code to enable bezel/background autodraw
- Keep detection convention-based and minimal
- Keep scope engine-safe and surgical
- Prefer a small shared image-discovery/render helper if needed

## Testable Outcome
- If `games/Asteroids/assets/images/bezel.png` exists, bezel appears automatically in fullscreen
- If `games/<gameId>/assets/images/background.png` exists, background appears automatically
- Games without either file continue to run without error
- No manual game code required to enable either behavior
- PR returns repo-structured ZIP at:
  `<project folder>/tmp/BUILD_PR_LEVEL_10_16_AUTODISCOVER_FULLSCREEN_BEZEL_AND_BACKGROUND.zip`

## Non-Goals
- No generalized layered art system
- No editor changes
- No parallax/background system redesign
