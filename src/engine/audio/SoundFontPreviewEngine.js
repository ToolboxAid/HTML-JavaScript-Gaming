import { previewInstrumentById } from "./PreviewInstrumentPacks.js";

const CHORD_TONES = {
  A: ["A", "C#", "E"],
  Am: ["A", "C", "E"],
  B: ["B", "D#", "F#"],
  Bm: ["B", "D", "F#"],
  C: ["C", "E", "G"],
  Cm: ["C", "Eb", "G"],
  D: ["D", "F#", "A"],
  Dm: ["D", "F", "A"],
  E: ["E", "G#", "B"],
  Em: ["E", "G", "B"],
  F: ["F", "A", "C"],
  Fm: ["F", "Ab", "C"],
  G: ["G", "B", "D"],
  Gm: ["G", "Bb", "D"]
};

const DRUM_FREQUENCIES = {
  clap: 920,
  crash: 1100,
  hat: 760,
  kick: 72,
  perc: 640,
  ride: 980,
  snare: 230,
  tom: 150
};

const DRUM_DURATIONS = {
  clap: 0.12,
  crash: 0.38,
  hat: 0.07,
  kick: 0.16,
  perc: 0.11,
  ride: 0.28,
  snare: 0.14,
  tom: 0.18
};

export const DEFAULT_SOUNDFONT_ASSET_ID = "midi-studio-embedded-general-midi";

export const DEFAULT_SOUNDFONT_ASSETS = [
  {
    description: "Embedded Web Audio SoundFont bank for MIDI Studio V2 playback and WAV rendering.",
    format: "embedded-web-audio-soundfont",
    id: DEFAULT_SOUNDFONT_ASSET_ID,
    label: "MIDI Studio Embedded GM SoundFont",
    patches: {
      bass: { attack: 0.006, decay: 0.08, release: 0.11, volume: 0.2, waveform: "triangle" },
      lead: { attack: 0.004, decay: 0.06, release: 0.09, volume: 0.16, waveform: "sawtooth" },
      pad: { attack: 0.08, decay: 0.16, release: 0.34, volume: 0.12, waveform: "sine" },
      percussion: { attack: 0.002, decay: 0.08, release: 0.04, volume: 0.28, waveform: "noise" },
      piano: { attack: 0.003, decay: 0.18, release: 0.16, volume: 0.15, waveform: "sine" }
    }
  }
];

