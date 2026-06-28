# PR_26171_ALFA_009 Validation Report

## Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `node --check dev/scripts/team-port-config.mjs` | PASS | Syntax valid. |
| `node --check dev/scripts/start-dev.mjs` | PASS | Syntax valid. |
| `node --check dev/scripts/start-local-api-server.mjs` | PASS | Legacy startup entrypoint remains valid. |
| `node --check dev/tests/dev-runtime/TeamAwareBootstrap.test.mjs` | PASS | Test syntax valid. |
| `node ./dev/scripts/run-node-test-files.mjs dev/tests/dev-runtime/TeamAwareBootstrap.test.mjs dev/tests/dev-runtime/LocalApiStartupLogging.test.mjs` | PASS | 2 targeted files passed; 14 subtests passed. |
| Unsupported team token scan in new bootstrap files | PASS | No unsupported old team names or single-letter public team commands found in package scripts, bootstrap scripts, or targeted bootstrap tests. |
| `npm run validate:canonical-structure` | PASS | Canonical repository structure guardrail passed. |
| `npm run dev:bootstrap -- --team alfa` | PASS | Started with team `alfa`, role `owner`, web `5510`, API `5511`, launched browser to `http://127.0.0.1:5510/index.html`, then process tree was stopped. |
| `npm run dev:bootstrap -- --team alfa --role codex` | PASS | Started with team `alfa`, role `codex`, web `5512`, API `5513`, skipped browser launch, then process tree was stopped. |
| `npm run dev:bootstrap -- alfa codex` | PASS | Positional team/role forwarding selected team `alfa`, role `codex`, web `5512`, API `5513`, and skipped browser launch. |
| `npm run dev:bootstrap -- --team charlie` with inherited stale URL env values | PASS | Started with team `charlie`, role `owner`, web `5530`, API `5531`, launched browser to `http://127.0.0.1:5530/index.html`, and ignored inherited `GAMEFOUNDRY_SITE_URL` / `GAMEFOUNDRY_API_URL` port values before process cleanup. |
| `npm run dev:bootstrap -- charlie` | PASS | Positional team forwarding selected team `charlie`, web `5530`, API `5531`, and browser target `http://127.0.0.1:5530/index.html`. |
| `npm run dev:bootstrap -- --team bravo` | PASS | Started with team `bravo`, role `owner`, web `5520`, API `5521`, and browser target `http://127.0.0.1:5520/index.html`. |
| `npm run dev:bootstrap -- --team omega` | PASS | Failed clearly with supported team list. |
| `npm run dev:bootstrap -- --team alfa --role reviewer` | PASS | Failed clearly with supported role list. |
| `npm run dev:local-api` | PASS | Legacy command started and printed legacy startup diagnostics, then process tree was stopped. |

## Notes

The startup-command validations used short-lived process launches and `taskkill /T /F` cleanup after expected diagnostics appeared, so no dev servers were left running. Owner-role validations opened the configured browser target after both server diagnostics were available. Unit coverage verifies loaded `.env` and inherited process URL values are overwritten by computed team/role ports.
