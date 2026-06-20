import assert from "node:assert/strict";
import test from "node:test";

import {
  TTS_MESSAGE_STATUSES,
  TTS_PROVIDER_ADAPTER_PLAN,
  createEmotionProfile,
  createTtsMessage,
  createVoiceProfile,
  exportTtsMessage,
  generateTtsMessage,
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

test("Text2Speech workflow blocks missing provider and missing generated asset without silent fallback", () => {
  const ready = createTtsMessage({ text: "Welcome" });
  const empty = createTtsMessage();

  assert.equal(previewTtsMessage(ready).ok, true);
  assert.equal(previewTtsMessage(empty).status, "blocked");
  assert.equal(generateTtsMessage(ready).ok, false);
  assert.match(generateTtsMessage(ready).message, /no TTS provider adapter/i);
  assert.equal(exportTtsMessage(ready).ok, false);
  assert.match(exportTtsMessage(ready).message, /Audio-owned voice asset/i);
});

test("Text2Speech provider adapter plan names expected future providers only", () => {
  assert.deepEqual(
    TTS_PROVIDER_ADAPTER_PLAN.map((provider) => provider.key),
    ["openai", "elevenlabs", "azure", "local"],
  );
  assert.ok(TTS_PROVIDER_ADAPTER_PLAN.every((provider) => provider.status === "planned"));
});
