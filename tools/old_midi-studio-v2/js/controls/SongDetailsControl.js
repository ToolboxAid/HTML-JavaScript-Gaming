function displayValue(value) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "not declared";
  }
  if (value === true) {
    return "true";
  }
  if (value === false) {
    return "false";
  }
  if (value === undefined || value === null || value === "") {
    return "not declared";
  }
  return String(value);
}

const CLASSIFICATION_HELP = "Classification examples: Menu, Intro, Loop, Boss, Victory, Game Over, Ambient, Cutscene, Underwater, Flying, Ice, Lava, Space, Castle, Town, Dungeon, Forest, Night, Stealth, Puzzle, Chase. Guidance: Classification remains human-entered; it seeds default section templates, instrument suggestions, and generation hints while the ID stays camelCase(Name)-Classification.";
const CLASSIFICATION_EXAMPLES = [
  "Menu",
  "Intro",
  "Loop",
  "Boss",
  "Victory",
  "Game Over",
  "Ambient",
  "Cutscene",
  "Underwater",
  "Flying",
  "Ice",
  "Lava",
  "Space",
  "Castle",
  "Town",
  "Dungeon",
  "Forest",
  "Night",
  "Stealth",
  "Puzzle",
  "Chase"
];
const GAME_USAGE_OPTIONS = ["Menu", "Intro", "Loop", "Boss", "Victory", "Game Over", "Ambient", "Cutscene"];

function editableRows(song) {
  return [
    { field: "name", label: "Name", type: "text", value: song.name },
    { field: "classification", help: CLASSIFICATION_HELP, label: "Classification", type: "text", value: song.classification },
    { field: "id", label: "Id", readonly: true, type: "text", value: song.id }
  ];
}

function notesRows(song) {
  if (song.director?.notes) {
    return [{ field: "notes", label: "Notes", rows: 3, type: "textarea", value: song.director.notes }];
  }
  return [];
}

function sectionsLoopRows(song) {
  return [
    { checked: song.loop.enabled, field: "loopEnabled", label: "Loop enabled", type: "checkbox" },
    { field: "loopStartSeconds", label: "Loop start", step: "0.1", type: "number", value: song.loop.startSeconds },
    { field: "loopEndSeconds", label: "Loop end", step: "0.1", type: "number", value: song.loop.endSeconds }
  ];
}

export class SongDetailsControl {
  constructor({
    applyClassificationExampleButton,
    classificationExampleSelect,
    classificationLibrarySummary,
    details,
    gameUsageCustomInput,
    gameUsageInputs,
    gameUsageSummary,
    generatedIdPreview,
    instrumentSetField,
    inspector,
    notesDetails,
    renderedTargets,
    sectionsLoopDetails,
    sourceField
  }) {
    this.applyClassificationExampleButton = applyClassificationExampleButton;
    this.classificationExampleSelect = classificationExampleSelect;
    this.classificationLibrarySummary = classificationLibrarySummary;
    this.details = details;
    this.gameUsageCustomInput = gameUsageCustomInput;
    this.gameUsageInputs = gameUsageInputs || [];
    this.gameUsageSummary = gameUsageSummary;
    this.generatedIdPreview = generatedIdPreview;
    this.instrumentSetField = instrumentSetField;
    this.inspector = inspector;
    this.notesDetails = notesDetails;
    this.onChange = () => {};
    this.renderedTargets = renderedTargets;
    this.sectionsLoopDetails = sectionsLoopDetails;
    this.sourceField = sourceField;
  }

  mount({ onChange = () => {} } = {}) {
    this.onChange = onChange;
    this.initializeClassificationExamples();
    [this.details, this.notesDetails, this.sectionsLoopDetails].filter(Boolean).forEach((list) => {
      list.addEventListener("input", (event) => this.handleFieldChange(event));
      list.addEventListener("change", (event) => this.handleFieldChange(event));
    });
    this.applyClassificationExampleButton?.addEventListener("click", () => {
      const value = this.classificationExampleSelect?.value || "";
      if (!value) {
        return;
      }
      this.updateFieldValue("classification", value);
      this.renderClassificationLibrarySummary(value);
      this.onChange("classification", value);
    });
    this.gameUsageInputs.forEach((input) => {
      input.addEventListener("change", () => this.handleGameUsageChange());
    });
    this.gameUsageCustomInput?.addEventListener("input", () => this.handleGameUsageChange());
  }

  handleFieldChange(event) {
    const field = event.target.closest("[data-song-detail-field]");
    if (!field) {
      return;
    }
    const value = field.type === "checkbox" ? field.checked : field.value;
    this.onChange(field.dataset.songDetailField, value);
  }

