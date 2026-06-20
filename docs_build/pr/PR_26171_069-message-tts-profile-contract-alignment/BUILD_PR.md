# PR_26171_069-message-tts-profile-contract-alignment Build

## Source Of Truth

Use this BUILD doc, the original PR request, `docs_build/dev/PROJECT_INSTRUCTIONS.md`, and `docs_build/dev/PROJECT_MULTI_PC.txt`.

## Singular Purpose

Align Message Studio and TTS Studio around reusable TTS Profiles, per-profile Emotion Settings, and Message Parts playback.

## Exact Targets

- `toolbox/messages/index.html`
- `toolbox/messages/messages.js`
- `toolbox/messages/message-tts-service-registry.js`
- `toolbox/text-to-speech/index.html`
- `toolbox/text-to-speech/text2speech.js`
- `src/engine/audio/TextToSpeechEngine.js`
- Targeted Message Studio Playwright/unit tests.
- Targeted TTS Studio Playwright/unit tests.
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- PR-specific report.
- Message/TTS ownership checklist.
- Parent-child table checklist.
- Validation report.
- Manual validation notes.

## Requirements

- Message Studio parent table is Messages.
- Clicking a Message row opens the Message Parts child table.
- Message Parts select Text, Emotion, and TTS Profile.
- Message Studio exposes Play Part, Play Message, and Stop.
- Message playback uses `src/engine/audio/TextToSpeechEngine`.
- Default TTS Profile exists until real profiles are available.
- TTS Studio parent table is TTS Profiles.
- Clicking a TTS Profile row opens Emotion Settings child table.
- Emotion settings belong to the selected TTS Profile.
- Do not create separate Emotion Studio.
- Include example profiles with Neutral, Happy, Angry, and Scared settings.
- Message Studio owns text and ordered message parts.
- TTS Studio owns reusable profiles and per-profile emotion settings.
- `src/engine/audio` owns playback.
- Audio owns generated/played output.
- Use Theme V2 and external JavaScript only.
- Do not add inline styles, style blocks, inline event handlers, page-local CSS, or tool-local CSS.
- Do not add database changes unless an existing Local API contract already supports them.
- Do not use browser-owned product data as source of truth.
- Do not add silent fallbacks.

## Validation

- Run targeted Message Studio validation.
- Run targeted TTS Studio validation.
- Run `npm run test:workspace-v2`.
- Do not run full samples smoke.

## ZIP

Produce `tmp/PR_26171_069-message-tts-profile-contract-alignment_delta.zip` with repo-structured changed files only.
