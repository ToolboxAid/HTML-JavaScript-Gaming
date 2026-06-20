import { TextToSpeechEngine } from "../../src/engine/audio/TextToSpeechEngine.js";

const TTS_OWNERSHIP = Object.freeze({
  DESIGN: "Design",
  AUDIO: "Audio",
});

const TTS_MESSAGE_STATUSES = Object.freeze([
  "draft",
  "ready-for-preview",
  "speaking",
  "stopped",
  "blocked",
  "archived",
]);

const TTS_LANGUAGES = Object.freeze([
  { code: "en-US", name: "English (United States)" },
  { code: "en-GB", name: "English (United Kingdom)" },
  { code: "es-ES", name: "Spanish (Spain)" },
  { code: "fr-FR", name: "French (France)" },
  { code: "de-DE", name: "German (Germany)" },
  { code: "ja-JP", name: "Japanese (Japan)" },
]);

const TTS_PROVIDER_ADAPTER_PLAN = Object.freeze([
  {
    key: "browser-speech",
    name: "Browser Speech Synthesis",
    status: "implemented",
    boundary: "Local browser Web Speech API preview; no generated files.",
    requiredCapabilities: ["text input", "voice selection", "rate", "pitch", "volume", "speak", "stop"],
  },
  {
    key: "openai",
    name: "OpenAI",
    status: "planned",
    boundary: "External provider adapter; no implementation in this PR.",
    requiredCapabilities: ["text input", "voice selection", "generated audio file response", "usage metadata"],
  },
  {
    key: "elevenlabs",
    name: "ElevenLabs",
    status: "planned",
    boundary: "External provider adapter; no implementation in this PR.",
    requiredCapabilities: ["text input", "voice profile mapping", "generated audio file response", "provider job metadata"],
  },
  {
    key: "azure",
    name: "Azure AI Speech",
    status: "planned",
    boundary: "External provider adapter; no implementation in this PR.",
    requiredCapabilities: ["SSML-safe text", "language mapping", "voice deployment mapping", "generated audio file response"],
  },
  {
    key: "local",
    name: "Local Provider",
    status: "planned",
    boundary: "Local/offline adapter; no implementation in this PR.",
    requiredCapabilities: ["local model availability", "voice preset mapping", "file output", "device/runtime capability reporting"],
  },
]);

const RANGE_LIMITS = Object.freeze({
  pitch: Object.freeze({ fallback: 1, max: 2, min: 0.1 }),
  rate: Object.freeze({ fallback: 1, max: 2, min: 0.1 }),
  volume: Object.freeze({ fallback: 1, max: 1, min: 0 }),
});

function boundedNumber(value, { fallback, max, min }) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function createTtsMessage({
  id,
  name,
  text,
  emotionKey = "neutral",
  voiceProfileKey = "browser-speech",
  languageCode = "en-US",
  status = "draft",
  metadata = {},
} = {}) {
  return {
    id: String(id || "tts-message-draft"),
    name: String(name || "Untitled TTS Message"),
    text: String(text || ""),
    emotionKey: String(emotionKey || "neutral"),
    voiceProfileKey: String(voiceProfileKey || "browser-speech"),
    languageCode: String(languageCode || "en-US"),
    status: TTS_MESSAGE_STATUSES.includes(status) ? status : "draft",
    owner: TTS_OWNERSHIP.DESIGN,
    audioOwner: TTS_OWNERSHIP.AUDIO,
    metadata: {
      creatorNotes: String(metadata.creatorNotes || ""),
      intent: String(metadata.intent || ""),
      sceneKey: String(metadata.sceneKey || ""),
      tags: Array.isArray(metadata.tags) ? metadata.tags.map(String) : [],
    },
    generatedAudio: null,
  };
}

function createEmotionProfile({ key = "neutral", name = "Neutral", intensity = 0.5 } = {}) {
  const numericIntensity = Number(intensity);
  const safeIntensity = Number.isNaN(numericIntensity) ? 0.5 : Math.min(1, Math.max(0, numericIntensity));
  return { key: String(key), name: String(name), intensity: safeIntensity, owner: TTS_OWNERSHIP.DESIGN };
}

