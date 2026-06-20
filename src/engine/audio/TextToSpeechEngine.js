import {
  TEXT_TO_SPEECH_AGE_FILTER_OPTIONS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_DISPLAY_NAME,
  TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS,
  TEXT_TO_SPEECH_QUEUE_ITEM_REQUIRED_FIELDS,
  TEXT_TO_SPEECH_RANGE_DEFAULTS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS,
  TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS
} from "./TextToSpeechDefaults.js";

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function boundedNumber(value, { fallback, max, min }) {
  return Math.min(max, Math.max(min, finiteNumber(value, fallback)));
}

const TEXT_TO_SPEECH_CHARACTER_PRESET_VALUES = new Set(TEXT_TO_SPEECH_CHARACTER_PRESET_OPTIONS.map((option) => option.value));
const TEXT_TO_SPEECH_GENDER_VALUES = new Set(TEXT_TO_SPEECH_GENDER_FILTER_OPTIONS
  .map((option) => option.value)
  .filter((value) => value !== "neutral"));
const TEXT_TO_SPEECH_SSML_LIKE_PRESET_VALUES = new Set(TEXT_TO_SPEECH_SSML_LIKE_PRESET_OPTIONS.map((option) => option.value));
const TEXT_TO_SPEECH_VOICE_AGE_VALUES = new Set(TEXT_TO_SPEECH_AGE_FILTER_OPTIONS.map((option) => option.value));

function textToSpeechSlugFromName(name) {
  const slug = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "speech-item";
}

function textToSpeechPayloadGenderValue(value) {
  return value === "neutral" ? "any" : String(value || "any");
}

function boundedTextToSpeechNumber(value, kind) {
  const range = TEXT_TO_SPEECH_RANGE_DEFAULTS[kind] || TEXT_TO_SPEECH_RANGE_DEFAULTS.rate;
  const fallback = Number.isFinite(TEXT_TO_SPEECH_DEFAULTS[kind])
    ? TEXT_TO_SPEECH_DEFAULTS[kind]
    : range.value;
  return boundedNumber(value, { fallback, max: range.max, min: range.min });
}

function safeTextToSpeechCharacterPreset(value) {
  const normalizedValue = String(value || TEXT_TO_SPEECH_DEFAULTS.characterPreset);
  return TEXT_TO_SPEECH_CHARACTER_PRESET_VALUES.has(normalizedValue)
    ? normalizedValue
    : TEXT_TO_SPEECH_DEFAULTS.characterPreset;
}

function safeTextToSpeechSsmlLikePreset(value) {
  const normalizedValue = String(value || TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset);
  return TEXT_TO_SPEECH_SSML_LIKE_PRESET_VALUES.has(normalizedValue)
    ? normalizedValue
    : TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset;
}

function safeTextToSpeechVoiceAge(value) {
  const normalizedValue = String(value || TEXT_TO_SPEECH_DEFAULTS.voiceAge);
  return TEXT_TO_SPEECH_VOICE_AGE_VALUES.has(normalizedValue)
    ? normalizedValue
    : TEXT_TO_SPEECH_DEFAULTS.voiceAge;
}

function safeTextToSpeechGender(value) {
  const normalizedValue = textToSpeechPayloadGenderValue(value);
  return TEXT_TO_SPEECH_GENDER_VALUES.has(normalizedValue)
    ? normalizedValue
    : TEXT_TO_SPEECH_DEFAULTS.gender;
}

function resolveTextToSpeechDeliveryOptions({
  characterPreset = TEXT_TO_SPEECH_DEFAULTS.characterPreset,
  manualPitch = false,
  manualRate = false,
  manualVolume = false,
  pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
  rate = TEXT_TO_SPEECH_DEFAULTS.rate,
  ssmlLikePreset = TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
  voiceAge = TEXT_TO_SPEECH_DEFAULTS.voiceAge,
  volume = TEXT_TO_SPEECH_DEFAULTS.volume
} = {}) {
  const safeCharacterPreset = safeTextToSpeechCharacterPreset(characterPreset);
  const safeSsmlLikePreset = safeTextToSpeechSsmlLikePreset(ssmlLikePreset);
  const safeVoiceAge = safeTextToSpeechVoiceAge(voiceAge);
  const characterDefaults = TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS[safeCharacterPreset];
  const ssmlDefaults = TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS[safeSsmlLikePreset];
  const voiceAgeDefaults = TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS[safeVoiceAge];

  return {
    characterPreset: safeCharacterPreset,
    pitch: boundedTextToSpeechNumber(manualPitch
      ? pitch
      : Number(characterDefaults.pitch) + Number(voiceAgeDefaults.pitchOffset) + Number(ssmlDefaults.pitchOffset), "pitch"),
    rate: boundedTextToSpeechNumber(manualRate
      ? rate
      : Number(characterDefaults.rate) * Number(voiceAgeDefaults.rateMultiplier) * Number(ssmlDefaults.rateMultiplier), "rate"),
    ssmlLikePreset: safeSsmlLikePreset,
    voiceAge: safeVoiceAge,
    volume: boundedTextToSpeechNumber(manualVolume
      ? volume
      : Number(characterDefaults.volume) * Number(ssmlDefaults.volumeMultiplier), "volume")
  };
}

