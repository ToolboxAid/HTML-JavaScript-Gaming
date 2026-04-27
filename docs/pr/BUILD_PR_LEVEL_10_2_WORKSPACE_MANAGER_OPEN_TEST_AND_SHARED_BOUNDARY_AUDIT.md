# BUILD_PR_LEVEL_10_2_WORKSPACE_MANAGER_OPEN_TEST_AND_SHARED_BOUNDARY_AUDIT

## Objective A — Test "Open with Workspace Manager" From `games/index.html`

Add a focused test that opens `games/index.html`, finds every game entry/card, and validates the "Open with Workspace Manager" action for each game.

## Why
This directly supports the current manifest/tool alignment work.

We need to prove:
- normal preview/direct launch is direct game launch
- "Open with Workspace Manager" is a separate action
- Workspace Manager receives a valid `gameId`
- Workspace Manager receives `mount=game`
- old bad query `?game=<id>&mount=game` is not used

## Required Test Behavior

### Test target
Add or update a test under:

```text
tests/runtime/
```

Suggested name:

```text
tests/runtime/GamesIndexWorkspaceManagerOpen.test.mjs
```

### Test should:
1. Serve the repo like existing launch smoke tests do.
2. Open:
   ```text
   /games/index.html
   ```
3. Discover all game entries/cards from the DOM.
4. For each game:
   - find the "Open with Workspace Manager" action/link/button
   - verify the target URL contains:
     - `tools/Workspace%20Manager/index.html`
     - `gameId=<id>`
     - `mount=game`
   - verify it does NOT use:
     - `?game=`
5. Optionally click each Workspace Manager action and confirm it does not show the diagnostic:
   ```text
   Workspace Manager game launch requires a valid gameId
   ```

### Test must not:
- run samples
- run tools
- run every launch smoke test twice
- replace the games-only smoke path

## Objective B — Boundary Audit for `tools/shared/asteroidsPlatformDemo.js`

## User Question
Why does:

```text
tools/shared/asteroidsPlatformDemo.js
```

live under `tools/shared/`?

Is that crossing a boundary?

## Initial Decision
Likely yes, if this file contains game/domain demo logic for Asteroids.

### Correct Boundary
- `tools/shared/` should contain tool-agnostic shared tool utilities only.
- Asteroids platform/demo logic should not live in `tools/shared/`.
- If it is game-specific, move toward:
  ```text
  games/Asteroids/shared/
  ```
  or inline/manifest-driven Asteroids runtime ownership.
- If it is sample/demo-only, move toward:
  ```text
  samples/phase-XX/<id>/
  ```
- If it is engine-generic platform demo support, move toward:
  ```text
  src/
  ```
  or another engine/shared runtime folder.

## Required Audit
Create:

```text
docs/dev/reports/level_10_2_asteroids_platform_demo_boundary_audit.md
```

Report:
- what imports `tools/shared/asteroidsPlatformDemo.js`
- what it imports
- whether it contains Asteroids/game-specific logic
- whether it contains tool-generic logic
- recommended move target
- whether move is safe now or should be a follow-up PR

## Move Rule
Do not move the file in this PR unless:
- all imports are updated
- no runtime/tool break occurs
- ownership is obvious
- scope remains small

Otherwise:
- report as blocker/follow-up.

## Required Report
Create:

```text
docs/dev/reports/level_10_2_workspace_manager_open_test_report.md
```

Report:
- games discovered from index
- Workspace Manager action count
- actions with `gameId`
- actions with `mount=game`
- actions still using `game`
- diagnostic failures

## Roadmap Movement
Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status only:
- add/advance Workspace Manager open action test
- add/advance tool/shared boundary audit
- use only `[ ] -> [.]` and `[.] -> [x]`

## Acceptance
- Test exists for `games/index.html` Workspace Manager actions.
- Test covers all games from the index.
- Test validates `gameId` and `mount=game`.
- Test rejects old `?game=` query.
- `tools/shared/asteroidsPlatformDemo.js` boundary audit exists.
- No start_of_day changes.
- Delta ZIP returned.