function createVoiceProfile({ key = "browser-speech", name = "Browser Speech", providerKey = "browser-speech", voiceId = "" } = {}) {
  return {
    key: String(key),
    name: String(name),
    providerKey: String(providerKey),
    voiceId: String(voiceId),
    owner: TTS_OWNERSHIP.DESIGN,
    generatedAudioOwner: TTS_OWNERSHIP.AUDIO,
  };
}

function createSpeechPreviewRequest({
  pitch = 1,
  rate = 1,
  text = "",
  voice = "",
  voiceOptions = [],
  volume = 1,
} = {}) {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) {
    return { ok: false, message: "Speech text is required before preview." };
  }

  const selectedVoice = voiceOptions.find((option) => String(option.value) === String(voice)) || null;
  if (!selectedVoice) {
    return { ok: false, message: "Select an available browser voice before preview." };
  }

  return {
    language: selectedVoice.language || "en-US",
    ok: true,
    pitch: boundedNumber(pitch, RANGE_LIMITS.pitch),
    rate: boundedNumber(rate, RANGE_LIMITS.rate),
    speechItemId: "browser-preview",
    speechItemName: "Browser Preview",
    text: normalizedText,
    voice: selectedVoice.value,
    voiceName: selectedVoice.name || selectedVoice.label || "selected voice",
    volume: boundedNumber(volume, RANGE_LIMITS.volume),
  };
}

function previewTtsMessage(message, options = {}) {
  return createSpeechPreviewRequest({
    ...options,
    text: message?.text,
  });
}

function formatRangeValue(value, kind) {
  const limits = RANGE_LIMITS[kind] || RANGE_LIMITS.rate;
  const boundedValue = boundedNumber(value, limits);
  return String(Math.round(boundedValue * 100) / 100);
}

function setTextContent(root, selector, text) {
  const node = root.querySelector(selector);
  if (node) node.textContent = text;
}

function setStatus(root, message, state = "info") {
  const status = root.querySelector("[data-tts-status]");
  if (!status) return;
  status.textContent = message;
  status.dataset.ttsStatusState = state;
}

function renderVoiceOptions(select, voiceOptions) {
  select.replaceChildren();
  if (voiceOptions.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No browser voices available";
    select.append(option);
    select.value = "";
    return;
  }
  voiceOptions.forEach((voiceOption) => {
    const option = document.createElement("option");
    option.value = voiceOption.value;
    option.textContent = voiceOption.label;
    select.append(option);
  });
  select.value = voiceOptions[0].value;
}

function collectSpeechRequest(root, voiceOptions) {
  return createSpeechPreviewRequest({
    pitch: root.querySelector("[data-tts-pitch]")?.value,
    rate: root.querySelector("[data-tts-rate]")?.value,
    text: root.querySelector("[data-tts-text-input]")?.value,
    voice: root.querySelector("[data-tts-voice-select]")?.value,
    voiceOptions,
    volume: root.querySelector("[data-tts-volume]")?.value,
  });
}