function audioContextCtor(windowRef) {
  return windowRef?.AudioContext || windowRef?.webkitAudioContext || null;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampNumber(value, min, max, fallback) {
  return Math.max(min, Math.min(max, finiteNumber(value, fallback)));
}

function noteFrequency(noteName) {
  const match = String(noteName || "").trim().match(/^([A-G])(#|b)?([0-8])$/);
  if (!match) {
    return null;
  }
  const offsets = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  const accidental = match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0;
  const semitonesFromA4 = offsets[match[1]] + accidental + (Number(match[3]) - 4) * 12;
  return 440 * (2 ** (semitonesFromA4 / 12));
}

function chordNotes(chordName) {
  const tones = CHORD_TONES[String(chordName || "").trim()];
  return tones ? tones.map((tone) => `${tone}4`) : [];
}

function normalizedEffects(laneSettings = {}, lane = "") {
  const effects = laneSettings.effects?.[lane] || {};
  return {
    brightnessTone: clampNumber(effects.brightnessTone, 0, 1, 0),
    chorus: clampNumber(effects.chorus, 0, 1, 0),
    delay: clampNumber(effects.delay, 0, 1, 0),
    filter: clampNumber(effects.filter, 0, 1, 0),
    reverb: clampNumber(effects.reverb, 0, 1, 0)
  };
}

function roleForInstrument(instrument = {}) {
  if (instrument.synthRole === "percussion") {
    return "percussion";
  }
  if (instrument.synthRole === "bass") {
    return "bass";
  }
  if (instrument.synthRole === "pad") {
    return "pad";
  }
  if (String(instrument.typeGroup || "").toLowerCase().includes("piano")) {
    return "piano";
  }
  return "lead";
}

function makeWavBlob(windowRef, samples, sampleRate) {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);
  let offset = 44;
  samples.forEach((sample) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += bytesPerSample;
  });
  return new windowRef.Blob([buffer], { type: "audio/wav" });
}

function writeAscii(view, offset, value) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

export class SoundFontPreviewEngine {
  constructor({ assets = DEFAULT_SOUNDFONT_ASSETS, windowRef = globalThis } = {}) {
    this.assets = assets;
    this.assetStates = new Map();
    this.context = null;
    this.lastError = "";
    this.lastPlayback = null;
    this.loopTimer = null;
    this.nodes = [];
    this.playing = false;
    this.selectedAssetId = assets[0]?.id || "";
    this.statusKind = this.validateAsset(this.selectedAssetId).ok ? "loaded" : "failed";
    this.window = windowRef;
    this.assets.forEach((asset) => {
      const validation = this.validateAsset(asset.id);
      this.assetStates.set(asset.id, {
        message: validation.ok ? `${asset.label} loaded.` : validation.message,
        status: validation.ok ? "loaded" : "failed"
      });
    });
  }

  listAssets() {
    return this.assets.map((asset) => ({
      description: asset.description || "",
      format: asset.format || "embedded",
      id: asset.id,
      label: asset.label
    }));
  }

  selectAsset(assetId) {
    const selected = String(assetId || this.selectedAssetId || DEFAULT_SOUNDFONT_ASSET_ID).trim();
    const validation = this.validateAsset(selected);
    if (!validation.ok) {
      this.statusKind = "failed";
      this.lastError = validation.message;
      return { ...validation, status: this.status(selected) };
    }
    this.selectedAssetId = selected;
    this.assetStates.set(selected, {
      message: `${validation.asset.label} loaded.`,
      status: "loaded"
    });
    this.statusKind = "loaded";
    this.lastError = "";
    return { ok: true, status: this.status(selected) };
  }

  validateAsset(assetId = this.selectedAssetId) {
    const asset = this.assets.find((candidate) => candidate.id === assetId) || null;
    if (!asset) {
      return {
        message: `SoundFont asset ${assetId || "(missing)"} is unavailable. Choose a configured SoundFont asset in Export settings.`,
        ok: false,
        reason: "missing-soundfont-asset"
      };
    }
    if (!asset.patches || !Object.keys(asset.patches).length) {
      return {
        message: `SoundFont asset ${asset.label} has no playable instrument patches.`,
        ok: false,
        reason: "empty-soundfont-asset"
      };
    }
    return { asset, ok: true };
  }

  status(assetId = this.selectedAssetId) {
    const validation = this.validateAsset(assetId);
    if (!validation.ok) {
      return {
        assetId,
        available: false,
        label: "SoundFont Preview",
        level: "FAIL",
        message: validation.message,
        status: "failed"
      };
    }
    const state = this.assetStates.get(assetId) || {
      message: `${validation.asset.label} loaded.`,
      status: "loaded"
    };
    const contextAvailable = Boolean(audioContextCtor(this.window));
    const playbackStatus = contextAvailable ? state.status : "unavailable";
    const message = contextAvailable
      ? `${validation.asset.label} ${state.status}. SoundFont playback and WAV rendering are available.`
      : `${validation.asset.label} loaded, but Web Audio AudioContext is unavailable for playback. WAV rendering remains available.`;
    return {
      assetId,
      assetLabel: validation.asset.label,
      available: contextAvailable && state.status === "loaded",
      label: "SoundFont Preview",
      level: contextAvailable && state.status === "loaded" ? "PASS" : "WARN",
      message,
      status: playbackStatus
    };
  }

  async ensureContext(assetId = this.selectedAssetId) {
    const validation = this.selectAsset(assetId);
    if (!validation.ok) {
      return this.fail(validation.status.message, validation.status.status);
    }
    const AudioContextCtor = audioContextCtor(this.window);
    if (!AudioContextCtor) {
      return this.fail("SoundFont playback unavailable: Web Audio AudioContext is not available. Use a browser with Web Audio support.", "unavailable");
    }
    try {
      this.context = this.context || new AudioContextCtor();
      if (typeof this.context.resume === "function") {
        await this.context.resume();
      }
      if (this.context.state === "suspended") {
        return this.fail("SoundFont playback is still suspended after the play gesture. Click Play again and check browser audio permissions.", "failed");
      }
      return { context: this.context, ok: true };
    } catch (error) {
      return this.fail(`SoundFont playback could not start: ${error.message || "browser audio permission blocked playback"}.`, "failed");
    }
  }

  async playGridRange({ assetId = this.selectedAssetId, endStep, grid, label, laneSettings = {}, loop = false, mode = "section", startStep, tempoBpm = 120 } = {}) {
    this.stop();
    if (!grid?.ok) {
      return this.fail("SoundFont playback needs a normalized instrument grid before playback.", "failed");
    }
    const contextResult = await this.ensureContext(assetId);
    if (!contextResult.ok) {
      return contextResult;
    }
    const playable = this.playableEventsForRange(grid, startStep, endStep, laneSettings);
    if (!playable.events.length) {
      return this.fail(
        `No playable SoundFont notes found for ${mode} ${label || "(unnamed)"}. Generate or enter chords, bass, pad, lead, or drum cells before playing.`,
        "failed",
        { warnings: playable.warnings }
      );
    }
    const safeTempo = Number.isFinite(Number(tempoBpm)) && Number(tempoBpm) > 0 ? Number(tempoBpm) : 120;
    const secondsPerBeat = 60 / safeTempo;
    const secondsPerStep = secondsPerBeat / grid.subdivision;
    const cycleSeconds = Math.max((endStep - startStep + 1) * secondsPerStep, secondsPerStep);
    this.playing = true;
    this.scheduleEvents({ context: contextResult.context, events: playable.events, secondsPerBeat, secondsPerStep, startStep });
    if (loop) {
      this.loopTimer = this.window.setInterval(() => {
        this.scheduleEvents({ context: contextResult.context, events: playable.events, secondsPerBeat, secondsPerStep, startStep });
      }, cycleSeconds * 1000);
    }
    this.lastError = "";
    this.lastPlayback = {
      activeLanes: playable.activeLanes,
      assetId,
      eventCount: playable.events.length,
      label,
      mode
    };
    this.logEvent("play-start", { assetId, eventCount: playable.events.length, label, loop, mode });
    return {
      activeLanes: playable.activeLanes,
      eventCount: playable.events.length,
      label,
      mode,
      ok: true,
      soundFontPlayback: true,
      synthName: "SoundFont Preview",
      warnings: playable.warnings
    };
  }

  async previewInstrument({ assetId = this.selectedAssetId, instrumentId, label = "", lane = "", laneSettings = {} } = {}) {
    const contextResult = await this.ensureContext(assetId);
    if (!contextResult.ok) {
      return contextResult;
    }
    const instrument = previewInstrumentById(instrumentId);
    if (!instrument) {
      return this.fail(`Missing SoundFont instrument mapping for ${label || lane || "instrument"}. Choose an instrument before auditioning.`, "failed");
    }
    const adjustedInstrument = this.instrumentWithLaneSettings(instrument, lane, laneSettings);
    const event = {
      durationBeats: adjustedInstrument.role === "pad" ? 0.5 : 0.25,
      kind: adjustedInstrument.role === "percussion" ? "drum" : "note",
      lane,
      previewInstrument: adjustedInstrument,
      stepIndex: 0,
      value: this.auditionValueForInstrument(adjustedInstrument)
    };
    const startTime = contextResult.context.currentTime + 0.01;
    if (event.kind === "drum") {
      this.scheduleDrumHit({ context: contextResult.context, event, startTime });
    } else {
      this.frequenciesForEvent(event, adjustedInstrument).forEach((frequency, index) => {
        this.scheduleSoundFontTone({
          context: contextResult.context,
          durationSeconds: 0.24 * Number(adjustedInstrument.durationScale || 1),
          event,
          frequency,
          startTime: startTime + index * 0.006
        });
      });
    }
    this.logEvent("instrument-audition", { instrumentId, label, lane });
    this.lastError = "";
    return {
      instrumentLabel: instrument.label,
      mappedPreviewInstrumentLabel: instrument.mappedPreviewInstrumentLabel || "",
      ok: true,
      warnings: instrument.approximationWarning ? [instrument.approximationWarning] : []
    };
  }

  auditionValueForInstrument(instrument) {
    if (instrument.role === "percussion") {
      return "kick";
    }
    if (instrument.role === "bass") {
      return "C2";
    }
    if (instrument.role === "pad") {
      return "C4";
    }
    return "C5";
  }

  playableEventsForRange(grid, startStep = 0, endStep = 0, laneSettings = {}) {
    const instruments = laneSettings.instruments || {};
    const muted = laneSettings.muted || {};
    const soloed = laneSettings.soloed || {};
    const visible = laneSettings.visible || {};
    const soloedLanes = Object.entries(soloed).filter((entry) => entry[1]).map(([lane]) => lane);
    const warnings = [];
    const warningKeys = new Set();
    const events = [];
    (grid.timeline || []).forEach((event) => {
      const stepIndex = Number(event.stepIndex);
      if (!Number.isFinite(stepIndex) || stepIndex < startStep || stepIndex > endStep) {
        return;
      }
      if (visible[event.lane] === false) {
        return;
      }
      if (muted[event.lane] || (soloedLanes.length && !soloedLanes.includes(event.lane))) {
        return;
      }
      const instrumentId = String(instruments[event.lane] || "").trim();
      const instrument = previewInstrumentById(instrumentId);
      if (!instrument) {
        const key = `missing:${event.lane}`;
        if (!warningKeys.has(key)) {
          warnings.push(`Missing SoundFont instrument mapping for ${event.lane}. Choose an instrument before playback.`);
          warningKeys.add(key);
        }
        return;
      }
      const adjustedEvent = this.eventWithLaneSettings(event, laneSettings);
      const adjustedInstrument = this.instrumentWithLaneSettings(instrument, event.lane, laneSettings);
      if (this.canScheduleEvent(adjustedEvent, adjustedInstrument)) {
        events.push({ ...adjustedEvent, previewInstrument: adjustedInstrument });
      }
    });
    return {
      activeLanes: Array.from(new Set(events.map((event) => event.lane))),
      events,
      warnings
    };
  }

  instrumentWithLaneSettings(instrument, lane, laneSettings = {}) {
    const validation = this.validateAsset(this.selectedAssetId);
    const asset = validation.asset || DEFAULT_SOUNDFONT_ASSETS[0];
    const role = roleForInstrument(instrument);
    const patch = asset.patches[role] || asset.patches.lead || {};
    const effects = normalizedEffects(laneSettings, lane);
    const laneVolume = clampNumber(laneSettings.volumes?.[lane], 0, 1, 1);
    const velocityScale = clampNumber(laneSettings.velocities?.[lane], 1, 127, 100) / 100;
    const transpose = clampNumber(laneSettings.transposes?.[lane], -24, 24, 0);
    const pan = clampNumber(laneSettings.pans?.[lane], -1, 1, 0);
    const brightnessGain = 1 + effects.brightnessTone * 0.22;
    const filterDamping = 1 - effects.filter * 0.24;
    const ambienceLift = 1 + (effects.chorus + effects.delay + effects.reverb) * 0.05;
    return {
      ...instrument,
      attack: patch.attack ?? 0.006,
      decay: patch.decay ?? 0.08,
      durationScale: finiteNumber(instrument.durationScale, 1) * (1 + effects.reverb * 0.2 + effects.delay * 0.12 + effects.chorus * 0.08),
      effects,
      pan,
      patchLabel: `${asset.label} ${role}`,
      release: patch.release ?? 0.1,
      role,
      transposeSemitones: finiteNumber(instrument.transposeSemitones, 0) + transpose,
      volumeOverride: Math.max(0, finiteNumber(patch.volume, 0.14) * laneVolume * velocityScale * brightnessGain * filterDamping * ambienceLift),
      waveformOverride: this.waveformWithEffects(patch.waveform || instrument.waveform || "sine", effects)
    };
  }

  waveformWithEffects(baseWaveform = "sine", effects = {}) {
    if (effects.filter >= 0.7) {
      return "sine";
    }
    if (effects.brightnessTone >= 0.65) {
      return "sawtooth";
    }
    if (effects.chorus >= 0.75) {
      return "triangle";
    }
    return baseWaveform || "sine";
  }

  eventWithLaneSettings(event, laneSettings = {}) {
    const durationScale = clampNumber(laneSettings.durations?.[event.lane], 0.1, 8, 1);
    return {
      ...event,
      durationBeats: Math.max(0.05, finiteNumber(event.durationBeats, 1) * durationScale)
    };
  }

  scheduleEvents({ context, events, secondsPerBeat, secondsPerStep, startStep }) {
    const now = context.currentTime;
    events.forEach((event) => {
      const offsetSeconds = Math.max(0, (event.stepIndex - startStep) * secondsPerStep);
      const instrument = event.previewInstrument;
      if (event.kind === "drum") {
        this.scheduleDrumHit({ context, event, startTime: now + offsetSeconds });
        return;
      }
      const durationSeconds = Math.max(0.06, Number(event.durationBeats || 1) * secondsPerBeat * 0.84 * Number(instrument?.durationScale || 1));
      this.frequenciesForEvent(event, instrument).forEach((frequency, index) => {
        this.scheduleSoundFontTone({
          context,
          durationSeconds,
          event,
          frequency,
          startTime: now + offsetSeconds + index * 0.006
        });
      });
    });
  }

  scheduleSoundFontTone({ context, durationSeconds, event, frequency, startTime }) {
    const instrument = event.previewInstrument || {};
    this.scheduleOscillatorTone({ context, durationSeconds, event, frequency, gainScale: 1, startTime });
    if (instrument.effects?.chorus > 0.05) {
      this.scheduleOscillatorTone({
        context,
        durationSeconds,
        event,
        frequency: frequency * (1 + instrument.effects.chorus * 0.004),
        gainScale: Math.min(0.45, instrument.effects.chorus * 0.35),
        startTime: startTime + 0.012
      });
    }
    if (instrument.effects?.delay > 0.05) {
      this.scheduleOscillatorTone({
        context,
        durationSeconds: durationSeconds * 0.72,
        event,
        frequency,
        gainScale: Math.min(0.38, instrument.effects.delay * 0.32),
        startTime: startTime + 0.14
      });
    }
  }

  scheduleOscillatorTone({ context, durationSeconds, event, frequency, gainScale = 1, startTime }) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const instrument = event.previewInstrument || {};
    const waveform = this.waveformForEvent(event, instrument);
    const volume = this.volumeForEvent(event, instrument) * gainScale;
    const attack = Math.min(durationSeconds * 0.4, finiteNumber(instrument.attack, 0.006));
    const release = Math.min(durationSeconds * 0.45, finiteNumber(instrument.release, 0.1) * (1 + finiteNumber(instrument.effects?.reverb, 0)));
    const endTime = startTime + durationSeconds;
    oscillator.type = waveform === "noise" ? "square" : waveform;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attack);
    gainNode.gain.setValueAtTime(volume * (1 - Math.min(0.5, finiteNumber(instrument.decay, 0.08))), Math.max(startTime + attack, endTime - release));
    gainNode.gain.linearRampToValueAtTime(0.0001, endTime);
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime);
    this.nodes.push({ gainNode, source: oscillator });
    this.logEvent("oscillator-start", { frequency, lane: event.lane, startTime, waveform });
  }

  scheduleDrumHit({ context, event, startTime }) {
    const drumName = String(event.value || "").toLowerCase();
    const durationSeconds = DRUM_DURATIONS[drumName] || 0.12;
    if (typeof context.createBuffer !== "function" || typeof context.createBufferSource !== "function") {
      const frequency = DRUM_FREQUENCIES[drumName];
      if (frequency) {
        this.scheduleSoundFontTone({ context, durationSeconds, event, frequency, startTime });
      }
      return;
    }
    const sampleRate = Number(context.sampleRate || 44100);
    const frameCount = Math.max(1, Math.floor(sampleRate * durationSeconds));
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) {
      const decay = 1 - (index / frameCount);
      const tone = Math.sin((index / sampleRate) * Math.PI * 2 * (DRUM_FREQUENCIES[drumName] || 260));
      samples[index] = tone * decay * decay * 0.7;
    }
    const source = context.createBufferSource();
    const gainNode = context.createGain();
    const volume = this.volumeForEvent(event, event.previewInstrument);
    source.buffer = buffer;
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.004);
    gainNode.gain.linearRampToValueAtTime(0.0001, startTime + durationSeconds);
    source.connect(gainNode);
    gainNode.connect(context.destination);
    source.start(startTime);
    source.stop(startTime + durationSeconds);
    this.nodes.push({ gainNode, source });
    this.logEvent("drum-start", { drumName, lane: event.lane, startTime });
  }

  renderAudio({ assetId = this.selectedAssetId, endStep, format = "wav", grid, label = "", laneSettings = {}, startStep, tempoBpm = 120 } = {}) {
    const normalizedFormat = String(format || "wav").trim().toLowerCase();
    const validation = this.selectAsset(assetId);
    if (!validation.ok) {
      return { ok: false, level: "FAIL", message: validation.status.message, reason: validation.status.status };
    }
    if (normalizedFormat !== "wav") {
      return {
        format: normalizedFormat,
        level: "FAIL",
        message: `SoundFont ${normalizedFormat.toUpperCase()} export requires an encoder that is not available in this browser build. Use Save WAV or export JSON; no ${normalizedFormat.toUpperCase()} file was created.`,
        ok: false,
        reason: "encoder-unavailable"
      };
    }
    if (!grid?.ok) {
      return { ok: false, level: "FAIL", message: "SoundFont WAV export needs a normalized instrument grid before rendering.", reason: "missing-grid" };
    }
    const playable = this.playableEventsForRange(grid, startStep, endStep, laneSettings);
    if (!playable.events.length) {
      return {
        ok: false,
        level: "FAIL",
        message: `No playable SoundFont notes found for WAV export ${label || "(unnamed)"}. Generate or enter notes before exporting.`,
        reason: "no-playable-notes"
      };
    }
    const safeTempo = Number.isFinite(Number(tempoBpm)) && Number(tempoBpm) > 0 ? Number(tempoBpm) : 120;
    const secondsPerBeat = 60 / safeTempo;
    const secondsPerStep = secondsPerBeat / grid.subdivision;
    const sampleRate = 44100;
    const durationSeconds = Math.max((endStep - startStep + 1) * secondsPerStep + 1, secondsPerStep);
    const samples = new Float32Array(Math.ceil(durationSeconds * sampleRate));
    playable.events.forEach((event) => {
      const startSeconds = Math.max(0, (event.stepIndex - startStep) * secondsPerStep);
      const duration = Math.max(0.06, Number(event.durationBeats || 1) * secondsPerBeat * 0.84 * Number(event.previewInstrument?.durationScale || 1));
      if (event.kind === "drum") {
        this.mixRenderedDrum(samples, sampleRate, event, startSeconds, duration);
        return;
      }
      this.frequenciesForEvent(event, event.previewInstrument).forEach((frequency, index) => {
        this.mixRenderedTone(samples, sampleRate, event, frequency, startSeconds + index * 0.006, duration, 1);
        if (event.previewInstrument?.effects?.chorus > 0.05) {
          this.mixRenderedTone(samples, sampleRate, event, frequency * (1 + event.previewInstrument.effects.chorus * 0.004), startSeconds + 0.012, duration, Math.min(0.45, event.previewInstrument.effects.chorus * 0.35));
        }
        if (event.previewInstrument?.effects?.delay > 0.05) {
          this.mixRenderedTone(samples, sampleRate, event, frequency, startSeconds + 0.14, duration * 0.72, Math.min(0.38, event.previewInstrument.effects.delay * 0.32));
        }
      });
    });
    const blob = makeWavBlob(this.window, samples, sampleRate);
    this.logEvent("render-wav", { durationSeconds, eventCount: playable.events.length, sampleRate });
    return {
      activeLanes: playable.activeLanes,
      blob,
      durationSeconds,
      eventCount: playable.events.length,
      format: "wav",
      level: "PASS",
      message: `SoundFont WAV render complete for ${label || "selected song"}: ${playable.events.length} event${playable.events.length === 1 ? "" : "s"}, ${durationSeconds.toFixed(2)} seconds.`,
      ok: true,
      sampleRate,
      warnings: playable.warnings
    };
  }

  mixRenderedTone(samples, sampleRate, event, frequency, startSeconds, durationSeconds, gainScale = 1) {
    const startIndex = Math.max(0, Math.floor(startSeconds * sampleRate));
    const frameCount = Math.max(1, Math.floor(durationSeconds * sampleRate));
    const instrument = event.previewInstrument || {};
    const volume = this.volumeForEvent(event, instrument) * gainScale;
    const waveform = this.waveformForEvent(event, instrument);
    for (let offset = 0; offset < frameCount && startIndex + offset < samples.length; offset += 1) {
      const progress = offset / frameCount;
      const time = offset / sampleRate;
      const envelope = progress < 0.08 ? progress / 0.08 : progress > 0.82 ? Math.max(0, (1 - progress) / 0.18) : 1;
      samples[startIndex + offset] += this.waveSample(waveform, frequency, time) * volume * envelope;
    }
  }

  mixRenderedDrum(samples, sampleRate, event, startSeconds, durationSeconds) {
    const startIndex = Math.max(0, Math.floor(startSeconds * sampleRate));
    const frameCount = Math.max(1, Math.floor(durationSeconds * sampleRate));
    const frequency = DRUM_FREQUENCIES[String(event.value || "").toLowerCase()] || 220;
    const volume = this.volumeForEvent(event, event.previewInstrument);
    for (let offset = 0; offset < frameCount && startIndex + offset < samples.length; offset += 1) {
      const progress = offset / frameCount;
      const decay = (1 - progress) * (1 - progress);
      const time = offset / sampleRate;
      samples[startIndex + offset] += Math.sin(time * Math.PI * 2 * frequency) * volume * decay;
    }
  }

  waveSample(waveform, frequency, time) {
    const phase = (time * frequency) % 1;
    if (waveform === "square") {
      return phase < 0.5 ? 1 : -1;
    }
    if (waveform === "sawtooth") {
      return 2 * phase - 1;
    }
    if (waveform === "triangle") {
      return 1 - 4 * Math.abs(Math.round(phase - 0.25) - (phase - 0.25));
    }
    return Math.sin(time * Math.PI * 2 * frequency);
  }

  canScheduleEvent(event, instrument = null) {
    if (event.kind === "drum") {
      return Boolean(DRUM_FREQUENCIES[String(event.value || "").toLowerCase()]);
    }
    return this.frequenciesForEvent(event, instrument).length > 0;
  }

  frequenciesForEvent(event, instrument = null) {
    const transposeFactor = 2 ** (Number(instrument?.transposeSemitones || 0) / 12);
    if (event.kind === "drum") {
      const frequency = DRUM_FREQUENCIES[String(event.value || "").toLowerCase()];
      return frequency ? [frequency * transposeFactor] : [];
    }
    if (event.kind === "chord") {
      return chordNotes(event.value).map((note) => noteFrequency(note)).filter(Boolean).map((frequency) => frequency * transposeFactor);
    }
    if (event.kind === "note") {
      const frequency = noteFrequency(event.value);
      return frequency ? [frequency * transposeFactor] : [];
    }
    return [];
  }

  waveformForEvent(event, instrument = null) {
    if (event.kind === "drum") {
      return event.value === "kick" || event.value === "tom" ? "sine" : instrument?.waveformOverride || "square";
    }
    return instrument?.waveformOverride || "sine";
  }

  volumeForEvent(event, instrument = null) {
    const fallbackVolume = event.kind === "chord" ? 0.12 : event.kind === "drum" ? 0.22 : 0.14;
    if (Number.isFinite(Number(instrument?.volumeOverride))) {
      return Math.max(0, Math.min(1, Number(instrument.volumeOverride)));
    }
    return fallbackVolume;
  }

  stop() {
    if (this.loopTimer) {
      this.window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    this.nodes.forEach(({ source, gainNode }) => {
      try {
        source.stop();
      } catch {
        // Already stopped or never started.
      }
      try {
        source.disconnect();
        gainNode.disconnect();
      } catch {
        // Some test doubles do not implement disconnect.
      }
    });
    const stoppedCount = this.nodes.length;
    this.nodes = [];
    this.playing = false;
    this.lastPlayback = null;
    if (stoppedCount) {
      this.logEvent("stop", { stoppedCount });
    }
    return stoppedCount;
  }

  getSnapshot() {
    const status = this.status(this.selectedAssetId);
    return {
      activeNodeCount: this.nodes.length,
      assetId: this.selectedAssetId,
      assetLabel: status.assetLabel || "none",
      audioContextState: this.context?.state || "not created",
      lastError: this.lastError || "none",
      lastPlayback: this.lastPlayback,
      loopActive: Boolean(this.loopTimer),
      playing: this.playing,
      status: status.status,
      supported: status.available
    };
  }

  fail(message, status = "failed", extra = {}) {
    this.lastError = message;
    this.lastPlayback = null;
    this.playing = false;
    this.statusKind = status;
    this.logEvent("fail", { message, status });
    return {
      message,
      ok: false,
      reason: status,
      status,
      ...extra
    };
  }

  logEvent(action, detail = {}) {
    if (Array.isArray(this.window.__midiStudioSoundFontEvents)) {
      this.window.__midiStudioSoundFontEvents.push({ action, ...detail });
    }
  }
}
