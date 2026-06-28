# PR_26179_ALPHA_008 Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Add `npm run dev:bootstrap` as primary local bootstrap command. | PASS | `package.json` script points to `dev/bootstrap/start-dev.mjs`. |
| Keep `npm run dev:local-api` as legacy alias. | PASS | `package.json` maps it to the new orchestrator with `--api-only`. |
| Add `npm run dev:api` for API-only startup. | PASS | `package.json` adds `dev:api`. |
| Add `npm run dev:web` for web-only startup. | PASS | `package.json` adds `dev:web`. |
| Create `dev/bootstrap/start-dev.mjs`. | PASS | Added orchestrator. |
| Create `dev/bootstrap/team-port-config.mjs`. | PASS | Added team port config module. |
| Support `--team owner|alpha|bravo|charlie|gamma|beta`. | PASS | Parser and resolver cover all requested teams. |
| Use requested owner/default, alpha, bravo, charlie, gamma, beta port mapping. | PASS | `TeamAwareBootstrap.test.mjs` validates every mapping. |
| Validate unknown team names clearly. | PASS | Resolver throws `Unknown bootstrap team ... Use --team ...`. |
| Load environment before startup. | PASS | Orchestrator loads `.env` before applying team ports and launching processes. |
| Resolve team ports before launching processes. | PASS | Team config is resolved before API/web startup. |
| Start API when requested. | PASS | `--api`, default, and `--api-only` spawn existing local API server. |
| Start web server when requested. | PASS | `--web`, default, and `--web-only` start the static web server. |
| Print startup diagnostics. | PASS | Diagnostics include team, URLs, selected ports, env status, and browser launch. |
| Support optional browser launch. | PASS | `--open` launches the selected local URL after startup. |
| Preserve existing runtime behavior except orchestration. | PASS | Existing local API server is delegated to unchanged. |
