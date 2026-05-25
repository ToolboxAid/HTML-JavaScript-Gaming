const TOOL_ID = "audio-sfx-playground-v2";
const PAYLOAD_SCHEMA = "html-js-gaming.audio-sfx-playground-v2";

function serializeSound(sound) {
  return {
    attackMs: sound.attackMs,
    durationMs: sound.durationMs,
    frequencyHz: sound.frequencyHz,
    name: sound.name,
    noise: sound.noise,
    pitchSweepCents: sound.pitchSweepCents,
    releaseMs: sound.releaseMs,
    volume: sound.volume,
    waveform: sound.waveform
  };
}

export class ToolStateSerializer {
  createToolState({ activeSoundId, sound, soundEntries }) {
    return {
      schema: "html-js-gaming.tool-state",
      version: 1,
      toolId: TOOL_ID,
      payload: {
        schema: PAYLOAD_SCHEMA,
        version: 1,
        toolId: TOOL_ID,
        activeSoundId,
        name: sound.name,
        sound: serializeSound(sound),
        sounds: soundEntries.map((entry) => ({
          id: entry.id,
          name: entry.sound.name,
          sound: serializeSound(entry.sound)
        }))
      }
    };
  }
}
