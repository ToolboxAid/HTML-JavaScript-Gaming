const TOOL_ID = "audio-sfx-playground-v2";
const PAYLOAD_SCHEMA = "html-js-gaming.audio-sfx-playground-v2";
const TOOL_SCHEMA_PATH = "tools/schemas/tools/audio-sfx-playground-v2.schema.json";
const ALLOWED_WAVEFORMS = Object.freeze(new Set(["sine", "square", "triangle", "sawtooth"]));
const ROOT_KEYS = Object.freeze(new Set(["$schema", "schema", "version", "toolId", "payload"]));
const PAYLOAD_KEYS = Object.freeze(new Set(["schema", "version", "toolId", "activeSoundId", "sounds"]));
const SOUND_ENTRY_KEYS = Object.freeze(new Set(["id", "sound"]));
const SOUND_KEYS = Object.freeze(new Set([
  "attackMs",
  "durationMs",
  "frequencyHz",
  "name",
  "noise",
  "noiseAmount",
  "noiseDecayMs",
  "noiseFilterHz",
  "pitchSweepCents",
  "releaseMs",
  "volume",
  "waveform"
]));

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSoundName(name) {
  return name.trim().toLowerCase();
}

function serializeSound(sound) {
  return {
    attackMs: sound.attackMs,
    durationMs: sound.durationMs,
    frequencyHz: sound.frequencyHz,
    name: sound.name,
    noise: sound.noise,
    noiseAmount: sound.noiseAmount,
    noiseDecayMs: sound.noiseDecayMs,
    noiseFilterHz: sound.noiseFilterHz,
    pitchSweepCents: sound.pitchSweepCents,
    releaseMs: sound.releaseMs,
    volume: sound.volume,
    waveform: sound.waveform
  };
}

function readAllowedKeys(value, allowedKeys, label) {
  const unknownKey = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unknownKey) {
    return { ok: false, message: `${label}.${unknownKey} is not allowed.` };
  }
  return { ok: true };
}

function readNumber(value, label, min, max, multipleOf = null) {
  if (!Number.isFinite(value) || value < min || value > max) {
    return { ok: false, message: `${label} must be a number between ${min} and ${max}.` };
  }
  if (multipleOf !== null && value % multipleOf !== 0) {
    return { ok: false, message: `${label} must use ${multipleOf} increments.` };
  }
  return { ok: true, value };
}

function readSound(value, label) {
  if (!isPlainObject(value)) {
    return { ok: false, message: `${label} must be an object.` };
  }
  const allowedKeys = readAllowedKeys(value, SOUND_KEYS, label);
  if (!allowedKeys.ok) {
    return allowedKeys;
  }
  if (typeof value.name !== "string" || !value.name.trim()) {
    return { ok: false, message: `${label}.name is required.` };
  }
  if (!ALLOWED_WAVEFORMS.has(value.waveform)) {
    return { ok: false, message: `${label}.waveform is unsupported.` };
  }
  if (typeof value.noise !== "boolean") {
    return { ok: false, message: `${label}.noise must be boolean.` };
  }

  const attack = readNumber(value.attackMs, `${label}.attackMs`, 0, 250);
  const duration = readNumber(value.durationMs, `${label}.durationMs`, 60, 2000, 5);
  const frequency = readNumber(value.frequencyHz, `${label}.frequencyHz`, 80, 1800);
  const noiseAmount = readNumber(value.noiseAmount, `${label}.noiseAmount`, 0, 1);
  const noiseDecay = readNumber(value.noiseDecayMs, `${label}.noiseDecayMs`, 20, 600, 5);
  const noiseFilter = readNumber(value.noiseFilterHz, `${label}.noiseFilterHz`, 400, 9000, 50);
  const pitchSweep = readNumber(value.pitchSweepCents, `${label}.pitchSweepCents`, -1200, 1200, 5);
  const release = readNumber(value.releaseMs, `${label}.releaseMs`, 20, 700, 5);
  const volume = readNumber(value.volume, `${label}.volume`, 0, 1);
  const failed = [attack, duration, frequency, noiseAmount, noiseDecay, noiseFilter, pitchSweep, release, volume].find((result) => !result.ok);
  if (failed) {
    return failed;
  }
  if (attack.value + release.value > duration.value) {
    return { ok: false, message: `${label} attack and release must fit inside duration.` };
  }

  return {
    ok: true,
    value: {
      attackMs: Math.round(attack.value),
      durationMs: Math.round(duration.value),
      frequencyHz: Math.round(frequency.value),
      name: value.name.trim(),
      noise: value.noise,
      noiseAmount: Number(noiseAmount.value.toFixed(2)),
      noiseDecayMs: Math.round(noiseDecay.value),
      noiseFilterHz: Math.round(noiseFilter.value),
      pitchSweepCents: Math.round(pitchSweep.value),
      releaseMs: Math.round(release.value),
      volume: Number(volume.value.toFixed(2)),
      waveform: value.waveform
    }
  };
}

