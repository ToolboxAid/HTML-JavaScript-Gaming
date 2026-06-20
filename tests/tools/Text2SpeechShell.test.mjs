import assert from "node:assert/strict";
import test from "node:test";

import {
  TTS_MESSAGE_STATUSES,
  TTS_PROVIDER_ADAPTER_PLAN,
  createEmotionProfile,
  createSpeechPreviewRequest,
  createTtsMessage,
  createVoiceProfile,
  previewTtsMessage,
} from "../../toolbox/text-to-speech/text2speech.js";

test("Text2Speech message model separates Design and Audio ownership", () => {
  const message = createTtsMessage({ text: "Hello", metadata: { tags: ["intro"] } });
  const emotion = createEmotionProfile({ intensity: 2 });
  const voice = createVoiceProfile({ providerKey: "openai" });

  assert.equal(message.owner, "Design");
  assert.equal(message.audioOwner, "Audio");
  assert.equal(message.generatedAudio, null);
  assert.deepEqual(message.metadata.tags, ["intro"]);
  assert.equal(emotion.owner, "Design");
  assert.equal(emotion.intensity, 1);
  assert.equal(voice.owner, "Design");
  assert.equal(voice.generatedAudioOwner, "Audio");
  assert.ok(TTS_MESSAGE_STATUSES.includes("blocked"));
});

test("Text2Speech browser preview builds a Web Speech request without provider blocking", () => {
  const voiceOptions = [{ language: "en-US", label: "Test Voice (en-US)", name: "Test Voice", value: "test-voice" }];
  const ready = createTtsMessage({ text: "Welcome" });
  const empty = createTtsMessage();

  assert.deepEqual(previewTtsMessage(ready, { voice: "test-voice", voiceOptions }), {
    language: "en-US",
    ok: true,
    pitch: 1,
    rate: 1,
    speechItemId: "browser-preview",
    speechItemName: "Browser Preview",
    text: "Welcome",
    voice: "test-voice",
    voiceName: "Test Voice",
    volume: 1,
  });
  assert.equal(previewTtsMessage(empty, { voice: "test-voice", voiceOptions }).ok, false);
  assert.match(previewTtsMessage(ready, { voiceOptions }).message, /select an available browser voice/i);
  assert.equal(createSpeechPreviewRequest({ text: "Hi", voice: "test-voice", voiceOptions, rate: 9, pitch: 0, volume: 2 }).rate, 2);
  assert.equal(createSpeechPreviewRequest({ text: "Hi", voice: "test-voice", voiceOptions, rate: 9, pitch: 0, volume: 2 }).pitch, 0.1);
  assert.equal(createSpeechPreviewRequest({ text: "Hi", voice: "test-voice", voiceOptions, rate: 9, pitch: 0, volume: 2 }).volume, 1);
});

test("Text2Speech provider adapter plan keeps browser speech implemented and paid providers planned", () => {
  assert.deepEqual(
    TTS_PROVIDER_ADAPTER_PLAN.map((provider) => provider.key),
    ["browser-speech", "openai", "elevenlabs", "azure", "local"],
  );
  assert.equal(TTS_PROVIDER_ADAPTER_PLAN[0].status, "implemented");
  assert.ok(TTS_PROVIDER_ADAPTER_PLAN.slice(1).every((provider) => provider.status === "planned"));
});
