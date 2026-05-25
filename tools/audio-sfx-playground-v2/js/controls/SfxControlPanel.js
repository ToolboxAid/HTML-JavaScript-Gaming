const SLIDER_LIMITS = Object.freeze({
  attackMs: Object.freeze({ min: 0, max: 250, step: 5, defaultValue: 5 }),
  durationMs: Object.freeze({ min: 60, max: 2000, step: 5, defaultValue: 180 }),
  frequencyHz: Object.freeze({ min: 20, max: 20000, step: 1, defaultValue: 880 }),
  noiseAmount: Object.freeze({ min: 0, max: 1, step: 0.01, defaultValue: 0.65 }),
  noiseDecayMs: Object.freeze({ min: 20, max: 600, step: 5, defaultValue: 95 }),
  noiseFilterHz: Object.freeze({ min: 400, max: 9000, step: 50, defaultValue: 5200 }),
  pitchSweepCents: Object.freeze({ min: -1200, max: 1200, step: 5, defaultValue: 700 }),
  releaseMs: Object.freeze({ min: 20, max: 700, step: 5, defaultValue: 90 }),
  volume: Object.freeze({ min: 0, max: 1, step: 0.01, defaultValue: 0.42 })
});

const SLIDER_INPUTS = Object.freeze([
  Object.freeze({ soundKey: "attackMs", inputProperty: "attackInput" }),
  Object.freeze({ soundKey: "durationMs", inputProperty: "durationInput" }),
  Object.freeze({ soundKey: "frequencyHz", inputProperty: "frequencyInput" }),
  Object.freeze({ soundKey: "noiseAmount", inputProperty: "noiseAmountInput" }),
  Object.freeze({ soundKey: "noiseDecayMs", inputProperty: "noiseDecayInput" }),
  Object.freeze({ soundKey: "noiseFilterHz", inputProperty: "noiseFilterInput" }),
  Object.freeze({ soundKey: "pitchSweepCents", inputProperty: "pitchSweepInput" }),
  Object.freeze({ soundKey: "releaseMs", inputProperty: "releaseInput" }),
  Object.freeze({ soundKey: "volume", inputProperty: "volumeInput" })
]);

const SLIDER_RANGE_UNITS = Object.freeze({
  attackMs: "ms",
  durationMs: "ms",
  frequencyHz: "Hz",
  noiseAmount: "",
  noiseDecayMs: "ms",
  noiseFilterHz: "Hz",
  pitchSweepCents: "cents",
  releaseMs: "ms",
  volume: ""
});

