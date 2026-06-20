# BUILD PR_26171_012-message-voice-provider-adapters

## Branch Name

`pr/PR_26171_012-message-voice-provider-adapters`

## Purpose

Introduce a small browser-side voice provider adapter registry for Messages speech preview so provider behavior is explicit and future providers can be added without rewriting the Messages UI.

## Exact Scope

- Add a Messages voice provider adapter module.
- Supported adapters in this PR:
  - `browser-speech`
  - `diagnostic-only`
- Adapter contract:
  - provider key
  - display name
  - availability check
  - preview method
  - stop method
  - diagnostic message
- Route Speech Preview through the adapter registry.
- Keep the existing TTS Profile `providerKey` as the selector.
- Show visible diagnostics for unknown providers and unavailable providers.
- Add targeted tests for browser-speech, diagnostic-only, and unknown-provider behavior.

## Out Of Scope

- Network providers.
- AI voices.
- Secret/API-key handling.
- Server-side speech generation.
- Audio file persistence.
- Runtime playback API.
- New database tables.
- Local storage.

## Files Likely Affected

- `toolbox/messages/message-voice-provider-adapters.js`
- `toolbox/messages/messages.js`
- `toolbox/messages/index.html`
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `docs_build/dev/reports/*`

## API/DB Rules

- No new persistence.
- No secrets exposed to the browser.
- Provider adapters must not require environment variables.
- Browser must continue using safe public UI data only.
- TTS Profile provider keys remain configuration only.

## Theme V2 Rules

- Use existing Theme V2 status/logging patterns.
- No inline styles, `<style>` blocks, inline scripts, or inline event handlers.
- No tool-local CSS.

## Validation

- Verify branch starts from clean `main`.
- Run `node --check` on touched JavaScript files.
- Run targeted adapter unit/static validation if added.
- Run targeted Messages Playwright validation for provider routing.
- Run `npm run test:workspace-v2`.
- Run `git diff --check`.

## Manual Test Notes

- Select a TTS Profile with `browser-speech`.
- Confirm preview routes through the browser-speech adapter.
- Select or create a profile with `diagnostic-only`.
- Confirm no audio is attempted and a visible diagnostic is shown.
- Use an unknown provider key and confirm an actionable error.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_012-message-voice-provider-adapters.md`
- `docs_build/dev/reports/PR_26171_012-message-voice-provider-adapters-validation.txt`
- `docs_build/dev/reports/PR_26171_012-message-voice-provider-adapters-manual-validation.md`
- `tmp/PR_26171_012-message-voice-provider-adapters_delta.zip`
