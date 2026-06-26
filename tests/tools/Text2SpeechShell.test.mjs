import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  TTS_MESSAGE_STATUSES,
  TTS_PROFILE_CONTRACT_VERSION,
  TTS_PROVIDER_ADAPTER_PLAN,
  createDefaultTextToSpeechProfiles,
  createEmotionProfile,
  createSpeechPreviewRequest,
  createTextToSpeechProfile,
  createTextToSpeechProfileEmotion,
  createTtsMessage,
  createVoiceProfile,
  previewTtsMessage,
} from "../../assets/toolbox/text-to-speech/js/index.js";

test("Text2Speech message model separates Design and Audio ownership", () => {
  const message = createTtsMessage({ text: "Hello", metadata: { tags: ["intro"] } });
  const emotion = createEmotionProfile({ intensity: 2 });
  const voice = createVoiceProfile({ providerKey: "openai" });

  assert.equal(message.owner, "Design");
  assert.equal(message.audioOwner, "Audio");
  assert.equal(message.generatedAudio, null);
  assert.deepEqual(message.metadata.tags, ["intro"]);
  assert.equal(emotion.owner, "Audio");
  assert.equal(emotion.intensity, 1);
  assert.equal(voice.owner, "Audio");
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

test("Text2Speech emotion preview accepts parent profile default browser voice", () => {
  const voiceOptions = [
    { language: "en-GB", label: "Narrator Voice (en-GB)", name: "Narrator Voice", value: "narrator-voice-uri" },
    { language: "en-US", label: "Arcade Voice (en-US)", name: "Arcade Voice", value: "arcade-voice-uri" },
  ];

  assert.deepEqual(createSpeechPreviewRequest({
    language: "en-US",
    pitch: 1.2,
    rate: 1.1,
    text: "Launch the next wave.",
    voice: "Default browser voice",
    voiceOptions,
    volume: 0.7,
  }), {
    language: "en-US",
    ok: true,
    pitch: 1.2,
    rate: 1.1,
    speechItemId: "browser-preview",
    speechItemName: "Browser Preview",
    text: "Launch the next wave.",
    voice: "arcade-voice-uri",
    voiceName: "Default browser voice",
    volume: 0.7,
  });
});

test("Text2Speech provider adapter plan keeps browser speech implemented and paid providers planned", () => {
  assert.deepEqual(
    TTS_PROVIDER_ADAPTER_PLAN.map((provider) => provider.key),
    ["browser-speech", "openai", "elevenlabs", "azure", "local"],
  );
  assert.equal(TTS_PROVIDER_ADAPTER_PLAN[0].status, "implemented");
  assert.ok(TTS_PROVIDER_ADAPTER_PLAN.slice(1).every((provider) => provider.status === "planned"));
});

test("Text2Speech profile helpers do not expose broken seed profiles or hidden emotions", () => {
  const voiceOptions = [{ language: "en-US", label: "Test Voice (en-US)", name: "Test Voice", value: "test-voice" }];
  const defaults = createDefaultTextToSpeechProfiles(voiceOptions);
  const emptyProfile = createTextToSpeechProfile({
    id: "empty-profile",
    name: "Empty Profile",
    voice: "test-voice",
    voiceName: "Test Voice",
  });
  const defaultEmotion = createTextToSpeechProfileEmotion();
  const custom = createTextToSpeechProfile({
    emotions: [
      createTextToSpeechProfileEmotion({
        emotion: "urgent",
        pitch: 1.2,
        rate: 1.1,
        ssmlLikePreset: "whisper-ish",
        volume: 0.8,
      }),
    ],
    id: "custom-profile",
    name: "Custom Profile",
    voice: "test-voice",
    voiceName: "Test Voice",
  });

  assert.equal(TTS_PROFILE_CONTRACT_VERSION, "tts-profile-emotion-v1");
  assert.deepEqual(defaults, []);
  assert.deepEqual(emptyProfile.emotions, []);
  assert.equal(createEmotionProfile().name, "Calm");
  assert.equal(defaultEmotion.emotion, "calm");
  assert.equal(defaultEmotion.emotionLabel, "Calm");
  assert.deepEqual(custom, {
    active: true,
    age: "any",
    emotions: [{
      active: true,
      emotion: "urgent",
      emotionLabel: "Urgent",
      displayOrder: 0,
      id: "urgent",
      messagePartsUsageCount: 0,
      messageUsageCount: 0,
      pitch: 1.2,
      rate: 1.1,
      references: [],
      settingKey: "",
      ssmlLikePreset: "whisper-ish",
      usageCount: 0,
      volume: 0.8,
    }],
    gender: "neutral",
    id: "custom-profile",
    language: "en-US",
    messageStudioUsageCount: 0,
    name: "Custom Profile",
    owner: "Audio",
    providerKey: "browser-speech",
    references: [],
    segmentUsageCount: 0,
    usageCount: 0,
    voice: "test-voice",
    voiceName: "Test Voice",
  });
});

test("Text2Speech runtime uses Local API profile contracts instead of browser-owned profile storage", async () => {
  const source = await readFile(new URL("../../assets/toolbox/text-to-speech/js/index.js", import.meta.url), "utf8");

  assert.equal(source.includes("../../../js/shared/tts-profile-store.js"), false);
  assert.equal(source.includes("readSavedTextToSpeechProfiles"), false);
  assert.equal(source.includes("writeSavedTextToSpeechProfiles"), false);
  assert.equal(source.includes("listTtsProfiles"), true);
  assert.equal(source.includes("createTtsProfile"), true);
  assert.equal(source.includes("updateTtsProfile"), true);
  assert.equal(source.includes("deleteTtsProfile"), true);
  assert.equal(source.includes("getSessionCurrent"), true);
  assert.equal(source.includes("account/sign-in.html"), true);
});

test("Text2Speech emotion editor preview uses unsaved editor values before save", async () => {
  const source = await readFile(new URL("../../assets/toolbox/text-to-speech/js/index.js", import.meta.url), "utf8");
  const playButtonIndex = source.indexOf('createButton("Play", "ttsPlayEditingEmotion", key)');
  const saveButtonIndex = source.indexOf('createButton("Save", "ttsCommitEmotion", key)');
  const cancelButtonIndex = source.indexOf('createButton("Cancel", "ttsCancelEmotion", key)');
  const editorRowEndIndex = source.indexOf("row.append(emotionCell, pitchCell, rateCell, volumeCell, usageCell, actionsCell);");
  const previewFunctionIndex = source.indexOf("function playEditingEmotion(key)");
  const commitFunctionIndex = source.indexOf("function commitEmotion(key)");
  const editorActions = source.slice(
    playButtonIndex,
    editorRowEndIndex,
  );
  const playEditingEmotion = source.slice(
    previewFunctionIndex,
    commitFunctionIndex,
  );

  assert.notEqual(playButtonIndex, -1);
  assert.notEqual(saveButtonIndex, -1);
  assert.notEqual(cancelButtonIndex, -1);
  assert.notEqual(editorRowEndIndex, -1);
  assert.notEqual(previewFunctionIndex, -1);
  assert.notEqual(commitFunctionIndex, -1);
  assert.ok(editorActions.indexOf('createButton("Play", "ttsPlayEditingEmotion", key)') < editorActions.indexOf('createButton("Save", "ttsCommitEmotion", key)'));
  assert.ok(editorActions.indexOf('createButton("Save", "ttsCommitEmotion", key)') < editorActions.indexOf('createButton("Cancel", "ttsCancelEmotion", key)'));
  assert.equal(playEditingEmotion.includes("const emotion = emotionValues(key);"), true);
  assert.equal(playEditingEmotion.includes("speakEmotion(profile, emotion);"), true);
  assert.equal(playEditingEmotion.includes("saveProfileEmotionSettings"), false);
  assert.equal(playEditingEmotion.includes("requireAuthenticatedWrite"), false);
});
