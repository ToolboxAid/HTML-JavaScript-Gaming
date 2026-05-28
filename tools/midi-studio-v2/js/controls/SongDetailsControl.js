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

function editableRows(song) {
  const arrangement = song.studioArrangement || {};
  return [
    { field: "name", label: "Title", type: "text", value: song.name },
    { field: "tempo", label: "BPM", type: "number", value: arrangement.tempo },
    { field: "key", label: "Key", type: "text", value: arrangement.key },
    { field: "style", label: "Style", type: "text", value: arrangement.style },
    { checked: song.loop.enabled, field: "loopEnabled", label: "Loop enabled", type: "checkbox" },
    { field: "loopStartSeconds", label: "Loop start", step: "0.1", type: "number", value: song.loop.startSeconds },
    { field: "loopEndSeconds", label: "Loop end", step: "0.1", type: "number", value: song.loop.endSeconds },
    { field: "defaultRuntimeFormat", label: "Runtime format", type: "text", value: song.defaultRuntimeFormat },
    { field: "tags", label: "Tags", type: "text", value: song.tags.join(", ") },
    { field: "id", label: "Song ID", readonly: true, type: "text", value: song.id }
  ];
}

export class SongDetailsControl {
  constructor({ details, instrumentSetField, inspector, renderedTargets, sourceField }) {
    this.details = details;
    this.instrumentSetField = instrumentSetField;
    this.inspector = inspector;
    this.onChange = () => {};
    this.renderedTargets = renderedTargets;
    this.sourceField = sourceField;
  }

  mount({ onChange = () => {} } = {}) {
    this.onChange = onChange;
    this.details.addEventListener("input", (event) => this.handleFieldChange(event));
    this.details.addEventListener("change", (event) => this.handleFieldChange(event));
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
      return;
    }
    this.syncSourceFields(song);
    this.renderCurrentDetails(song);
    this.renderDefinitionList(this.renderedTargets, [
      ["WAV", song.rendered.wav || "No rendered WAV target declared."],
      ["MP3", song.rendered.mp3 || "No rendered MP3 target declared."],
      ["OGG", song.rendered.ogg || "No rendered OGG target declared."]
    ]);
    this.inspector.textContent = JSON.stringify(song, null, 2);
  }

  renderEmptyDetails(payload) {
    this.details.replaceChildren();
    this.details.classList.remove("midi-studio-v2__editable-details");
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
      return;
    }
    this.renderEditableDetails(song);
  }

  renderEditableDetails(song) {
    this.details.replaceChildren();
    this.details.classList.add("midi-studio-v2__editable-details");
    editableRows(song).forEach((row) => {
      const wrapper = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      const input = document.createElement("input");
      const id = `songDetail${row.field.charAt(0).toUpperCase()}${row.field.slice(1)}`;

      wrapper.className = "midi-studio-v2__editable-detail";
      term.textContent = row.label;
      input.id = id;
      input.dataset.songDetailField = row.field;
      input.readOnly = row.readonly === true;
      input.type = row.type;
      if (row.step) {
        input.step = row.step;
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
      this.details.append(wrapper);
    });
  }

  showJson(value) {
    this.inspector.textContent = JSON.stringify(value || {}, null, 2);
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