const STYLE_CLAMPS = Object.freeze({
  "pure-tone": Object.freeze({
    attackMs: Object.freeze({ min: 0, max: 120 }),
    durationMs: Object.freeze({ min: 80, max: 2000 }),
    frequencyHz: Object.freeze({ min: 20, max: 20000 }),
    noiseAmount: Object.freeze({ min: 0, max: 0.25 }),
    noiseDecayMs: Object.freeze({ min: 20, max: 240 }),
    noiseFilterHz: Object.freeze({ min: 1200, max: 9000 }),
    pitchSweepCents: Object.freeze({ min: -1200, max: 1200 }),
    releaseMs: Object.freeze({ min: 20, max: 700 }),
    volume: Object.freeze({ min: 0, max: 1 })
  }),
  "noise-only": Object.freeze({
    attackMs: Object.freeze({ min: 0, max: 80 }),
    durationMs: Object.freeze({ min: 60, max: 1200 }),
    frequencyHz: Object.freeze({ min: 80, max: 4000 }),
    noiseAmount: Object.freeze({ min: 0.2, max: 1 }),
    noiseDecayMs: Object.freeze({ min: 20, max: 600 }),
    noiseFilterHz: Object.freeze({ min: 400, max: 9000 }),
    pitchSweepCents: Object.freeze({ min: -400, max: 400 }),
    releaseMs: Object.freeze({ min: 20, max: 500 }),
    volume: Object.freeze({ min: 0, max: 1 })
  }),
  "atari-style": Object.freeze({
    attackMs: Object.freeze({ min: 0, max: 80 }),
    durationMs: Object.freeze({ min: 60, max: 900 }),
    frequencyHz: Object.freeze({ min: 40, max: 4000 }),
    noiseAmount: Object.freeze({ min: 0, max: 1 }),
    noiseDecayMs: Object.freeze({ min: 20, max: 450 }),
    noiseFilterHz: Object.freeze({ min: 400, max: 7000 }),
    pitchSweepCents: Object.freeze({ min: -1200, max: 1200 }),
    releaseMs: Object.freeze({ min: 20, max: 400 }),
    volume: Object.freeze({ min: 0, max: 1 })
  }),
  "classic-arcade": Object.freeze({
    attackMs: Object.freeze({ min: 0, max: 100 }),
    durationMs: Object.freeze({ min: 60, max: 1400 }),
    frequencyHz: Object.freeze({ min: 60, max: 5000 }),
    noiseAmount: Object.freeze({ min: 0, max: 1 }),
    noiseDecayMs: Object.freeze({ min: 20, max: 520 }),
    noiseFilterHz: Object.freeze({ min: 500, max: 8500 }),
    pitchSweepCents: Object.freeze({ min: -1200, max: 1200 }),
    releaseMs: Object.freeze({ min: 20, max: 500 }),
    volume: Object.freeze({ min: 0, max: 1 })
  }),
  "early-analog": Object.freeze({
    attackMs: Object.freeze({ min: 0, max: 180 }),
    durationMs: Object.freeze({ min: 100, max: 2000 }),
    frequencyHz: Object.freeze({ min: 30, max: 8000 }),
    noiseAmount: Object.freeze({ min: 0, max: 0.6 }),
    noiseDecayMs: Object.freeze({ min: 20, max: 600 }),
    noiseFilterHz: Object.freeze({ min: 400, max: 7000 }),
    pitchSweepCents: Object.freeze({ min: -1200, max: 1200 }),
    releaseMs: Object.freeze({ min: 40, max: 700 }),
    volume: Object.freeze({ min: 0, max: 1 })
  }),
  "namco-style": Object.freeze({
    attackMs: Object.freeze({ min: 0, max: 90 }),
    durationMs: Object.freeze({ min: 60, max: 900 }),
    frequencyHz: Object.freeze({ min: 120, max: 6500 }),
    noiseAmount: Object.freeze({ min: 0, max: 0.5 }),
    noiseDecayMs: Object.freeze({ min: 20, max: 360 }),
    noiseFilterHz: Object.freeze({ min: 1200, max: 9000 }),
    pitchSweepCents: Object.freeze({ min: -900, max: 1200 }),
    releaseMs: Object.freeze({ min: 20, max: 420 }),
    volume: Object.freeze({ min: 0, max: 1 })
  }),
  "nintendo-style": Object.freeze({
    attackMs: Object.freeze({ min: 0, max: 80 }),
    durationMs: Object.freeze({ min: 60, max: 1100 }),
    frequencyHz: Object.freeze({ min: 80, max: 5000 }),
    noiseAmount: Object.freeze({ min: 0, max: 0.9 }),
    noiseDecayMs: Object.freeze({ min: 20, max: 450 }),
    noiseFilterHz: Object.freeze({ min: 800, max: 9000 }),
    pitchSweepCents: Object.freeze({ min: -900, max: 1200 }),
    releaseMs: Object.freeze({ min: 20, max: 450 }),
    volume: Object.freeze({ min: 0, max: 1 })
  }),
  "ttl-arcade": Object.freeze({
    attackMs: Object.freeze({ min: 0, max: 60 }),
    durationMs: Object.freeze({ min: 60, max: 700 }),
    frequencyHz: Object.freeze({ min: 80, max: 2500 }),
    noiseAmount: Object.freeze({ min: 0, max: 1 }),
    noiseDecayMs: Object.freeze({ min: 20, max: 300 }),
    noiseFilterHz: Object.freeze({ min: 700, max: 9000 }),
    pitchSweepCents: Object.freeze({ min: -800, max: 800 }),
    releaseMs: Object.freeze({ min: 20, max: 260 }),
    volume: Object.freeze({ min: 0, max: 1 })
  }),
  "vector-arcade": Object.freeze({
    attackMs: Object.freeze({ min: 0, max: 140 }),
    durationMs: Object.freeze({ min: 80, max: 1600 }),
    frequencyHz: Object.freeze({ min: 100, max: 6000 }),
    noiseAmount: Object.freeze({ min: 0, max: 0.6 }),
    noiseDecayMs: Object.freeze({ min: 20, max: 500 }),
    noiseFilterHz: Object.freeze({ min: 500, max: 8500 }),
    pitchSweepCents: Object.freeze({ min: -1200, max: 1200 }),
    releaseMs: Object.freeze({ min: 20, max: 600 }),
    volume: Object.freeze({ min: 0, max: 1 })
  })
});

