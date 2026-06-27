# PLAN_PR_LEVEL_8_32_DIRECT_GAME_LAUNCH_HOOK_REMOVAL_AND_ASTEROIDS_PARITY

## Purpose
Remove the global hook/redirect that sends game preview launches through Workspace Manager, and continue Asteroids cleanup/parity only after direct game launch is restored.

## User-Reported Failure
Only Space Invaders launches directly.

Clicking Bouncing Ball and other games appears to target the correct direct game URL, for example:

```text
games/BouncingBall.index.html
```

But the browser redirects to:

```text
http://127.0.0.1:5500/tools/Workspace%20Manager/index.html?game=Bouncing-ball&mount=game
```

Workspace Manager then shows:

```text
Workspace Manager Diagnostic
Workspace Manager game launch requires a valid gameId.

Expected query: ?gameId=<id>&mount=game
```

## Scope
- Find and remove/disable the redirect hook that reroutes normal game previews to Workspace Manager.
- Ensure game preview click launches the game directly for all games.
- Keep Workspace Manager as a separate explicit action only.
- Keep Asteroids JSON cleanup/parity work from 8.31 moving forward.
- Advance roadmap status only.

## Non-Goals
- No Workspace Manager redesign.
- No broad runtime rewrite beyond removing the bad redirect hook.
- No validators.
- No `start_of_day` changes.
