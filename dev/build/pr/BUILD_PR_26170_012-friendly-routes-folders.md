# BUILD PR_26170_012-friendly-routes-folders

## Purpose

Rename only the route/folder surface that is safe after impact review, and preserve compatibility for existing links.

## Safe Route Decision

Rename the Toolbox Game Crew page route:

- From `toolbox/users/index.html`
- To `toolbox/game-crew/index.html`

The `users` tool key and underlying identity/database table names remain unchanged because they are runtime contracts.

## Unsafe Route Decisions

- Do not rename `toolbox/game-workspace/` to `toolbox/game-hub/` because `game-workspace` is tied to active tool keys, repository ids, API paths, tests, and runtime contracts.
- Do not rename Admin `users`, `roles`, or `invitations` routes because those paths reflect admin service contracts and table-backed pages.
- Do not move Game Journey.

## Scope

- Move the existing Game Crew Toolbox page to `toolbox/game-crew/index.html`.
- Add a compatibility page at `toolbox/users/index.html` that points creators to the new Game Crew route without inline JavaScript or inline CSS.
- Update shared toolbox metadata route fields for the `users` tool entry to point at `game-crew/index.html`.
- Update route/link validation expectations that use the shared metadata path.
- Document compatibility notes in the PR report.

## Out Of Scope

- Tool key renames.
- Database schema/table/key renames.
- Admin route renames.
- Game Hub route rename.
- Game Journey route/folder moves.
- Runtime behavior changes.
- Full samples validation.

## Validation

- Verify current branch is `main`.
- Run `node --check` for touched JavaScript files.
- Run targeted static route/link checks for `toolbox/game-crew/index.html` and compatibility `toolbox/users/index.html`.
- Run targeted Toolbox Playwright validation for Toolbox rendering, Game Crew route resolution, and old-route compatibility.
- Do not run full samples.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26170_012-friendly-routes-folders.md`
- `tmp/PR_26170_012-friendly-routes-folders_delta.zip`