const DEFAULT_SOUND = Object.freeze({
  attackMs: SLIDER_LIMITS.attackMs.defaultValue,
  durationMs: SLIDER_LIMITS.durationMs.defaultValue,
  frequencyHz: SLIDER_LIMITS.frequencyHz.defaultValue,
  name: "Coin",
  noise: false,
  noiseAmount: SLIDER_LIMITS.noiseAmount.defaultValue,
  noiseDecayMs: SLIDER_LIMITS.noiseDecayMs.defaultValue,
  noiseFilterHz: SLIDER_LIMITS.noiseFilterHz.defaultValue,
  pitchSweepCents: SLIDER_LIMITS.pitchSweepCents.defaultValue,
  releaseMs: SLIDER_LIMITS.releaseMs.defaultValue,
  volume: SLIDER_LIMITS.volume.defaultValue,
  waveform: "square"
});

const ALLOWED_WAVEFORMS = Object.freeze(new Set(["sine", "square", "triangle", "sawtooth", "noise"]));
const STYLE_PROFILES = Object.freeze({
  "pure-tone": {
    durationMs: 240,
    frequencyHz: 660,
    name: "Pure Tone",
    noise: false,
    noiseAmount: 0,
    noiseDecayMs: 80,
    noiseFilterHz: 5200,
    pitchSweepCents: 0,
    releaseMs: 120,
    volume: 0.38,
    waveform: "sine"
  },
  "noise-only": {
    durationMs: 260,
    frequencyHz: 880,
    name: "Noise Only",
    noise: false,
    noiseAmount: 0.72,
    noiseDecayMs: 120,
    noiseFilterHz: 6200,
    pitchSweepCents: 0,
    releaseMs: 100,
    volume: 0.44,
    waveform: "noise"
  },
  "atari-style": {
    durationMs: 180,
    frequencyHz: 520,
    name: "Atari Blip",
    noise: true,
    noiseAmount: 0.48,
    noiseDecayMs: 75,
    noiseFilterHz: 4200,
    pitchSweepCents: -520,
    releaseMs: 60,
    volume: 0.5,
    waveform: "square"
  },
  "classic-arcade": {
    durationMs: 220,
    frequencyHz: 880,
    name: "Classic Zap",
    noise: true,
    noiseAmount: 0.65,
    noiseDecayMs: 95,
    noiseFilterHz: 5600,
    pitchSweepCents: 700,
    releaseMs: 85,
    volume: 0.46,
    waveform: "square"
  },
  "early-analog": {
    durationMs: 360,
    frequencyHz: 340,
    name: "Analog Bloom",
    noise: false,
    noiseAmount: 0.22,
    noiseDecayMs: 140,
    noiseFilterHz: 3600,
    pitchSweepCents: 240,
    releaseMs: 180,
    volume: 0.42,
    waveform: "sawtooth"
  },
  "namco-style": {
    durationMs: 170,
    frequencyHz: 1040,
    name: "Namco Ping",
    noise: false,
    noiseAmount: 0.15,
    noiseDecayMs: 70,
    noiseFilterHz: 6800,
    pitchSweepCents: 420,
    releaseMs: 70,
    volume: 0.44,
    waveform: "triangle"
  },
  "nintendo-style": {
    durationMs: 260,
    frequencyHz: 760,
    name: "Nintendo Pop",
    noise: true,
    noiseAmount: 0.36,
    noiseDecayMs: 90,
    noiseFilterHz: 7600,
    pitchSweepCents: 520,
    releaseMs: 95,
    volume: 0.4,
    waveform: "square"
  },
  "ttl-arcade": {
    durationMs: 130,
    frequencyHz: 1180,
    name: "TTL Tick",
    noise: true,
    noiseAmount: 0.72,
    noiseDecayMs: 50,
    noiseFilterHz: 8300,
    pitchSweepCents: -260,
    releaseMs: 45,
    volume: 0.48,
    waveform: "square"
  },
  "vector-arcade": {
    durationMs: 300,
    frequencyHz: 420,
    name: "Vector Sweep",
    noise: false,
    noiseAmount: 0.12,
    noiseDecayMs: 120,
    noiseFilterHz: 4600,
    pitchSweepCents: 900,
    releaseMs: 130,
    volume: 0.43,
    waveform: "sawtooth"
  }
});

