# PR_26171_BETA_073-message-tts-table-ui-correction Manual Validation Notes

Generated: 2026-06-20T23:06:25.711Z
Team ownership: Bravo
Branch: pr/26171-BETA-073-message-tts-table-ui-correction

## Manual Review

- Reviewed `src/shared/toolbox/tool-metadata-inventory.js` to confirm Text To Speech uses the active `text-to-speech/index.html` registry entry and beta release metadata.
- Reviewed `toolbox/text-to-speech/index.html` to confirm the summary uses only Theme V2 reusable classes and keeps all live data hooks.
- Reviewed `toolbox/messages/index.html` and `toolbox/messages/messages.js` to confirm Add Message/Add Part are table-row workflows and Message Parts remain child table content.
- Reviewed targeted Playwright coverage for Message Studio TTS Profile dropdown compatibility.

## Automated Browser Validation Used As Manual Proxy

- TTS validation clicked through the toolbox index Text To Speech card and confirmed the active path.
- TTS validation exercised the TTS Studio page, summary hooks, profile/emotion table behavior, and speech synthesis.
- Message validation exercised add/edit message rows, add/edit part rows, name-cell expansion, part-count non-expansion, message playback, part playback, and unavailable audio errors.

## Not Performed

- No unscripted manual browser session was run beyond Playwright browser validation.
