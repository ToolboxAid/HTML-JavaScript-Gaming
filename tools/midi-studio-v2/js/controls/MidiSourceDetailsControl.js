function sourceDetailRows(details) {
  if (!details?.ok) {
    return [
      ["Workflow", "Local MIDI file import is separate from JSON manifest import. Use Import MIDI Source for .mid/.midi files; use Import JSON Manifest for game manifests."],
      ["Inspection result", details?.message ? `FAIL ${details.message}` : "WARN No MIDI source inspected."],
      ["Canonical conversion", "WARN Local MIDI import normalizes note timing into the canonical studio arrangement; advanced controller and velocity conversion remains future work."]
    ];
  }
  const warnings = String(details.warningSummary || "").trim();
  const inspectionStatus = warnings && warnings !== "none"
    ? `WARN ${details.validationStatus}`
    : `PASS ${details.validationStatus}`;
  return [
    ["Workflow", "Local MIDI file import is separate from JSON manifest import. Use Import MIDI Source for .mid/.midi files; use Import JSON Manifest for game manifests."],
    ["Inspection result", inspectionStatus],
    ["Canonical conversion", "PASS Local MIDI notes can populate the canonical studio arrangement; WARN advanced MIDI event conversion remains future work."],
    ["Source path", details.path],
    ["Format", details.format],
    ["Track count", details.trackCount],
    ["Ticks per quarter note", details.ticksPerQuarterNote],
    ["Parsed track chunks", details.tracks.length],
    ["Estimated duration", `${details.durationSeconds} seconds`],
    ["Loop-safe duration", `${details.loopSafeDurationSeconds} seconds`],
    ["Tempo summary", details.tempoSummary],
    ["Time signature summary", details.timeSignatureSummary],
    ["Note on events", details.eventCounts.noteOn],
    ["Note off events", details.eventCounts.noteOff],
    ["MIDI events", details.eventCounts.midi],
    ["Meta events", details.eventCounts.meta],
    ["Normalized note count", details.normalizedNoteCount],
    ["Channel summary", details.channelSummary],
    ["Instrument/program summary", details.instrumentSummary],
    ["Bar/measure estimate", details.measureTimingSummary],
    ["Track activity summary", details.trackActivitySummary],
    ["Warnings", details.warningSummary]
  ];
}

export class MidiSourceDetailsControl {
  constructor({ details, importButton, input, inspectButton }) {
    this.details = details;
    this.importButton = importButton;
    this.input = input;
    this.inspectButton = inspectButton;
  }

  mount({ onImport, onInspect }) {
    this.importButton.addEventListener("click", () => this.input.click());
    this.input.addEventListener("change", () => onImport(this.input.files?.[0] || null));
    this.inspectButton.addEventListener("click", () => onInspect());
  }

  render(details = null) {
    this.renderDefinitionList(sourceDetailRows(details));
  }

  setEnabled(enabled) {
    this.inspectButton.disabled = !enabled;
  }

  renderDefinitionList(rows) {
    this.details.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = value === undefined || value === null || value === "" ? "not declared" : String(value);
      row.append(term, description);
      this.details.append(row);
    });
  }
}