function toNumber(input) {
  return Number.parseFloat(input.value);
}

function readRange(input, limits) {
  const value = toNumber(input);
  const { min, max } = limits;
  if (!Number.isFinite(value) || value < min || value > max) {
    return { ok: false, message: `${input.id} must be between ${min} and ${max}.` };
  }
  return { ok: true, value };
}

function formatRangeNumber(soundKey, value) {
  if (soundKey === "noiseAmount" || soundKey === "volume") {
    return value.toFixed(2);
  }
  return String(Math.round(value));
}

export class SfxControlPanel {
  constructor({
    addButton,
    attackInput,
    attackValue,
    deleteButton,
    durationInput,
    durationValue,
    frequencyInput,
    frequencyValue,
    nameInput,
    noiseAmountInput,
    noiseAmountValue,
    noiseDecayInput,
    noiseDecayValue,
    noiseFilterInput,
    noiseFilterValue,
    noiseInput,
    pitchSweepInput,
    pitchSweepValue,
    releaseInput,
    releaseValue,
    styleProfileSelect,
    validationMessage,
    volumeInput,
    volumeValue,
    waveformSelect
  }) {
    this.activeSliderLimits = SLIDER_LIMITS;
    this.addButton = addButton;
    this.attackInput = attackInput;
    this.attackValue = attackValue;
    this.deleteButton = deleteButton;
    this.durationInput = durationInput;
    this.durationValue = durationValue;
    this.frequencyInput = frequencyInput;
    this.frequencyValue = frequencyValue;
    this.nameInput = nameInput;
    this.noiseAmountInput = noiseAmountInput;
    this.noiseAmountValue = noiseAmountValue;
    this.noiseDecayInput = noiseDecayInput;
    this.noiseDecayValue = noiseDecayValue;
    this.noiseFilterInput = noiseFilterInput;
    this.noiseFilterValue = noiseFilterValue;
    this.noiseInput = noiseInput;
    this.pitchSweepInput = pitchSweepInput;
    this.pitchSweepValue = pitchSweepValue;
    this.releaseInput = releaseInput;
    this.releaseValue = releaseValue;
    this.styleProfileSelect = styleProfileSelect;
    this.validationMessage = validationMessage;
    this.volumeInput = volumeInput;
    this.volumeValue = volumeValue;
    this.waveformSelect = waveformSelect;
  }

