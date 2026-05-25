const TOOL_ID = "audio-sfx-playground-v2";
const PAYLOAD_SCHEMA = "html-js-gaming.audio-sfx-playground-v2";

export class ToolStateSerializer {
  createToolState(sound) {
    return {
      schema: "html-js-gaming.tool-state",
      version: 1,
      toolId: TOOL_ID,
      payload: {
        schema: PAYLOAD_SCHEMA,
        version: 1,
        toolId: TOOL_ID,
        name: sound.name,
        sound: {
          attackMs: sound.attackMs,
          durationMs: sound.durationMs,
          frequencyHz: sound.frequencyHz,
          noise: sound.noise,
          pitchSweepCents: sound.pitchSweepCents,
          presetId: sound.presetId,
          releaseMs: sound.releaseMs,
          volume: sound.volume,
          waveform: sound.waveform
        }
      }
    };
  }
}
