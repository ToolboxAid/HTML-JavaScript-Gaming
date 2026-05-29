const EXPORT_FORMATS = [
  { key: "wav", label: "WAV" },
  { key: "mp3", label: "MP3" },
  { key: "ogg", label: "OGG" }
];

function displayValue(value) {
  if (value === undefined || value === null || value === "") {
    return "not declared";
  }
  return String(value);
}

function missingTargetLabel(label) {
  return `No rendered ${label} target selected.`;
}

export class ExportPanelControl {
  constructor({ diagnosticTargets, renderedTargets, sourceDetails, statusDetails }) {
    this.diagnosticTargets = diagnosticTargets;
    this.renderedTargets = renderedTargets;
    this.sourceDetails = sourceDetails;
    this.statusDetails = statusDetails;
    this.onTargetChange = () => {};
  }

  mount({ onTargetChange = () => {} } = {}) {
    this.onTargetChange = onTargetChange;
    this.renderedTargets.addEventListener("input", (event) => this.handleTargetInput(event));
    this.renderedTargets.addEventListener("change", (event) => this.handleTargetInput(event));
  }

  handleTargetInput(event) {
    const input = event.target.closest("[data-rendered-target-format]");
    if (!input) {
      return;
    }
    const format = input.dataset.renderedTargetFormat;
    const value = input.value;
    const readout = input.closest(".midi-studio-v2__export-target-row")?.querySelector(".midi-studio-v2__export-target-readout");
    if (readout) {
      const label = EXPORT_FORMATS.find((entry) => entry.key === format)?.label || format.toUpperCase();
      readout.textContent = value.trim() || missingTargetLabel(label);
    }
    this.onTargetChange(format, value);
  }

  render(song, { playable = { count: 0 } } = {}) {
    this.renderSource(song, playable);
    this.renderTargets(song);
    this.renderDiagnostics(song);
    this.setStatus({
      level: song ? "INFO" : "FAIL",
      message: song ? "No export attempted. Rendered audio export is not implemented." : "No MIDI song selected."
    });
  }

  renderSource(song, playable = { count: 0 }) {
    this.renderDefinitionList(this.sourceDetails, [
      ["Selected song", song?.name || "No song selected"],
      ["Playable event count", Number(playable.count || 0)],
      ["Runtime source", song ? "canonical song model / octave timeline data" : "No octave timeline source selected"]
    ]);
  }

  renderTargets(song) {
    this.renderedTargets.replaceChildren();
    EXPORT_FORMATS.forEach(({ key, label }) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      const input = document.createElement("input");
      const readout = document.createElement("span");
      const value = String(song?.rendered?.[key] || "");

      row.className = "midi-studio-v2__export-target-row";
      term.textContent = `${label} target path`;
      input.id = `renderedTarget${label.charAt(0)}${label.slice(1).toLowerCase()}Input`;
      input.type = "text";
      input.disabled = !song;
      input.placeholder = `assets/music/rendered/song.${key}`;
      input.value = value;
      input.dataset.renderedTargetFormat = key;
      input.setAttribute("aria-label", `${label} rendered target path`);
      readout.className = "midi-studio-v2__export-target-readout";
      readout.textContent = value || missingTargetLabel(label);

      description.append(input, readout);
      row.append(term, description);
      this.renderedTargets.append(row);
    });
  }

  renderDiagnostics(song) {
    if (!this.diagnosticTargets) {
      return;
    }
    this.renderDefinitionList(this.diagnosticTargets, EXPORT_FORMATS.map(({ key, label }) => [
      `${label} target`,
      song?.rendered?.[key] || missingTargetLabel(label)
    ]));
  }

  setStatus({ level = "INFO", message = "No export attempted." } = {}) {
    this.statusDetails.dataset.exportStatusLevel = level.toLowerCase();
    this.renderDefinitionList(this.statusDetails, [
      ["Owner", "Export tab owns rendered audio output workflow"],
      ["Renderer", "Not implemented"],
      ["SoundFont", "Planned; not implemented"],
      ["Status", `${level}: ${message}`]
    ]);
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
