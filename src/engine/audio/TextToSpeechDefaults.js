const TEXT_TO_SPEECH_TOOL_ID = "text2speach-V2";

const TEXT_TO_SPEECH_SAMPLE_TEXT = "Welcome to Toolbox Aid. This is the default text2speach-V2 sample line for previewing narration, prompts, and menu feedback.";

const TEXT_TO_SPEECH_LANGUAGE_OPTIONS = Object.freeze([
  Object.freeze({ label: "English (US)", value: "en-US" }),
  Object.freeze({ label: "English (UK)", value: "en-GB" }),
  Object.freeze({ label: "Spanish (Spain)", value: "es-ES" }),
  Object.freeze({ label: "French (France)", value: "fr-FR" }),
  Object.freeze({ label: "Japanese", value: "ja-JP" })
]);

const TEXT_TO_SPEECH_RATE_OPTIONS = Object.freeze([
  Object.freeze({ label: "Slow", value: 0.75 }),
  Object.freeze({ label: "Normal", value: 1 }),
  Object.freeze({ label: "Fast", value: 1.25 })
]);

const TEXT_TO_SPEECH_PITCH_OPTIONS = Object.freeze([
  Object.freeze({ label: "Low", value: 0.8 }),
  Object.freeze({ label: "Natural", value: 1 }),
  Object.freeze({ label: "Bright", value: 1.2 })
]);

const TEXT_TO_SPEECH_VOLUME_OPTIONS = Object.freeze([
  Object.freeze({ label: "Quiet", value: 0.5 }),
  Object.freeze({ label: "Medium", value: 0.8 }),
  Object.freeze({ label: "Full", value: 1 })
]);

const TEXT_TO_SPEECH_DEFAULTS = Object.freeze({
  language: "en-US",
  pitch: 1,
  rate: 1,
  sampleText: TEXT_TO_SPEECH_SAMPLE_TEXT,
  volume: 1
});

export {
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_LANGUAGE_OPTIONS,
  TEXT_TO_SPEECH_PITCH_OPTIONS,
  TEXT_TO_SPEECH_RATE_OPTIONS,
  TEXT_TO_SPEECH_SAMPLE_TEXT,
  TEXT_TO_SPEECH_TOOL_ID,
  TEXT_TO_SPEECH_VOLUME_OPTIONS
};
