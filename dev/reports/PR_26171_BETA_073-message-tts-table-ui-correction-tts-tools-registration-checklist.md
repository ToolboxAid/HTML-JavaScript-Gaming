# PR_26171_BETA_073-message-tts-table-ui-correction TTS Tools Registration Checklist

Generated: 2026-06-20T23:06:25.711Z
Team ownership: Bravo

- PASS: Text To Speech metadata uses `path: text-to-speech`.
- PASS: Text To Speech metadata uses `entryPoint: text-to-speech/index.html`.
- PASS: Text To Speech metadata now uses `status: beta` and `releaseChannel: beta`.
- PASS: Toolbox index validation finds `Text To Speech` with href `/toolbox/text-to-speech/index.html`.
- PASS: Toolbox index validation finds `data-registered-tool-route=toolbox/text-to-speech/index.html`.
- PASS: Validation asserts no link targets `tools/text2speech`.
- PASS: No `tools/text2speech/` directory was created.
