import {
  TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_DISPLAY_NAME,
  TEXT_TO_SPEECH_RANGE_DEFAULTS,
  TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS,
  TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS
} from "./TextToSpeechDefaults.js";

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function boundedNumber(value, { fallback, max, min, value: defaultValue }) {
  const fallbackValue = fallback ?? defaultValue ?? min;
  return Math.min(max, Math.max(min, finiteNumber(value, fallbackValue)));
}

function shapedNumber(value, { fallback, max, min, step }) {
  const boundedValue = boundedNumber(value, { fallback, max, min });
  const stepText = String(step || "1");
  const decimalPart = stepText.includes(".") ? stepText.split(".")[1] : "";
  const multiplier = 10 ** decimalPart.length;
  return Math.round(boundedValue * multiplier) / multiplier;
}

function textToSpeechSlugFromName(name) {
  const slug = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "speech-item";
}

function textToSpeechVoiceGender(option) {
  const voiceText = `${option?.gender || ""} ${option?.name || ""} ${option?.label || ""}`;
  const voiceLanguage = String(option?.language || "").toLowerCase();
  if (/\bneutral\b|\bnon[-\s]?binary\b|\bandrogynous\b/i.test(voiceText)) return "neutral";
  if (voiceLanguage === "es-es" || /\bmale\b|\bman\b|\bdavid\b|\bmark\b/i.test(voiceText)) return "male";
  if (/\bfemale\b|\bwoman\b|\bzira\b/i.test(voiceText)) return "female";
  return "unknown";
}

function genderFilterLabel(value) {
  if (value === "male-preferred") return "Male";
  if (value === "female-preferred") return "Female";
  if (value === "neutral") return "Neutral";
  return "Any";
}

function ageFilterLabel(value) {
  if (value === "adult") return "Adult";
  if (value === "child") return "Child";
  if (value === "elderly") return "Elderly";
  if (value === "teen") return "Teen";
  return "Any";
}

function payloadGenderValue(value) {
  return value === "neutral" ? "any" : value;
}

function filterTextToSpeechVoicesByGender(voiceOptions, genderFilter = "any") {
  if (genderFilter === "any") return voiceOptions;
  if (genderFilter === "male-preferred") {
    return voiceOptions.filter((option) => textToSpeechVoiceGender(option) === "male");
  }
  if (genderFilter === "female-preferred") {
    return voiceOptions.filter((option) => textToSpeechVoiceGender(option) === "female");
  }
  if (genderFilter === "neutral") {
    return voiceOptions.filter((option) => ["neutral", "unknown"].includes(textToSpeechVoiceGender(option)));
  }
  return voiceOptions;
}

