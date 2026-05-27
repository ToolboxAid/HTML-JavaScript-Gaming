import { PREVIEW_INSTRUMENT_PACKS } from "../../../../src/engine/audio/PreviewInstrumentPacks.js";

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
  chords: "Pad/Chords",
  drums: "Drums",
  lead: "Lead",
  pad: "Pad Layer"
};

const DEFAULT_PREVIEW_INSTRUMENTS = {
  bass: "synth-bass",
  chords: "warm-pad",
  drums: "basic-drums",
  lead: "retro-square-lead",
  pad: "warm-pad"
};

const REST_TOKENS = new Set(["", "-", ".", "rest"]);

function clonePreviewLaneState() {
  return Object.fromEntries(Object.entries(DEFAULT_PREVIEW_INSTRUMENTS).map(([lane, instrument]) => [
    lane,
    {
      instrument,
      muted: false,
      pan: 0,
      soloed: false,
      volume: 1
    }
  ]));
}

function laneId(lane) {
  const label = String(lane || "");
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

function instrumentLabel(value) {
  return PREVIEW_INSTRUMENT_PACKS.find((instrument) => instrument.id === value)?.label || "";
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
    jumpToSectionButton,
    laneTypeSelect,
    leadInput,
    loopEndSelect,
    loopStartSelect,
    normalizeButton,
    padInput,
    playLoopButton,
    playSectionButton,
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
    this.previewLaneControls = {};
    this.previewLaneState = clonePreviewLaneState();
    this.previewTempoBpm = 120;
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
    this.selectedLane = "lead";
  }

  mount({ onGenerate, onLaneSettingChange, onNormalize, onNoteEdit = () => {}, onTransport }) {
    this.onNoteEdit = onNoteEdit;
    this.onLaneSettingChange = onLaneSettingChange;
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
    this.selectLane(this.selectedLane);
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
      if (this.previewLaneState[lane]) {
        this.previewLaneState[lane].instrument = String(instrument || "");
      }
    });
    this.syncLaneHeaderControls();
  }

  clearLaneToggles() {
    Object.values(this.previewLaneState).forEach((state) => {
      state.muted = false;
      state.pan = 0;
      state.soloed = false;
      state.volume = 1;
    });
    this.syncLaneHeaderControls();
  }

  previewLaneSettings() {
    const settings = { instruments: {}, muted: {}, pans: {}, soloed: {}, volumes: {} };
    Object.entries(this.previewLaneState).forEach(([lane, state]) => {
      settings.instruments[lane] = state.instrument || "";
      settings.muted[lane] = Boolean(state.muted);
      settings.pans[lane] = Number(state.pan || 0);
      settings.soloed[lane] = Boolean(state.soloed);
      settings.volumes[lane] = Number(state.volume || 1);
    });
    return settings;
  }

  previewLaneDiagnostics() {
    const settings = this.previewLaneSettings();
    const instrumentLabels = {};
    Object.entries(this.previewLaneState).forEach(([lane, state]) => {
      instrumentLabels[lane] = instrumentLabel(state.instrument);
    });
    return {
      activeLanes: this.activePreviewLanes,
      instrumentLabels,
      instruments: settings.instruments,
      mutedLanes: Object.entries(settings.muted).filter((entry) => entry[1]).map(([lane]) => lane),
      panSummary: Object.entries(settings.pans).map(([lane, value]) => `${lane}:${value}`).join(", "),
      soloedLanes: Object.entries(settings.soloed).filter((entry) => entry[1]).map(([lane]) => lane),
      volumeSummary: Object.entries(settings.volumes).map(([lane, value]) => `${lane}:${value}`).join(", ")
    };
  }

  previewLaneEntries() {
    return Object.entries(this.previewLaneControls);
  }

  setPreviewTempoBpm(tempoBpm) {
    const parsed = Number(tempoBpm);
    this.previewTempoBpm = Number.isFinite(parsed) && parsed > 0 ? parsed : 120;
  }

  inputForLane(lane) {
    return {
      bass: this.bassInput,
      chords: this.chordsInput,
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
    this.previewLaneControls = {};
    if (!result?.ok) {
      this.populateSectionControls([]);
      this.setTransportEnabled(false);
      const empty = document.createElement("p");
      empty.className = "midi-studio-v2__empty";
      empty.textContent = result?.message || "No grid data normalized. Import a manifest arrangement or enter sections/chords, then choose Normalize Grid.";
      this.gridOutput.append(empty);
      return;
    }
    this.populateSectionControls(result.sections);
    this.setTransportEnabled(true);
    this.renderGrid(result);
    this.setPlayheadStep(this.playheadStep);
    this.updateLoopRegion();
    this.applySelectedLaneHighlight();
  }

  syncEditedGridResult(result) {
    if (!result?.ok) {
      return;
    }
    this.currentResult = result;
    this.renderDefinitionList(summaryRows(result));
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
    this.previewLaneControls = {};
    const grid = document.createElement("div");
    grid.className = "midi-studio-v2__instrument-grid midi-studio-v2__note-table";
    grid.setAttribute("role", "table");
    grid.setAttribute("aria-label", "Signal-style note table");
    grid.style.gridTemplateColumns = `minmax(17rem, 22rem) repeat(${result.totalSteps}, minmax(4.75rem, 1fr))`;
    this.renderNoteTableHeader(grid, result);
    result.lanes.forEach((lane) => {
      grid.append(this.createLaneHeaderCell(lane));
      result.cells[lane].forEach((cell, stepIndex) => {
        const outputCell = this.createNoteTableCell(cell, stepIndex);
        this.applyTimingDataset(outputCell, cell, stepIndex);
        grid.append(outputCell);
      });
    });
    this.gridOutput.append(grid);
    this.applySelectedLaneHighlight();
  }

  renderNoteTableHeader(grid, result) {
    const instrumentHeader = this.appendCell(grid, "Instrument", "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label midi-studio-v2__grid-cell--instrument-column midi-studio-v2__note-table-instrument-header");
    instrumentHeader.setAttribute("role", "columnheader");
    result.cells.chords.forEach((cell, stepIndex) => {
      const classes = [
        "midi-studio-v2__grid-cell",
        "midi-studio-v2__grid-cell--beat",
        "midi-studio-v2__grid-cell--ruler",
        "midi-studio-v2__grid-cell--timing-header",
        "midi-studio-v2__note-table-column-header"
      ];
      if (cell.beat === 1 && cell.subdivisionStep === 1) {
        classes.push("midi-studio-v2__grid-cell--bar");
      }
      const section = result.sections.find((entry) => entry.label === cell.section);
      if (section && section.startStep === stepIndex) {
        classes.push("midi-studio-v2__grid-cell--section", `midi-studio-v2__section-tone-${section.colorIndex}`);
      }
      const outputCell = this.appendCell(grid, "", classes.join(" "));
      outputCell.setAttribute("role", "columnheader");
      outputCell.setAttribute("aria-label", `Bar ${cell.bar}, beat ${cell.beat}${result.subdivision > 1 ? `, subdivision ${cell.subdivisionStep}` : ""}, section ${cell.section}`);
      outputCell.append(
        this.timingHeaderLine("Bar", cell.bar),
        this.timingHeaderLine("Beat", cell.beat)
      );
      if (result.subdivision > 1) {
        outputCell.append(this.timingHeaderLine("Subdivision", cell.subdivisionStep));
      }
      this.applyTimingDataset(outputCell, cell, stepIndex);
    });
  }

  timingHeaderLine(label, value) {
    const line = document.createElement("span");
    line.textContent = `${label} ${value}`;
    return line;
  }

  createLaneHeaderCell(lane) {
    const cell = document.createElement("div");
    cell.className = "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label midi-studio-v2__grid-cell--instrument-column midi-studio-v2__lane-header-cell";
    cell.setAttribute("role", "rowheader");
    cell.dataset.lane = lane;
    cell.tabIndex = 0;

    const instrumentSelect = this.createInstrumentSelect(lane);
    const role = document.createElement("span");
    role.className = "midi-studio-v2__lane-role";
    role.textContent = `role: ${LANE_LABELS[lane] || lane}`;

    const mute = this.createLaneToggle(lane, "mute");
    const solo = this.createLaneToggle(lane, "solo");
    const volume = this.createLaneSlider(lane, "volume");
    const pan = this.createLaneSlider(lane, "pan");
    const volumeButton = this.createLaneSliderButton(lane, "volume");
    const panButton = this.createLaneSliderButton(lane, "pan");

    const main = document.createElement("div");
    main.className = "midi-studio-v2__lane-header-main";
    main.append(instrumentSelect, role);

    const toggles = document.createElement("div");
    toggles.className = "midi-studio-v2__lane-control-row";
    toggles.append(mute.label, solo.label, volumeButton, panButton);

    const sliders = document.createElement("div");
    sliders.className = "midi-studio-v2__lane-slider-row";
    sliders.append(volume.input, pan.input);

    cell.addEventListener("click", (event) => {
      if (event.target.closest("input, select, option, button")) {
        return;
      }
      this.handleLaneSelection(lane);
    });
    cell.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      if (event.target.closest("input, select, option, button")) {
        return;
      }
      event.preventDefault();
      this.handleLaneSelection(lane);
    });
    this.previewLaneControls[lane] = {
      instrument: instrumentSelect,
      mute: mute.input,
      pan: pan.input,
      panButton,
      row: cell,
      solo: solo.input,
      volume: volume.input,
      volumeButton
    };
    cell.append(main, toggles, sliders);
    return cell;
  }

  createInstrumentSelect(lane) {
    const select = document.createElement("select");
    select.id = `previewInstrument${laneId(lane)}Select`;
    select.className = "midi-studio-v2__lane-instrument-select";
    select.dataset.laneInstrumentSelect = lane;
    select.dataset.previewInstrumentLane = lane;
    select.setAttribute("aria-label", `Preview instrument ${LANE_LABELS[lane] || lane}`);

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Choose preview instrument";
    select.append(emptyOption);
    PREVIEW_INSTRUMENT_PACKS.forEach((instrument) => {
      const option = document.createElement("option");
      option.value = instrument.id;
      option.textContent = instrument.label;
      select.append(option);
    });
    select.value = this.previewLaneState[lane]?.instrument || "";
    select.addEventListener("change", () => {
      this.previewLaneState[lane].instrument = select.value;
      this.onLaneSettingChange?.("instrument", {
        instrumentLabel: select.selectedOptions[0]?.textContent || "",
        instrumentValue: select.value,
        lane,
        laneLabel: LANE_LABELS[lane] || lane
      });
    });
    return select;
  }

  createLaneToggle(lane, kind) {
    const input = document.createElement("input");
    const label = document.createElement("label");
    const text = document.createElement("span");
    const controlLabel = kind === "mute" ? "Mute" : "Solo";
    input.id = `preview${controlLabel}${laneId(lane)}Toggle`;
    input.type = "checkbox";
    input.checked = kind === "mute" ? this.previewLaneState[lane]?.muted === true : this.previewLaneState[lane]?.soloed === true;
    input.dataset[kind === "mute" ? "previewMuteLane" : "previewSoloLane"] = lane;
    input.setAttribute("aria-label", `${controlLabel} ${LANE_LABELS[lane] || lane}`);
    label.className = "tool-starter__toggle midi-studio-v2__lane-toggle";
    label.htmlFor = input.id;
    text.textContent = controlLabel;
    input.addEventListener("change", () => {
      if (kind === "mute") {
        this.previewLaneState[lane].muted = input.checked;
      } else {
        this.previewLaneState[lane].soloed = input.checked;
      }
      this.onLaneSettingChange?.(kind, {
        enabled: input.checked,
        lane,
        laneLabel: LANE_LABELS[lane] || lane
      });
    });
    label.append(input, text);
    return { input, label };
  }

  createLaneSlider(lane, kind) {
    const input = document.createElement("input");
    const controlLabel = kind === "volume" ? "Volume" : "Pan";
    input.id = `preview${controlLabel}${laneId(lane)}Input`;
    input.className = "midi-studio-v2__lane-slider";
    input.type = "range";
    input.hidden = true;
    input.min = kind === "volume" ? "0" : "-1";
    input.max = "1";
    input.step = kind === "volume" ? "0.05" : "0.1";
    input.value = String(kind === "volume" ? this.previewLaneState[lane]?.volume ?? 1 : this.previewLaneState[lane]?.pan ?? 0);
    input.dataset[kind === "volume" ? "laneVolumeSlider" : "lanePanSlider"] = lane;
    input.dataset[kind === "volume" ? "previewVolumeLane" : "previewPanLane"] = lane;
    input.setAttribute("aria-label", `${controlLabel} ${LANE_LABELS[lane] || lane}`);
    const update = () => {
      const value = Number(input.value);
      if (kind === "volume") {
        this.previewLaneState[lane].volume = value;
      } else {
        this.previewLaneState[lane].pan = value;
      }
      this.onLaneSettingChange?.(kind, {
        lane,
        laneLabel: LANE_LABELS[lane] || lane,
        value: input.value
      });
    };
    input.addEventListener("change", update);
    return { input };
  }

  createLaneSliderButton(lane, kind) {
    const button = document.createElement("button");
    const controlLabel = kind === "volume" ? "volume" : "pan";
    button.className = "midi-studio-v2__lane-icon-button";
    button.type = "button";
    button.dataset.lane = lane;
    button.dataset.laneControlToggle = kind;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", `Toggle ${controlLabel} slider for ${LANE_LABELS[lane] || lane}`);
    button.title = `Toggle ${controlLabel} slider`;
    button.textContent = kind === "volume" ? "◢" : "↔";
    button.addEventListener("click", () => this.toggleLaneSlider(lane, kind));
    return button;
  }

  toggleLaneSlider(lane, kind) {
    const controls = this.previewLaneControls[lane];
    const slider = kind === "volume" ? controls?.volume : controls?.pan;
    const button = kind === "volume" ? controls?.volumeButton : controls?.panButton;
    if (!slider || !button) {
      return;
    }
    slider.hidden = !slider.hidden;
    button.setAttribute("aria-expanded", String(!slider.hidden));
  }

  syncLaneHeaderControls() {
    this.previewLaneEntries().forEach(([lane, controls]) => {
      const state = this.previewLaneState[lane];
      if (!state) {
        return;
      }
      if (controls.instrument) {
        controls.instrument.value = state.instrument || "";
      }
      if (controls.mute) {
        controls.mute.checked = state.muted === true;
      }
      if (controls.solo) {
        controls.solo.checked = state.soloed === true;
      }
      if (controls.volume) {
        controls.volume.value = String(state.volume ?? 1);
      }
      if (controls.pan) {
        controls.pan.value = String(state.pan ?? 0);
      }
    });
  }

  createNoteTableCell(cell, stepIndex) {
    const outputCell = document.createElement("div");
    outputCell.className = this.noteTableCellClass(cell).join(" ");
    outputCell.contentEditable = "true";
    outputCell.role = "textbox";
    outputCell.spellcheck = false;
    outputCell.append(this.createNoteBlock(cell));
    outputCell.setAttribute("aria-label", `${LANE_LABELS[cell.lane] || cell.lane} note cell, section ${cell.section}, bar ${cell.bar}, beat ${cell.beat}`);
    outputCell.dataset.lane = cell.lane;
    outputCell.dataset.source = cell.source;
    outputCell.addEventListener("input", () => this.updateLaneFromNoteTableCell(outputCell, stepIndex));
    outputCell.addEventListener("focus", () => this.selectLane(cell.lane));
    outputCell.addEventListener("click", () => this.selectLane(cell.lane));
    outputCell.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        outputCell.blur();
      }
    });
    return outputCell;
  }

  createNoteBlock(cell) {
    const block = document.createElement("span");
    block.className = "midi-studio-v2__note-block";
    block.textContent = cell.token || "-";
    return block;
  }

  noteTableCellClass(cell) {
    const classes = ["midi-studio-v2__grid-cell", "midi-studio-v2__spreadsheet-note-cell", "midi-studio-v2__note-table-cell"];
    if (!REST_TOKENS.has(String(cell.token || "").trim().toLowerCase())) {
      classes.push("midi-studio-v2__grid-cell--event");
    }
    if (cell.source === "generated") {
      classes.push("midi-studio-v2__grid-cell--generated");
    }
    if (cell.source === "manual") {
      classes.push("midi-studio-v2__grid-cell--manual");
    }
    return classes;
  }

  updateLaneFromNoteTableCell(cell) {
    const lane = cell.dataset.lane;
    const laneInput = this.inputForLane(lane);
    if (!laneInput || !this.currentResult?.ok) {
      return;
    }
    this.syncNoteTableCellState(cell);
    laneInput.value = this.noteTableLaneText(lane);
    this.onNoteEdit?.(this.readInput(), { lane, laneLabel: LANE_LABELS[lane] || lane });
  }

  syncNoteTableCellState(cell) {
    const value = String(cell.textContent || "").trim();
    const isRest = REST_TOKENS.has(value.toLowerCase());
    cell.classList.toggle("midi-studio-v2__grid-cell--event", !isRest);
    cell.classList.toggle("midi-studio-v2__grid-cell--generated", false);
    cell.classList.toggle("midi-studio-v2__grid-cell--manual", !isRest);
    cell.dataset.source = isRest ? "empty" : "manual";
  }

  noteTableLaneText(lane) {
    const result = this.currentResult;
    const stepsPerBar = result.beatsPerBar * result.subdivision;
    const cells = Array.from(this.gridOutput.querySelectorAll(`.midi-studio-v2__note-table-cell[data-lane="${lane}"]`));
    const bars = [];
    for (let barIndex = 0; barIndex < result.barCount; barIndex += 1) {
      const tokens = [];
      for (let stepIndex = 0; stepIndex < stepsPerBar; stepIndex += 1) {
        const cell = cells[barIndex * stepsPerBar + stepIndex];
        const token = String(cell?.textContent || "").trim();
        tokens.push(token || "-");
      }
      bars.push(tokens.join(" "));
    }
    return bars.join(" | ");
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

  selectLane(lane) {
    if (!lane) {
      return;
    }
    this.selectedLane = lane;
    this.previewLaneEntries().forEach(([entryLane, controls]) => {
      controls.row?.classList.toggle("is-selected", entryLane === lane);
      controls.row?.setAttribute("aria-selected", String(entryLane === lane));
    });
    this.applySelectedLaneHighlight();
  }

  handleLaneSelection(lane) {
    this.selectLane(lane);
    this.onLaneSettingChange?.("select", { lane, laneLabel: LANE_LABELS[lane] || lane });
  }

  applySelectedLaneHighlight() {
    this.gridOutput.querySelectorAll(".midi-studio-v2__grid-cell--lane-selected").forEach((cell) => {
      cell.classList.remove("midi-studio-v2__grid-cell--lane-selected");
    });
    if (!this.selectedLane) {
      return;
    }
    this.gridOutput.querySelectorAll(`[data-lane="${this.selectedLane}"]`).forEach((cell) => {
      cell.classList.add("midi-studio-v2__grid-cell--lane-selected");
    });
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
    const intervalMs = this.previewStepDurationMs();
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
    }, intervalMs);
  }

  previewStepDurationMs() {
    const subdivision = Number(this.currentResult?.subdivision || this.subdivisionInput.value || 1);
    const safeSubdivision = Number.isFinite(subdivision) && subdivision > 0 ? subdivision : 1;
    const safeTempo = Number.isFinite(this.previewTempoBpm) && this.previewTempoBpm > 0 ? this.previewTempoBpm : 120;
    return Math.max(60, (60 / safeTempo / safeSubdivision) * 1000);
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
    });
    this.gridOutput.querySelectorAll(".midi-studio-v2__grid-cell--lane-active").forEach((cell) => {
      cell.classList.remove("midi-studio-v2__grid-cell--lane-active");
    });
    this.gridOutput.querySelectorAll(`[data-step-index="${this.playheadStep}"]`).forEach((cell) => {
      if (cell.classList.contains("midi-studio-v2__grid-cell--timing-header") || cell.classList.contains("midi-studio-v2__grid-cell--playhead")) {
        cell.classList.add("midi-studio-v2__grid-cell--playhead-active");
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
