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

export class PreviewSynthEngine {
  constructor({ windowRef = globalThis } = {}) {
    this.context = null;
    this.loopTimer = null;
    this.nodes = [];
    this.playing = false;
    this.window = windowRef;
  }

  isSupported() {
    return Boolean(audioContextCtor(this.window));
  }

  async playGridRange({ endStep, grid, label, loop = false, mode = "section", startStep, tempoBpm = 120 } = {}) {
    this.stop();
    if (!grid?.ok) {
      return { message: "Preview Synth needs a normalized instrument grid before playback.", ok: false, reason: "missing-grid" };
    }
    const contextResult = await this.ensureContext();
    if (!contextResult.ok) {
      return contextResult;
    }
    const playableEvents = this.playableEventsForRange(grid, startStep, endStep);
    if (!playableEvents.length) {
      return {
        message: `No playable Preview Synth notes found for ${mode} ${label || "(unnamed)"}. Generate or enter chords, bass, pad, lead, or drum cells before playing.`,
        ok: false,
        reason: "no-playable-notes"
      };
    }
    const safeTempo = Number.isFinite(Number(tempoBpm)) && Number(tempoBpm) > 0 ? Number(tempoBpm) : 120;
    const secondsPerBeat = 60 / safeTempo;
    const secondsPerStep = secondsPerBeat / grid.subdivision;
    const cycleSeconds = Math.max((endStep - startStep + 1) * secondsPerStep, secondsPerStep);
    this.playing = true;
    this.scheduleEvents({ context: contextResult.context, events: playableEvents, secondsPerBeat, secondsPerStep, startStep });
    if (loop) {
      this.loopTimer = this.window.setInterval(() => {
        this.scheduleEvents({ context: contextResult.context, events: playableEvents, secondsPerBeat, secondsPerStep, startStep });
      }, cycleSeconds * 1000);
    }
    return {
      eventCount: playableEvents.length,
      label,
      mode,
      ok: true,
      soundFontPlayback: false,
      synthName: "Preview Synth"
    };
  }

  async ensureContext() {
    const AudioContextCtor = audioContextCtor(this.window);
    if (!AudioContextCtor) {
      return {
        message: "Preview Synth audio unavailable: Web Audio AudioContext is not available. Use a browser with Web Audio support.",
        ok: false,
        reason: "audio-unavailable"
      };
    }
    try {
      this.context = this.context || new AudioContextCtor();
      if (typeof this.context.resume === "function") {
        await this.context.resume();
      }
      if (this.context.state === "suspended") {
        return {
          message: "Preview Synth audio is still suspended after the play gesture. Click Play Section or Play Loop again and check browser audio permissions.",
          ok: false,
          reason: "audio-suspended"
        };
      }
      return { context: this.context, ok: true };
    } catch (error) {
      return {
        message: `Preview Synth audio could not start after the play gesture: ${error.message || "browser audio permission blocked playback"}.`,
        ok: false,
        reason: "audio-resume-failed"
      };
    }
  }

  playableEventsForRange(grid, startStep = 0, endStep = 0) {
    return (grid.timeline || []).filter((event) => {
      const stepIndex = Number(event.stepIndex);
      return Number.isFinite(stepIndex)
        && stepIndex >= startStep
        && stepIndex <= endStep
        && this.frequenciesForEvent(event).length > 0;
    });
  }

  scheduleEvents({ context, events, secondsPerBeat, secondsPerStep, startStep }) {
    const now = context.currentTime;
    events.forEach((event) => {
      const offsetSeconds = Math.max(0, (event.stepIndex - startStep) * secondsPerStep);
      const durationSeconds = Math.max(0.06, Number(event.durationBeats || 1) * secondsPerBeat * 0.82);
      this.frequenciesForEvent(event).forEach((frequency, index) => {
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
    const waveform = this.waveformForEvent(event);
    const volume = this.volumeForEvent(event);
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
    this.nodes.push({ gainNode, oscillator });
  }

  frequenciesForEvent(event) {
    if (event.kind === "drum") {
      const frequency = DRUM_FREQUENCIES[String(event.value || "").toLowerCase()];
      return frequency ? [frequency] : [];
    }
    if (event.kind === "chord") {
      return chordNotes(event.value).map((note) => noteFrequency(note)).filter(Boolean);
    }
    if (event.kind === "note") {
      const frequency = noteFrequency(event.value);
      return frequency ? [frequency] : [];
    }
    return [];
  }

  waveformForEvent(event) {
    if (event.kind === "drum") {
      return event.value === "kick" || event.value === "tom" ? "sine" : "square";
    }
    return event.lane === "lead" ? "sawtooth" : event.lane === "bass" ? "triangle" : "sine";
  }

  volumeForEvent(event) {
    if (event.kind === "drum") {
      return 0.12;
    }
    return event.kind === "chord" ? 0.045 : 0.075;
  }

  stop() {
    if (this.loopTimer) {
      this.window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    this.nodes.forEach(({ oscillator, gainNode }) => {
      try {
        oscillator.stop();
      } catch {
        // Already stopped or never started.
      }
      try {
        oscillator.disconnect();
        gainNode.disconnect();
      } catch {
        // Some test doubles do not implement disconnect.
      }
    });
    const stoppedCount = this.nodes.length;
    this.nodes = [];
    this.playing = false;
    return stoppedCount;
  }

  getSnapshot() {
    return {
      activeNodeCount: this.nodes.length,
      loopActive: Boolean(this.loopTimer),
      playing: this.playing,
      supported: this.isSupported()
    };
  }
}
