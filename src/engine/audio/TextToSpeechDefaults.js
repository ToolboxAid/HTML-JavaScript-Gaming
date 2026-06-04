const TEXT_TO_SPEECH_TOOL_ID = "text2speech-V2";
const TEXT_TO_SPEECH_SCHEMA_ID = "src/shared/schemas/tools/text2speech-V2.schema.json";
const TEXT_TO_SPEECH_DISPLAY_NAME = "Text to Speech V2";

const TEXT_TO_SPEECH_LANGUAGE_OPTIONS = Object.freeze([
  Object.freeze({ label: "English (UK)", value: "en-GB" }),
  Object.freeze({ label: "English (US)", value: "en-US" }),
  Object.freeze({ label: "French (France)", value: "fr-FR" }),
  Object.freeze({ label: "Japanese", value: "ja-JP" }),
  Object.freeze({ label: "Spanish (Spain)", value: "es-ES" })
]);

const TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS = Object.freeze([
  Object.freeze({ label: "Any", value: "any" }),
  Object.freeze({ label: "Male", value: "male-preferred" }),
  Object.freeze({ label: "Female", value: "female-preferred" }),
  Object.freeze({ label: "Neutral", value: "neutral" })
]);

const TEXT_TO_SPEECH_AGE_FILTER_OPTIONS = Object.freeze([
  Object.freeze({ label: "Any", value: "any" }),
  Object.freeze({ label: "Adult", value: "adult" }),
  Object.freeze({ label: "Child", value: "child" }),
  Object.freeze({ label: "Elderly", value: "elderly" }),
  Object.freeze({ label: "Teen", value: "teen" })
]);

const TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS = Object.freeze({
  adult: Object.freeze({ pitchOffset: 0, rateMultiplier: 1 }),
  any: Object.freeze({ pitchOffset: 0, rateMultiplier: 1 }),
  child: Object.freeze({ pitchOffset: 0.4, rateMultiplier: 1.15 }),
  elderly: Object.freeze({ pitchOffset: -0.2, rateMultiplier: 0.85 }),
  teen: Object.freeze({ pitchOffset: 0.2, rateMultiplier: 1.08 })
});

const TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS = Object.freeze([
  Object.freeze({ label: "Manual", value: "manual" }),
  Object.freeze({ label: "Alert", value: "alert" }),
  Object.freeze({ label: "Calm", value: "calm" }),
  Object.freeze({ label: "D&D Dungeon Master", value: "dnd-dungeon-master" }),
  Object.freeze({ label: "Dramatic", value: "dramatic" }),
  Object.freeze({ label: "Narrator", value: "narrator" }),
  Object.freeze({ label: "Robot", value: "robot" })
]);

const TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS = Object.freeze([
  Object.freeze({ label: "Normal", value: "normal" }),
  Object.freeze({ label: "Slow", value: "slow" }),
  Object.freeze({ label: "Whisper-ish", value: "whisper-ish" })
]);

const TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS = Object.freeze({
  normal: Object.freeze({ pitchOffset: 0, rateMultiplier: 1, volumeMultiplier: 1 }),
  slow: Object.freeze({ pitchOffset: -0.1, rateMultiplier: 0.75, volumeMultiplier: 0.95 }),
  "whisper-ish": Object.freeze({ pitchOffset: -0.3, rateMultiplier: 0.8, volumeMultiplier: 0.6 })
});

const TEXT_TO_SPEECH_RANGE_DEFAULTS = Object.freeze({
  pitch: Object.freeze({ max: 2, min: 0.1, step: 0.1, value: 1 }),
  rate: Object.freeze({ max: 2, min: 0.1, step: 0.1, value: 1 }),
  volume: Object.freeze({ max: 1, min: 0, step: 0.01, value: 1 })
});

const TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS = Object.freeze({
  alert: Object.freeze({ pitch: 0.9, rate: 1.3, ssmlLikePreset: "normal", volume: 1 }),
  calm: Object.freeze({ pitch: 1, rate: 0.8, ssmlLikePreset: "normal", volume: 1 }),
  "dnd-dungeon-master": Object.freeze({ pitch: 0.5, rate: 0.8, ssmlLikePreset: "normal", volume: 1 }),
  dramatic: Object.freeze({ pitch: 1.2, rate: 1.1, ssmlLikePreset: "normal", volume: 1 }),
  manual: Object.freeze({ pitch: 1, rate: 1, ssmlLikePreset: "normal", volume: 1 }),
  narrator: Object.freeze({ pitch: 1, rate: 1, ssmlLikePreset: "normal", volume: 1 }),
  robot: Object.freeze({ pitch: 0.8, rate: 0.9, ssmlLikePreset: "normal", volume: 1 })
});

const TEXT_TO_SPEECH_QUEUE_ITEM_REQUIRED_FIELDS = Object.freeze([
  "id",
  "name",
  "text",
  "gender",
  "language",
  "voice",
  "voiceAge",
  "volume",
  "rate",
  "pitch",
  "characterPreset",
  "ssmlLikePreset"
]);

const TEXT_TO_SPEECH_DEFAULT_OPTIONS = Object.freeze({
  characterPreset: "manual",
  gender: "any",
  language: "en-US",
  pitch: TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS.manual.pitch,
  rate: TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS.manual.rate,
  ssmlLikePreset: TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS.manual.ssmlLikePreset,
  voice: "",
  voiceAge: "any",
  volume: TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS.manual.volume
});

const TEXT_TO_SPEECH_DEFAULTS = Object.freeze({
  ...TEXT_TO_SPEECH_DEFAULT_OPTIONS
});

export {
  TEXT_TO_SPEECH_AGE_FILTER_OPTIONS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
  TEXT_TO_SPEECH_DEFAULT_OPTIONS,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_DISPLAY_NAME,
  TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_QUEUE_ITEM_REQUIRED_FIELDS,
  TEXT_TO_SPEECH_RANGE_DEFAULTS,
  TEXT_TO_SPEECH_SCHEMA_ID,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS,
  TEXT_TO_SPEECH_TOOL_ID,
  TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS
};