function initializeTextToSpeechTool(root = document, { engine = new TextToSpeechEngine() } = {}) {
  const textInput = root.querySelector("[data-tts-text-input]");
  const voiceSelect = root.querySelector("[data-tts-voice-select]");
  const speakButton = root.querySelector("[data-tts-speak]");
  const stopButton = root.querySelector("[data-tts-stop]");
  const rateInput = root.querySelector("[data-tts-rate]");
  const pitchInput = root.querySelector("[data-tts-pitch]");
  const volumeInput = root.querySelector("[data-tts-volume]");
  let voiceOptions = [];

  function syncRange(input, selector, kind) {
    if (!input) return;
    input.value = formatRangeValue(input.value, kind);
    setTextContent(root, selector, input.value);
  }

  function refreshActionState() {
    const hasText = Boolean(String(textInput?.value || "").trim());
    const hasVoice = Boolean(voiceSelect?.value);
    const supported = engine.isSupported();
    if (speakButton) speakButton.disabled = !(supported && hasText && hasVoice);
    if (stopButton) stopButton.disabled = !supported;
    setTextContent(root, "[data-tts-text-count]", String(String(textInput?.value || "").length));
  }

  function refreshVoices({ preserveSelection = true } = {}) {
    const previousVoice = voiceSelect?.value || "";
    voiceOptions = engine.voiceOptions();
    if (voiceSelect) {
      renderVoiceOptions(voiceSelect, voiceOptions);
      if (preserveSelection && voiceOptions.some((option) => option.value === previousVoice)) {
        voiceSelect.value = previousVoice;
      }
    }
    setTextContent(root, "[data-tts-voice-count]", String(voiceOptions.length));
    setTextContent(root, "[data-tts-voice-details]", voiceOptions.length
      ? `${voiceOptions.length} browser voice${voiceOptions.length === 1 ? "" : "s"} available.`
      : "No browser voices are currently available.");
    refreshActionState();
  }

  function markUnavailable() {
    setTextContent(root, "[data-tts-engine-label]", "Unavailable");
    setTextContent(root, "[data-tts-engine-status]", "SpeechSynthesis is unavailable in this browser. Use a browser with Web Speech API support.");
    setStatus(root, "SpeechSynthesis is unavailable in this browser. Use a browser with Web Speech API support.", "error");
    if (voiceSelect) {
      voiceSelect.disabled = true;
      renderVoiceOptions(voiceSelect, []);
    }
    if (speakButton) speakButton.disabled = true;
    if (stopButton) stopButton.disabled = true;
  }

  syncRange(rateInput, "[data-tts-rate-value]", "rate");
  syncRange(pitchInput, "[data-tts-pitch-value]", "pitch");
  syncRange(volumeInput, "[data-tts-volume-value]", "volume");

  if (!engine.isSupported()) {
    markUnavailable();
    return { engine, speechSupported: false, voiceOptions };
  }

  setTextContent(root, "[data-tts-engine-label]", "Ready");
  setTextContent(root, "[data-tts-engine-status]", "Browser SpeechSynthesis is available for local preview.");
  setStatus(root, "Browser Text To Speech ready. Enter text, choose a voice, then press Speak / Preview.", "ready");
  refreshVoices({ preserveSelection: false });
  engine.onVoicesChanged(() => {
    refreshVoices();
  });

  [rateInput, pitchInput, volumeInput].forEach((input) => {
    input?.addEventListener("input", () => {
      const kind = input === rateInput ? "rate" : input === pitchInput ? "pitch" : "volume";
      syncRange(input, `[data-tts-${kind}-value]`, kind);
      refreshActionState();
    });
  });
  textInput?.addEventListener("input", refreshActionState);
  voiceSelect?.addEventListener("change", refreshActionState);

  speakButton?.addEventListener("click", () => {
    const request = collectSpeechRequest(root, voiceOptions);
    if (!request.ok) {
      setStatus(root, request.message, "error");
      refreshActionState();
      return;
    }
    const result = engine.speak(request);
    if (!result.ok) {
      setStatus(root, result.message, "error");
      refreshActionState();
      return;
    }
    setStatus(root, `Speech queued with ${result.voiceName}; rate=${result.rate}; pitch=${result.pitch}; volume=${result.volume}.`, "ready");
    refreshActionState();
  });

  stopButton?.addEventListener("click", () => {
    const result = engine.stop();
    if (!result.ok) {
      setStatus(root, result.message, "error");
      return;
    }
    setStatus(root, `Speech stopped. Cleared ${result.stoppedCount} queued item${result.stoppedCount === 1 ? "" : "s"}.`, "ready");
    refreshActionState();
  });

  return { engine, speechSupported: true, voiceOptions };
}

if (typeof document !== "undefined") {
  initializeTextToSpeechTool(document);
}

export {
  TTS_LANGUAGES,
  TTS_MESSAGE_STATUSES,
  TTS_OWNERSHIP,
  TTS_PROVIDER_ADAPTER_PLAN,
  createEmotionProfile,
  createSpeechPreviewRequest,
  createTtsMessage,
  createVoiceProfile,
  initializeTextToSpeechTool,
  previewTtsMessage,
};