function createTextToSpeechQueueItem({
  characterPreset = TEXT_TO_SPEECH_DEFAULTS.characterPreset,
  gender = TEXT_TO_SPEECH_DEFAULTS.gender,
  id,
  language = TEXT_TO_SPEECH_DEFAULTS.language,
  name,
  pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
  rate = TEXT_TO_SPEECH_DEFAULTS.rate,
  ssmlLikePreset = TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
  text = "",
  voice = TEXT_TO_SPEECH_DEFAULTS.voice,
  voiceAge = TEXT_TO_SPEECH_DEFAULTS.voiceAge,
  volume = TEXT_TO_SPEECH_DEFAULTS.volume
} = {}) {
  const itemName = String(name || "New speech item").trim() || "New speech item";
  return {
    id: String(id || textToSpeechSlugFromName(itemName)),
    name: itemName,
    text: String(text || ""),
    gender: safeTextToSpeechGender(gender),
    language: String(language || TEXT_TO_SPEECH_DEFAULTS.language),
    voice: String(voice || ""),
    voiceAge: safeTextToSpeechVoiceAge(voiceAge),
    volume: boundedTextToSpeechNumber(volume, "volume"),
    rate: boundedTextToSpeechNumber(rate, "rate"),
    pitch: boundedTextToSpeechNumber(pitch, "pitch"),
    characterPreset: safeTextToSpeechCharacterPreset(characterPreset),
    ssmlLikePreset: safeTextToSpeechSsmlLikePreset(ssmlLikePreset)
  };
}

