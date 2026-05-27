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

function optionForSection(section) {
  const option = document.createElement("option");
  option.value = section.label;
  option.textContent = section.label;
  return option;
}

const LANE_LABELS = {
  bass: "Bass",
  chords: "Chords",
  drums: "Drums",
  lead: "Lead",
  pad: "Pad"
};

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
    jumpToSectionButton,
    laneTypeSelect,
    leadInput,
    loopEndSelect,
    loopStartSelect,
    normalizeButton,
    padInput,
    playLoopButton,
    playSectionButton,
    previewLaneControls = {},
    sectionPresetButtons,
    sectionSelect,
    sectionsInput,
    snapIndicator,
    stopTimingPreviewButton,
    subdivisionInput,
    summary,
    transportState,
    windowRef = window
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
    this.jumpToSectionButton = jumpToSectionButton;
    this.laneTypeSelect = laneTypeSelect;
    this.leadInput = leadInput;
    this.loopEndSelect = loopEndSelect;
    this.loopStartSelect = loopStartSelect;
    this.normalizeButton = normalizeButton;
    this.padInput = padInput;
    this.playLoopButton = playLoopButton;
    this.playSectionButton = playSectionButton;
    this.previewLaneControls = previewLaneControls;
    this.sectionPresetButtons = sectionPresetButtons;
    this.sectionSelect = sectionSelect;
    this.sectionsInput = sectionsInput;
    this.snapIndicator = snapIndicator;
    this.stopTimingPreviewButton = stopTimingPreviewButton;
    this.subdivisionInput = subdivisionInput;
    this.summary = summary;
    this.transportState = transportState;
    this.window = windowRef;
    this.currentResult = null;
    this.activePreviewLanes = [];
    this.loopBounds = null;
    this.playTimer = null;
    this.playheadStep = 0;
  }

  mount({ onGenerate, onLaneSettingChange, onNormalize, onTransport }) {
    this.generateBassButton.addEventListener("click", () => onGenerate("bass", this.readInput()));
    this.generatePadButton.addEventListener("click", () => onGenerate("pad", this.readInput()));
    this.generateArpeggioButton.addEventListener("click", () => onGenerate("lead", this.readInput()));
    this.generateDrumsButton.addEventListener("click", () => onGenerate("drums", this.readInput()));
    this.normalizeButton.addEventListener("click", () => onNormalize(this.readInput()));
    this.jumpToSectionButton.addEventListener("click", () => this.jumpToSelectedSection(onTransport));
    this.playSectionButton.addEventListener("click", () => {
      void this.playSelectedSection(onTransport);
    });
    this.playLoopButton.addEventListener("click", () => {
      void this.playSelectedLoop(onTransport);
    });
    this.stopTimingPreviewButton.addEventListener("click", () => this.stopTimingPreview(onTransport));
    this.previewLaneEntries().forEach(([lane, controls]) => {
      controls.instrument?.addEventListener("change", () => onLaneSettingChange("instrument", {
        instrumentLabel: controls.instrument.selectedOptions[0]?.textContent || "",
        instrumentValue: controls.instrument.value,
        lane,
        laneLabel: LANE_LABELS[lane] || lane
      }));
      controls.mute?.addEventListener("change", () => onLaneSettingChange("mute", {
        enabled: controls.mute.checked,
        lane,
        laneLabel: LANE_LABELS[lane] || lane
      }));
      controls.solo?.addEventListener("change", () => onLaneSettingChange("solo", {
        enabled: controls.solo.checked,
        lane,
        laneLabel: LANE_LABELS[lane] || lane
      }));
    });
    this.sectionPresetButtons.forEach((button) => {
      button.addEventListener("click", () => this.selectPresetSection(button.dataset.sectionPreset, onTransport));
    });
    [this.loopStartSelect, this.loopEndSelect].forEach((select) => {
      select.addEventListener("change", () => this.updateLoopRegion());
    });
    [this.sectionsInput, this.beatsInput, this.subdivisionInput].forEach((input) => {
      input.addEventListener("input", () => this.updateSnapIndicator());
      input.addEventListener("change", () => this.updateSnapIndicator());
    });
    this.setTransportEnabled(false);
    this.populateSectionControls([]);
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
      previewLaneSettings: this.previewLaneSettings(),
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

  applyGridDefaults({ bass, beatsPerBar, chords, drums, lead, pad, previewInstruments = {}, sections, subdivision }) {
    this.sectionsInput.value = sections || "";
    this.beatsInput.value = beatsPerBar || "";
    this.subdivisionInput.value = subdivision || "1";
    this.chordsInput.value = chords || "";
    this.bassInput.value = bass || "";
    this.padInput.value = pad || "";
    this.leadInput.value = lead || "";
    this.drumsInput.value = drums || "";
    this.generatedLanes = {};
    this.applyPreviewInstruments(previewInstruments);
    this.clearLaneToggles();
    this.updateSnapIndicator();
  }

  applyPreviewInstruments(previewInstruments = {}) {
    Object.entries(previewInstruments).forEach(([lane, instrument]) => {
      const select = this.previewLaneControls[lane]?.instrument;
      if (select) {
        select.value = instrument || "";
      }
    });
  }

  clearLaneToggles() {
    this.previewLaneEntries().forEach(([, controls]) => {
      if (controls.mute) {
        controls.mute.checked = false;
      }
      if (controls.solo) {
        controls.solo.checked = false;
      }
    });
  }

  previewLaneSettings() {
    const settings = { instruments: {}, muted: {}, soloed: {} };
    this.previewLaneEntries().forEach(([lane, controls]) => {
      settings.instruments[lane] = controls.instrument?.value || "";
      settings.muted[lane] = Boolean(controls.mute?.checked);
      settings.soloed[lane] = Boolean(controls.solo?.checked);
    });
    return settings;
  }

  previewLaneDiagnostics() {
    const settings = this.previewLaneSettings();
    const instrumentLabels = {};
    this.previewLaneEntries().forEach(([lane, controls]) => {
      instrumentLabels[lane] = controls.instrument?.selectedOptions[0]?.textContent || "";
    });
    return {
      activeLanes: this.activePreviewLanes,
      instrumentLabels,
      instruments: settings.instruments,
      mutedLanes: Object.entries(settings.muted).filter((entry) => entry[1]).map(([lane]) => lane),
      soloedLanes: Object.entries(settings.soloed).filter((entry) => entry[1]).map(([lane]) => lane)
    };
  }

  previewLaneEntries() {
    return Object.entries(this.previewLaneControls);
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
    this.stopTimer({ clearPreviewLanes: true });
    this.currentResult = result?.ok ? result : null;
    this.renderDefinitionList(summaryRows(result));
    this.gridOutput.replaceChildren();
    if (!result?.ok) {
      this.populateSectionControls([]);
      this.setTransportEnabled(false);
      const empty = document.createElement("p");
      empty.className = "midi-studio-v2__empty";
      empty.textContent = result?.message || "No grid data normalized. Enter sections/chords or use the example test song, then choose Normalize Grid.";
      this.gridOutput.append(empty);
      return;
    }
    this.populateSectionControls(result.sections);
    this.setTransportEnabled(true);
    this.renderGrid(result);
    this.setPlayheadStep(this.playheadStep);
    this.updateLoopRegion();
  }

  populateSectionControls(sections) {
    const previousSection = this.sectionSelect.value;
    const previousLoopStart = this.loopStartSelect.value;
    const previousLoopEnd = this.loopEndSelect.value;
    [this.sectionSelect, this.loopStartSelect, this.loopEndSelect].forEach((select) => select.replaceChildren());
    sections.forEach((section) => {
      this.sectionSelect.append(optionForSection(section));
      this.loopStartSelect.append(optionForSection(section));
      this.loopEndSelect.append(optionForSection(section));
    });
    if (!sections.length) {
      [this.sectionSelect, this.loopStartSelect, this.loopEndSelect].forEach((select) => {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No section selected";
        select.append(option);
        select.value = "";
      });
      this.transportState.textContent = "No section selected. Normalize grid data before testing section timing.";
      return;
    }
    this.sectionSelect.value = sections.some((section) => section.label === previousSection) ? previousSection : sections[0].label;
    this.loopStartSelect.value = sections.some((section) => section.label === previousLoopStart) ? previousLoopStart : sections[0].label;
    this.loopEndSelect.value = sections.some((section) => section.label === previousLoopEnd) ? previousLoopEnd : sections[sections.length - 1].label;
  }

  setTransportEnabled(enabled) {
    [
      this.jumpToSectionButton,
      this.playLoopButton,
      this.playSectionButton,
      this.sectionSelect,
      this.loopStartSelect,
      this.loopEndSelect,
      this.stopTimingPreviewButton
    ].forEach((control) => {
      control.disabled = !enabled;
    });
  }

  renderGrid(result) {
    const grid = document.createElement("div");
    grid.className = "midi-studio-v2__instrument-grid";
    grid.style.gridTemplateColumns = `7rem repeat(${result.totalSteps}, minmax(3rem, 1fr))`;
    this.renderSectionRow(grid, result);
    this.renderBarRow(grid, result);
    this.renderBeatRow(grid, result);
    this.renderRulerRow(grid, result);
    this.renderPlayheadRow(grid, result);
    result.lanes.forEach((lane) => {
      this.appendCell(grid, lane, "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label");
      result.cells[lane].forEach((cell, stepIndex) => {
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
        this.applyTimingDataset(outputCell, cell, stepIndex);
        outputCell.dataset.lane = lane;
        outputCell.dataset.source = cell.source;
      });
    });
    this.gridOutput.append(grid);
  }

  renderSectionRow(grid, result) {
    this.appendCell(grid, "Section", "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label");
    result.sections.forEach((section) => {
      const cell = this.appendCell(grid, section.label, `midi-studio-v2__grid-cell midi-studio-v2__grid-cell--section midi-studio-v2__section-tone-${section.colorIndex}`);
      cell.style.gridColumn = `span ${section.steps}`;
      cell.dataset.section = section.label;
    });
  }

  renderBarRow(grid, result) {
    this.appendCell(grid, "Bar", "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label");
    const stepsPerBar = result.beatsPerBar * result.subdivision;
    for (let bar = 1; bar <= result.barCount; bar += 1) {
      const cell = this.appendCell(grid, `Bar ${bar}`, "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--bar");
      cell.style.gridColumn = `span ${stepsPerBar}`;
      cell.dataset.bar = String(bar);
    }
  }

  renderBeatRow(grid, result) {
    this.appendCell(grid, "Beat", "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label");
    result.cells.chords.forEach((cell, stepIndex) => {
      const outputCell = this.appendCell(grid, `B${cell.bar}.${cell.beat}${result.subdivision > 1 ? `.${cell.subdivisionStep}` : ""}`, "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--beat");
      this.applyTimingDataset(outputCell, cell, stepIndex);
    });
  }

  renderRulerRow(grid, result) {
    this.appendCell(grid, "Ruler", "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label");
    result.cells.chords.forEach((cell, stepIndex) => {
      const isBeatStart = cell.subdivisionStep === 1;
      const outputCell = this.appendCell(grid, isBeatStart ? String(cell.beat) : ".", "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--ruler");
      this.applyTimingDataset(outputCell, cell, stepIndex);
    });
  }

  renderPlayheadRow(grid, result) {
    this.appendCell(grid, "Playhead", "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label");
    result.cells.chords.forEach((cell, stepIndex) => {
      const outputCell = this.appendCell(grid, "", "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--playhead");
      this.applyTimingDataset(outputCell, cell, stepIndex);
    });
  }

  applyTimingDataset(element, cell, stepIndex) {
    element.dataset.bar = String(cell.bar);
    element.dataset.beat = String(cell.beat);
    element.dataset.section = cell.section;
    element.dataset.stepIndex = String(stepIndex);
    element.dataset.subdivisionStep = String(cell.subdivisionStep);
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

  selectPresetSection(sectionLabel, onTransport) {
    const section = this.sectionByLabel(sectionLabel);
    if (!section) {
      onTransport("invalid-section", { label: this.displaySectionLabel(sectionLabel) });
      return;
    }
    this.sectionSelect.value = section.label;
    this.setPlayheadStep(section.startStep);
    this.transportState.textContent = `Selected section: ${section.label}`;
    onTransport("select-section", { section });
  }

  jumpToSelectedSection(onTransport) {
    const section = this.sectionByLabel(this.sectionSelect.value);
    if (!section) {
      onTransport("invalid-section", { label: this.sectionSelect.value || "(none)" });
      return;
    }
    this.stopTimer();
    this.setPlayheadStep(section.startStep);
    this.transportState.textContent = `Jumped to section: ${section.label}`;
    onTransport("jump-section", { section });
  }

  async playSelectedSection(onTransport) {
    const section = this.sectionByLabel(this.sectionSelect.value);
    if (!section) {
      onTransport("invalid-section", { label: this.sectionSelect.value || "(none)" });
      return;
    }
    const canStart = await onTransport("play-section", { section });
    if (canStart === false) {
      return;
    }
    this.startTimingPreview({ endStep: section.endStep, label: section.label, mode: "section", startStep: section.startStep });
  }

  async playSelectedLoop(onTransport) {
    const bounds = this.selectedLoopBounds();
    if (!bounds.ok) {
      onTransport("invalid-loop", { message: bounds.message });
      return;
    }
    const canStart = await onTransport("play-loop", { endSection: bounds.endSection, startSection: bounds.startSection });
    if (canStart === false) {
      return;
    }
    this.startTimingPreview({
      endStep: bounds.endSection.endStep,
      label: `${bounds.startSection.label} to ${bounds.endSection.label}`,
      mode: "loop",
      startStep: bounds.startSection.startStep
    });
  }

  stopTimingPreview(onTransport) {
    this.stopTimer({ clearPreviewLanes: true });
    this.transportState.textContent = "Preview Synth timing preview stopped.";
    onTransport("stop-preview", {});
  }

  stopPreviewUi() {
    this.stopTimer({ clearPreviewLanes: true });
    this.transportState.textContent = "Preview Synth timing preview stopped.";
  }

  startTimingPreview({ endStep, label, mode, startStep }) {
    this.stopTimer();
    this.setPlayheadStep(startStep);
    this.transportState.textContent = `${mode === "loop" ? "Playing loop" : "Playing section"} Preview Synth timing preview: ${label}`;
    this.playTimer = this.window.setInterval(() => {
      const nextStep = this.playheadStep + 1;
      if (nextStep > endStep) {
        if (mode === "loop") {
          this.setPlayheadStep(startStep);
          return;
        }
        this.stopTimer({ clearPreviewLanes: true });
        this.transportState.textContent = `Timing preview complete: ${label}`;
        return;
      }
      this.setPlayheadStep(nextStep);
    }, 90);
  }

  stopTimer({ clearPreviewLanes = false } = {}) {
    if (this.playTimer) {
      this.window.clearInterval(this.playTimer);
      this.playTimer = null;
    }
    if (clearPreviewLanes) {
      this.clearPreviewPlaybackLanes();
    }
  }

  setPreviewPlaybackLanes(lanes = []) {
    this.activePreviewLanes = Array.from(new Set(lanes));
    this.setPlayheadStep(this.playheadStep);
  }

  clearPreviewPlaybackLanes() {
    this.activePreviewLanes = [];
    this.gridOutput.querySelectorAll(".midi-studio-v2__grid-cell--lane-active").forEach((cell) => {
      cell.classList.remove("midi-studio-v2__grid-cell--lane-active");
    });
  }

  setPlayheadStep(stepIndex) {
    const result = this.currentResult;
    if (!result?.ok) {
      this.playheadStep = 0;
      return;
    }
    this.playheadStep = Math.max(0, Math.min(stepIndex, result.totalSteps - 1));
    this.gridOutput.querySelectorAll(".midi-studio-v2__grid-cell--playhead-active").forEach((cell) => {
      cell.classList.remove("midi-studio-v2__grid-cell--playhead-active");
      cell.textContent = "";
    });
    this.gridOutput.querySelectorAll(".midi-studio-v2__grid-cell--lane-active").forEach((cell) => {
      cell.classList.remove("midi-studio-v2__grid-cell--lane-active");
    });
    this.gridOutput.querySelectorAll(`[data-step-index="${this.playheadStep}"]`).forEach((cell) => {
      if (cell.classList.contains("midi-studio-v2__grid-cell--playhead")) {
        cell.classList.add("midi-studio-v2__grid-cell--playhead-active");
        cell.textContent = ">";
      }
      if (this.activePreviewLanes.includes(cell.dataset.lane) && cell.classList.contains("midi-studio-v2__grid-cell--event")) {
        cell.classList.add("midi-studio-v2__grid-cell--lane-active");
      }
    });
  }

  updateLoopRegion() {
    const bounds = this.selectedLoopBounds();
    this.gridOutput.querySelectorAll(".midi-studio-v2__grid-cell--loop-region").forEach((cell) => {
      cell.classList.remove("midi-studio-v2__grid-cell--loop-region");
    });
    if (!bounds.ok) {
      this.loopBounds = null;
      return bounds;
    }
    this.loopBounds = bounds;
    this.gridOutput.querySelectorAll("[data-step-index]").forEach((cell) => {
      const stepIndex = Number(cell.dataset.stepIndex);
      if (stepIndex >= bounds.startSection.startStep && stepIndex <= bounds.endSection.endStep) {
        cell.classList.add("midi-studio-v2__grid-cell--loop-region");
      }
    });
    return bounds;
  }

  selectedLoopBounds() {
    const startSection = this.sectionByLabel(this.loopStartSelect.value);
    const endSection = this.sectionByLabel(this.loopEndSelect.value);
    if (!startSection || !endSection) {
      return { message: "Choose valid loop start and loop end sections before previewing the loop.", ok: false };
    }
    if (endSection.endStep < startSection.startStep) {
      return { message: `Invalid loop region: ${startSection.label} starts after ${endSection.label}.`, ok: false };
    }
    return { endSection, ok: true, startSection };
  }

  selectedSection() {
    return this.sectionByLabel(this.sectionSelect.value);
  }

  sectionByLabel(label) {
    const normalized = String(label || "").trim().toLowerCase();
    return this.currentResult?.sections.find((section) => section.label.toLowerCase() === normalized) || null;
  }

  displaySectionLabel(label) {
    const value = String(label || "").trim();
    return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "(none)";
  }
}
