# BUILD_PR_LEVEL_8_32_DIRECT_GAME_LAUNCH_HOOK_REMOVAL_AND_ASTEROIDS_PARITY

## Objective
Fix the direct game launch path globally.

## Required Behavior

### Game Preview
Clicking a game preview/card must launch the game directly.

Example:
```text
games/BouncingBall.index.html
```

or the correct canonical direct launch path.

### Workspace Manager
Workspace Manager should only open from an explicit Workspace Manager action:

```text
tools/Workspace Manager/index.html?gameId=<id>&mount=game
```

Not from normal preview click.

## Current Broken Behavior
Some game launches redirect to Workspace Manager using:

```text
?game=<id>&mount=game
```

This is wrong for two reasons:
1. Preview should not route through Workspace Manager.
2. Workspace Manager expects `gameId`, not `game`.

## Required Fix
Find the hook that rewrites or redirects direct game launches to Workspace Manager.

Likely search targets:
- game index/cards/list renderers
- preview click handlers
- launch helper functions
- workspace manager launch adapters
- redirect guards
- `mount=game`
- `?game=`
- `Workspace Manager/index.html`
- `open with workspace`
- game registry launch URL generation

## Fix Rules
- Delete or disable the redirect only for normal preview/direct game launch.
- Preserve a separate Workspace Manager action if already present.
- If a shared helper mixes both behaviors, split into:
  - `launchGameDirect(game)`
  - `openGameInWorkspaceManager(game)`
- Do not require query params for normal game launch.
- Do not rewrite unrelated runtime behavior.

## Games to Smoke Check
At minimum:
- SpaceInvaders direct launch remains working.
- Bouncing Ball direct launch works.
- Asteroids direct launch works.
- Pong direct launch works if present.
- Breakout direct launch works if present.

## Asteroids Parity Continuation
After launch hook is fixed, continue Asteroids-only cleanup from Level 8.31:
- confirm every remaining Asteroids JSON is manifest-wired, legacy-required, or deferred
- preserve legacy catalogs unless parity is proven
- do not delete runtime-required catalogs yet

## Required Report
Create:

```text
docs/dev/reports/level_8_32_direct_launch_hook_and_asteroids_parity_report.md
```

Report must include:
- hook/source file found
- old behavior
- new behavior
- direct-launch smoke check results
- Workspace Manager explicit-action status
- Asteroids parity status
- delta ZIP creation confirmation

## Roadmap Movement
Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status only:
- advance direct game launch hook removal `[ ] -> [.]` or `[.] -> [x]`
- advance Asteroids parity cleanup if execution-backed
- no prose rewrite/delete

## Acceptance
- Normal preview clicks no longer redirect to Workspace Manager.
- Bouncing Ball launches directly.
- Asteroids launches directly.
- Space Invaders still launches directly.
- Workspace Manager remains available only as explicit action.
- No validators added.
- No `start_of_day` changes.
- Codex returns delta ZIP.
