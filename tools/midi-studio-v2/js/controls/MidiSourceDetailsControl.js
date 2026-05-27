function sourceDetailRows(details) {
  if (!details?.ok) {
    return [
      ["Status", details?.message || "No MIDI source inspected."]
    ];
  }
  return [
    ["Status", details.validationStatus],
    ["Source path", details.path],
    ["Format", details.format],
    ["Track count", details.trackCount],
    ["Ticks per quarter note", details.ticksPerQuarterNote],
    ["Parsed track chunks", details.tracks.length],
    ["Estimated duration", `${details.durationSeconds} seconds`],
    ["Tempo summary", details.tempoSummary],
    ["Time signature summary", details.timeSignatureSummary],
    ["Note on events", details.eventCounts.noteOn],
    ["Note off events", details.eventCounts.noteOff],
    ["MIDI events", details.eventCounts.midi],
    ["Meta events", details.eventCounts.meta]
  ];
}

export class MidiSourceDetailsControl {
  constructor({ details, inspectButton }) {
    this.details = details;
    this.inspectButton = inspectButton;
  }

  mount({ onInspect }) {
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
