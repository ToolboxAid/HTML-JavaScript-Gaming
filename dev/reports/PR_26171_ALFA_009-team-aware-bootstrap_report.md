# PR_26171_ALFA_009 Team-Aware Bootstrap Report

## Purpose

Implement team-aware local dev bootstrap commands with role-aware port assignment while preserving the legacy local API command.

## Reset Note

Before rebuilding from clean `main`, the failed dirty attempt included:

- `dev/reports/codex_changed_files.txt`
- `dev/reports/codex_review.diff`
- `dev/scripts/start-local-api-server.mjs`
- `package.json`
- untracked bootstrap reports
- untracked `dev/scripts/start-dev.mjs`
- untracked `dev/scripts/team-port-config.mjs`
- untracked `dev/tests/dev-runtime/TeamAwareBootstrap.test.mjs`

Per OWNER instruction, those uncommitted changes were discarded with `git reset --hard` and `git clean -fd`, then this branch was recreated from clean `main`.

## Implementation Summary

- Added `npm run dev:bootstrap`.
- Added `npm run dev:api`.
- Added `npm run dev:web`.
- Preserved `npm run dev:local-api` unchanged as the legacy alias.
- Added `dev/scripts/team-port-config.mjs` for full team name and role-aware port resolution.
- Added `dev/scripts/start-dev.mjs` as the bootstrap orchestrator.
- Added focused node tests for team resolution, role offsets, invalid team/role validation, script wiring, `.env` loading behavior, and bootstrap diagnostics.
- Added automatic browser launch for owner-role `dev:bootstrap` after the API and web servers are both ready.
- Skipped automatic browser launch for the `codex` role.
- Fixed npm argument forwarding/parsing so both `--team charlie` and positional `charlie` select the same team after the package script's `--mode bootstrap` argument.
- Treats `.env` `GAMEFOUNDRY_SITE_URL` and `GAMEFOUNDRY_API_URL` as legacy/default local values for bootstrap mode, then overwrites runtime URLs from the resolved team/role ports.

## Supported Teams

`owner`, `alfa`, `bravo`, `charlie`, `delta`, `echo`, `foxtrot`, `golf`, `hotel`

## Supported Roles

`owner`, `codex`

## Port Mapping

`owner` role uses base ports. `codex` role uses base ports plus 2.

| Team | Owner Web | Owner API | Codex Web | Codex API |
| --- | ---: | ---: | ---: | ---: |
| owner | 5500 | 5501 | 5502 | 5503 |
| alfa | 5510 | 5511 | 5512 | 5513 |
| bravo | 5520 | 5521 | 5522 | 5523 |
| charlie | 5530 | 5531 | 5532 | 5533 |
| delta | 5540 | 5541 | 5542 | 5543 |
| echo | 5550 | 5551 | 5552 | 5553 |
| foxtrot | 5560 | 5561 | 5562 | 5563 |
| golf | 5570 | 5571 | 5572 | 5573 |
| hotel | 5580 | 5581 | 5582 | 5583 |

## Commands Added

```powershell
npm run dev:bootstrap
npm run dev:api
npm run dev:web
```

## Legacy Command Preserved

```powershell
npm run dev:local-api
```

## Exact Startup Commands

```powershell
npm run dev:bootstrap -- --team owner
npm run dev:bootstrap -- --team alfa
npm run dev:bootstrap -- --team bravo
npm run dev:bootstrap -- --team charlie
npm run dev:bootstrap -- --team delta
npm run dev:bootstrap -- --team echo
npm run dev:bootstrap -- --team foxtrot
npm run dev:bootstrap -- --team golf
npm run dev:bootstrap -- --team hotel
```

Codex role example:

```powershell
npm run dev:bootstrap -- --team alfa --role codex
```

## Browser Launch Behavior

- `owner` role launches the browser automatically to the selected team's `index.html`.
- `codex` role skips browser launch.
- Browser launch happens only after both API and web servers are ready.
- The Alfa owner launch target is `http://127.0.0.1:5510/index.html`.
- The Alfa codex browser launch is skipped while using web `5512` and API `5513`.
- The Charlie launch target is `http://127.0.0.1:5530/index.html` for both `npm run dev:bootstrap -- --team charlie` and `npm run dev:bootstrap -- charlie`.
- Computed team/role ports override any `.env` or inherited process `GAMEFOUNDRY_SITE_URL` / `GAMEFOUNDRY_API_URL` values loaded before bootstrap startup.
- Bootstrap runtime sets `GAMEFOUNDRY_SITE_URL=http://127.0.0.1:<webPort>` and `GAMEFOUNDRY_API_URL=http://127.0.0.1:<apiPort>/api` after team/role resolution.

## Files Changed

- `package.json` - updated
- `dev/scripts/start-dev.mjs` - added
- `dev/scripts/team-port-config.mjs` - added
- `dev/tests/dev-runtime/TeamAwareBootstrap.test.mjs` - added

## Validation Summary

All requested targeted validation passed.
