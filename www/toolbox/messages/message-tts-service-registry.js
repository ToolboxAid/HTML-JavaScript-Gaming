import { TextToSpeechEngine } from "../../../src/engine/audio/TextToSpeechEngine.js";

const BROWSER_SPEECH_SYNTHESIS_SERVICE_KEY = "browser-speech-synthesis";

function createMessageStudioTtsServiceRegistry({
  engine = new TextToSpeechEngine(),
} = {}) {
  function browserService() {
    const available = engine.isSupported();
    return {
      available,
      key: BROWSER_SPEECH_SYNTHESIS_SERVICE_KEY,
      name: "Browser Speech Synthesis",
      unavailableMessage: available ? "" : "Browser Speech Synthesis is unavailable in this browser.",
    };
  }

  return {
    listServices() {
      return [browserService()];
    },

    onServicesChanged(callback) {
      return engine.onVoicesChanged(callback);
    },

    speak(serviceKey, options) {
      if (serviceKey !== BROWSER_SPEECH_SYNTHESIS_SERVICE_KEY) {
        return {
          message: "Selected TTS service is not available for Message Studio speech tests.",
          ok: false,
        };
      }
      const selectedVoice = String(options?.voice || "").trim()
        || engine.voiceOptions()[0]?.value
        || "";
      return engine.speak({
        ...options,
        voice: selectedVoice,
      });
    },

    stop() {
      return engine.stop();
    },
  };
}

export {
  BROWSER_SPEECH_SYNTHESIS_SERVICE_KEY,
  createMessageStudioTtsServiceRegistry,
};
