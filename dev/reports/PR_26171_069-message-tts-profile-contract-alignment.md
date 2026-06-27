# PR_26171_069 Message/TTS Profile Contract Alignment

## Scope
- Align Message Studio and TTS Studio around the parent/child table model.
- Keep Message Studio as the owner of game text and ordered Message Parts.
- Keep TTS Studio as the owner of reusable TTS Profiles and per-profile Emotion Settings.
- Keep playback routed through `src/engine/audio/TextToSpeechEngine`.

## Requirement Evidence
- PASS: Message Studio parent table remains `Messages` in `toolbox/messages/index.html`.
- PASS: Clicking a Message row opens the `Message Parts` child table in `toolbox/messages/messages.js`.
- PASS: Message Parts expose Text, Emotion, TTS Profile, and row actions.
- PASS: Message Studio exposes Play Part, Play Message, and Stop.
- PASS: Stop routes through `toolbox/messages/message-tts-service-registry.js` to `TextToSpeechEngine.stop()`.
- PASS: Message Studio no longer displays Message-owned Emotion Profile or Available TTS Profile side tables.
- PASS: TTS Studio parent table remains `TTS Profiles`.
- PASS: Clicking a TTS Profile row opens the `Emotion Settings` child table.
- PASS: `Man Profile 1` and `Woman Profile 2` seed Neutral, Happy, Angry, and Scared Emotion Settings.
- PASS: No separate Emotion Studio was created.
- PASS: No database schema changes were added.
- PASS: Theme V2 and external JavaScript structure remain in use; no inline styles, style blocks, or inline handlers were added.

## Git Workflow
- Current branch: `codex/pr-26171-069-message-tts-profile-contract-alignment`
- Created branch: `codex/pr-26171-069-message-tts-profile-contract-alignment`
- Push result: pending at report creation
- PR URL: pending at report creation
- Merge result: pending at report creation
- Final main commit: pending at report creation
