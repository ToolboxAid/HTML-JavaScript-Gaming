import assert from "node:assert/strict";
import test from "node:test";

import {
  TextToSpeechEngine,
  createTextToSpeechQueueItem,
  createTextToSpeechSpeakRequest,
  normalizeTextToSpeechPayload,
  resolveTextToSpeechDeliveryOptions,
  textToSpeechLanguageOptionsFromVoices,
  textToSpeechPayloadGenderValue,
  textToSpeechVoicesForGender,
  validateTextToSpeechPayload,
} from "../../../src/engine/audio/TextToSpeechEngine.js";
import {
  TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS,
} from "../../../src/engine/audio/TextToSpeechDefaults.js";

class FakeUtterance {
  constructor(text = "") {
    this.text = text;
  }
}

function createSpeechSynthesisStub({ includePauseResume = true } = {}) {
  const calls = [];
  const voices = [
    { lang: "en-US", name: "David Arcade Voice", voiceURI: "arcade-voice-uri" },
    { lang: "en-GB", name: "Zira Narrator Voice", voiceURI: "narrator-voice-uri" },
  ];
  return {
    calls,
    speechSynthesisRef: {
      addEventListener(type, callback) {
        calls.push({ callback: typeof callback, type });
      },
      cancel() {
        calls.push({ type: "cancel" });
      },
      getVoices() {
        return voices;
      },
      pause: includePauseResume ? () => {
        calls.push({ type: "pause" });
      } : undefined,
      removeEventListener(type) {
        calls.push({ type: `remove:${type}` });
      },
      resume: includePauseResume ? () => {
        calls.push({ type: "resume" });
      } : undefined,
      speak(utterance) {
        calls.push({
          lang: utterance.lang,
          pitch: utterance.pitch,
          rate: utterance.rate,
          text: utterance.text,
          type: "speak",
          voiceName: utterance.voice?.name || "",
          volume: utterance.volume,
        });
      },
    },
    voices,
  };
}

test("TextToSpeech defaults expose old baseline options", () => {
  assert.deepEqual(TEXT_TO_SPEECH_DEFAULTS, {
    characterPreset: "manual",
    gender: "any",
    language: "en-US",
    pitch: 1,
    rate: 1,
    ssmlLikePreset: "normal",
    voice: "",
    voiceAge: "any",
    volume: 1,
  });
  assert.ok(TEXT_TO_SPEECH_LANGUAGE_OPTIONS.some((option) => option.value === "en-US"));
  assert.ok(TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS.some((option) => option.value === "dnd-dungeon-master"));
  assert.ok(TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS.some((option) => option.value === "whisper-ish"));
});

test("TextToSpeechEngine wraps browser SpeechSynthesis for games and tools", () => {
  const { calls, speechSynthesisRef } = createSpeechSynthesisStub();
  const engine = new TextToSpeechEngine({ speechSynthesisRef, utteranceCtor: FakeUtterance });

  assert.equal(engine.isSupported(), true);
  assert.equal(engine.canPause(), true);
  assert.equal(engine.canResume(), true);
  assert.equal(engine.voiceOptions().length, 2);
  assert.equal(engine.voiceForValue("arcade-voice-uri").name, "David Arcade Voice");

  const result = engine.speak({
    language: "en-US",
    pitch: 0,
    rate: 9,
    speechItemId: "intro",
    speechItemName: "Intro",
    text: "Welcome, creator.",
    voice: "arcade-voice-uri",
    volume: 2,
  });

  assert.equal(result.ok, true);
  assert.equal(result.pitch, 0.1);
  assert.equal(result.rate, 2);
  assert.equal(result.volume, 1);
  assert.equal(result.voiceName, "David Arcade Voice");
  assert.deepEqual(calls.at(-1), {
    lang: "en-US",
    pitch: 0.1,
    rate: 2,
    text: "Welcome, creator.",
    type: "speak",
    voiceName: "David Arcade Voice",
    volume: 1,
  });

  assert.equal(engine.pause().ok, true);
  assert.equal(calls.at(-1).type, "pause");
  assert.equal(engine.resume().ok, true);
  assert.equal(calls.at(-1).type, "resume");
  assert.equal(engine.stop().stoppedCount, 1);
  assert.equal(calls.at(-1).type, "cancel");
  assert.equal(engine.queuedSpeechItemList().length, 0);
});

