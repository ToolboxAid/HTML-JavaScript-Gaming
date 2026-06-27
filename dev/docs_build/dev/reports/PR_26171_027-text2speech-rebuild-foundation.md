# PR_26171_027 Text To Speech Rebuild Foundation

## Reference source
- Reviewed `archive/v1-v2/tools/old_text2speech-V2` as historical reference only.
- No archived implementation, CSS, event handlers, or runtime code was copied.

## Feature inventory
- Script/message text entry and review.
- Voice/profile selection concepts.
- Emotion or delivery tuning concepts.
- Preview/generate/export workflow concepts.
- Provider choice as a future integration path.

## UX inventory
- Creator needs a clear distinction between design-owned message text and audio-owned generated voice assets.
- Creator needs workflow state labels before provider integration exists.
- Creator needs visible blocked states instead of silent fallback behavior.
- Creator needs future provider readiness notes without exposing fake generation.

## Data model notes
- Message: design-owned text, language, emotion, status, metadata, and optional project linkage.
- Emotion: named delivery intent with safe scalar settings.
- Voice Profile: creator-facing desired voice/provider settings; generated output remains audio-owned.
- Language: BCP-47-style language code and display name.
- Status: draft, ready for preview, pending generation, generated, exported, blocked, archived.
- Audio ownership: generated clips, files, provider artifacts, and export bundles belong to Audio.

## Gap analysis
- Current hidden Voice Output shell had no creator workflow model.
- Current Message Studio speech testing is browser preview oriented and not a generated-audio pipeline.
- Provider adapters require planning before any external service implementation.
- Export requires explicit generated asset references; no browser-owned product data should be persisted.

## Rebuild plan
1. Create a Theme V2 Text To Speech shell under `toolbox/text-to-speech/`.
2. Add a TTS message model foundation with explicit ownership boundaries.
3. Add preview/generate/export shell states with blocked provider behavior.
4. Add provider adapter planning for future OpenAI, ElevenLabs, Azure, and local providers.
5. Keep implementation provider-free until a later scoped PR adds a real adapter.
