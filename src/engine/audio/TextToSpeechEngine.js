import {
  TEXT_TO_SPEECH_DEFAULTS,
  TEXT_TO_SPEECH_DISPLAY_NAME,
  TEXT_TO_SPEECH_RANGE_DEFAULTS
} from "./TextToSpeechDefaults.js";

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function boundedNumber(value, { fallback, max, min }) {
  return Math.min(max, Math.max(min, finiteNumber(value, fallback)));
}

class TextToSpeechEngine {
  constructor({
    speechSynthesisRef = globalThis.speechSynthesis,
    utteranceCtor = globalThis.SpeechSynthesisUtterance
  } = {}) {
    this.activeSpeakers = new Map();
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

  activeSpeakerList() {
    return Array.from(this.activeSpeakers.values()).map((speaker) => ({ ...speaker }));
  }

  createUtterance({
    language = TEXT_TO_SPEECH_DEFAULTS.language,
    pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
    rate = TEXT_TO_SPEECH_DEFAULTS.rate,
    text = TEXT_TO_SPEECH_DEFAULTS.sampleText,
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
    autoSpeak = TEXT_TO_SPEECH_DEFAULTS.autoSpeak,
    characterPreset = TEXT_TO_SPEECH_DEFAULTS.characterPreset,
    gender = TEXT_TO_SPEECH_DEFAULTS.gender,
    language = TEXT_TO_SPEECH_DEFAULTS.language,
    pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
    queueMode = TEXT_TO_SPEECH_DEFAULTS.queueMode,
    rate = TEXT_TO_SPEECH_DEFAULTS.rate,
    speakerId = "",
    speakerName = "",
    ssmlLikePreset = TEXT_TO_SPEECH_DEFAULTS.ssmlLikePreset,
    text = TEXT_TO_SPEECH_DEFAULTS.sampleText,
    voice = TEXT_TO_SPEECH_DEFAULTS.voice,
    voiceAge = TEXT_TO_SPEECH_DEFAULTS.voiceAge,
    volume = TEXT_TO_SPEECH_DEFAULTS.volume
  } = {}) {
    const firstUtterance = this.createUtterance({ language, pitch, rate, text, voice, volume });
    if (!firstUtterance.ok) {
      return firstUtterance;
    }

    if (queueMode !== "append" && queueMode !== "replace") {
      return { message: `Unsupported ${TEXT_TO_SPEECH_DISPLAY_NAME} queueMode: ${queueMode}.`, ok: false };
    }

    const activeSpeakerId = String(speakerId || speakerName || `speaker-${Date.now().toString(36)}`);
    const activeSpeakerName = String(speakerName || activeSpeakerId);
    const activeSpeaker = {
      id: activeSpeakerId,
      language: firstUtterance.utterance.lang,
      name: activeSpeakerName,
      pitch: firstUtterance.utterance.pitch,
      queueMode,
      rate: firstUtterance.utterance.rate,
      status: "queued",
      text: firstUtterance.text,
      voiceName: firstUtterance.voiceName,
      voiceURI: firstUtterance.voiceURI,
      volume: firstUtterance.utterance.volume
    };
    firstUtterance.utterance.onstart = () => {
      const speaker = this.activeSpeakers.get(activeSpeakerId);
      if (speaker) {
        this.activeSpeakers.set(activeSpeakerId, { ...speaker, status: "speaking" });
      }
    };
    const clearSpeaker = () => {
      this.activeSpeakers.delete(activeSpeakerId);
    };
    firstUtterance.utterance.onend = clearSpeaker;
    firstUtterance.utterance.onerror = clearSpeaker;
    this.activeSpeakers.set(activeSpeakerId, activeSpeaker);
    this.speechSynthesis.speak(firstUtterance.utterance);

    return {
      activeSpeakers: this.activeSpeakerList(),
      autoSpeak: autoSpeak === true,
      characterPreset,
      gender,
      language: firstUtterance.utterance.lang,
      ok: true,
      pitch: firstUtterance.utterance.pitch,
      queueMode,
      rate: firstUtterance.utterance.rate,
      speakerId: activeSpeakerId,
      speakerName: activeSpeakerName,
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

  stop({ speakerId = "" } = {}) {
    if (!this.isSupported()) {
      return { message: "SpeechSynthesis is unavailable in this browser.", ok: false };
    }
    const selectedSpeakerId = String(speakerId || "");
    const speaker = selectedSpeakerId
      ? this.activeSpeakers.get(selectedSpeakerId)
      : this.activeSpeakerList()[0];
    if (!speaker) {
      return { message: `No active ${TEXT_TO_SPEECH_DISPLAY_NAME} speaker is tracked for ${selectedSpeakerId || "the current selection"}.`, ok: false };
    }
    if (this.activeSpeakers.size > 1) {
      return {
        activeSpeakers: this.activeSpeakerList(),
        message: `Cannot stop only ${speaker.name}: browser SpeechSynthesis exposes global cancel only. No global cancel was called while other speakers are active.`,
        ok: false
      };
    }
    this.speechSynthesis.cancel();
    this.activeSpeakers.delete(speaker.id);
    return { activeSpeakers: this.activeSpeakerList(), ok: true, speakerName: speaker.name };
  }

  stopAll() {
    if (!this.isSupported()) {
      return { message: "SpeechSynthesis is unavailable in this browser.", ok: false };
    }
    const stoppedCount = this.activeSpeakers.size;
    this.speechSynthesis.cancel();
    this.activeSpeakers.clear();
    return { ok: true, stoppedCount };
  }

  resetActiveSpeakers() {
    this.activeSpeakers.clear();
    return { ok: true };
  }
}

export { TextToSpeechEngine };
export default TextToSpeechEngine;
