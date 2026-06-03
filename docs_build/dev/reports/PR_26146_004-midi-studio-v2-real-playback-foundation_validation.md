# PR_26146_004-midi-studio-v2-real-playback-foundation Validation

## Scope

- Repaired MIDI Studio V2 playback messaging so `.mid` files are treated as musical instruction data, not browser-playable audio.
- Updated rendered preview behavior to use browser media playback only for manifest-owned rendered OGG/MP3/WAV targets.
- Added explicit live MIDI synthesis status: `NOT IMPLEMENTED` until a real shared JavaScript MIDI parser/synth/instrument path exists.
- Preserved first-class Workspace V2 tool scope and did not add MIDI input, recording, fallback songs, DAW editing, piano-roll editing, or fake playback.

## Playback Contract

- Manifest root `music.songs` stores song metadata.
- `sourceMidi` points to a `.mid` musical instruction file.
- `rendered` targets point to runtime audio assets that may be previewed through browser `Audio`.
- Future real MIDI playback requires shared `src/` MIDI parser, synth, and instrument rendering capability before the tool can claim live MIDI playback.

## Status Behavior

- Rendered preview success logs `OK Rendered preview started ...`.
- Instruction-only playback attempts log `WARN Live MIDI synthesis not implemented.`.
- Songs without rendered targets fail with `FAIL No rendered audio target ... and no live MIDI engine is available ...`.

## Validation

- PASS: `node --check tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: `node --check tools/midi-studio-v2/js/MidiStudioV2App.js`
- PASS: `node --check tools/midi-studio-v2/js/services/MidiPlaybackService.js`
- PASS: `node --check tools/midi-studio-v2/js/controls/PlaybackControl.js`
- PASS: `npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs --project=playwright --workers=1 --reporter=line`
- PASS: `npx.cmd playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=line -g "registers Workspace Manager V2 from the tools index"`
- PASS: `git diff --check`

## Environment Notes

- Initial Playwright Chromium install attempt failed when writing to the default user cache path.
- Retried Chromium install with `PLAYWRIGHT_BROWSERS_PATH` set to `%TEMP%\ms-playwright`.
- A TLS validation error was resolved by adding `NODE_OPTIONS=--use-system-ca`.
- Targeted Playwright validation was run only after Chromium was available.

## Explicit Skips

- SKIP: full samples smoke test. Samples alignment is out of scope for this docs/tool repair.
- SKIP: full Workspace V2 suite. Only the touched registration/handoff test was required and run.