  render(song, payload) {
    if (!song) {
      this.sourceField.value = "No song selected";
      this.instrumentSetField.value = "No song selected";
      this.renderEmptyDetails(payload);
      this.renderGeneratedIdPreview(null);
      this.renderGameUsage(null);
      return;
    }
    this.syncSourceFields(song);
    this.renderCurrentDetails(song);
    this.renderGeneratedIdPreview(song);
    this.renderGameUsage(song);
    this.renderClassificationLibrarySummary(song.classification);
    this.renderDefinitionList(this.renderedTargets, [
      ["WAV", song.rendered.wav || "No rendered WAV target declared."],
      ["MP3", song.rendered.mp3 || "No rendered MP3 target declared."],
      ["OGG", song.rendered.ogg || "No rendered OGG target declared."]
    ]);
    this.inspector.textContent = JSON.stringify(song, null, 2);
  }

  initializeClassificationExamples() {
    if (!this.classificationExampleSelect) {
      return;
    }
    this.classificationExampleSelect.replaceChildren();
    CLASSIFICATION_EXAMPLES.forEach((example) => {
      const option = document.createElement("option");
      option.value = example;
      option.textContent = example;
      this.classificationExampleSelect.append(option);
    });
    this.renderClassificationLibrarySummary("");
  }

  renderEmptyDetails(payload) {
    this.details.replaceChildren();
    this.details.classList.remove("midi-studio-v2__editable-details");
    this.renderEmptyNotesDetails();
    this.renderEmptySectionsLoopDetails();
    if (this.details.hidden) {
      this.renderDefinitionList(this.renderedTargets, [["WAV", "No rendered WAV target selected."], ["MP3", "No rendered MP3 target selected."], ["OGG", "No rendered OGG target selected."]]);
      this.inspector.textContent = JSON.stringify(payload || {}, null, 2);
      return;
    }
    const empty = document.createElement("p");
    empty.className = "tool-starter__hint";
    empty.textContent = "No song selected.";
    this.details.append(empty);
    this.renderDefinitionList(this.renderedTargets, [["WAV", "No rendered WAV target selected."], ["MP3", "No rendered MP3 target selected."], ["OGG", "No rendered OGG target selected."]]);
    this.inspector.textContent = JSON.stringify(payload || {}, null, 2);
  }

  renderCurrentDetails(song) {
    if (this.details.hidden) {
      this.details.replaceChildren();
      this.details.classList.remove("midi-studio-v2__editable-details");
      this.renderSectionsLoopDetails(song);
      return;
    }
    this.renderEditableDetails(song);
    this.renderSectionsLoopDetails(song);
  }

  renderEditableDetails(song) {
    this.details.replaceChildren();
    this.details.classList.add("midi-studio-v2__editable-details");
    this.renderEditableRows(this.details, editableRows(song));
    this.renderNotesDetails(song);
  }

  renderNotesDetails(song) {
    if (!this.notesDetails) {
      return;
    }
    this.notesDetails.replaceChildren();
    const rows = notesRows(song);
    this.notesDetails.hidden = !rows.length;
    this.notesDetails.classList.toggle("midi-studio-v2__editable-details", rows.length > 0);
    if (rows.length) {
      this.renderEditableRows(this.notesDetails, rows);
    }
  }

  renderSectionsLoopDetails(song) {
    if (!this.sectionsLoopDetails) {
      return;
    }
    this.sectionsLoopDetails.replaceChildren();
    this.sectionsLoopDetails.classList.add("midi-studio-v2__editable-details");
    this.renderEditableRows(this.sectionsLoopDetails, sectionsLoopRows(song));
  }

  renderEmptySectionsLoopDetails() {
    if (!this.sectionsLoopDetails) {
      return;
    }
    this.sectionsLoopDetails.replaceChildren();
    this.sectionsLoopDetails.classList.remove("midi-studio-v2__editable-details");
    const empty = document.createElement("p");
    empty.className = "tool-starter__hint";
    empty.textContent = "No song selected.";
    this.sectionsLoopDetails.append(empty);
  }

  renderEmptyNotesDetails() {
    if (!this.notesDetails) {
      return;
    }
    this.notesDetails.replaceChildren();
    this.notesDetails.classList.remove("midi-studio-v2__editable-details");
    this.notesDetails.hidden = true;
  }

  renderClassificationLibrarySummary(classification) {
    if (!this.classificationLibrarySummary) {
      return;
    }
    const value = String(classification || "").trim();
    const exampleMatch = CLASSIFICATION_EXAMPLES.some((example) => example.toLowerCase() === value.toLowerCase());
    this.classificationLibrarySummary.textContent = value
      ? `${value} is ${exampleMatch ? "from the common examples" : "a custom classification"}. Classification remains Song Details metadata.`
      : "Classification remains user-entered; examples are starting points.";
    this.classificationLibrarySummary.dataset.classificationValue = value;
    this.classificationLibrarySummary.dataset.classificationIsCommon = String(exampleMatch);
  }