  mount({ onAdd, onChange, onDelete }) {
    this.applySliderLimits();
    this.loadSound(DEFAULT_SOUND);
    this.addButton.addEventListener("click", onAdd);
    this.deleteButton.addEventListener("click", onDelete);
    this.styleProfileSelect.addEventListener("change", () => {
      if (this.applyStyleProfile()) {
        onChange();
      }
    });
    this.setDeleteEnabled(false);
    [
      this.attackInput,
      this.durationInput,
      this.frequencyInput,
      this.nameInput,
      this.noiseAmountInput,
      this.noiseDecayInput,
      this.noiseFilterInput,
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
    this.sliderInputs().forEach((input) => {
      input.addEventListener("pointerdown", () => this.focusSlider(input));
      input.addEventListener("input", () => this.focusSlider(input));
      input.addEventListener("change", () => this.focusSlider(input));
    });
  }

  sliderInputs() {
    return SLIDER_INPUTS.map((item) => this[item.inputProperty]);
  }

  applySliderLimits(styleKey = "custom", shouldClampValues = false) {
    this.activeSliderLimits = styleKey === "custom" ? SLIDER_LIMITS : this.sliderLimitsForStyle(styleKey);
    SLIDER_INPUTS.forEach((item) => {
      const input = this[item.inputProperty];
      const limits = this.activeSliderLimits[item.soundKey];
      input.min = String(limits.min);
      input.max = String(limits.max);
      input.step = String(SLIDER_LIMITS[item.soundKey].step);
      if (shouldClampValues) {
        input.value = String(this.clampSliderValue(input, limits));
      }
    });
  }

  sliderLimitsForStyle(styleKey) {
    const clampProfile = STYLE_CLAMPS[styleKey] || {};
    return Object.freeze(Object.fromEntries(SLIDER_INPUTS.map((item) => {
      const baseLimits = SLIDER_LIMITS[item.soundKey];
      const clampLimits = clampProfile[item.soundKey] || baseLimits;
      return [item.soundKey, Object.freeze({
        max: clampLimits.max,
        min: clampLimits.min,
        step: baseLimits.step
      })];
    })));
  }

  clampSliderValue(input, limits) {
    const value = toNumber(input);
    if (!Number.isFinite(value)) {
      return limits.min;
    }
    return Math.min(limits.max, Math.max(limits.min, value));
  }

  focusSlider(input) {
    if (typeof input.focus === "function") {
      input.focus({ preventScroll: true });
    }
  }

  loadSound(sound) {
    this.styleProfileSelect.value = "custom";
    this.applySliderLimits("custom");
    this.attackInput.value = String(sound.attackMs);
    this.durationInput.value = String(sound.durationMs);
    this.frequencyInput.value = String(sound.frequencyHz);
    this.nameInput.value = sound.name;
    this.noiseInput.checked = sound.noise;
    this.noiseAmountInput.value = String(sound.noiseAmount);
    this.noiseDecayInput.value = String(sound.noiseDecayMs);
    this.noiseFilterInput.value = String(sound.noiseFilterHz);
    this.pitchSweepInput.value = String(sound.pitchSweepCents);
    this.releaseInput.value = String(sound.releaseMs);
    this.volumeInput.value = String(sound.volume);
    this.waveformSelect.value = sound.waveform;
    this.syncOutputs();
  }

  applyStyleProfile() {
    const styleKey = this.styleProfileSelect.value;
    if (styleKey === "custom") {
      this.applySliderLimits("custom", true);
      this.syncOutputs();
      return true;
    }
    const profile = STYLE_PROFILES[styleKey];
    if (!profile) {
      this.styleProfileSelect.value = "custom";
      this.applySliderLimits("custom", true);
      return false;
    }
    this.applySliderLimits(styleKey, true);
    this.attackInput.value = String(DEFAULT_SOUND.attackMs);
    this.durationInput.value = String(profile.durationMs);
    this.frequencyInput.value = String(profile.frequencyHz);
    this.nameInput.value = profile.name;
    this.noiseInput.checked = profile.noise;
    this.noiseAmountInput.value = String(profile.noiseAmount);
    this.noiseDecayInput.value = String(profile.noiseDecayMs);
    this.noiseFilterInput.value = String(profile.noiseFilterHz);
    this.pitchSweepInput.value = String(profile.pitchSweepCents);
    this.releaseInput.value = String(profile.releaseMs);
    this.volumeInput.value = String(profile.volume);
    this.waveformSelect.value = profile.waveform;
    this.syncOutputs();
    return true;
  }

  syncOutputs() {
    this.attackValue.textContent = this.valueWithRange("attackMs", `${Math.round(toNumber(this.attackInput))} ms`);
    this.durationValue.textContent = this.valueWithRange("durationMs", `${Math.round(toNumber(this.durationInput))} ms`);
    this.frequencyValue.textContent = this.valueWithRange("frequencyHz", `${Math.round(toNumber(this.frequencyInput))} Hz`);
    this.noiseAmountValue.textContent = this.valueWithRange("noiseAmount", toNumber(this.noiseAmountInput).toFixed(2));
    this.noiseDecayValue.textContent = this.valueWithRange("noiseDecayMs", `${Math.round(toNumber(this.noiseDecayInput))} ms`);
    this.noiseFilterValue.textContent = this.valueWithRange("noiseFilterHz", `${Math.round(toNumber(this.noiseFilterInput))} Hz`);
    this.pitchSweepValue.textContent = this.valueWithRange("pitchSweepCents", `${Math.round(toNumber(this.pitchSweepInput))} cents`);
    this.releaseValue.textContent = this.valueWithRange("releaseMs", `${Math.round(toNumber(this.releaseInput))} ms`);
    this.volumeValue.textContent = this.valueWithRange("volume", toNumber(this.volumeInput).toFixed(2));
  }

  valueWithRange(soundKey, valueText) {
    return `${valueText} [${this.rangeText(soundKey)}]`;
  }

  rangeText(soundKey) {
    const limits = this.activeSliderLimits[soundKey];
    const unit = SLIDER_RANGE_UNITS[soundKey];
    const range = `${formatRangeNumber(soundKey, limits.min)}-${formatRangeNumber(soundKey, limits.max)}`;
    return unit ? `${range} ${unit}` : range;
  }

  validate() {
    const name = this.nameInput.value.trim();
    if (!name) {
      return { valid: false, message: "Name is required." };
    }
    if (!ALLOWED_WAVEFORMS.has(this.waveformSelect.value)) {
      return { valid: false, message: `Unsupported waveform: ${this.waveformSelect.value}.` };
    }
    const frequency = readRange(this.frequencyInput, this.activeSliderLimits.frequencyHz);
    const duration = readRange(this.durationInput, this.activeSliderLimits.durationMs);
    const attack = readRange(this.attackInput, this.activeSliderLimits.attackMs);
    const release = readRange(this.releaseInput, this.activeSliderLimits.releaseMs);
    const volume = readRange(this.volumeInput, this.activeSliderLimits.volume);
    const pitchSweep = readRange(this.pitchSweepInput, this.activeSliderLimits.pitchSweepCents);
    const noiseAmount = readRange(this.noiseAmountInput, this.activeSliderLimits.noiseAmount);
    const noiseDecay = readRange(this.noiseDecayInput, this.activeSliderLimits.noiseDecayMs);
    const noiseFilter = readRange(this.noiseFilterInput, this.activeSliderLimits.noiseFilterHz);
    const failed = [frequency, duration, attack, release, volume, pitchSweep, noiseAmount, noiseDecay, noiseFilter].find((result) => !result.ok);
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
        noiseAmount: Number(noiseAmount.value.toFixed(2)),
        noiseDecayMs: Math.round(noiseDecay.value),
        noiseFilterHz: Math.round(noiseFilter.value),
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

  setDeleteEnabled(isEnabled) {
    this.deleteButton.disabled = !isEnabled;
  }
}
