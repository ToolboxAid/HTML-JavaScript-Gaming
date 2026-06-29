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
  clap: 0.1,
  crash: 0.32,
  hat: 0.055,
  kick: 0.14,
  perc: 0.09,
  ride: 0.22,
  snare: 0.12,
  tom: 0.16
};

function audioContextCtor(windowRef) {
  return windowRef?.AudioContext || windowRef?.webkitAudioContext || null;
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

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampNumber(value, min, max, fallback) {
  return Math.max(min, Math.min(max, finiteNumber(value, fallback)));
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

export class PreviewSynthEngine {
  constructor({ windowRef = globalThis } = {}) {
    this.context = null;
    this.lastError = "";
    this.lastPlayback = null;
    this.loopTimer = null;
    this.nodes = [];
    this.playing = false;
    this.window = windowRef;
  }

  isSupported() {
    return Boolean(audioContextCtor(this.window));
  }

  async playGridRange({ endStep, grid, label, laneSettings = {}, loop = false, mode = "section", startStep, tempoBpm = 120 } = {}) {
    this.stop();
    if (!grid?.ok) {
      return this.fail("Preview Synth needs a normalized instrument grid before playback.", "missing-grid");
    }
    const contextResult = await this.ensureContext();
    if (!contextResult.ok) {
      return contextResult;
    }
    const playable = this.playableEventsForRange(grid, startStep, endStep, laneSettings);
    if (!playable.events.length) {
      return this.fail(
        `No playable Preview Synth notes found for ${mode} ${label || "(unnamed)"}. Generate or enter chords, bass, pad, lead, or drum cells before playing.`,
        "no-playable-notes",
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
      eventCount: playable.events.length,
      label,
      mode
    };
    return {
      activeLanes: playable.activeLanes,
      eventCount: playable.events.length,
      label,
      mode,
      ok: true,
      soundFontPlayback: false,
      synthName: "Preview Synth",
      warnings: playable.warnings
    };
  }

  async ensureContext() {
    const AudioContextCtor = audioContextCtor(this.window);
    if (!AudioContextCtor) {
      return this.fail("Preview Synth audio unavailable: Web Audio AudioContext is not available. Use a browser with Web Audio support.", "audio-unavailable");
    }
    try {
      this.context = this.context || new AudioContextCtor();
      if (typeof this.context.resume === "function") {
        await this.context.resume();
      }
      if (this.context.state === "suspended") {
        return this.fail("Preview Synth audio is still suspended after the play gesture. Click Play Section or Play Loop again and check browser audio permissions.", "audio-suspended");
      }
      return { context: this.context, ok: true };
    } catch (error) {
      return this.fail(`Preview Synth audio could not start after the play gesture: ${error.message || "browser audio permission blocked playback"}.`, "audio-resume-failed");
    }
  }

  async previewInstrument({ instrumentId, label = "", lane = "", laneSettings = {} } = {}) {
    const contextResult = await this.ensureContext();
    if (!contextResult.ok) {
      return contextResult;
    }
    const instrument = previewInstrumentById(instrumentId);
    if (!instrument) {
      return this.fail(`Missing preview instrument selection for ${label || lane || "instrument"}. Choose a Preview Synth instrument before auditioning.`, "missing-instrument");
    }
    const adjustedInstrument = this.instrumentWithLaneSettings(instrument, lane, laneSettings);
    const event = {
      durationBeats: instrument.synthRole === "pad" ? 0.5 : 0.25,
      kind: instrument.synthRole === "percussion" ? "drum" : "note",
      lane,
      previewInstrument: adjustedInstrument,
      stepIndex: 0,
      value: this.auditionValueForInstrument(adjustedInstrument)
    };
    const startTime = contextResult.context.currentTime + 0.01;
    if (event.kind === "drum") {
      this.scheduleDrumHit({ context: contextResult.context, event, startTime });
    } else {
      const durationSeconds = (instrument.synthRole === "pad" ? 0.34 : 0.2) * Number(adjustedInstrument.durationScale || 1);
      this.frequenciesForEvent(event, adjustedInstrument).forEach((frequency, index) => {
        this.scheduleTone({
          context: contextResult.context,
          durationSeconds,
          event,
          frequency,
          startTime: startTime + index * 0.006
        });
      });
    }
    this.lastError = "";
    return {
      instrumentLabel: instrument.label,
      mappedPreviewInstrumentLabel: instrument.mappedPreviewInstrumentLabel || "",
      ok: true,
      warnings: instrument.approximationWarning ? [instrument.approximationWarning] : []
    };
  }

  auditionValueForInstrument(instrument) {
    if (instrument.synthRole === "percussion") {
      return "kick";
    }
    if (instrument.synthRole === "bass") {
      return "C2";
    }
    if (instrument.synthRole === "pad") {
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
          warnings.push(`Missing preview instrument selection for ${event.lane}. Choose a Preview Synth instrument before playback.`);
          warningKeys.add(key);
        }
        return;
      }
      if (event.kind === "drum" && instrument.synthRole !== "percussion") {
        const key = `drum-pack:${event.lane}`;
        if (!warningKeys.has(key)) {
          warnings.push(`Preview instrument "${instrument.label}" is not a percussion pack for ${event.lane}; Preview Synth will use a noise-based percussion approximation.`);
          warningKeys.add(key);
        }
      }
      if (instrument.approximationWarning) {
        const key = `approximation:${instrument.id}`;
        if (!warningKeys.has(key)) {
          warnings.push(instrument.approximationWarning);
          warningKeys.add(key);
        }
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
    const baseVolume = finiteNumber(instrument?.volume, null);
    const fallbackVolume = instrument?.synthRole === "percussion" ? 0.16 : instrument?.synthRole === "pad" ? 0.1 : 0.11;
    const laneVolume = clampNumber(laneSettings.volumes?.[lane], 0, 1, 1);
    const velocityScale = clampNumber(laneSettings.velocities?.[lane], 1, 127, 100) / 100;
    const transpose = clampNumber(laneSettings.transposes?.[lane], -24, 24, 0);
    const pan = clampNumber(laneSettings.pans?.[lane], -1, 1, 0);
    const effects = normalizedEffects(laneSettings, lane);
    const brightnessGain = 1 + effects.brightnessTone * 0.18;
    const filterDamping = 1 - effects.filter * 0.22;
    const ambienceLift = 1 + (effects.chorus + effects.delay + effects.reverb) * 0.04;
    const waveformOverride = this.waveformWithEffects(instrument?.waveform, effects);
    return {
      ...instrument,
      effects,
      pan,
      durationScale: 1 + effects.reverb * 0.18 + effects.delay * 0.12 + effects.chorus * 0.08,
      transposeSemitones: finiteNumber(instrument?.transposeSemitones, 0) + transpose,
      volumeOverride: Math.max(0, (baseVolume ?? fallbackVolume) * laneVolume * velocityScale * brightnessGain * filterDamping * ambienceLift),
      waveformOverride
    };
  }

  waveformWithEffects(baseWaveform = "", effects = {}) {
    if (effects.filter >= 0.7) {
      return "sine";
    }
    if (effects.brightnessTone >= 0.65) {
      return "sawtooth";
    }
    if (effects.chorus >= 0.75) {
      return "triangle";
    }
    return baseWaveform || "";
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
        this.scheduleDrumHit({
          context,
          event,
          startTime: now + offsetSeconds
        });
        return;
      }
      const durationScale = Number(instrument?.durationScale || 1);
      const durationSeconds = Math.max(0.06, Number(event.durationBeats || 1) * secondsPerBeat * 0.82 * durationScale);
      this.frequenciesForEvent(event, instrument).forEach((frequency, index) => {
        this.scheduleTone({
          context,
          durationSeconds,
          event,
          frequency,
          startTime: now + offsetSeconds + index * 0.006
        });
      });
    });
  }

  scheduleTone({ context, durationSeconds, event, frequency, startTime }) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const waveform = this.waveformForEvent(event, event.previewInstrument);
    const volume = this.volumeForEvent(event, event.previewInstrument);
    const endTime = startTime + durationSeconds;
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.015);
    gainNode.gain.setValueAtTime(volume, Math.max(startTime + 0.016, endTime - 0.045));
    gainNode.gain.linearRampToValueAtTime(0.0001, endTime);
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime);
    this.nodes.push({ gainNode, source: oscillator });
  }

  scheduleDrumHit({ context, event, startTime }) {
    if (typeof context.createBuffer !== "function" || typeof context.createBufferSource !== "function") {
      const frequency = DRUM_FREQUENCIES[String(event.value || "").toLowerCase()];
      if (frequency) {
        this.scheduleTone({ context, durationSeconds: 0.08, event, frequency, startTime });
      }
      return;
    }
    const drumName = String(event.value || "").toLowerCase();
    const durationSeconds = DRUM_DURATIONS[drumName] || 0.1;
    const sampleRate = Number(context.sampleRate || 44100);
    const frameCount = Math.max(1, Math.floor(sampleRate * durationSeconds));
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) {
      const decay = 1 - (index / frameCount);
      samples[index] = (Math.random() * 2 - 1) * decay * decay;
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
      return event.value === "kick" || event.value === "tom" ? "sine" : instrument?.waveformOverride || instrument?.waveform || "square";
    }
    return instrument?.waveformOverride || instrument?.waveform || "sine";
  }

  volumeForEvent(event, instrument = null) {
    const fallbackVolume = event.kind === "chord" ? 0.1 : event.kind === "drum" ? 0.16 : 0.11;
    if (Number.isFinite(Number(instrument?.volumeOverride))) {
      return Math.max(0, Math.min(1, Number(instrument.volumeOverride)));
    }
    const volume = Number(instrument?.volume ?? fallbackVolume);
    if (event.kind === "drum") {
      return Math.max(volume, 0.16);
    }
    return Math.max(volume, event.kind === "chord" ? 0.1 : 0.11);
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
    return stoppedCount;
  }

  getSnapshot() {
    return {
      activeNodeCount: this.nodes.length,
      audioContextState: this.context?.state || "not created",
      lastError: this.lastError || "none",
      lastPlayback: this.lastPlayback,
      loopActive: Boolean(this.loopTimer),
      playing: this.playing,
      supported: this.isSupported()
    };
  }

  fail(message, reason, extra = {}) {
    this.lastError = message;
    this.lastPlayback = null;
    this.playing = false;
    return {
      message,
      ok: false,
      reason,
      ...extra
    };
  }
}
