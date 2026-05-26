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

const RECOMMENDED_ZONE_SPAN = Object.freeze({
  attackMs: 0.36,
  durationMs: 0.34,
  frequencyHz: 0.28,
  noiseAmount: 0.36,
  noiseDecayMs: 0.34,
  noiseFilterHz: 0.32,
  pitchSweepCents: 0.38,
  releaseMs: 0.34,
  volume: 0.3
});

const STYLE_DESCRIPTIONS = Object.freeze({
  custom: "Full-range design mode for building a sound without a style preset.",
  "pure-tone": "Clean oscillator tones with little noise and broad pitch control.",
  "noise-only": "Transient noise bursts for impacts, hits, glitches, and static.",
  "atari-style": "Softer analog-style arcade tones with midrange sweeps.",
  "classic-arcade": "Punchy cabinet-era blips, zaps, and short mixed noise accents.",
  "early-analog": "Warm early synth effects with slower envelopes and wider motion.",
  "namco-style": "Bright melodic arcade pings with compact timing and clear pitch.",
  "nintendo-style": "Crisp console-style square tones with tight envelopes.",
  "ttl-arcade": "Harsh digital logic-style arcade sounds.",
  "vector-arcade": "Clean vector-display era synth tones."
});

const STYLE_EXAMPLES = Object.freeze({
  custom: Object.freeze(["Coin Pickup", "Laser Sweep", "Menu Confirm"]),
  "pure-tone": Object.freeze(["Clean Beep", "UI Confirm", "Target Lock"]),
  "noise-only": Object.freeze(["Analog Explosion", "Static Burst", "Shield Hit"]),
  "atari-style": Object.freeze(["Asteroids Fire", "Analog Explosion", "Saucer Chirp"]),
  "classic-arcade": Object.freeze(["Cabinet Coin", "Power-Up Zap", "Enemy Hit"]),
  "early-analog": Object.freeze(["Synth Bloom", "Retro Engine", "Warm Alarm"]),
  "namco-style": Object.freeze(["Maze Pickup", "Bonus Ping", "Ghost Alert"]),
  "nintendo-style": Object.freeze(["Jump Pop", "Coin Tick", "Power Shot"]),
  "ttl-arcade": Object.freeze(["Space Invaders Fire", "Digital Alarm", "Logic Hit"]),
  "vector-arcade": Object.freeze(["Vector Thrust", "Clean Laser", "Hyperspace Sweep"])
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
  playbackMode: "oneShot",
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

function formatPercent(value) {
  return `${Math.round(value * 1000) / 10}%`;
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
    loopingInput,
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
    renameButton,
    settingsHelper,
    styleDescription,
    styleExamples,
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
    this.loopingInput = loopingInput;
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
    this.renameButton = renameButton;
    this.settingsHelper = settingsHelper;
    this.styleDescription = styleDescription;
    this.styleExamples = styleExamples;
    this.styleProfileSelect = styleProfileSelect;
    this.validationMessage = validationMessage;
    this.volumeInput = volumeInput;
    this.volumeValue = volumeValue;
    this.waveformSelect = waveformSelect;
  }

  mount({ onAdd, onChange, onDelete, onRename }) {
    this.applySliderLimits();
    this.loadSound(DEFAULT_SOUND);
    this.addButton.addEventListener("click", onAdd);
    this.deleteButton.addEventListener("click", onDelete);
    this.renameButton.addEventListener("click", onRename);
    this.styleProfileSelect.addEventListener("change", () => {
      if (this.applyStyleProfile()) {
        onChange();
      }
    });
    this.setDeleteEnabled(false);
    this.setRenameEnabled(false);
    [
      this.attackInput,
      this.durationInput,
      this.frequencyInput,
      this.loopingInput,
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
    this.loopingInput.checked = sound.playbackMode === "loop";
    this.noiseInput.checked = sound.noise;
    this.noiseAmountInput.value = String(sound.noiseAmount);
    this.noiseDecayInput.value = String(sound.noiseDecayMs);
    this.noiseFilterInput.value = String(sound.noiseFilterHz);
    this.pitchSweepInput.value = String(sound.pitchSweepCents);
    this.releaseInput.value = String(sound.releaseMs);
    this.volumeInput.value = String(sound.volume);
    this.waveformSelect.value = sound.waveform;
    this.syncStyleDescription();
    this.syncOutputs();
  }

  applyStyleProfile() {
    const styleKey = this.styleProfileSelect.value;
    if (styleKey === "custom") {
      this.applySliderLimits("custom", true);
      this.syncStyleDescription();
      this.syncOutputs();
      return true;
    }
    const profile = STYLE_PROFILES[styleKey];
    if (!profile) {
      this.styleProfileSelect.value = "custom";
      this.applySliderLimits("custom", true);
      this.syncStyleDescription();
      return false;
    }
    this.applySliderLimits(styleKey, true);
    this.attackInput.value = String(DEFAULT_SOUND.attackMs);
    this.durationInput.value = String(profile.durationMs);
    this.frequencyInput.value = String(profile.frequencyHz);
    this.noiseInput.checked = profile.noise;
    this.noiseAmountInput.value = String(profile.noiseAmount);
    this.noiseDecayInput.value = String(profile.noiseDecayMs);
    this.noiseFilterInput.value = String(profile.noiseFilterHz);
    this.pitchSweepInput.value = String(profile.pitchSweepCents);
    this.releaseInput.value = String(profile.releaseMs);
    this.volumeInput.value = String(profile.volume);
    this.waveformSelect.value = profile.waveform;
    this.syncStyleDescription();
    this.syncOutputs();
    return true;
  }

  syncOutputs() {
    this.syncRecommendedZones();
    this.syncSettingsHelper();
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
    return this.formatRangeText(soundKey, this.activeSliderLimits[soundKey]);
  }

  formatRangeText(soundKey, limits) {
    const unit = SLIDER_RANGE_UNITS[soundKey];
    const range = `${formatRangeNumber(soundKey, limits.min)}-${formatRangeNumber(soundKey, limits.max)}`;
    return unit ? `${range} ${unit}` : range;
  }

  syncStyleDescription() {
    const styleKey = this.styleProfileSelect.value || "custom";
    this.styleDescription.textContent = STYLE_DESCRIPTIONS[styleKey] || STYLE_DESCRIPTIONS.custom;
    this.styleExamples.replaceChildren(...this.exampleItemsFor(styleKey));
  }

  exampleItemsFor(styleKey) {
    const examples = STYLE_EXAMPLES[styleKey] || STYLE_EXAMPLES.custom;
    const documentRef = this.styleExamples.ownerDocument;
    return examples.map((example) => {
      const item = documentRef.createElement("li");
      item.textContent = example;
      return item;
    });
  }

  syncSettingsHelper() {
    this.settingsHelper.textContent = `Why this sounds this way: ${this.settingHelperMessages().join(" ")}`;
  }

  settingHelperMessages() {
    const messages = [];
    const waveform = this.waveformSelect.value;
    const pitchSweep = toNumber(this.pitchSweepInput);
    const release = toNumber(this.releaseInput);
    const attack = toNumber(this.attackInput);
    const duration = toNumber(this.durationInput);
    const frequency = toNumber(this.frequencyInput);
    const noiseAmount = toNumber(this.noiseAmountInput);
    if (waveform === "noise") {
      messages.push("Noise waveform produces explosion/static textures.");
    } else if (this.noiseInput.checked && noiseAmount >= 0.4) {
      messages.push("Noise layer adds grit and transient impact.");
    }
    if (pitchSweep <= -500) {
      messages.push("Large negative sweep creates falling laser tones.");
    } else if (pitchSweep >= 500) {
      messages.push("Large positive sweep creates rising zaps.");
    }
    if (release <= 80) {
      messages.push("Short release creates punchier arcade sounds.");
    } else if (release >= 300) {
      messages.push("Long release gives the sound a softer tail.");
    }
    if (duration <= 160) {
      messages.push("Short duration keeps the effect snappy.");
    } else if (duration >= 900) {
      messages.push("Long duration makes the sound feel like a held tone or engine.");
    }
    if (attack <= 10) {
      messages.push("Fast attack gives the sound an instant arcade edge.");
    }
    if (frequency >= 2000) {
      messages.push("High frequency creates bright beeps and alarms.");
    } else if (frequency <= 120) {
      messages.push("Low frequency leans toward thuds and rumbles.");
    }
    return messages.length ? messages.slice(0, 3) : ["Balanced pitch, sweep, and envelope settings keep the sound neutral."];
  }

  syncRecommendedZones() {
    SLIDER_INPUTS.forEach((item) => {
      const input = this[item.inputProperty];
      const zone = this.recommendedZoneFor(item.soundKey);
      const limits = this.activeSliderLimits[item.soundKey];
      const start = this.percentForValue(limits, zone.min);
      const end = this.percentForValue(limits, zone.max);
      input.style.setProperty("--audio-sfx-zone-start", formatPercent(start));
      input.style.setProperty("--audio-sfx-zone-end", formatPercent(end));
      input.dataset.recommendedZone = this.formatRangeText(item.soundKey, zone);
      input.title = `Recommended Zone: ${input.dataset.recommendedZone}`;
    });
  }

  recommendedZoneFor(soundKey) {
    const styleKey = this.styleProfileSelect.value || "custom";
    const limits = this.activeSliderLimits[soundKey];
    if (styleKey === "custom") {
      return { min: limits.min, max: limits.max };
    }
    const profile = STYLE_PROFILES[styleKey] || {};
    const centerSource = Object.hasOwn(profile, soundKey) ? profile[soundKey] : DEFAULT_SOUND[soundKey];
    const center = this.clampNumber(Number(centerSource), limits);
    const totalRange = Math.max(0, limits.max - limits.min);
    const span = Math.max(
      SLIDER_LIMITS[soundKey].step,
      totalRange * (RECOMMENDED_ZONE_SPAN[soundKey] || 0.34)
    );
    const halfSpan = span / 2;
    let min = this.clampNumber(center - halfSpan, limits);
    let max = this.clampNumber(center + halfSpan, limits);
    if (min === max) {
      min = this.clampNumber(center - SLIDER_LIMITS[soundKey].step, limits);
      max = this.clampNumber(center + SLIDER_LIMITS[soundKey].step, limits);
    }
    return { min, max };
  }

  percentForValue(limits, value) {
    const range = limits.max - limits.min;
    if (range <= 0) {
      return 0;
    }
    return (this.clampNumber(value, limits) - limits.min) / range;
  }

  clampNumber(value, limits) {
    if (!Number.isFinite(value)) {
      return limits.min;
    }
    return Math.min(limits.max, Math.max(limits.min, value));
  }

  validate({ nameOverride = "" } = {}) {
    const name = (nameOverride || this.nameInput.value).trim();
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
        playbackMode: this.loopingInput.checked ? "loop" : "oneShot",
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

  currentName() {
    return this.nameInput.value.trim();
  }

  setRenameEnabled(isEnabled) {
    this.renameButton.disabled = !isEnabled;
  }
}
