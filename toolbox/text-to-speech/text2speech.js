const TTS_OWNERSHIP = Object.freeze({
  DESIGN: "Design",
  AUDIO: "Audio",
});

const TTS_MESSAGE_STATUSES = Object.freeze([
  "draft",
  "ready-for-preview",
  "pending-generation",
  "generated",
  "exported",
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

function createTtsMessage({
  id,
  name,
  text,
  emotionKey = "neutral",
  voiceProfileKey = "unassigned",
  languageCode = "en-US",
  status = "draft",
  metadata = {},
} = {}) {
  return {
    id: String(id || "tts-message-draft"),
    name: String(name || "Untitled TTS Message"),
    text: String(text || ""),
    emotionKey: String(emotionKey || "neutral"),
    voiceProfileKey: String(voiceProfileKey || "unassigned"),
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

function createVoiceProfile({ key = "unassigned", name = "Unassigned Voice", providerKey = "unassigned", voiceId = "" } = {}) {
  return {
    key: String(key),
    name: String(name),
    providerKey: String(providerKey),
    voiceId: String(voiceId),
    owner: TTS_OWNERSHIP.DESIGN,
    generatedAudioOwner: TTS_OWNERSHIP.AUDIO,
  };
}

function previewTtsMessage(message) {
  if (!message || !message.text.trim()) {
    return { ok: false, status: "blocked", message: "Preview blocked: message text is required." };
  }
  return { ok: true, status: "ready-for-preview", message: "Preview shell ready. Provider playback is not implemented yet." };
}

function generateTtsMessage() {
  return { ok: false, status: "blocked", message: "Generation blocked: no TTS provider adapter is implemented yet." };
}

function exportTtsMessage(message) {
  if (!message || !message.generatedAudio) {
    return { ok: false, status: "blocked", message: "Export blocked: generated Audio-owned voice asset is required." };
  }
  return { ok: true, status: "exported", message: "Export shell ready for an Audio-owned generated voice asset." };
}

function renderProviderPlan(list, providers = TTS_PROVIDER_ADAPTER_PLAN) {
  if (!list) return;
  list.replaceChildren();
  providers.forEach((provider) => {
    const item = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = provider.name;
    item.append(strong, ` - ${provider.status}. ${provider.boundary}`);
    list.append(item);
  });
}

function initializeText2SpeechShell(root = document) {
  const status = root.querySelector("[data-tts-workflow-status]");
  const sample = createTtsMessage({
    id: "sample-message",
    name: "Sample Message",
    text: "Welcome to the arena, hero.",
    emotionKey: "confident",
    voiceProfileKey: "future-voice",
    metadata: { intent: "Narration", tags: ["intro", "tutorial"] },
  });
  const actions = {
    preview: previewTtsMessage(sample),
    generate: generateTtsMessage(sample),
    export: exportTtsMessage(sample),
  };
  root.querySelectorAll("[data-tts-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = actions[button.dataset.ttsAction];
      if (status && result) status.textContent = result.message;
    });
  });
  renderProviderPlan(root.querySelector("[data-tts-provider-plan]"));
  if (status) status.textContent = "Text To Speech shell loaded. Generation is blocked until a real provider adapter is implemented.";
  return { sample, actions };
}

if (typeof document !== "undefined") {
  initializeText2SpeechShell(document);
}

export {
  TTS_LANGUAGES,
  TTS_MESSAGE_STATUSES,
  TTS_OWNERSHIP,
  TTS_PROVIDER_ADAPTER_PLAN,
  createEmotionProfile,
  createTtsMessage,
  createVoiceProfile,
  exportTtsMessage,
  generateTtsMessage,
  initializeText2SpeechShell,
  previewTtsMessage,
};