function readSoundEntries(value) {
  if (!Array.isArray(value)) {
    return { ok: false, message: "payload.sounds must be an array." };
  }
  const soundEntries = [];
  const ids = new Set();
  const names = new Set();
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    if (!isPlainObject(item)) {
      return { ok: false, message: `payload.sounds[${index}] must be an object.` };
    }
    const allowedKeys = readAllowedKeys(item, SOUND_ENTRY_KEYS, `payload.sounds[${index}]`);
    if (!allowedKeys.ok) {
      return allowedKeys;
    }
    if (typeof item.id !== "string" || !item.id.trim()) {
      return { ok: false, message: `payload.sounds[${index}].id is required.` };
    }
    if (ids.has(item.id)) {
      return { ok: false, message: `Duplicate sound id: ${item.id}.` };
    }
    const sound = readSound(item.sound, `payload.sounds[${index}].sound`);
    if (!sound.ok) {
      return sound;
    }
    const normalizedName = normalizeSoundName(sound.value.name);
    if (names.has(normalizedName)) {
      return { ok: false, message: `Duplicate sound name: ${sound.value.name}.` };
    }
    ids.add(item.id);
    names.add(normalizedName);
    soundEntries.push({
      id: item.id,
      sound: sound.value
    });
  }
  return { ok: true, value: soundEntries };
}

export class ToolStateSerializer {
  createToolState({ activeSoundId, soundEntries }) {
    const sounds = soundEntries.map((entry) => ({
      id: entry.id,
      sound: serializeSound(entry.sound)
    }));
    const selectedActiveSoundId = sounds.some((entry) => entry.id === activeSoundId)
      ? activeSoundId
      : "";
    return {
      $schema: TOOL_SCHEMA_PATH,
      schema: "html-js-gaming.tool-state",
      version: 1,
      toolId: TOOL_ID,
      payload: {
        schema: PAYLOAD_SCHEMA,
        version: 1,
        toolId: TOOL_ID,
        activeSoundId: selectedActiveSoundId,
        sounds
      }
    };
  }

  readToolState(value) {
    if (!isPlainObject(value)) {
      return { valid: false, message: "Imported JSON must be an object." };
    }
    const rootKeys = readAllowedKeys(value, ROOT_KEYS, "Imported JSON");
    if (!rootKeys.ok) {
      return { valid: false, message: rootKeys.message };
    }
    if (value.$schema !== TOOL_SCHEMA_PATH) {
      return { valid: false, message: `Imported JSON $schema must be ${TOOL_SCHEMA_PATH}.` };
    }
    if (value.schema !== "html-js-gaming.tool-state") {
      return { valid: false, message: "Imported JSON schema must be html-js-gaming.tool-state." };
    }
    if (!Number.isInteger(value.version) || value.version < 1) {
      return { valid: false, message: "Imported JSON version must be an integer greater than or equal to 1." };
    }
    if (value.toolId !== TOOL_ID) {
      return { valid: false, message: `Imported JSON toolId must be ${TOOL_ID}.` };
    }
    if (!isPlainObject(value.payload)) {
      return { valid: false, message: "Imported JSON payload must be an object." };
    }
    const payloadKeys = readAllowedKeys(value.payload, PAYLOAD_KEYS, "payload");
    if (!payloadKeys.ok) {
      return { valid: false, message: payloadKeys.message };
    }
    if (value.payload.schema !== PAYLOAD_SCHEMA || value.payload.toolId !== TOOL_ID) {
      return { valid: false, message: "Imported JSON payload is not for Audio / SFX Playground V2." };
    }
    if (!Number.isInteger(value.payload.version) || value.payload.version < 1) {
      return { valid: false, message: "Imported JSON payload.version must be an integer greater than or equal to 1." };
    }

    const soundEntries = readSoundEntries(value.payload.sounds);
    if (!soundEntries.ok) {
      return { valid: false, message: soundEntries.message };
    }
    if (soundEntries.value.length === 0) {
      return { valid: false, message: "payload.sounds must include at least one saved sound." };
    }
    const activeSoundId = typeof value.payload.activeSoundId === "string"
      ? value.payload.activeSoundId.trim()
      : "";
    if (!activeSoundId) {
      return { valid: false, message: "Active sound id is required." };
    }
    const activeEntry = soundEntries.value.find((entry) => entry.id === activeSoundId);
    if (!activeEntry) {
      return { valid: false, message: `Active sound id is missing from payload.sounds: ${activeSoundId}.` };
    }
    return {
      valid: true,
      value: {
        activeSoundId,
        sound: activeEntry.sound,
        soundEntries: soundEntries.value
      }
    };
  }
}