function validateTextToSpeechPayload(payload) {
  if (!Array.isArray(payload)) {
    return { ok: false, message: "Text To Speech JSON must be a root array of named speech items." };
  }
  const errors = [];
  payload.forEach((item, index) => {
    const label = `item ${index + 1}`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${label}: expected object`);
      return;
    }
    TEXT_TO_SPEECH_QUEUE_ITEM_REQUIRED_FIELDS.forEach((field) => {
      if (!Object.prototype.hasOwnProperty.call(item, field)) {
        errors.push(`${label}: ${field} is required`);
      }
    });
    if (!String(item.id || "").trim()) errors.push(`${label}: id is required`);
    if (!String(item.name || "").trim()) errors.push(`${label}: name is required`);
    if (!String(item.text || "").trim()) errors.push(`${label}: text is required`);
    if (!TEXT_TO_SPEECH_GENDER_VALUES.has(String(item.gender))) errors.push(`${label}: gender must be any, male-preferred, or female-preferred`);
    if (!TEXT_TO_SPEECH_VOICE_AGE_VALUES.has(String(item.voiceAge))) errors.push(`${label}: voiceAge is invalid`);
    if (!TEXT_TO_SPEECH_CHARACTER_PRESET_VALUES.has(String(item.characterPreset))) errors.push(`${label}: characterPreset is invalid`);
    if (!TEXT_TO_SPEECH_SSML_LIKE_PRESET_VALUES.has(String(item.ssmlLikePreset))) errors.push(`${label}: ssmlLikePreset is invalid`);
    if (boundedTextToSpeechNumber(item.volume, "volume") !== Number(item.volume)) errors.push(`${label}: volume must be 0-1`);
    if (boundedTextToSpeechNumber(item.rate, "rate") !== Number(item.rate)) errors.push(`${label}: rate must be 0.1-2`);
    if (boundedTextToSpeechNumber(item.pitch, "pitch") !== Number(item.pitch)) errors.push(`${label}: pitch must be 0.1-2`);
  });
  return errors.length
    ? { ok: false, message: errors.join(" | ") }
    : { ok: true };
}

function normalizeTextToSpeechPayload(payload) {
  const validation = validateTextToSpeechPayload(payload);
  if (!validation.ok) return validation;
  return {
    ok: true,
    payload: payload.map((item) => createTextToSpeechQueueItem(item))
  };
}

function createTextToSpeechSpeakRequest({
  characterPreset = TEXT_TO_SPEECH_DEFAULTS.characterPreset,
  gender = TEXT_TO_SPEECH_DEFAULTS.gender,
  language = TEXT_TO_SPEECH_DEFAULTS.language,
  pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
  rate = TEXT_TO_SPEECH_DEFAULTS.rate,
  speechItemId = "browser-preview",
  speechItemName = "Browser Preview",
  ssmlLikePreset = TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
  text = "",
  voice = "",
  voiceAge = TEXT_TO_SPEECH_DEFAULTS.voiceAge,
  voiceOptions = [],
  volume = TEXT_TO_SPEECH_DEFAULTS.volume
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
    characterPreset: safeTextToSpeechCharacterPreset(characterPreset),
    gender: safeTextToSpeechGender(gender),
    language: language || selectedVoice.language || TEXT_TO_SPEECH_DEFAULTS.language,
    ok: true,
    pitch: boundedTextToSpeechNumber(pitch, "pitch"),
    rate: boundedTextToSpeechNumber(rate, "rate"),
    speechItemId,
    speechItemName,
    ssmlLikePreset: safeTextToSpeechSsmlLikePreset(ssmlLikePreset),
    text: normalizedText,
    voice: selectedVoice.value,
    voiceAge: safeTextToSpeechVoiceAge(voiceAge),
    voiceName: selectedVoice.name || selectedVoice.label || "selected voice",
    volume: boundedTextToSpeechNumber(volume, "volume")
  };
}

function inferTextToSpeechVoiceGender(option) {
  const voiceText = `${option?.gender || ""} ${option?.name || ""} ${option?.label || ""}`;
  const voiceLanguage = String(option?.language || "").toLowerCase();
  if (/\bneutral\b|\bnon[-\s]?binary\b|\bandrogynous\b/i.test(voiceText)) return "neutral";
  if (voiceLanguage === "es-es" || /\bmale\b|\bman\b|\bdavid\b|\bmark\b/i.test(voiceText)) return "male";
  if (/\bfemale\b|\bwoman\b|\bzira\b/i.test(voiceText)) return "female";
  return "unknown";
}

function textToSpeechVoicesForGender(voiceOptions, genderFilter = "any") {
  if (genderFilter === "male-preferred") return voiceOptions.filter((option) => inferTextToSpeechVoiceGender(option) === "male");
  if (genderFilter === "female-preferred") return voiceOptions.filter((option) => inferTextToSpeechVoiceGender(option) === "female");
  if (genderFilter === "neutral") return voiceOptions.filter((option) => ["neutral", "unknown"].includes(inferTextToSpeechVoiceGender(option)));
  return voiceOptions;
}

function textToSpeechLanguageOptionsFromVoices(voiceOptions) {
  const languageCounts = new Map();
  voiceOptions.forEach((option) => {
    const language = String(option.language || "").trim();
    if (language) languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
  });
  return Array.from(languageCounts.entries())
    .map(([language, count]) => ({ label: `${language} (${count} ${count === 1 ? "voice" : "voices"})`, value: language }))
    .sort((left, right) => String(left.label).localeCompare(String(right.label), undefined, {
      numeric: true,
      sensitivity: "base"
    }));
}

class TextToSpeechEngine {
  constructor({
    speechSynthesisRef = globalThis.speechSynthesis,
    utteranceCtor = globalThis.SpeechSynthesisUtterance
  } = {}) {
    this.queueSequence = 0;
    this.queuedSpeechItems = new Map();
    this.speechSynthesis = speechSynthesisRef;
    this.Utterance = utteranceCtor;
  }

  isSupported() {
    return Boolean(this.speechSynthesis
      && typeof this.speechSynthesis.speak === "function"
      && typeof this.speechSynthesis.cancel === "function"
      && typeof this.Utterance === "function");
  }

  canPause() {
    return this.isSupported() && typeof this.speechSynthesis.pause === "function";
  }

  canResume() {
    return this.isSupported() && typeof this.speechSynthesis.resume === "function";
  }

  voices() {
    if (!this.speechSynthesis || typeof this.speechSynthesis.getVoices !== "function") {
      return [];
    }
    return this.speechSynthesis.getVoices();
  }

  voiceOptions() {
    return this.voices()
      .map((voice) => ({
        age: voice.age || "",
        gender: voice.gender || "",
        label: `${voice.name || voice.voiceURI || "Unnamed voice"} (${voice.lang || "unknown"})`,
        language: voice.lang || "",
        name: voice.name || "",
        value: voice.voiceURI || `${voice.name || "voice"}:${voice.lang || "unknown"}`
      }));
  }

  voiceForValue(value) {
    const normalizedValue = String(value || "").trim();
    if (!normalizedValue) {
      return null;
    }
    return this.voices().find((voice) => (
      voice?.voiceURI === normalizedValue
      || voice?.name === normalizedValue
      || `${voice?.name || "voice"}:${voice?.lang || "unknown"}` === normalizedValue
    )) || null;
  }

  onVoicesChanged(callback) {
    if (!this.speechSynthesis || typeof callback !== "function") {
      return () => {};
    }
    if (typeof this.speechSynthesis.addEventListener === "function"
      && typeof this.speechSynthesis.removeEventListener === "function") {
      this.speechSynthesis.addEventListener("voiceschanged", callback);
      return () => {
        this.speechSynthesis.removeEventListener("voiceschanged", callback);
      };
    }
    const previousHandler = this.speechSynthesis.onvoiceschanged;
    const handler = (event) => {
      if (typeof previousHandler === "function") {
        previousHandler.call(this.speechSynthesis, event);
      }
      callback(event);
    };
    this.speechSynthesis.onvoiceschanged = handler;
    return () => {
      if (this.speechSynthesis?.onvoiceschanged === handler) {
        this.speechSynthesis.onvoiceschanged = previousHandler;
      }
    };
  }

  queuedSpeechItemList() {
    return Array.from(this.queuedSpeechItems.values()).map((item) => ({ ...item }));
  }

  createUtterance({
    language = TEXT_TO_SPEECH_DEFAULTS.language,
    pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
    rate = TEXT_TO_SPEECH_DEFAULTS.rate,
    text = "",
    voice = TEXT_TO_SPEECH_DEFAULTS.voice,
    volume = TEXT_TO_SPEECH_DEFAULTS.volume
  } = {}) {
    if (!this.isSupported()) {
      return { message: "SpeechSynthesis is unavailable in this browser.", ok: false };
    }

    const normalizedText = String(text || "").trim();
    if (!normalizedText) {
      return { message: `${TEXT_TO_SPEECH_DISPLAY_NAME} text is required before speaking.`, ok: false };
    }

    const selectedVoice = this.voiceForValue(voice);
    if (!selectedVoice) {
      return { message: `${TEXT_TO_SPEECH_DISPLAY_NAME} voice is required before speaking: ${voice || "(none selected)"}.`, ok: false };
    }

    const utterance = new this.Utterance(normalizedText);
    utterance.lang = String(language || selectedVoice.lang || TEXT_TO_SPEECH_DEFAULTS.language);
    utterance.pitch = boundedNumber(pitch, {
      fallback: TEXT_TO_SPEECH_DEFAULTS.pitch,
      max: TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch.max,
      min: TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch.min
    });
    utterance.rate = boundedNumber(rate, {
      fallback: TEXT_TO_SPEECH_DEFAULTS.rate,
      max: TEXT_TO_SPEECH_RANGE_DEFAULTS.rate.max,
      min: TEXT_TO_SPEECH_RANGE_DEFAULTS.rate.min
    });
    utterance.volume = boundedNumber(volume, { fallback: TEXT_TO_SPEECH_DEFAULTS.volume, max: 1, min: 0 });
    utterance.voice = selectedVoice;
    return {
      ok: true,
      text: normalizedText,
      utterance,
      voice: selectedVoice,
      voiceName: selectedVoice.name || selectedVoice.voiceURI || "selected voice",
      voiceURI: selectedVoice.voiceURI || voice
    };
  }

  speak({
    characterPreset = TEXT_TO_SPEECH_DEFAULTS.characterPreset,
    gender = TEXT_TO_SPEECH_DEFAULTS.gender,
    language = TEXT_TO_SPEECH_DEFAULTS.language,
    pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
    rate = TEXT_TO_SPEECH_DEFAULTS.rate,
    speechItemId = "",
    speechItemName = "",
    ssmlLikePreset = TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
    text = "",
    voice = TEXT_TO_SPEECH_DEFAULTS.voice,
    voiceAge = TEXT_TO_SPEECH_DEFAULTS.voiceAge,
    volume = TEXT_TO_SPEECH_DEFAULTS.volume
  } = {}) {
    const firstUtterance = this.createUtterance({ language, pitch, rate, text, voice, volume });
    if (!firstUtterance.ok) {
      return firstUtterance;
    }

    this.queueSequence += 1;
    const selectedSpeechItemId = String(speechItemId || speechItemName || `speech-item-${Date.now().toString(36)}`);
    const queuedSpeechItemId = `${selectedSpeechItemId || "speech-item"}::${this.queueSequence}`;
    const queuedSpeechItemName = String(speechItemName || selectedSpeechItemId);
    const queuedSpeechItem = {
      id: queuedSpeechItemId,
      language: firstUtterance.utterance.lang,
      name: queuedSpeechItemName,
      pitch: firstUtterance.utterance.pitch,
      rate: firstUtterance.utterance.rate,
      speechItemId: selectedSpeechItemId,
      status: "queued",
      text: firstUtterance.text,
      voiceName: firstUtterance.voiceName,
      voiceURI: firstUtterance.voiceURI,
      volume: firstUtterance.utterance.volume
    };
    firstUtterance.utterance.onstart = () => {
      const item = this.queuedSpeechItems.get(queuedSpeechItemId);
      if (item) {
        this.queuedSpeechItems.set(queuedSpeechItemId, { ...item, status: "speaking" });
      }
    };
    const clearQueuedSpeechItem = () => {
      this.queuedSpeechItems.delete(queuedSpeechItemId);
    };
    firstUtterance.utterance.onend = clearQueuedSpeechItem;
    firstUtterance.utterance.onerror = clearQueuedSpeechItem;
    this.queuedSpeechItems.set(queuedSpeechItemId, queuedSpeechItem);
    this.speechSynthesis.speak(firstUtterance.utterance);

    return {
      characterPreset,
      gender,
      language: firstUtterance.utterance.lang,
      ok: true,
      pitch: firstUtterance.utterance.pitch,
      queuedSpeechItems: this.queuedSpeechItemList(),
      rate: firstUtterance.utterance.rate,
      speechItemId: selectedSpeechItemId,
      speechItemName: queuedSpeechItemName,
      ssmlLikePreset,
      text: firstUtterance.text,
      voiceAge,
      voiceName: firstUtterance.voiceName,
      voiceURI: firstUtterance.voiceURI,
      volume: firstUtterance.utterance.volume
    };
  }

  pause() {
    if (!this.canPause()) {
      return { message: "SpeechSynthesis pause is unavailable in this browser.", ok: false };
    }
    this.speechSynthesis.pause();
    return { ok: true };
  }

  resume() {
    if (!this.canResume()) {
      return { message: "SpeechSynthesis resume is unavailable in this browser.", ok: false };
    }
    this.speechSynthesis.resume();
    return { ok: true };
  }

  stop() {
    if (!this.isSupported()) {
      return { message: "SpeechSynthesis is unavailable in this browser.", ok: false };
    }
    const stoppedCount = this.queuedSpeechItems.size;
    this.speechSynthesis.cancel();
    this.queuedSpeechItems.clear();
    return { ok: true, stoppedCount };
  }

  resetQueuedSpeechItems() {
    this.queueSequence = 0;
    this.queuedSpeechItems.clear();
    return { ok: true };
  }
}

export {
  TextToSpeechEngine,
  boundedTextToSpeechNumber,
  createTextToSpeechQueueItem,
  createTextToSpeechSpeakRequest,
  inferTextToSpeechVoiceGender,
  normalizeTextToSpeechPayload,
  resolveTextToSpeechDeliveryOptions,
  safeTextToSpeechCharacterPreset,
  safeTextToSpeechGender,
  safeTextToSpeechSsmlLikePreset,
  safeTextToSpeechVoiceAge,
  textToSpeechLanguageOptionsFromVoices,
  textToSpeechPayloadGenderValue,
  textToSpeechSlugFromName,
  textToSpeechVoicesForGender,
  validateTextToSpeechPayload
};
export default TextToSpeechEngine;
