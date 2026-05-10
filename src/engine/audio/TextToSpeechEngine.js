import { TEXT_TO_SPEECH_DEFAULTS } from "./TextToSpeechDefaults.js";

class TextToSpeechEngine {
  constructor({
    speechSynthesisRef = globalThis.speechSynthesis,
    utteranceCtor = globalThis.SpeechSynthesisUtterance
  } = {}) {
    this.speechSynthesis = speechSynthesisRef;
    this.Utterance = utteranceCtor;
  }

  isSupported() {
    return Boolean(this.speechSynthesis
      && typeof this.speechSynthesis.speak === "function"
      && typeof this.Utterance === "function");
  }

  voices() {
    if (!this.speechSynthesis || typeof this.speechSynthesis.getVoices !== "function") {
      return [];
    }
    return this.speechSynthesis.getVoices();
  }

  voiceForLanguage(language) {
    const normalizedLanguage = String(language || "").trim();
    return this.voices().find((voice) => voice?.lang === normalizedLanguage) || null;
  }

  speak({
    language = TEXT_TO_SPEECH_DEFAULTS.language,
    pitch = TEXT_TO_SPEECH_DEFAULTS.pitch,
    rate = TEXT_TO_SPEECH_DEFAULTS.rate,
    text = TEXT_TO_SPEECH_DEFAULTS.sampleText,
    volume = TEXT_TO_SPEECH_DEFAULTS.volume
  } = {}) {
    if (!this.isSupported()) {
      return { message: "SpeechSynthesis is unavailable in this browser.", ok: false };
    }

    const normalizedText = String(text || "").trim();
    if (!normalizedText) {
      return { message: "text2speach-V2 text is required before speaking.", ok: false };
    }

    const utterance = new this.Utterance(normalizedText);
    utterance.lang = String(language || TEXT_TO_SPEECH_DEFAULTS.language);
    utterance.pitch = Number(pitch);
    utterance.rate = Number(rate);
    utterance.volume = Number(volume);
    const voice = this.voiceForLanguage(utterance.lang);
    if (voice) {
      utterance.voice = voice;
    }
    this.speechSynthesis.cancel();
    this.speechSynthesis.speak(utterance);
    return {
      language: utterance.lang,
      ok: true,
      pitch: utterance.pitch,
      rate: utterance.rate,
      text: normalizedText,
      voiceName: voice?.name || "browser default",
      volume: utterance.volume
    };
  }

  stop() {
    if (!this.isSupported()) {
      return { message: "SpeechSynthesis is unavailable in this browser.", ok: false };
    }
    this.speechSynthesis.cancel();
    return { ok: true };
  }
}

export { TextToSpeechEngine };
export default TextToSpeechEngine;