test("TextToSpeechEngine reports actionable unsupported browser errors", () => {
  const engine = new TextToSpeechEngine({ speechSynthesisRef: null, utteranceCtor: null });

  assert.equal(engine.isSupported(), false);
  assert.match(engine.speak({ text: "Hello", voice: "voice" }).message, /SpeechSynthesis is unavailable/);
  assert.match(engine.pause().message, /pause is unavailable/);
  assert.match(engine.resume().message, /resume is unavailable/);
  assert.match(engine.stop().message, /SpeechSynthesis is unavailable/);
});

test("TextToSpeech engine helpers normalize payloads, presets, and voice filters", () => {
  const voiceOptions = [
    { language: "en-US", label: "David Arcade Voice (en-US)", name: "David Arcade Voice", value: "arcade-voice-uri" },
    { language: "en-GB", label: "Zira Narrator Voice (en-GB)", name: "Zira Narrator Voice", value: "narrator-voice-uri" },
  ];
  const item = createTextToSpeechQueueItem({
    gender: "neutral",
    name: "Battle Call",
    pitch: 9,
    rate: 0,
    ssmlLikePreset: "slow",
    text: "Launch the next wave.",
    voice: "arcade-voice-uri",
    voiceAge: "child",
    volume: 2,
  });

  assert.equal(textToSpeechPayloadGenderValue("neutral"), "any");
  assert.equal(item.id, "battle-call");
  assert.equal(item.gender, "any");
  assert.equal(item.pitch, 2);
  assert.equal(item.rate, 0.1);
  assert.equal(item.volume, 1);
  assert.equal(validateTextToSpeechPayload([item]).ok, true);
  assert.equal(validateTextToSpeechPayload([{ name: "Missing fields" }]).ok, false);
  assert.equal(normalizeTextToSpeechPayload([item]).payload[0].name, "Battle Call");

  const resolved = resolveTextToSpeechDeliveryOptions({
    characterPreset: "robot",
    ssmlLikePreset: "slow",
    voiceAge: "child",
  });
  assert.equal(resolved.characterPreset, "robot");
  assert.equal(resolved.ssmlLikePreset, "slow");
  assert.equal(resolved.voiceAge, "child");
  assert.equal(resolved.pitch, 1.1);
  assert.ok(Math.abs(resolved.rate - 0.77625) < Number.EPSILON);
  assert.equal(resolved.volume, 0.95);

  assert.deepEqual(textToSpeechLanguageOptionsFromVoices(voiceOptions).map((option) => option.value), ["en-GB", "en-US"]);
  assert.deepEqual(textToSpeechVoicesForGender(voiceOptions, "male-preferred").map((option) => option.value), ["arcade-voice-uri"]);
  assert.deepEqual(textToSpeechVoicesForGender(voiceOptions, "female-preferred").map((option) => option.value), ["narrator-voice-uri"]);

  assert.deepEqual(createTextToSpeechSpeakRequest({
    pitch: 9,
    rate: 0,
    text: "Launch",
    voice: "arcade-voice-uri",
    voiceOptions,
    volume: 2,
  }), {
    characterPreset: "manual",
    gender: "any",
    language: "en-US",
    ok: true,
    pitch: 2,
    rate: 0.1,
    speechItemId: "browser-preview",
    speechItemName: "Browser Preview",
    ssmlLikePreset: "normal",
    text: "Launch",
    voice: "arcade-voice-uri",
    voiceAge: "any",
    voiceName: "David Arcade Voice",
    volume: 1,
  });
});
