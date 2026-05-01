# Codex Commands — PR_11_195

Model: GPT-5.4-codex
Reasoning: high

## Command
Run one Codex pass for PR_11_195.

## Codex Prompt
You are implementing PR_11_195 in the HTML-JavaScript-Gaming repo.

Follow `docs/pr/PR_11_195_REMAINING_V2_HTML_SESSION_BATCH.md` exactly.

Important:
- This is a re-engineer, not a copy/paste migration.
- ChatGPT did not write implementation code. You must write the implementation.
- Convert the next remaining V2 tools that still violate HTML-first/session-only architecture.
- Use a larger safe batch than the prior one-tool PRs, but do not expand outside V2 tool entries.
- Do not change schemas, samples, games, Workspace Manager v1, or shared tool systems.
- Do not use `platformShell`, `assetUsageIntegration`, `tools/shared/*`, aliases, fallback/default data, helper classes, or abstraction layers.
- Keep `index.html` static and testable.
- Keep `index.js` behavior-only.
- Ensure every touched V2 tool uses `<div id="shared-theme-header"></div>` and user-facing names ending in `V2`.
- Produce targeted validation evidence in `docs/dev/reports/PR_11_195_validation.md`.
- Create final repo-structured ZIP at `tmp/PR_11_195.zip`.

## Required Targeted Checks
Run:
- `node --check` for each changed `.js` file.
- grep/report checks for banned JS shell injection and banned legacy coupling terms.
- HTML checks for `shared-theme-header`, `mount-shared-header.js`, and `./index.js` in changed V2 `index.html` files.

Do not run the full samples smoke test unless shared sample loader/framework code is modified. If skipped, document why.
