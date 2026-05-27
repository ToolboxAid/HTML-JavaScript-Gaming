function summaryRows(result) {
  if (!result?.ok) {
    return [["Status", result?.message || "No instrument grid normalized."]];
  }
  const generatedCells = Object.values(result.cells).flat().filter((cell) => cell.source === "generated").length;
  const manualCells = Object.values(result.cells).flat().filter((cell) => cell.source === "manual").length;
  return [
    ["Sections", result.sectionSummary],
    ["Bars", result.barCount],
    ["Beats", result.beatCount],
    ["Subdivision", result.subdivisionLabel || result.subdivision],
    ["Events", result.eventCount],
    ["Notes", result.noteCount],
    ["Chords", result.chordCount],
    ["Drums", result.drumCount],
    ["Generated cells", generatedCells],
    ["Manual cells", manualCells],
    ["Timeline", `${result.timeline.length} normalized event${result.timeline.length === 1 ? "" : "s"}`],
    ["Warnings", result.warningSummary]
  ];
}

export class InstrumentGridControl {
  constructor({
    bassInput,
    beatsInput,
    chordsInput,
    drumsInput,
    generateArpeggioButton,
    generateBassButton,
    generateDrumsButton,
    generatePadButton,
    gridOutput,
    leadInput,
    normalizeButton,
    padInput,
    sectionsInput,
    snapIndicator,
    subdivisionInput,
    summary
  }) {
    this.bassInput = bassInput;
    this.beatsInput = beatsInput;
    this.chordsInput = chordsInput;
    this.drumsInput = drumsInput;
    this.generateArpeggioButton = generateArpeggioButton;
    this.generateBassButton = generateBassButton;
    this.generateDrumsButton = generateDrumsButton;
    this.generatePadButton = generatePadButton;
    this.generatedLanes = {};
    this.gridOutput = gridOutput;
    this.leadInput = leadInput;
    this.normalizeButton = normalizeButton;
    this.padInput = padInput;
    this.sectionsInput = sectionsInput;
    this.snapIndicator = snapIndicator;
    this.subdivisionInput = subdivisionInput;
    this.summary = summary;
  }

  mount({ onGenerate, onNormalize }) {
    this.generateBassButton.addEventListener("click", () => onGenerate("bass", this.readInput()));
    this.generatePadButton.addEventListener("click", () => onGenerate("pad", this.readInput()));
    this.generateArpeggioButton.addEventListener("click", () => onGenerate("lead", this.readInput()));
    this.generateDrumsButton.addEventListener("click", () => onGenerate("drums", this.readInput()));
    this.normalizeButton.addEventListener("click", () => onNormalize(this.readInput()));
    [this.sectionsInput, this.beatsInput, this.subdivisionInput].forEach((input) => {
      input.addEventListener("input", () => this.updateSnapIndicator());
      input.addEventListener("change", () => this.updateSnapIndicator());
    });
    this.updateSnapIndicator();
  }

  readInput() {
    return {
      beatsPerBar: this.beatsInput.value,
      generatedLanes: { ...this.generatedLanes },
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

  applyGeneratedLane(result) {
    const laneInput = this.inputForLane(result?.lane);
    if (!result?.ok || !laneInput) {
      return;
    }
    laneInput.value = result.text;
    this.generatedLanes[result.lane] = result.text;
  }

  inputForLane(lane) {
    return {
      bass: this.bassInput,
      drums: this.drumsInput,
      lead: this.leadInput,
      pad: this.padInput
    }[lane] || null;
  }

  updateSnapIndicator() {
    const bars = this.estimatedBarCount();
    const beats = this.beatsInput.value || "?";
    const subdivision = this.subdivisionInput.selectedOptions[0]?.textContent || `1/${this.subdivisionInput.value || "?"}`;
    this.snapIndicator.textContent = `Snap: ${bars} bar${bars === 1 ? "" : "s"} / ${beats} beats / ${subdivision}`;
  }

  estimatedBarCount() {
    const text = String(this.sectionsInput.value || "").trim();
    if (!text) {
      return 0;
    }
    return text.split(",").reduce((total, part) => {
      const match = part.trim().match(/^[A-Za-z][A-Za-z0-9_-]*\s*:\s*(\d+)$/);
      return match ? total + Number(match[1]) : total;
    }, 0);
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
        const classes = ["midi-studio-v2__grid-cell"];
        if (cell.token) {
          classes.push("midi-studio-v2__grid-cell--event");
        }
        if (cell.source === "generated") {
          classes.push("midi-studio-v2__grid-cell--generated");
        }
        if (cell.source === "manual") {
          classes.push("midi-studio-v2__grid-cell--manual");
        }
        const outputCell = this.appendCell(grid, cell.token || "-", classes.join(" "));
        outputCell.dataset.lane = lane;
        outputCell.dataset.source = cell.source;
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
