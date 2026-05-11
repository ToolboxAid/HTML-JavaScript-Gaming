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

function configureRange(input, output, range) {
  input.min = String(range.min);
  input.max = String(range.max);
  input.step = String(range.step);
  input.value = String(range.value);
  output.textContent = input.value;
}

function shapedSliderValue(value, input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const clamped = Math.min(max, Math.max(min, value));
  const step = String(input.step || "1");
  const decimalPart = step.includes(".") ? step.split(".")[1] : "";
  const multiplier = 10 ** decimalPart.length;
  return String(Math.round(clamped * multiplier) / multiplier);
}

function optionLabelCompare(left, right) {
  return String(left.label).localeCompare(String(right.label), undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function ageFilterLabel(value) {
  if (value === "adult") {
    return "Adult";
  }
  if (value === "child") {
    return "Child";
  }
  if (value === "elderly") {
    return "Elderly";
  }
  if (value === "teen") {
    return "Teen";
  }
  return "Any";
}

function voiceGender(option) {
  const voiceText = `${option.gender || ""} ${option.name || ""} ${option.label || ""}`;
  const voiceLanguage = String(option.language || "").toLowerCase();
  if (/\bneutral\b|\bnon[-\s]?binary\b|\bandrogynous\b/i.test(voiceText)) {
    return "neutral";
  }
  if (voiceLanguage === "es-es" || /\bmale\b|\bman\b|\bdavid\b|\bmark\b/i.test(voiceText)) {
    return "male";
  }
  if (/\bfemale\b|\bwoman\b|\bzira\b/i.test(voiceText)) {
    return "female";
  }
  return "unknown";
}

function genderFilterLabel(value) {
  if (value === "male-preferred") {
    return "Male Preferred";
  }
  if (value === "female-preferred") {
    return "Female Preferred";
  }
  return "Any";
}

function voicesForGender(voiceOptions, genderFilter) {
  if (genderFilter === "any") {
    return voiceOptions;
  }
  if (genderFilter === "male-preferred") {
    return voiceOptions.filter((option) => ["male", "neutral", "unknown"].includes(voiceGender(option)));
  }
  if (genderFilter === "female-preferred") {
    return voiceOptions.filter((option) => ["female", "neutral", "unknown"].includes(voiceGender(option)));
  }
  return voiceOptions;
}

function voiceDetailsText({ filterLabel, filteredVoiceCount, matchingVoiceOptions, voiceCount }) {
  if (voiceCount === 0) {
    return "No SpeechSynthesis voices loaded.";
  }
  if (filteredVoiceCount === 0) {
    return `0 voices match ${filterLabel}.\n${voiceCount} total voices loaded.`;
  }
  if (matchingVoiceOptions.length === 0) {
    return `0 voices match ${filterLabel}.\n${filteredVoiceCount} ${filterLabel} voices loaded.`;
  }
  const details = matchingVoiceOptions
    .map((option) => `- ${option.language || "unknown"}: ${option.name || option.label}`)
    .join("\n");
  return `${matchingVoiceOptions.length} voices match ${filterLabel}:\n${details}`;
}

function languageOptionsFromVoices(voiceOptions) {
  const languageCounts = new Map();
  voiceOptions.forEach((option) => {
    const language = String(option.language || "").trim();
    if (language) {
      languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
    }
  });
  return Array.from(languageCounts.entries())
    .map(([language, count]) => ({
      label: `${language} (${count} ${count === 1 ? "voice" : "voices"})`,
      value: language
    }))
    .sort(optionLabelCompare);
}

export class SpeechOptionsControl {
  constructor({
    ageFilterSelect,
    characterPresetSelect,
    genderFilterSelect,
    languageSelect,
    pitchOutput,
    pitchSlider,
    queueModeSelect,
    rateOutput,
    rateSlider,
    ssmlLikePresetSelect,
    voiceDetails,
    voiceSelect,
    volumeOutput,
    volumeSlider
  }) {
    this.ageFilterSelect = ageFilterSelect;
    this.characterPresetDefaults = {};
    this.characterPresetSelect = characterPresetSelect;
    this.defaultLanguage = "";
    this.genderFilterSelect = genderFilterSelect;
    this.languageSelect = languageSelect;
    this.pitchOutput = pitchOutput;
    this.pitchSlider = pitchSlider;
    this.queueModeSelect = queueModeSelect;
    this.rateOutput = rateOutput;
    this.rateSlider = rateSlider;
    this.ssmlLikePresetSelect = ssmlLikePresetSelect;
    this.ssmlLikePresetDefaults = {};
    this.voiceDetails = voiceDetails;
    this.voiceOptions = [];
    this.voiceAgePresetDefaults = {};
    this.sliderOverrides = { pitch: false, rate: false, volume: false };
    this.voiceSelect = voiceSelect;
    this.volumeOutput = volumeOutput;
    this.volumeSlider = volumeSlider;
  }

  populate({
    ageFilterOptions,
    characterPresetDefaults,
    characterPresetOptions,
    defaults,
    genderFilterOptions,
    languageOptions,
    queueModeOptions,
    rangeDefaults,
    ssmlLikePresetDefaults,
    ssmlLikePresetOptions,
    voiceAgePresetDefaults
  }) {
    this.characterPresetDefaults = characterPresetDefaults;
    this.defaultLanguage = defaults.language;
    this.ssmlLikePresetDefaults = ssmlLikePresetDefaults || {};
    this.voiceAgePresetDefaults = voiceAgePresetDefaults || {};
    populateSelect(this.ageFilterSelect, ageFilterOptions, "any");
    populateSelect(this.genderFilterSelect, genderFilterOptions, "any");
    populateSelect(this.languageSelect, languageOptions, defaults.language);
    populateSelect(this.queueModeSelect, queueModeOptions, defaults.queueMode);
    populateSelect(this.characterPresetSelect, characterPresetOptions, defaults.characterPreset);
    populateSelect(this.ssmlLikePresetSelect, ssmlLikePresetOptions, defaults.ssmlLikePreset);
    configureRange(this.volumeSlider, this.volumeOutput, rangeDefaults.volume);
    configureRange(this.rateSlider, this.rateOutput, rangeDefaults.rate);
    configureRange(this.pitchSlider, this.pitchOutput, rangeDefaults.pitch);
  }

  applyCharacterPreset() {
    const preset = this.characterPresetDefaults[this.characterPresetSelect.value];
    if (preset?.ssmlLikePreset) {
      this.ssmlLikePresetSelect.value = String(preset.ssmlLikePreset);
    }
    this.applyPresetDerivedSliders({ resetOverrides: true });
  }

  applyPresetDerivedSliders({ resetOverrides = false } = {}) {
    const characterPreset = this.characterPresetDefaults[this.characterPresetSelect.value];
    const voiceAgePreset = this.voiceAgePresetDefaults[this.ageFilterSelect.value];
    const ssmlLikePreset = this.ssmlLikePresetDefaults[this.ssmlLikePresetSelect.value];
    if (!characterPreset || !voiceAgePreset || !ssmlLikePreset) {
      return;
    }
    if (resetOverrides) {
      this.sliderOverrides = { pitch: false, rate: false, volume: false };
    }
    if (!this.sliderOverrides.volume) {
      this.volumeSlider.value = shapedSliderValue(Number(characterPreset.volume) * Number(ssmlLikePreset.volumeMultiplier), this.volumeSlider);
    }
    if (!this.sliderOverrides.rate) {
      this.rateSlider.value = shapedSliderValue(Number(characterPreset.rate) * Number(voiceAgePreset.rateMultiplier) * Number(ssmlLikePreset.rateMultiplier), this.rateSlider);
    }
    if (!this.sliderOverrides.pitch) {
      this.pitchSlider.value = shapedSliderValue(Number(characterPreset.pitch) + Number(voiceAgePreset.pitchOffset) + Number(ssmlLikePreset.pitchOffset), this.pitchSlider);
    }
    this.syncOutputs();
  }

  populateVoices(voiceOptions, selectedValue = undefined) {
    this.voiceOptions = voiceOptions.map((option) => ({ ...option }));
    const languageResult = this.populateLanguages();
    const voiceResult = this.filterVoices(selectedValue);
    return {
      ...voiceResult,
      ...languageResult
    };
  }

  populateLanguages() {
    const ageFilter = this.ageFilterSelect.value;
    const ageFilterLabelValue = ageFilterLabel(ageFilter);
    const genderFilterLabelValue = genderFilterLabel(this.genderFilterSelect.value);
    const filteredVoiceOptions = voicesForGender(this.voiceOptions, this.genderFilterSelect.value);
    const filterLabel = genderFilterLabelValue;
    const voiceLanguageOptions = languageOptionsFromVoices(filteredVoiceOptions);
    const previousLanguage = this.languageSelect.value;
    if (voiceLanguageOptions.length === 0) {
      if (this.voiceOptions.length > 0) {
        const node = document.createElement("option");
        node.value = "";
        node.textContent = `No ${filterLabel} voice languages`;
        this.languageSelect.replaceChildren(node);
        this.languageSelect.value = "";
        return {
          ageFilter,
          ageFilterLabel: ageFilterLabelValue,
          filterLabel,
          genderFilter: this.genderFilterSelect.value,
          genderFilterLabel: genderFilterLabelValue,
          filteredVoiceCount: filteredVoiceOptions.length,
          language: "",
          languageAdjusted: Boolean(previousLanguage),
          languageCount: 0,
          previousLanguage
        };
      }
      return {
        ageFilter,
        ageFilterLabel: ageFilterLabelValue,
        filterLabel,
        genderFilter: this.genderFilterSelect.value,
        genderFilterLabel: genderFilterLabelValue,
        filteredVoiceCount: filteredVoiceOptions.length,
        language: previousLanguage,
        languageAdjusted: false,
        languageCount: this.languageSelect.options.length,
        previousLanguage
      };
    }
    let selectedLanguage = voiceLanguageOptions[0].value;
    if (voiceLanguageOptions.some((option) => option.value === this.defaultLanguage)) {
      selectedLanguage = this.defaultLanguage;
    }
    if (voiceLanguageOptions.some((option) => option.value === previousLanguage)) {
      selectedLanguage = previousLanguage;
    }
    populateSelect(this.languageSelect, voiceLanguageOptions, selectedLanguage);
    this.languageSelect.value = selectedLanguage;
    return {
      ageFilter,
      ageFilterLabel: ageFilterLabelValue,
      filterLabel,
      genderFilter: this.genderFilterSelect.value,
      genderFilterLabel: genderFilterLabelValue,
      filteredVoiceCount: filteredVoiceOptions.length,
      language: selectedLanguage,
      languageAdjusted: selectedLanguage !== previousLanguage,
      languageCount: voiceLanguageOptions.length,
      previousLanguage
    };
  }

  filterVoices(selectedValue = undefined) {
    const ageFilter = this.ageFilterSelect.value;
    const ageLabel = ageFilterLabel(ageFilter);
    const genderFilter = this.genderFilterSelect.value;
    const genderLabel = genderFilterLabel(genderFilter);
    const filterLabel = genderLabel;
    const language = this.languageSelect.value;
    const previousValue = this.voiceSelect.value;
    const voiceCount = this.voiceOptions.length;
    const filteredVoiceOptions = voicesForGender(this.voiceOptions, genderFilter);
    const matchingVoiceOptions = filteredVoiceOptions
      .filter((option) => option.language === language)
      .sort(optionLabelCompare);
    this.voiceDetails.textContent = voiceDetailsText({
      filterLabel,
      filteredVoiceCount: filteredVoiceOptions.length,
      matchingVoiceOptions,
      voiceCount
    });
    if (voiceCount === 0) {
      const node = document.createElement("option");
      node.value = "";
      node.textContent = "No SpeechSynthesis voices available";
      this.voiceSelect.replaceChildren(node);
      this.voiceSelect.value = "";
      return {
        ageFilter,
        ageFilterLabel: ageLabel,
        filterLabel,
        filteredVoiceCount: filteredVoiceOptions.length,
        genderFilter,
        genderFilterLabel: genderLabel,
        language,
        matchingVoiceCount: 0,
        previousVoice: previousValue,
        selectedVoice: "",
        selectedVoiceLabel: "",
        selectionAdjusted: Boolean(previousValue),
        voiceCount
      };
    }
    if (matchingVoiceOptions.length === 0) {
      const node = document.createElement("option");
      node.value = "";
      node.textContent = filteredVoiceOptions.length === 0
        ? `No ${filterLabel} voices available`
        : `No ${filterLabel} voices for ${language}`;
      this.voiceSelect.replaceChildren(node);
      this.voiceSelect.value = "";
      return {
        ageFilter,
        ageFilterLabel: ageLabel,
        filterLabel,
        filteredVoiceCount: filteredVoiceOptions.length,
        genderFilter,
        genderFilterLabel: genderLabel,
        language,
        matchingVoiceCount: 0,
        previousVoice: previousValue,
        selectedVoice: "",
        selectedVoiceLabel: "",
        selectionAdjusted: Boolean(previousValue),
        voiceCount
      };
    }
    const requestedValue = selectedValue === undefined ? previousValue : selectedValue;
    const requestedVoice = matchingVoiceOptions.find((option) => option.value === requestedValue);
    const selectedVoice = requestedVoice || matchingVoiceOptions[0];
    populateSelect(this.voiceSelect, matchingVoiceOptions, selectedVoice.value);
    this.voiceSelect.value = String(selectedVoice.value);
    return {
      ageFilter,
      ageFilterLabel: ageLabel,
      filterLabel,
      filteredVoiceCount: filteredVoiceOptions.length,
      genderFilter,
      genderFilterLabel: genderLabel,
      language,
      matchingVoiceCount: matchingVoiceOptions.length,
      previousVoice: previousValue,
      selectedVoice: this.voiceSelect.value,
      selectedVoiceLabel: selectedVoice.label,
      selectionAdjusted: this.voiceSelect.value !== previousValue,
      voiceCount
    };
  }

  mount({ onChange }) {
    this.characterPresetSelect.addEventListener("change", () => {
      this.applyCharacterPreset();
      onChange({ controlId: "characterPreset" });
    });
    this.ageFilterSelect.addEventListener("change", () => {
      this.applyPresetDerivedSliders();
      onChange({ controlId: "age" });
    });
    this.ssmlLikePresetSelect.addEventListener("change", () => {
      this.applyPresetDerivedSliders({ resetOverrides: true });
      onChange({ controlId: "ssmlLikePreset" });
    });
    this.genderFilterSelect.addEventListener("change", () => {
      this.syncOutputs();
      onChange({ controlId: "gender" });
    });
    this.languageSelect.addEventListener("change", () => {
      this.syncOutputs();
      onChange({ controlId: "language" });
    });
    [
      this.queueModeSelect,
      this.voiceSelect
    ].forEach((control) => {
      control.addEventListener(control.tagName === "SELECT" ? "change" : "input", () => {
        this.syncOutputs();
        onChange({ controlId: control.id });
      });
    });
    [
      { input: this.pitchSlider, slider: "pitch" },
      { input: this.rateSlider, slider: "rate" },
      { input: this.volumeSlider, slider: "volume" }
    ].forEach(({ input, slider }) => {
      input.addEventListener("input", () => {
        this.sliderOverrides[slider] = true;
        this.syncOutputs();
        onChange({ controlId: input.id });
      });
    });
  }

  setValue(value) {
    this.sliderOverrides = { pitch: false, rate: false, volume: false };
    this.genderFilterSelect.value = String(value.gender || "any");
    if (this.voiceOptions.length > 0) {
      this.populateLanguages();
    }
    this.ageFilterSelect.value = String(value.voiceAge || "any");
    this.languageSelect.value = String(value.language);
    this.queueModeSelect.value = String(value.queueMode);
    this.characterPresetSelect.value = String(value.characterPreset);
    this.ssmlLikePresetSelect.value = String(value.ssmlLikePreset);
    this.volumeSlider.value = String(value.volume);
    this.rateSlider.value = String(value.rate);
    this.pitchSlider.value = String(value.pitch);
    this.voiceSelect.value = "";
    if (value.voice && Array.from(this.voiceSelect.options).some((option) => option.value === String(value.voice))) {
      this.voiceSelect.value = String(value.voice);
    }
    this.syncOutputs();
  }

  syncOutputs() {
    this.volumeOutput.textContent = this.volumeSlider.value;
    this.rateOutput.textContent = this.rateSlider.value;
    this.pitchOutput.textContent = this.pitchSlider.value;
  }

  hasVoice() {
    return Boolean(this.voiceSelect.value);
  }

  selectedVoiceAgeLabel() {
    return ageFilterLabel(this.ageFilterSelect.value);
  }

  value() {
    return {
      characterPreset: this.characterPresetSelect.value,
      gender: this.genderFilterSelect.value,
      language: this.languageSelect.value,
      pitch: numberValue(this.pitchSlider),
      queueMode: this.queueModeSelect.value,
      rate: numberValue(this.rateSlider),
      ssmlLikePreset: this.ssmlLikePresetSelect.value,
      voice: this.voiceSelect.value,
      voiceAge: this.ageFilterSelect.value,
      volume: numberValue(this.volumeSlider)
    };
  }
}
