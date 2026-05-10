const TEXT_TO_SPEECH_TOOL_ID = "text2speach-V2";
const TEXT_TO_SPEECH_SCHEMA_ID = "tools/schemas/tools/text2speach-V2.schema.json";
const TEXT_TO_SPEECH_PAYLOAD_SCHEMA = "html-js-gaming.text2speach-V2";

const TEXT_TO_SPEECH_LANGUAGE_OPTIONS = Object.freeze([
  Object.freeze({ label: "English (US)", value: "en-US" }),
  Object.freeze({ label: "English (UK)", value: "en-GB" }),
  Object.freeze({ label: "Spanish (Spain)", value: "es-ES" }),
  Object.freeze({ label: "French (France)", value: "fr-FR" }),
  Object.freeze({ label: "Japanese", value: "ja-JP" })
]);

const TEXT_TO_SPEECH_QUEUE_MODE_OPTIONS = Object.freeze([
  Object.freeze({ label: "Replace current speech", value: "replace" }),
  Object.freeze({ label: "Append to queue", value: "append" })
]);

const TEXT_TO_SPEECH_REPEAT_COUNT_OPTIONS = Object.freeze([
  Object.freeze({ label: "1", value: 1 }),
  Object.freeze({ label: "2", value: 2 }),
  Object.freeze({ label: "3", value: 3 }),
  Object.freeze({ label: "Loop", value: "loop" })
]);

const TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS = Object.freeze([
  Object.freeze({ label: "Narrator", value: "narrator" }),
  Object.freeze({ label: "Hero", value: "hero" }),
  Object.freeze({ label: "Villain", value: "villain" }),
  Object.freeze({ label: "Alert", value: "alert" })
]);

const TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS = Object.freeze([
  Object.freeze({ label: "Normal", value: "normal" }),
  Object.freeze({ label: "Whisper-ish", value: "whisper-ish" }),
  Object.freeze({ label: "Announcement", value: "announcement" }),
  Object.freeze({ label: "Slow", value: "slow" })
]);

const TEXT_TO_SPEECH_RANGE_DEFAULTS = Object.freeze({
  delayBetweenRepeatsMs: Object.freeze({ max: 5000, min: 0, step: 100, value: 0 }),
  pitch: Object.freeze({ max: 2, min: 0, step: 0.1, value: 1 }),
  rate: Object.freeze({ max: 10, min: 0.1, step: 0.1, value: 1 }),
  volume: Object.freeze({ max: 1, min: 0, step: 0.01, value: 1 })
});

const TEXT_TO_SPEECH_QUEUE_ITEM_REQUIRED_FIELDS = Object.freeze([
  "id",
  "name",
  "text",
  "voice",
  "language",
  "volume",
  "rate",
  "pitch",
  "queueMode",
  "autoSpeak",
  "repeatCount",
  "delayBetweenRepeatsMs",
  "characterPreset",
  "ssmlLikePreset"
]);

const TEXT_TO_SPEECH_DEFAULT_OPTIONS = Object.freeze({
  autoSpeak: false,
  characterPreset: "narrator",
  delayBetweenRepeatsMs: TEXT_TO_SPEECH_RANGE_DEFAULTS.delayBetweenRepeatsMs.value,
  language: "en-US",
  pitch: TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch.value,
  queueMode: "replace",
  rate: TEXT_TO_SPEECH_RANGE_DEFAULTS.rate.value,
  repeatCount: 1,
  ssmlLikePreset: "normal",
  voice: "",
  volume: TEXT_TO_SPEECH_RANGE_DEFAULTS.volume.value
});

const TEXT_TO_SPEECH_DEFAULT_QUEUE = Object.freeze([
  Object.freeze({
    ...TEXT_TO_SPEECH_DEFAULT_OPTIONS,
    id: "narrator-welcome",
    name: "Narrator welcome",
    text: "Welcome to Toolbox Aid. This is the default text2speach-V2 sample line for previewing narration, prompts, and menu feedback."
  }),
  Object.freeze({
    ...TEXT_TO_SPEECH_DEFAULT_OPTIONS,
    characterPreset: "hero",
    id: "hero-ready",
    name: "Hero ready",
    pitch: 1.15,
    rate: 1.1,
    text: "Systems ready. The hero prompt is queued for an upbeat menu confirmation."
  }),
  Object.freeze({
    ...TEXT_TO_SPEECH_DEFAULT_OPTIONS,
    characterPreset: "alert",
    id: "alert-warning",
    name: "Alert warning",
    pitch: 0.9,
    rate: 1.25,
    ssmlLikePreset: "announcement",
    text: "Warning. Incoming hazard detected. Please confirm the next action."
  })
]);

const TEXT_TO_SPEECH_DEFAULT_QUEUE_DATA = Object.freeze({
  $schema: TEXT_TO_SPEECH_SCHEMA_ID,
  schema: TEXT_TO_SPEECH_PAYLOAD_SCHEMA,
  version: 1,
  name: "text2speach-V2 default queue",
  queue: TEXT_TO_SPEECH_DEFAULT_QUEUE
});

const TEXT_TO_SPEECH_DEFAULTS = Object.freeze({
  ...TEXT_TO_SPEECH_DEFAULT_OPTIONS,
  sampleText: TEXT_TO_SPEECH_DEFAULT_QUEUE[0].text
});

const TEXT_TO_SPEECH_SAMPLE_TEXT = TEXT_TO_SPEECH_DEFAULTS.sampleText;

export {
  TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
  TEXT_TO_SPEECH_DEFAULT_OPTIONS,
  TEXT_TO_SPEECH_DEFAULT_QUEUE,
  TEXT_TO_SPEECH_DEFAULT_QUEUE_DATA,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_PAYLOAD_SCHEMA,
  TEXT_TO_SPEECH_QUEUE_ITEM_REQUIRED_FIELDS,
  TEXT_TO_SPEECH_QUEUE_MODE_OPTIONS,
  TEXT_TO_SPEECH_RANGE_DEFAULTS,
  TEXT_TO_SPEECH_REPEAT_COUNT_OPTIONS,
  TEXT_TO_SPEECH_SAMPLE_TEXT,
  TEXT_TO_SPEECH_SCHEMA_ID,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS,
  TEXT_TO_SPEECH_TOOL_ID
};
