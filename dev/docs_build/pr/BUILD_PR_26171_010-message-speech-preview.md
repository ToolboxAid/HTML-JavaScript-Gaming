# BUILD PR_26171_010-message-speech-preview

## Branch Name

`pr/PR_26171_010-message-speech-preview`

## Purpose

Add a browser-local speech preview workflow for Messages using the existing Message, Segment, Emotion Profile, and TTS Profile configuration records.

## Exact Scope

- Add a Theme V2 Speech Preview section to the Messages tool.
- Allow previewing:
  - selected full message text
  - selected ordered active message segments
- Use selected or default active TTS Profile settings for preview controls.
- Use selected segment Emotion Profile settings when previewing segments.
- Use browser `speechSynthesis` when available.
- Show a visible actionable diagnostic when browser speech synthesis is unavailable.
- Add Stop Preview behavior.
- Add external JavaScript-only preview controller logic inside `toolbox/messages/messages.js`.
- Add tests that stub browser speech synthesis and validate preview payloads without requiring real audio output.

## Out Of Scope

- Server-side TTS generation.
- Audio file generation or persistence.
- External AI voices.
- Voice provider adapters beyond direct browser speech preview.
- Runtime playback API.
- Dialog trees, localization, translation, or game runtime integration.
- Storing preview history.

## Files Likely Affected

- `toolbox/messages/index.html`
- `toolbox/messages/messages.js`
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `docs_build/dev/reports/*`

## API/DB Rules

- Speech preview reads existing Local API data already loaded by the Messages UI.
- No new persistence is required.
- Browser preview state must not become product-data source of truth.
- No new server endpoint in this PR unless required only for diagnostics.

## Theme V2 Rules

- Use existing Theme V2 UI classes.
- No page-local CSS or tool-local CSS.
- No inline styles, `<style>` blocks, inline scripts, or inline event handlers.
- Stop and preview buttons must be wired from external JavaScript.

## Validation

- Verify branch starts from clean `main`.
- Run `node --check` on touched JavaScript files.
- Run targeted Messages Playwright validation with stubbed `speechSynthesis`.
- Validate preview selected message.
- Validate preview active ordered segments.
- Validate Stop Preview.
- Validate unavailable speech synthesis diagnostic.
- Run `npm run test:workspace-v2`.
- Run `git diff --check`.

## Manual Test Notes

- Select or create a message.
- Create two active segments with different emotion profiles.
- Click Preview Message and confirm the status log reports a preview request.
- Click Preview Segments and confirm ordered segment preview is requested.
- Click Stop Preview and confirm preview stops.
- Simulate missing browser speech support and confirm visible diagnostic.

## Required Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_010-message-speech-preview.md`
- `docs_build/dev/reports/PR_26171_010-message-speech-preview-validation.txt`
- `docs_build/dev/reports/PR_26171_010-message-speech-preview-manual-validation.md`
- `tmp/PR_26171_010-message-speech-preview_delta.zip`
