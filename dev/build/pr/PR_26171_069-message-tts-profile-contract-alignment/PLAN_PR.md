# PR_26171_069-message-tts-profile-contract-alignment Plan

## Purpose

Align Message Studio and TTS Studio around the parent/child table model and shared TTS profile contract.

## Scope

- Message Studio owns Messages and ordered Message Parts.
- Message Parts select Text, Emotion, and TTS Profile.
- Message Studio provides Play Part, Play Message, and Stop using `src/engine/audio/TextToSpeechEngine`.
- TTS Studio owns TTS Profiles and per-profile Emotion Settings.
- TTS Profile rows expand to Emotion Settings child rows.
- Keep Theme V2 only, external JavaScript only, no page-local or tool-local CSS.
- Add targeted validation and required PR reports.

## Non-Goals

- Do not add database schema or persistence changes.
- Do not create a separate Emotion Studio.
- Do not introduce browser storage as product source of truth.
- Do not change unrelated tools or shared runtime behavior beyond the audio playback contract needed by Message Studio.

## Validation

- Targeted Message Studio validation.
- Targeted TTS Studio validation.
- `npm run test:workspace-v2` with note that the command name is legacy and the user-facing language is Project Workspace.

## Delivery

- Commit, push, create PR, resolve conflicts if encountered, merge after validation passes, return to `main`, pull latest, and produce `tmp/PR_26171_069-message-tts-profile-contract-alignment_delta.zip`.
