const DEFAULT_SOUND = Object.freeze({
  attackMs: 5,
  durationMs: 180,
  frequencyHz: 880,
  name: "Coin",
  noise: false,
  pitchSweepCents: 700,
  releaseMs: 90,
  volume: 0.42,
  waveform: "square"
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
    addButton,
    attackInput,
    attackValue,
    durationInput,
    durationValue,
    frequencyInput,
    frequencyValue,
    nameInput,
    noiseInput,
    pitchSweepInput,
    pitchSweepValue,
    releaseInput,
    releaseValue,
    validationMessage,
    volumeInput,
    volumeValue,
    waveformSelect
  }) {
    this.addButton = addButton;
    this.attackInput = attackInput;
    this.attackValue = attackValue;
    this.durationInput = durationInput;
    this.durationValue = durationValue;
    this.frequencyInput = frequencyInput;
    this.frequencyValue = frequencyValue;
    this.nameInput = nameInput;
    this.noiseInput = noiseInput;
    this.pitchSweepInput = pitchSweepInput;
    this.pitchSweepValue = pitchSweepValue;
    this.releaseInput = releaseInput;
    this.releaseValue = releaseValue;
    this.validationMessage = validationMessage;
    this.volumeInput = volumeInput;
    this.volumeValue = volumeValue;
    this.waveformSelect = waveformSelect;
  }

  mount({ onAdd, onChange }) {
    this.loadSound(DEFAULT_SOUND);
    this.addButton.addEventListener("click", onAdd);
    [
      this.attackInput,
      this.durationInput,
      this.frequencyInput,
      this.nameInput,
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

  loadSound(sound) {
    this.attackInput.value = String(sound.attackMs);
    this.durationInput.value = String(sound.durationMs);
    this.frequencyInput.value = String(sound.frequencyHz);
    this.nameInput.value = sound.name;
    this.noiseInput.checked = sound.noise;
    this.pitchSweepInput.value = String(sound.pitchSweepCents);
    this.releaseInput.value = String(sound.releaseMs);
    this.volumeInput.value = String(sound.volume);
    this.waveformSelect.value = sound.waveform;
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
    const name = this.nameInput.value.trim();
    if (!name) {
      return { valid: false, message: "Name is required." };
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
        name,
        noise: this.noiseInput.checked,
        pitchSweepCents: Math.round(pitchSweep.value),
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
