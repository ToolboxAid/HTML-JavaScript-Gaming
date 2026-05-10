function populateSelect(select, options, selectedValue) {
  select.replaceChildren(...options.map((option) => {
    const node = document.createElement("option");
    node.value = String(option.value);
    node.textContent = option.label;
    node.selected = String(option.value) === String(selectedValue);
    return node;
  }));
}

function numberValue(select) {
  return Number(select.value);
}

export class SpeechOptionsControl {
  constructor({ languageSelect, pitchSelect, rateSelect, volumeSelect }) {
    this.languageSelect = languageSelect;
    this.pitchSelect = pitchSelect;
    this.rateSelect = rateSelect;
    this.volumeSelect = volumeSelect;
  }

  populate({ defaults, languageOptions, pitchOptions, rateOptions, volumeOptions }) {
    populateSelect(this.languageSelect, languageOptions, defaults.language);
    populateSelect(this.rateSelect, rateOptions, defaults.rate);
    populateSelect(this.pitchSelect, pitchOptions, defaults.pitch);
    populateSelect(this.volumeSelect, volumeOptions, defaults.volume);
  }

  mount({ onChange }) {
    [this.languageSelect, this.pitchSelect, this.rateSelect, this.volumeSelect].forEach((select) => {
      select.addEventListener("change", onChange);
    });
  }

  value() {
    return {
      language: this.languageSelect.value,
      pitch: numberValue(this.pitchSelect),
      rate: numberValue(this.rateSelect),
      volume: numberValue(this.volumeSelect)
    };
  }
}