  renderGeneratedIdPreview(song) {
    if (!this.generatedIdPreview) {
      return;
    }
    const generatedId = song?.id || "not declared";
    this.generatedIdPreview.textContent = `Generated ID: ${generatedId}`;
    this.generatedIdPreview.dataset.generatedIdPreview = generatedId;
  }

  renderGameUsage(song) {
    const usage = Array.isArray(song?.director?.usage) ? song.director.usage : [];
    const usageKeys = new Set(usage.map((entry) => String(entry).toLowerCase()));
    this.gameUsageInputs.forEach((input) => {
      input.checked = usageKeys.has(String(input.value || "").toLowerCase());
      input.disabled = !song;
    });
    if (this.gameUsageCustomInput) {
      this.gameUsageCustomInput.disabled = !song;
      this.gameUsageCustomInput.value = usage
        .filter((entry) => !GAME_USAGE_OPTIONS.some((option) => option.toLowerCase() === String(entry).toLowerCase()))
        .join(", ");
    }
    this.renderGameUsageSummary(usage);
  }

  gameUsageSelection() {
    const selected = this.gameUsageInputs
      .filter((input) => input.checked)
      .map((input) => input.value);
    const custom = String(this.gameUsageCustomInput?.value || "")
      .split(/[\n,;]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    const normalized = new Set();
    [...selected, ...custom].forEach((entry) => {
      const key = entry.toLowerCase();
      if (!normalized.has(key)) {
        normalized.add(key);
      }
    });
    return Array.from(normalized, (key) => {
      const common = GAME_USAGE_OPTIONS.find((option) => option.toLowerCase() === key);
      return common || [...selected, ...custom].find((entry) => entry.toLowerCase() === key) || key;
    });
  }

  handleGameUsageChange() {
    const usage = this.gameUsageSelection();
    this.renderGameUsageSummary(usage);
    this.onChange("usage", usage);
  }

  renderGameUsageSummary(usage) {
    if (!this.gameUsageSummary) {
      return;
    }
    const values = Array.isArray(usage) ? usage.filter(Boolean) : [];
    this.gameUsageSummary.textContent = values.length
      ? `Assigned game usage: ${values.join(", ")}`
      : "No game usage assigned.";
    this.gameUsageSummary.dataset.gameUsageCount = String(values.length);
    this.gameUsageSummary.dataset.gameUsageValues = values.join(", ");
  }

  renderEditableRows(list, rows) {
    rows.forEach((row) => {
      const wrapper = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      const input = row.type === "textarea" ? document.createElement("textarea") : document.createElement("input");
      const id = `songDetail${row.field.charAt(0).toUpperCase()}${row.field.slice(1)}`;

      wrapper.className = "midi-studio-v2__editable-detail";
      const label = document.createElement("span");
      label.textContent = row.label;
      term.append(label);
      if (row.help) {
        const help = document.createElement("span");
        help.className = "midi-studio-v2__field-help";
        help.dataset.songDetailHelp = row.field;
        help.setAttribute("aria-label", row.help);
        help.title = row.help;
        help.textContent = "?";
        term.append(help);
      }
      input.id = id;
      input.dataset.songDetailField = row.field;
      input.readOnly = row.readonly === true;
      if (row.type !== "textarea") {
        input.type = row.type;
      }
      if (row.step) {
        input.step = row.step;
      }
      if (row.rows) {
        input.rows = row.rows;
      }
      if (row.type === "number") {
        input.inputMode = "decimal";
      }
      if (row.type === "checkbox") {
        input.checked = row.checked === true;
      } else {
        input.value = displayValue(row.value) === "not declared" ? "" : displayValue(row.value);
      }
      description.append(input);
      wrapper.append(term, description);
      list.append(wrapper);
    });
  }

  showJson(value) {
    this.inspector.textContent = JSON.stringify(value || {}, null, 2);
  }

  updateFieldValue(field, value) {
    const control = this.details.querySelector(`[data-song-detail-field="${field}"]`)
      || this.notesDetails?.querySelector(`[data-song-detail-field="${field}"]`);
    if (control && control.type !== "checkbox") {
      control.value = displayValue(value) === "not declared" ? "" : displayValue(value);
    }
  }

  updateGeneratedIdPreview(song) {
    this.renderGeneratedIdPreview(song);
  }

  syncSourceFields(song) {
    this.sourceField.value = song?.sourceMidi || "No MIDI source declared.";
    this.instrumentSetField.value = song?.instrumentSet || "not declared";
  }

  renderDefinitionList(list, rows) {
    list.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = displayValue(value);
      row.append(term, description);
      list.append(row);
    });
  }
}
