function populateSelect(select, options, selectedValue) {
  select.replaceChildren(...options.map((option) => {
    const node = document.createElement("option");
    node.value = String(option.value);
    node.textContent = option.label;
    node.selected = String(option.value) === String(selectedValue);
    return node;
  }));
}

function numberValue(input) {
  return Number(input.value);
}

function stringOrNumber(value) {
  return Number.isFinite(Number(value)) && String(value).trim() !== ""
    ? Number(value)
    : String(value);
}

function configureRange(input, output, range) {
  input.min = String(range.min);
  input.max = String(range.max);
  input.step = String(range.step);
  input.value = String(range.value);
  output.textContent = input.value;
}

export class SpeechOptionsControl {
  constructor({
    autoSpeakCheckbox,
    characterPresetSelect,
    delayBetweenRepeatsMsOutput,
    delayBetweenRepeatsMsSlider,
    languageSelect,
    pitchOutput,
    pitchSlider,
    queueModeSelect,
    rateOutput,
    rateSlider,
    repeatCountSelect,
    ssmlLikePresetSelect,
    voiceSelect,
    volumeOutput,
    volumeSlider
  }) {
    this.autoSpeakCheckbox = autoSpeakCheckbox;
    this.characterPresetSelect = characterPresetSelect;
    this.delayBetweenRepeatsMsOutput = delayBetweenRepeatsMsOutput;
    this.delayBetweenRepeatsMsSlider = delayBetweenRepeatsMsSlider;
    this.languageSelect = languageSelect;
    this.pitchOutput = pitchOutput;
    this.pitchSlider = pitchSlider;
    this.queueModeSelect = queueModeSelect;
    this.rateOutput = rateOutput;
    this.rateSlider = rateSlider;
    this.repeatCountSelect = repeatCountSelect;
    this.ssmlLikePresetSelect = ssmlLikePresetSelect;
    this.voiceSelect = voiceSelect;
    this.volumeOutput = volumeOutput;
    this.volumeSlider = volumeSlider;
  }

  populate({
    characterPresetOptions,
    defaults,
    languageOptions,
    queueModeOptions,
    rangeDefaults,
    repeatCountOptions,
    ssmlLikePresetOptions
  }) {
    populateSelect(this.languageSelect, languageOptions, defaults.language);
    populateSelect(this.queueModeSelect, queueModeOptions, defaults.queueMode);
    populateSelect(this.repeatCountSelect, repeatCountOptions, defaults.repeatCount);
    populateSelect(this.characterPresetSelect, characterPresetOptions, defaults.characterPreset);
    populateSelect(this.ssmlLikePresetSelect, ssmlLikePresetOptions, defaults.ssmlLikePreset);
    configureRange(this.volumeSlider, this.volumeOutput, rangeDefaults.volume);
    configureRange(this.rateSlider, this.rateOutput, rangeDefaults.rate);
    configureRange(this.pitchSlider, this.pitchOutput, rangeDefaults.pitch);
    configureRange(this.delayBetweenRepeatsMsSlider, this.delayBetweenRepeatsMsOutput, rangeDefaults.delayBetweenRepeatsMs);
    this.autoSpeakCheckbox.checked = defaults.autoSpeak === true;
  }

  populateVoices(voiceOptions, selectedValue = "") {
    if (voiceOptions.length === 0) {
      const node = document.createElement("option");
      node.value = "";
      node.textContent = "No SpeechSynthesis voices available";
      this.voiceSelect.replaceChildren(node);
      this.voiceSelect.value = "";
      return { selectedVoice: "", voiceCount: 0 };
    }
    populateSelect(this.voiceSelect, voiceOptions, selectedValue || voiceOptions[0].value);
    if (!this.voiceSelect.value) {
      this.voiceSelect.value = voiceOptions[0].value;
    }
    return { selectedVoice: this.voiceSelect.value, voiceCount: voiceOptions.length };
  }

  mount({ onChange }) {
    [
      this.autoSpeakCheckbox,
      this.characterPresetSelect,
      this.delayBetweenRepeatsMsSlider,
      this.languageSelect,
      this.pitchSlider,
      this.queueModeSelect,
      this.rateSlider,
      this.repeatCountSelect,
      this.ssmlLikePresetSelect,
      this.voiceSelect,
      this.volumeSlider
    ].forEach((control) => {
      control.addEventListener(control.tagName === "SELECT" ? "change" : "input", () => {
        this.syncOutputs();
        onChange();
      });
    });
  }

  setValue(value) {
    this.languageSelect.value = String(value.language);
    this.queueModeSelect.value = String(value.queueMode);
    this.repeatCountSelect.value = String(value.repeatCount);
    this.characterPresetSelect.value = String(value.characterPreset);
    this.ssmlLikePresetSelect.value = String(value.ssmlLikePreset);
    this.volumeSlider.value = String(value.volume);
    this.rateSlider.value = String(value.rate);
    this.pitchSlider.value = String(value.pitch);
    this.delayBetweenRepeatsMsSlider.value = String(value.delayBetweenRepeatsMs);
    this.autoSpeakCheckbox.checked = value.autoSpeak === true;
    if (value.voice && Array.from(this.voiceSelect.options).some((option) => option.value === value.voice)) {
      this.voiceSelect.value = value.voice;
    }
    this.syncOutputs();
  }

  syncOutputs() {
    this.volumeOutput.textContent = this.volumeSlider.value;
    this.rateOutput.textContent = this.rateSlider.value;
    this.pitchOutput.textContent = this.pitchSlider.value;
    this.delayBetweenRepeatsMsOutput.textContent = this.delayBetweenRepeatsMsSlider.value;
  }

  hasVoice() {
    return Boolean(this.voiceSelect.value);
  }

  value() {
    return {
      autoSpeak: this.autoSpeakCheckbox.checked,
      characterPreset: this.characterPresetSelect.value,
      delayBetweenRepeatsMs: numberValue(this.delayBetweenRepeatsMsSlider),
      language: this.languageSelect.value,
      pitch: numberValue(this.pitchSlider),
      queueMode: this.queueModeSelect.value,
      rate: numberValue(this.rateSlider),
      repeatCount: stringOrNumber(this.repeatCountSelect.value),
      ssmlLikePreset: this.ssmlLikePresetSelect.value,
      voice: this.voiceSelect.value,
      volume: numberValue(this.volumeSlider)
    };
  }
}
