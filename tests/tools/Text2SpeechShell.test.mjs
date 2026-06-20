import assert from "node:assert/strict";
import test from "node:test";

import {
  TTS_ARCHIVED_FEATURE_INVENTORY,
  TTS_MESSAGE_STATUSES,
  TTS_PROVIDER_ADAPTER_PLAN,
  createEmotionProfile,
  createSpeechPreviewRequest,
  createSpeechQueueItem,
  createTtsMessage,
  createVoiceProfile,
  normalizeSpeechPayload,
  previewTtsMessage,
  validateSpeechPayload,
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
    characterPreset: "manual",
    gender: "any",
    language: "en-US",
    ok: true,
    pitch: 1,
    rate: 1,
    speechItemId: "browser-preview",
    speechItemName: "Browser Preview",
    ssmlLikePreset: "normal",
    text: "Welcome",
    voice: "test-voice",
    voiceAge: "any",
    voiceName: "Test Voice",
    volume: 1,
  });
  assert.equal(previewTtsMessage(empty, { voice: "test-voice", voiceOptions }).ok, false);
  assert.match(previewTtsMessage(ready, { voiceOptions }).message, /select an available browser voice/i);
  assert.equal(createSpeechPreviewRequest({ text: "Hi", voice: "test-voice", voiceOptions, rate: 9, pitch: 0, volume: 2 }).rate, 2);
  assert.equal(createSpeechPreviewRequest({ text: "Hi", voice: "test-voice", voiceOptions, rate: 9, pitch: 0, volume: 2 }).pitch, 0.1);
  assert.equal(createSpeechPreviewRequest({ text: "Hi", voice: "test-voice", voiceOptions, rate: 9, pitch: 0, volume: 2 }).volume, 1);
});

test("Text2Speech archived feature inventory covers current parity surface", () => {
  for (const feature of [
    "Import JSON",
    "Copy JSON",
    "Export JSON",
    "Add named sentence",
    "Duplicate named sentence",
    "Delete named sentence",
    "Gender helper filter",
    "Language voice filter",
    "Voice age shaping",
    "Character preset shaping",
    "SSML-like preset shaping",
    "Pause playback",
    "Resume playback",
    "Output summary JSON",
    "Status log with clear",
    "URL JSON sample source",
    "Workspace session payload loading",
  ]) {
    assert.ok(TTS_ARCHIVED_FEATURE_INVENTORY.includes(feature), `${feature} should be inventoried`);
  }
});

test("Text2Speech named sentence JSON payload validates old tool fields", () => {
  const item = createSpeechQueueItem({
    gender: "neutral",
    name: "Battle Call",
    pitch: 9,
    rate: 0,
    text: "Launch the next wave.",
    voice: "test-voice",
    volume: 2,
  });

  assert.equal(item.id, "battle-call");
  assert.equal(item.gender, "any");
  assert.equal(item.pitch, 2);
  assert.equal(item.rate, 0.1);
  assert.equal(item.volume, 1);
  assert.equal(validateSpeechPayload([item]).ok, true);
  assert.equal(normalizeSpeechPayload([item]).payload[0].name, "Battle Call");
  assert.equal(validateSpeechPayload([{ name: "Missing fields" }]).ok, false);
});

test("Text2Speech provider adapter plan keeps browser speech implemented and paid providers planned", () => {
  assert.deepEqual(
    TTS_PROVIDER_ADAPTER_PLAN.map((provider) => provider.key),
    ["browser-speech", "openai", "elevenlabs", "azure", "local"],
  );
  assert.equal(TTS_PROVIDER_ADAPTER_PLAN[0].status, "implemented");
  assert.ok(TTS_PROVIDER_ADAPTER_PLAN.slice(1).every((provider) => provider.status === "planned"));
});
