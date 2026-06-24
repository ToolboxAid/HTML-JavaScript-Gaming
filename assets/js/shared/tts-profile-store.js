const TEXT_TO_SPEECH_PROFILE_STORAGE_KEY = "gamefoundry.textToSpeech.profiles.v1";
const TEXT_TO_SPEECH_PROFILE_STORE_VERSION = "tts-profile-store-v1";

const DEFAULT_LANGUAGE = "en-US";
const DEFAULT_PROVIDER_KEY = "browser-speech";
const DEFAULT_VOICE_AGE = "adult";

function clampNumber(value, fallback, min, max) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, numberValue));
}

function normalizedText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function slugFromText(value, fallback = "item") {
  return normalizedText(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function labelFromSlug(value, fallback = "Neutral") {
  return normalizedText(value, fallback)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function defaultStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function storagePayloadProfiles(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.profiles)) {
    return payload.profiles;
  }
  return [];
}

function normalizeSavedEmotion(emotion = {}) {
  const emotionKey = slugFromText(emotion.emotion || emotion.id || emotion.emotionLabel, "neutral");
  const emotionLabel = normalizedText(emotion.emotionLabel || emotion.name, labelFromSlug(emotionKey));
  return {
    active: emotion.active !== false,
    emotion: emotionKey,
    emotionLabel,
    id: normalizedText(emotion.id, emotionKey),
    messagePartsUsageCount: Math.max(0, Number(emotion.messagePartsUsageCount) || 0),
    pitch: clampNumber(emotion.pitch, 1, 0.1, 2),
    rate: clampNumber(emotion.rate, 1, 0.1, 2),
    ssmlLikePreset: normalizedText(emotion.ssmlLikePreset, "normal"),
    volume: clampNumber(emotion.volume, 1, 0, 1),
  };
}

function normalizeSavedProfile(profile = {}) {
  const name = normalizedText(profile.name, "Default Balanced Profile");
  const emotions = Array.isArray(profile.emotions) && profile.emotions.length
    ? profile.emotions.map(normalizeSavedEmotion)
    : [normalizeSavedEmotion()];
  return {
    active: profile.active !== false,
    age: normalizedText(profile.age, DEFAULT_VOICE_AGE),
    emotions,
    gender: normalizedText(profile.gender, "neutral"),
    id: normalizedText(profile.id, slugFromText(name, "tts-profile")),
    language: normalizedText(profile.language, DEFAULT_LANGUAGE),
    messageStudioUsageCount: Math.max(0, Number(profile.messageStudioUsageCount) || 0),
    name,
    owner: "Audio",
    providerKey: normalizedText(profile.providerKey, DEFAULT_PROVIDER_KEY),
    voice: normalizedText(profile.voice),
    voiceName: normalizedText(profile.voiceName || profile.voice, "Default browser voice"),
  };
}

function normalizeSavedTextToSpeechProfiles(profiles = []) {
  return Array.isArray(profiles) ? profiles.map(normalizeSavedProfile) : [];
}

function readSavedTextToSpeechProfiles(storage = defaultStorage()) {
  if (!storage || typeof storage.getItem !== "function") {
    return [];
  }
  const raw = storage.getItem(TEXT_TO_SPEECH_PROFILE_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error("Saved Text To Speech profiles could not be read.");
  }
  return normalizeSavedTextToSpeechProfiles(storagePayloadProfiles(payload));
}

function writeSavedTextToSpeechProfiles(profiles = [], storage = defaultStorage()) {
  if (!storage || typeof storage.setItem !== "function") {
    return false;
  }
  const payload = {
    profiles: normalizeSavedTextToSpeechProfiles(profiles),
    updatedAt: new Date().toISOString(),
    version: TEXT_TO_SPEECH_PROFILE_STORE_VERSION,
  };
  storage.setItem(TEXT_TO_SPEECH_PROFILE_STORAGE_KEY, JSON.stringify(payload));
  return true;
}

function textToSpeechProfilesToMessageOptions(profiles = []) {
  return normalizeSavedTextToSpeechProfiles(profiles)
    .filter((profile) => profile.active !== false)
    .map((profile) => ({
      active: true,
      age: profile.age,
      ageFilter: profile.age,
      emotionSettings: profile.emotions
        .filter((emotion) => emotion.active !== false)
        .map((emotion) => ({
          active: true,
          emotion: emotion.emotion,
          emotionLabel: emotion.emotionLabel,
          key: emotion.id,
          pitch: emotion.pitch,
          rate: emotion.rate,
          ssmlLikePreset: emotion.ssmlLikePreset,
          volume: emotion.volume,
        })),
      gender: profile.gender,
      key: profile.id,
      language: profile.language,
      name: profile.name,
      providerKey: profile.providerKey,
      sourceProfileId: profile.id,
      voice: profile.voice,
      voiceName: profile.voiceName || profile.voice || "Default browser voice",
    }));
}

export {
  TEXT_TO_SPEECH_PROFILE_STORAGE_KEY,
  TEXT_TO_SPEECH_PROFILE_STORE_VERSION,
  normalizeSavedTextToSpeechProfiles,
  readSavedTextToSpeechProfiles,
  textToSpeechProfilesToMessageOptions,
  writeSavedTextToSpeechProfiles,
};
