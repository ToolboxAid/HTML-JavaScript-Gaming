const PRESETS = Object.freeze({
  coin: Object.freeze({
    attackMs: 5,
    durationMs: 180,
    frequencyHz: 880,
    name: "Coin",
    noise: false,
    pitchSweepCents: 700,
    releaseMs: 90,
    volume: 0.42,
    waveform: "square"
  }),
  laser: Object.freeze({
    attackMs: 0,
    durationMs: 260,
    frequencyHz: 620,
    name: "Laser",
    noise: false,
    pitchSweepCents: -850,
    releaseMs: 160,
    volume: 0.35,
    waveform: "sawtooth"
  }),
  jump: Object.freeze({
    attackMs: 5,
    durationMs: 220,
    frequencyHz: 360,
    name: "Jump",
    noise: false,
    pitchSweepCents: 500,
    releaseMs: 120,
    volume: 0.32,
    waveform: "triangle"
  }),
  hit: Object.freeze({
    attackMs: 0,
    durationMs: 140,
    frequencyHz: 150,
    name: "Hit",
    noise: true,
    pitchSweepCents: -300,
    releaseMs: 90,
    volume: 0.5,
    waveform: "square"
  }),
  powerup: Object.freeze({
    attackMs: 20,
    durationMs: 520,
    frequencyHz: 440,
    name: "Power Up",
    noise: false,
    pitchSweepCents: 1200,
    releaseMs: 240,
    volume: 0.38,
    waveform: "sine"
  })
});

const ALLOWED_WAVEFORMS = Object.freeze(new Set(["sine", "square", "triangle", "sawtooth"]));

function toNumber(input) {
  return Number.parseFloat(input.value);
}

function readRange(input) {
  const value = toNumber(input);
  const min = Number.parseFloat(input.min);
  const max = Number.parseFloat(input.max);
  if (!Number.isFinite(value) || value < min || value > max) {
    return { ok: false, message: `${input.id} must be between ${min} and ${max}.` };
  }
  return { ok: true, value };
}

export class SfxControlPanel {
  constructor({
    attackInput,
    attackValue,
    durationInput,
    durationValue,
    frequencyInput,
    frequencyValue,
    noiseInput,
    pitchSweepInput,
    pitchSweepValue,
    presetSelect,
    releaseInput,
    releaseValue,
    validationMessage,
    volumeInput,
    volumeValue,
    waveformSelect
  }) {
    this.attackInput = attackInput;
    this.attackValue = attackValue;
    this.durationInput = durationInput;
    this.durationValue = durationValue;
    this.frequencyInput = frequencyInput;
    this.frequencyValue = frequencyValue;
    this.noiseInput = noiseInput;
    this.pitchSweepInput = pitchSweepInput;
    this.pitchSweepValue = pitchSweepValue;
    this.presetSelect = presetSelect;
    this.releaseInput = releaseInput;
    this.releaseValue = releaseValue;
    this.validationMessage = validationMessage;
    this.volumeInput = volumeInput;
    this.volumeValue = volumeValue;
    this.waveformSelect = waveformSelect;
  }

  mount({ onChange }) {
    this.applyPreset(this.presetSelect.value);
    this.presetSelect.addEventListener("change", () => {
      this.applyPreset(this.presetSelect.value);
      onChange();
    });
    [
      this.attackInput,
      this.durationInput,
      this.frequencyInput,
      this.noiseInput,
      this.pitchSweepInput,
      this.releaseInput,
      this.volumeInput,
      this.waveformSelect
    ].forEach((control) => {
      control.addEventListener("input", () => {
        this.syncOutputs();
        onChange();
      });
      control.addEventListener("change", () => {
        this.syncOutputs();
        onChange();
      });
    });
  }

  applyPreset(presetId) {
    const preset = PRESETS[presetId];
    if (!preset) {
      return;
    }
    this.attackInput.value = String(preset.attackMs);
    this.durationInput.value = String(preset.durationMs);
    this.frequencyInput.value = String(preset.frequencyHz);
    this.noiseInput.checked = preset.noise;
    this.pitchSweepInput.value = String(preset.pitchSweepCents);
    this.releaseInput.value = String(preset.releaseMs);
    this.volumeInput.value = String(preset.volume);
    this.waveformSelect.value = preset.waveform;
    this.syncOutputs();
  }

  syncOutputs() {
    this.attackValue.textContent = `${Math.round(toNumber(this.attackInput))} ms`;
    this.durationValue.textContent = `${Math.round(toNumber(this.durationInput))} ms`;
    this.frequencyValue.textContent = `${Math.round(toNumber(this.frequencyInput))} Hz`;
    this.pitchSweepValue.textContent = `${Math.round(toNumber(this.pitchSweepInput))} cents`;
    this.releaseValue.textContent = `${Math.round(toNumber(this.releaseInput))} ms`;
    this.volumeValue.textContent = toNumber(this.volumeInput).toFixed(2);
  }

  validate() {
    const preset = PRESETS[this.presetSelect.value];
    if (!preset) {
      return { valid: false, message: `Unknown preset: ${this.presetSelect.value}.` };
    }
    if (!ALLOWED_WAVEFORMS.has(this.waveformSelect.value)) {
      return { valid: false, message: `Unsupported waveform: ${this.waveformSelect.value}.` };
    }
    const frequency = readRange(this.frequencyInput);
    const duration = readRange(this.durationInput);
    const attack = readRange(this.attackInput);
    const release = readRange(this.releaseInput);
    const volume = readRange(this.volumeInput);
    const pitchSweep = readRange(this.pitchSweepInput);
    const failed = [frequency, duration, attack, release, volume, pitchSweep].find((result) => !result.ok);
    if (failed) {
      return { valid: false, message: failed.message };
    }
    if (attack.value + release.value > duration.value) {
      return { valid: false, message: "Attack and release must fit inside duration." };
    }
    return {
      valid: true,
      value: {
        attackMs: Math.round(attack.value),
        durationMs: Math.round(duration.value),
        frequencyHz: Math.round(frequency.value),
        name: preset.name,
        noise: this.noiseInput.checked,
        pitchSweepCents: Math.round(pitchSweep.value),
        presetId: this.presetSelect.value,
        releaseMs: Math.round(release.value),
        volume: Number(volume.value.toFixed(2)),
        waveform: this.waveformSelect.value
      }
    };
  }

  showMessage(message, isError) {
    this.validationMessage.textContent = message;
    this.validationMessage.classList.toggle("is-error", isError);
  }
}
