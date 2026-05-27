function summaryRows(result) {
  if (!result?.ok) {
    return [["Status", result?.message || "No instrument grid normalized."]];
  }
  return [
    ["Sections", result.sectionSummary],
    ["Bars", result.barCount],
    ["Beats", result.beatCount],
    ["Subdivision", result.subdivision],
    ["Events", result.eventCount],
    ["Notes", result.noteCount],
    ["Chords", result.chordCount],
    ["Drums", result.drumCount],
    ["Timeline", `${result.timeline.length} normalized event${result.timeline.length === 1 ? "" : "s"}`],
    ["Warnings", result.warningSummary]
  ];
}

export class InstrumentGridControl {
  constructor({ bassInput, beatsInput, chordsInput, drumsInput, gridOutput, leadInput, normalizeButton, padInput, sectionsInput, subdivisionInput, summary }) {
    this.bassInput = bassInput;
    this.beatsInput = beatsInput;
    this.chordsInput = chordsInput;
    this.drumsInput = drumsInput;
    this.gridOutput = gridOutput;
    this.leadInput = leadInput;
    this.normalizeButton = normalizeButton;
    this.padInput = padInput;
    this.sectionsInput = sectionsInput;
    this.subdivisionInput = subdivisionInput;
    this.summary = summary;
  }

  mount({ onNormalize }) {
    this.normalizeButton.addEventListener("click", () => onNormalize(this.readInput()));
  }

  readInput() {
    return {
      beatsPerBar: this.beatsInput.value,
      lanes: {
        bass: this.bassInput.value,
        chords: this.chordsInput.value,
        drums: this.drumsInput.value,
        lead: this.leadInput.value,
        pad: this.padInput.value
      },
      sections: this.sectionsInput.value,
      subdivision: this.subdivisionInput.value
    };
  }

  render(result = null) {
    this.renderDefinitionList(summaryRows(result));
    this.gridOutput.replaceChildren();
    if (!result?.ok) {
      const empty = document.createElement("p");
      empty.className = "midi-studio-v2__empty";
      empty.textContent = result?.message || "No aligned grid normalized.";
      this.gridOutput.append(empty);
      return;
    }
    this.renderGrid(result);
  }

  renderGrid(result) {
    const grid = document.createElement("div");
    grid.className = "midi-studio-v2__instrument-grid";
    grid.style.gridTemplateColumns = `7rem repeat(${result.totalSteps}, minmax(3rem, 1fr))`;
    this.appendCell(grid, "Section", "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label");
    result.sections.forEach((section) => {
      const cell = this.appendCell(grid, section.label, "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--section");
      cell.style.gridColumn = `span ${section.steps}`;
    });
    this.appendCell(grid, "Beat", "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label");
    result.cells.chords.forEach((cell) => {
      this.appendCell(grid, `B${cell.bar}.${cell.beat}${result.subdivision > 1 ? `.${cell.subdivisionStep}` : ""}`, "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--beat");
    });
    result.lanes.forEach((lane) => {
      this.appendCell(grid, lane, "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label");
      result.cells[lane].forEach((cell) => {
        const className = cell.token ? "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--event" : "midi-studio-v2__grid-cell";
        this.appendCell(grid, cell.token || "-", className);
      });
    });
    this.gridOutput.append(grid);
  }

  appendCell(grid, text, className) {
    const cell = document.createElement("div");
    cell.className = className;
    cell.textContent = text;
    grid.append(cell);
    return cell;
  }

  renderDefinitionList(rows) {
    this.summary.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = value === undefined || value === null || value === "" ? "not declared" : String(value);
      row.append(term, description);
      this.summary.append(row);
    });
  }
}
