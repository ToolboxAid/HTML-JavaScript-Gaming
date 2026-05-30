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

function fieldToken(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function targetFormatSummary(song) {
  return EXPORT_FORMATS
    .map(({ key, label }) => `${label}: ${String(song?.rendered?.[key] || "").trim() ? "ready" : "missing"}`)
    .join("; ");
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
    this.setStatus(this.exportReadiness(song, { playable }));
  }

  renderSource(song, playable = { count: 0 }) {
    this.renderDefinitionList(this.sourceDetails, [
      ["Selected song", song?.name || "No song selected"],
      ["Classification", song?.classification || "not declared"],
      ["Generated ID", song?.id || "not declared"],
      ["Target output formats", targetFormatSummary(song)],
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
    this.renderDefinitionList(this.diagnosticTargets, [
      ["Selected song", song?.name || "No song selected"],
      ["Classification", song?.classification || "not declared"],
      ["Generated ID", song?.id || "not declared"],
      ["Target output formats", targetFormatSummary(song)],
      ...EXPORT_FORMATS.map(({ key, label }) => [
        `${label} target`,
        song?.rendered?.[key] || missingTargetLabel(label)
      ])
    ]);
  }

  exportReadiness(song, { playable = { count: 0 } } = {}) {
    if (!song) {
      return { level: "FAIL", message: "No MIDI song selected.", playable, song };
    }
    const missingTargets = EXPORT_FORMATS
      .filter(({ key }) => !String(song.rendered?.[key] || "").trim())
      .map(({ label }) => label);
    if (Number(playable.count || 0) <= 0) {
      return {
        level: "WARN",
        message: `Selected song ${song.name} has no playable timeline events for rendered export readiness.`,
        playable,
        song
      };
    }
    if (missingTargets.length) {
      return {
        level: "WARN",
        message: `Export source is ready, but target paths are missing for ${missingTargets.join(", ")}. Rendered audio save actions remain visible; rendering is not implemented.`,
        playable,
        song
      };
    }
    return {
      level: "INFO",
      message: "Export source and target formats are declared. Rendered audio save actions remain visible; rendering is not implemented.",
      playable,
      song
    };
  }

  setStatus({ level = "INFO", message = "No export attempted.", song = null } = {}) {
    this.statusDetails.dataset.exportStatusLevel = level.toLowerCase();
    this.renderDefinitionList(this.statusDetails, [
      ["Selected song", song?.name || "No song selected"],
      ["Classification", song?.classification || "not declared"],
      ["Generated ID", song?.id || "not declared"],
      ["Target output formats", targetFormatSummary(song)],
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
      row.dataset.exportField = fieldToken(label);
      term.textContent = label;
      description.textContent = displayValue(value);
      row.append(term, description);
      list.append(row);
    });
  }
}