function optionLabelCompare(left, right) {
  return String(left.label).localeCompare(String(right.label), undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function textToSpeechLanguageOptionsFromVoices(voiceOptions) {
  const languageCounts = new Map();
  voiceOptions.forEach((option) => {
    const language = String(option.language || "").trim();
    if (language) {
      languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
    }
  });
  return Array.from(languageCounts.entries())
    .map(([language, count]) => ({
      label: `${language} (${count} ${count === 1 ? "voice" : "voices"})`,
      value: language
    }))
    .sort(optionLabelCompare);
}

function filterTextToSpeechVoiceOptions(voiceOptions, { gender = "any", language = "" } = {}) {
  const filteredByGender = filterTextToSpeechVoicesByGender(voiceOptions, gender);
  const matchingVoices = filteredByGender
    .filter((option) => !language || option.language === language)
    .sort(optionLabelCompare);
  return {
    filteredVoiceCount: filteredByGender.length,
    gender,
    genderLabel: genderFilterLabel(gender),
    language,
    languageOptions: textToSpeechLanguageOptionsFromVoices(filteredByGender),
    matchingVoices,
    voiceCount: voiceOptions.length
  };
}

function shapeTextToSpeechOptions({
  characterPreset = TEXT_TO_SPEECH_DEFAULTS.characterPreset,
  pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
  rate = TEXT_TO_SPEECH_DEFAULTS.rate,
  ssmlLikePreset = TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
  voiceAge = TEXT_TO_SPEECH_DEFAULTS.voiceAge,
  volume = TEXT_TO_SPEECH_DEFAULTS.volume
} = {}, sliderOverrides = {}) {
  const character = TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS[characterPreset] || TEXT_TO_SPEECH_CHARACTER_PRESET_DEFAULTS.manual;
  const age = TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS[voiceAge] || TEXT_TO_SPEECH_VOICE_AGE_PRESET_DEFAULTS.any;
  const ssmlLike = TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS[ssmlLikePreset] || TEXT_TO_SPEECH_SSML_LIKE_PRESET_DEFAULTS.normal;
  return {
    characterPreset,
    pitch: sliderOverrides.pitch
      ? boundedNumber(pitch, TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch)
      : shapedNumber(Number(character.pitch) + Number(age.pitchOffset) + Number(ssmlLike.pitchOffset), TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch),
    rate: sliderOverrides.rate
      ? boundedNumber(rate, TEXT_TO_SPEECH_RANGE_DEFAULTS.rate)
      : shapedNumber(Number(character.rate) * Number(age.rateMultiplier) * Number(ssmlLike.rateMultiplier), TEXT_TO_SPEECH_RANGE_DEFAULTS.rate),
    ssmlLikePreset,
    voiceAge,
    volume: sliderOverrides.volume
      ? boundedNumber(volume, TEXT_TO_SPEECH_RANGE_DEFAULTS.volume)
      : shapedNumber(Number(character.volume) * Number(ssmlLike.volumeMultiplier), TEXT_TO_SPEECH_RANGE_DEFAULTS.volume)
  };
}

function uniqueTextToSpeechName(baseName, existingItems = []) {
  const requestedName = String(baseName || "").trim() || "New speech item";
  const existingNames = new Set(existingItems.map((item) => item.name));
  if (!existingNames.has(requestedName)) return requestedName;
  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${requestedName} ${index}`;
    if (!existingNames.has(candidate)) return candidate;
  }
  return `${requestedName} ${Date.now().toString(36)}`;
}

function uniqueTextToSpeechId(baseName, existingItems = []) {
  const existingIds = new Set(existingItems.map((item) => item.id));
  const baseId = textToSpeechSlugFromName(baseName);
  if (!existingIds.has(baseId)) return baseId;
  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${baseId}-${index}`;
    if (!existingIds.has(candidate)) return candidate;
  }
  return `${baseId}-${Date.now().toString(36)}`;
}

function createTextToSpeechQueueItem({
  existingItems = [],
  id = "",
  name = "",
  text = "",
  ...options
} = {}) {
  const itemName = uniqueTextToSpeechName(name, id ? [] : existingItems);
  return {
    characterPreset: options.characterPreset || TEXT_TO_SPEECH_DEFAULTS.characterPreset,
    gender: payloadGenderValue(options.gender || TEXT_TO_SPEECH_DEFAULTS.gender),
    id: id || uniqueTextToSpeechId(itemName, existingItems),
    language: options.language || TEXT_TO_SPEECH_DEFAULTS.language,
    name: itemName,
    pitch: boundedNumber(options.pitch, TEXT_TO_SPEECH_RANGE_DEFAULTS.pitch),
    rate: boundedNumber(options.rate, TEXT_TO_SPEECH_RANGE_DEFAULTS.rate),
    ssmlLikePreset: options.ssmlLikePreset || TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
    text: String(text || "").trim() || "New speech line.",
    voice: String(options.voice || ""),
    voiceAge: options.voiceAge || TEXT_TO_SPEECH_DEFAULTS.voiceAge,
    volume: boundedNumber(options.volume, TEXT_TO_SPEECH_RANGE_DEFAULTS.volume)
  };
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

  filterVoiceOptions(options = {}) {
    return filterTextToSpeechVoiceOptions(this.voiceOptions(), options);
  }

  shapeOptions(options = {}, sliderOverrides = {}) {
    return shapeTextToSpeechOptions(options, sliderOverrides);
  }

  createQueueItem(options = {}) {
    return createTextToSpeechQueueItem(options);
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
  ageFilterLabel as textToSpeechAgeFilterLabel,
  createTextToSpeechQueueItem,
  filterTextToSpeechVoiceOptions,
  genderFilterLabel as textToSpeechGenderFilterLabel,
  payloadGenderValue as textToSpeechPayloadGenderValue,
  shapeTextToSpeechOptions,
  textToSpeechLanguageOptionsFromVoices,
  textToSpeechSlugFromName,
  textToSpeechVoiceGender,
  TextToSpeechEngine,
  uniqueTextToSpeechId,
  uniqueTextToSpeechName
};
export default TextToSpeechEngine;
