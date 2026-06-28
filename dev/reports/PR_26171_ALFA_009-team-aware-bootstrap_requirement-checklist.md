# PR_26171_ALFA_009 Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Start from clean `main` | PASS | Reset failed attempt, switched to `main`, pulled fast-forward, confirmed `main...origin/main` was `0 0`, then recreated branch. |
| Add `npm run dev:bootstrap` | PASS | Added to `package.json`. |
| Keep `npm run dev:local-api` as legacy alias | PASS | Existing command remains unchanged. |
| Add `npm run dev:api` | PASS | Added to `package.json`. |
| Add `npm run dev:web` | PASS | Added to `package.json`. |
| Create `dev/scripts/start-dev.mjs` | PASS | Added orchestrator. |
| Create `dev/scripts/team-port-config.mjs` | PASS | Added team/role port resolver. |
| Support full team names only | PASS | Supported teams are owner, alfa, bravo, charlie, delta, echo, foxtrot, golf, hotel. |
| Support roles owner/codex | PASS | Role resolver supports owner and codex only. |
| Codex role uses base ports plus 2 | PASS | Covered by targeted unit test. |
| Do not use unsupported old team names | PASS | Scan returned no matches in new bootstrap files. |
| Do not use single-letter public team commands | PASS | Scan returned no matches in new bootstrap files. |
| Validate unknown team names | PASS | `omega` fails clearly with supported team list. |
| Validate unknown role names | PASS | `reviewer` fails clearly with supported role list. |
| Load environment | PASS | Orchestrator loads `.env` values without overriding existing environment values. |
| Resolve team ports | PASS | Unit tests cover all teams and both roles. |
| Start Local API | PASS | `dev:bootstrap` starts the existing Local API server on resolved API port. |
| Start web server when requested | PASS | `dev:bootstrap` starts web plus API; `dev:web` mode is wired. |
| Print startup diagnostics | PASS | Diagnostics include mode, team, role, web URL, API URL, environment source, supported teams, and supported roles. |
| Owner role launches browser automatically | PASS | Live startup validation opened `http://127.0.0.1:5510/index.html` after API and web were ready. |
| Codex role suppresses browser launch | PASS | Live startup validation reported `Browser launch: suppressed for codex role`. |
| Wait for both servers before browser launch | PASS | Targeted unit test asserts API ready, web ready, then browser launch order. |
| Preserve legacy behavior | PASS | `dev:local-api` command unchanged and startup validation passed. |
| No unrelated cleanup | PASS | Scope limited to package scripts, new dev scripts, targeted tests, and reports. |
