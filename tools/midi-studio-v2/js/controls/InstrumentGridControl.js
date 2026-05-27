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

const FIXED_LANES = ["bass", "chords", "drums", "lead", "pad"];
const INSTRUMENT_TYPE_GROUPS = [
  "Piano",
  "Chromatic Percussion",
  "Organ",
  "Guitar",
  "Bass",
  "Strings",
  "Ensemble",
  "Brass",
  "Reed",
  "Pipe",
  "Synth Lead",
  "Synth Pad",
  "Synth Effects",
  "Ethnic",
  "Percussive",
  "Sound Effects"
];

const REST_TOKENS = new Set(["", "-", ".", "rest"]);
const PERCUSSION_ROWS = ["crash", "ride", "hat", "clap", "snare", "tom", "perc", "kick"];
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_TO_SHARP = {
  Ab: "G#",
  Bb: "A#",
  Db: "C#",
  Eb: "D#",
  Gb: "F#"
};
const CHORD_ROOT_ROW = /^([A-G](?:#|b)?)/;
const SIMPLE_CHORD_PATTERN = /^([A-G](?:#|b)?)(m|min)?$/;
const CHORD_TONES = {
  A: ["A", "C#", "E"],
  Am: ["A", "C", "E"],
  B: ["B", "D#", "F#"],
  Bm: ["B", "D", "F#"],
  C: ["C", "E", "G"],
  Cm: ["C", "D#", "G"],
  D: ["D", "F#", "A"],
  Dm: ["D", "F", "A"],
  E: ["E", "G#", "B"],
  Em: ["E", "G", "B"],
  F: ["F", "A", "C"],
  Fm: ["F", "G#", "C"],
  G: ["G", "B", "D"],
  Gm: ["G", "A#", "D"]
};

const NOTE_RANGE_BY_TYPE = {
  Bass: [1, 3],
  Brass: [2, 5],
  "Chromatic Percussion": [3, 6],
  Ensemble: [2, 6],
  Ethnic: [2, 5],
  Guitar: [2, 5],
  Organ: [2, 6],
  Percussive: [1, 3],
  Piano: [2, 6],
  Pipe: [3, 6],
  Reed: [2, 6],
  "Sound Effects": [2, 6],
  Strings: [2, 6],
  "Synth Effects": [2, 6],
  "Synth Lead": [3, 6],
  "Synth Pad": [2, 6]
};

function defaultInstrumentForLane(lane) {
  if (lane === "drums" || lane.toLowerCase().includes("drum")) {
    return "basic-drums";
  }
  if (lane === "bass" || lane.toLowerCase().includes("bass")) {
    return "synth-bass";
  }
  if (lane === "pad" || lane === "chords" || lane.toLowerCase().includes("pad") || lane.toLowerCase().includes("chord")) {
    return "warm-pad";
  }
  return DEFAULT_PREVIEW_INSTRUMENTS[lane] || "retro-square-lead";
}

function instrumentTypeGroup(instrumentId) {
  return PREVIEW_INSTRUMENT_PACKS.find((instrument) => instrument.id === instrumentId)?.typeGroup || "Synth Lead";
}

function defaultInstrumentForType(typeGroup) {
  if (typeGroup === "Piano") {
    return "preview-acoustic-grand-piano";
  }
  return PREVIEW_INSTRUMENT_PACKS.find((instrument) => instrument.typeGroup === typeGroup)?.id || "";
}

function instrumentsForType(typeGroup) {
  return PREVIEW_INSTRUMENT_PACKS.filter((instrument) => instrument.typeGroup === typeGroup);
}

function clonePreviewLaneState(lanes = Object.keys(DEFAULT_PREVIEW_INSTRUMENTS)) {
  return Object.fromEntries(lanes.map((lane) => {
    const instrument = defaultInstrumentForLane(lane);
    return [
      lane,
      {
        instrument,
        instrumentType: instrumentTypeGroup(instrument),
        muted: false,
        pan: 0,
        soloed: false,
        visible: true,
        volume: 1
      }
    ];
  }));
}

function defaultPreviewLaneState(lane) {
  const instrument = defaultInstrumentForLane(lane);
  return {
    instrument,
    instrumentType: instrumentTypeGroup(instrument),
    muted: false,
    pan: 0,
    soloed: false,
    visible: true,
    volume: 1
  };
}

function laneId(lane) {
  return String(lane || "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function instrumentLabel(value) {
  return PREVIEW_INSTRUMENT_PACKS.find((instrument) => instrument.id === value)?.label || "";
}

function laneLabel(lane) {
  if (LANE_LABELS[lane]) {
    return LANE_LABELS[lane];
  }
  return String(lane || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
    instrumentList,
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
    selectionDetails,
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
    this.extraLaneSources = {};
    this.instrumentList = instrumentList;
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
    this.selectionDetails = selectionDetails;
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
    this.removedFixedLanes = new Set();
    this.selectedCell = null;
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
    this.renderSelectionDetails();
  }

  readInput() {
    const lanes = { ...this.extraLaneSources };
    [
      ["bass", this.bassInput],
      ["chords", this.chordsInput],
      ["drums", this.drumsInput],
      ["lead", this.leadInput],
      ["pad", this.padInput]
    ].forEach(([lane, input]) => {
      if (!this.removedFixedLanes.has(lane)) {
        lanes[lane] = input.value;
      }
    });
    return {
      beatsPerBar: this.beatsInput.value,
      generatedLanes: { ...this.generatedLanes },
      lanes,
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

  applyGridDefaults({ bass, beatsPerBar, chords, drums, lanes = null, lead, pad, previewInstruments = {}, sections, subdivision }) {
    const laneSources = lanes || { bass, chords, drums, lead, pad };
    this.sectionsInput.value = sections || "";
    this.beatsInput.value = beatsPerBar || "";
    this.subdivisionInput.value = subdivision || "1";
    this.chordsInput.value = laneSources.chords || "";
    this.bassInput.value = laneSources.bass || "";
    this.padInput.value = laneSources.pad || "";
    this.leadInput.value = laneSources.lead || "";
    this.drumsInput.value = laneSources.drums || "";
    this.extraLaneSources = Object.fromEntries(Object.entries(laneSources).filter(([lane]) => !FIXED_LANES.includes(lane)));
    this.removedFixedLanes = new Set(FIXED_LANES.filter((lane) => !Object.hasOwn(laneSources, lane)));
    this.previewLaneState = clonePreviewLaneState(Object.keys(laneSources));
    if (!this.previewLaneState[this.selectedLane]) {
      this.selectedLane = Object.keys(laneSources)[0] || "lead";
    }
    this.generatedLanes = {};
    this.applyPreviewInstruments(previewInstruments);
    this.clearLaneToggles();
    this.updateSnapIndicator();
  }

  applyPreviewInstruments(previewInstruments = {}) {
    Object.entries(previewInstruments).forEach(([lane, instrument]) => {
      if (this.previewLaneState[lane]) {
        this.previewLaneState[lane].instrument = String(instrument || "");
        this.previewLaneState[lane].instrumentType = instrumentTypeGroup(instrument);
      }
    });
    this.syncLaneHeaderControls();
  }

  clearLaneToggles() {
    Object.values(this.previewLaneState).forEach((state) => {
      state.muted = false;
      state.pan = 0;
      state.soloed = false;
      state.visible = true;
      state.volume = 1;
    });
    this.syncLaneHeaderControls();
  }

  previewLaneSettings() {
    const settings = { instrumentTypes: {}, instruments: {}, muted: {}, pans: {}, soloed: {}, visible: {}, volumes: {} };
    Object.entries(this.previewLaneState).forEach(([lane, state]) => {
      settings.instrumentTypes[lane] = state.instrumentType || instrumentTypeGroup(state.instrument);
      settings.instruments[lane] = state.instrument || "";
      settings.muted[lane] = Boolean(state.muted);
      settings.pans[lane] = Number(state.pan || 0);
      settings.soloed[lane] = Boolean(state.soloed);
      settings.visible[lane] = state.visible !== false;
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
      hiddenLanes: Object.entries(settings.visible).filter((entry) => entry[1] === false).map(([lane]) => lane),
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
      this.renderInstrumentList([]);
      this.populateSectionControls([]);
      this.setTransportEnabled(false);
      const empty = document.createElement("p");
      empty.className = "midi-studio-v2__empty";
      empty.textContent = result?.message || "No grid data normalized. Import a manifest arrangement or enter sections/chords, then choose Normalize Grid.";
      this.gridOutput.append(empty);
      this.renderSelectionDetails();
      return;
    }
    this.populateSectionControls(result.sections);
    this.setTransportEnabled(true);
    this.renderInstrumentList(result.lanes);
    this.renderGrid(result);
    this.setPlayheadStep(this.playheadStep);
    this.updateLoopRegion();
    this.applySelectedLaneHighlight();
    this.renderSelectionDetails();
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
    const grid = document.createElement("div");
    const octaveRows = this.octaveRowsFor(result);
    grid.className = "midi-studio-v2__instrument-grid midi-studio-v2__note-table midi-studio-v2__octave-timeline";
    grid.setAttribute("role", "table");
    grid.setAttribute("aria-label", "Octave timeline editor");
    grid.style.gridTemplateColumns = `minmax(5.5rem, 7rem) repeat(${result.totalSteps}, minmax(2.55rem, 1fr))`;
    this.renderNoteTableHeader(grid, result);
    octaveRows.forEach((row) => {
      grid.append(this.createOctaveRowHeader(row));
      this.referenceCells(result).forEach((cell, stepIndex) => {
        const outputCell = this.createOctaveTimelineCell({ result, row, stepIndex });
        this.applyTimingDataset(outputCell, cell, stepIndex);
        grid.append(outputCell);
      });
    });
    this.gridOutput.append(grid);
    this.applySelectedLaneHighlight();
  }

  renderNoteTableHeader(grid, result) {
    const instrumentHeader = this.appendCell(grid, "", "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label midi-studio-v2__grid-cell--instrument-column midi-studio-v2__note-table-instrument-header");
    instrumentHeader.setAttribute("role", "columnheader");
    instrumentHeader.textContent = "Octave";
    const rulerCells = this.referenceCells(result);
    rulerCells.forEach((cell, stepIndex) => {
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

  referenceCells(result) {
    return result.cells.chords || result.cells[result.lanes[0]] || [];
  }

  renderInstrumentList(lanes = []) {
    if (!this.instrumentList) {
      return;
    }
    this.instrumentList.replaceChildren();
    this.previewLaneControls = {};
    const actions = document.createElement("div");
    actions.className = "midi-studio-v2__instrument-list-actions";
    const addButton = document.createElement("button");
    addButton.id = "addInstrumentRowButton";
    addButton.className = "midi-studio-v2__lane-add-button";
    addButton.type = "button";
    addButton.dataset.addInstrumentRow = "true";
    addButton.setAttribute("aria-label", "Add instrument");
    addButton.title = "Add instrument";
    addButton.textContent = "+ Instrument";
    addButton.addEventListener("click", () => this.addInstrumentRow());
    actions.append(addButton);
    this.instrumentList.append(actions);
    if (!lanes.length) {
      const empty = document.createElement("p");
      empty.className = "midi-studio-v2__empty";
      empty.textContent = "No timeline instruments loaded.";
      this.instrumentList.append(empty);
      return;
    }
    lanes.forEach((lane) => {
      this.instrumentList.append(this.createInstrumentRow(lane));
    });
    this.syncLaneHeaderControls();
  }

  createInstrumentRow(lane) {
    if (!this.previewLaneState[lane]) {
      this.previewLaneState[lane] = defaultPreviewLaneState(lane);
    }
    const row = document.createElement("div");
    row.className = "midi-studio-v2__instrument-row";
    row.dataset.lane = lane;
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-selected", String(this.selectedLane === lane));

    const title = document.createElement("span");
    title.className = "midi-studio-v2__lane-title";
    title.dataset.laneLabel = lane;
    title.textContent = instrumentLabel(this.previewLaneState[lane]?.instrument) || laneLabel(lane);

    const visibilityButton = this.createVisibilityButton(lane);
    const typeSelect = this.createInstrumentTypeSelect(lane);
    const instrumentSelect = this.createInstrumentSelect(lane);
    const mute = this.createLaneToggle(lane, "mute");
    const solo = this.createLaneToggle(lane, "solo");
    const deleteButton = this.createDeleteLaneButton(lane);

    const titleRow = document.createElement("div");
    titleRow.className = "midi-studio-v2__instrument-title-row";
    titleRow.append(title);

    const selectors = document.createElement("div");
    selectors.className = "midi-studio-v2__instrument-selectors";
    selectors.append(typeSelect, instrumentSelect);

    const controls = document.createElement("div");
    controls.className = "midi-studio-v2__lane-control-row midi-studio-v2__instrument-control-row";
    controls.append(mute.label, solo.label, visibilityButton, deleteButton);

    row.addEventListener("click", (event) => {
      if (event.target.closest("input, select, option, button, label")) {
        return;
      }
      this.handleLaneSelection(lane);
    });
    row.addEventListener("keydown", (event) => {
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
      deleteButton,
      instrument: instrumentSelect,
      instrumentLabel: title,
      instrumentType: typeSelect,
      mute: mute.input,
      row,
      solo: solo.input,
      visibilityButton
    };
    row.append(titleRow, selectors, controls);
    return row;
  }

  createVisibilityButton(lane) {
    const button = document.createElement("button");
    button.className = "midi-studio-v2__lane-icon-button midi-studio-v2__visibility-button";
    button.type = "button";
    button.dataset.toggleInstrumentVisibility = lane;
    this.preventPointerFocusScroll(button);
    button.addEventListener("click", () => {
      this.runInstrumentControlAction(() => this.toggleInstrumentVisibility(lane));
    });
    this.updateVisibilityButton(button, lane);
    return button;
  }

  updateVisibilityButton(button, lane) {
    const visible = this.previewLaneState[lane]?.visible !== false;
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", `${visible ? "Hide" : "Show"} ${laneLabel(lane)}`);
    button.title = visible ? "Hide instrument" : "Show instrument";
    button.dataset.visibilityState = visible ? "visible" : "hidden";
    button.textContent = "";
  }

  toggleInstrumentVisibility(lane) {
    if (!this.previewLaneState[lane]) {
      return;
    }
    this.previewLaneState[lane].visible = this.previewLaneState[lane].visible === false;
    this.onLaneSettingChange?.("visibility", {
      enabled: this.previewLaneState[lane].visible !== false,
      lane,
      laneLabel: laneLabel(lane)
    });
    this.render(this.currentResult);
  }

  createOctaveRowHeader(row) {
    const header = document.createElement("div");
    header.className = "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label midi-studio-v2__grid-cell--instrument-column midi-studio-v2__octave-row-label";
    header.setAttribute("role", "rowheader");
    header.dataset.octaveRow = row.value;
    header.dataset.octave = row.octave;
    header.textContent = row.label;
    return header;
  }

  createOctaveTimelineCell({ result, row, stepIndex }) {
    const events = this.orderedEventsForCell(this.visibleEventsForCell({ result, row, stepIndex }));
    const cell = document.createElement("div");
    cell.className = this.octaveCellClass(events).join(" ");
    cell.dataset.octaveRow = row.value;
    cell.dataset.rowToken = row.value;
    cell.dataset.stepIndex = String(stepIndex);
    if (events.length) {
      cell.dataset.noteLanes = Array.from(new Set(events.map((event) => event.lane))).join(" ");
      cell.dataset.noteValues = events.map((event) => event.value).join(" ");
      cell.textContent = this.noteTextForOctaveCell(events, row.value);
    }
    cell.role = "button";
    cell.tabIndex = 0;
    cell.setAttribute("aria-label", `${row.label} at step ${stepIndex + 1}`);
    cell.addEventListener("click", () => this.toggleTimelineCell(row.value, stepIndex));
    cell.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      this.toggleTimelineCell(row.value, stepIndex);
    });
    return cell;
  }

  octaveCellClass(events) {
    const classes = ["midi-studio-v2__grid-cell", "midi-studio-v2__spreadsheet-note-cell", "midi-studio-v2__note-table-cell", "midi-studio-v2__octave-note-cell"];
    if (events.length) {
      classes.push("midi-studio-v2__grid-cell--event");
    }
    if (events.some((event) => event.lane === this.selectedLane)) {
      classes.push("midi-studio-v2__grid-cell--lane-selected");
    } else if (events.length) {
      classes.push("midi-studio-v2__grid-cell--lane-dimmed");
    }
    return classes;
  }

  noteTextForOctaveCell(events, rowToken) {
    return Array.from(new Set(events.map((event) => {
      if (event.kind === "drum") {
        return String(event.value || rowToken).toLowerCase();
      }
      if (event.kind === "chord") {
        return rowToken;
      }
      return this.normalizeNoteName(event.value);
    }))).join(" ");
  }

  orderedEventsForCell(events) {
    return events.slice().sort((left, right) => {
      const leftSelected = left.lane === this.selectedLane ? 1 : 0;
      const rightSelected = right.lane === this.selectedLane ? 1 : 0;
      return leftSelected - rightSelected;
    });
  }

  visibleEventsForCell({ result, row, stepIndex }) {
    return (result.timeline || []).filter((event) => {
      if (event.stepIndex !== stepIndex || this.previewLaneState[event.lane]?.visible === false) {
        return false;
      }
      return this.rowsForEvent(event).includes(row.value);
    });
  }

  rowsForEvent(event) {
    if (event.kind === "drum") {
      return [String(event.value || "").toLowerCase()];
    }
    if (event.kind === "chord") {
      return this.chordRows(event.value);
    }
    return [this.normalizeNoteName(event.value)];
  }

  chordRootRow(value) {
    const match = String(value || "").match(CHORD_ROOT_ROW);
    return `${this.normalizePitchName(match?.[1] || "C")}4`;
  }

  chordRows(value) {
    const simple = String(value || "").trim().match(SIMPLE_CHORD_PATTERN);
    if (!simple) {
      return [this.chordRootRow(value)];
    }
    const chordName = `${this.normalizePitchName(simple[1])}${simple[2] ? "m" : ""}`;
    const tones = CHORD_TONES[chordName];
    return tones ? tones.map((tone) => `${this.normalizePitchName(tone)}4`) : [this.chordRootRow(value)];
  }

  normalizeNoteName(value) {
    const match = String(value || "").trim().match(/^([A-G](?:#|b)?)([0-8])$/);
    if (!match) {
      return String(value || "").trim();
    }
    return `${this.normalizePitchName(match[1])}${match[2]}`;
  }

  normalizePitchName(value) {
    return FLAT_TO_SHARP[value] || value;
  }

  octaveRowsFor(result) {
    if (this.selectedInstrumentIsPercussion()) {
      const rows = new Set(PERCUSSION_ROWS);
      (result.timeline || []).forEach((event) => {
        if (event.kind === "drum") {
          rows.add(String(event.value || "").toLowerCase());
        }
      });
      return Array.from(rows).map((value) => ({ label: value, octave: "percussion", value }));
    }
    const typeGroup = this.previewLaneState[this.selectedLane]?.instrumentType || "Synth Lead";
    const [lowOctave, highOctave] = NOTE_RANGE_BY_TYPE[typeGroup] || [2, 6];
    const rows = [];
    for (let octave = highOctave; octave >= lowOctave; octave -= 1) {
      for (let index = NOTE_NAMES.length - 1; index >= 0; index -= 1) {
        const note = `${NOTE_NAMES[index]}${octave}`;
        rows.push({ label: note, octave: String(octave), value: note });
      }
    }
    return rows;
  }

  selectedInstrumentIsPercussion() {
    const state = this.previewLaneState[this.selectedLane] || {};
    return this.selectedLane === "drums" || state.instrumentType === "Percussive";
  }

  toggleTimelineCell(rowToken, stepIndex) {
    if (!this.currentResult?.ok || !this.selectedLane) {
      return;
    }
    this.selectedCell = { rowToken, stepIndex };
    const existingToken = this.tokenForLaneStep(this.selectedLane, stepIndex);
    const activeRows = this.rowsForSelectedToken(existingToken);
    const existingParts = this.tokenPartsForSelectedToken(existingToken);
    const rowPart = this.tokenForRow(rowToken);
    const nextParts = activeRows.includes(rowToken)
      ? existingParts.filter((part) => this.rowForTokenPart(part) !== rowToken)
      : [...existingParts, rowPart];
    const nextToken = nextParts.length ? this.joinTokenParts(nextParts) : "-";
    this.setLaneStepToken(this.selectedLane, stepIndex, nextToken);
    this.onNoteEdit?.(this.readInput(), {
      action: "toggle-note",
      lane: this.selectedLane,
      laneLabel: laneLabel(this.selectedLane),
      note: nextToken,
      rowToken,
      stepIndex
    });
  }

  tokenForRow(rowToken) {
    if (this.selectedInstrumentIsPercussion()) {
      return String(rowToken || "").toLowerCase();
    }
    return this.normalizeNoteName(rowToken);
  }

  rowsForSelectedToken(token) {
    return this.tokenPartsForSelectedToken(token).map((part) => this.rowForTokenPart(part));
  }

  tokenPartsForSelectedToken(token) {
    const value = String(token || "").trim();
    if (REST_TOKENS.has(value.toLowerCase())) {
      return [];
    }
    if (this.selectedInstrumentIsPercussion()) {
      return this.splitTokenParts(value).map((part) => part.toLowerCase());
    }
    const parts = this.splitTokenParts(value);
    if (parts.length > 1) {
      return parts.map((part) => this.normalizeNoteName(part));
    }
    if (this.selectedLane === "chords" || (this.selectedLane === "pad" && /^[A-G](?:#|b)?/.test(value) && !/[0-8]$/.test(value))) {
      return this.chordRows(value);
    }
    return [this.normalizeNoteName(value)];
  }

  splitTokenParts(token) {
    return String(token || "").split("+").map((part) => part.trim()).filter(Boolean);
  }

  rowForTokenPart(part) {
    if (this.selectedInstrumentIsPercussion()) {
      return String(part || "").toLowerCase();
    }
    return this.normalizeNoteName(part);
  }

  joinTokenParts(parts) {
    const seen = new Set();
    const unique = [];
    parts.forEach((part) => {
      const normalized = this.selectedInstrumentIsPercussion() ? String(part || "").toLowerCase() : this.normalizeNoteName(part);
      if (!normalized || seen.has(normalized)) {
        return;
      }
      seen.add(normalized);
      unique.push(normalized);
    });
    return unique.join("+");
  }

  tokenForLaneStep(lane, stepIndex) {
    const stepsPerBar = this.currentResult.beatsPerBar * this.currentResult.subdivision;
    const source = this.readInput().lanes[lane] || "";
    const bars = source ? source.split("|").map((bar) => bar.trim()) : [];
    const barIndex = Math.floor(stepIndex / stepsPerBar);
    const stepInBar = stepIndex % stepsPerBar;
    const tokens = bars[barIndex] ? bars[barIndex].split(/\s+/).filter(Boolean) : [];
    return tokens[stepInBar] || "-";
  }

  setLaneStepToken(lane, stepIndex, token) {
    const result = this.currentResult;
    const stepsPerBar = result.beatsPerBar * result.subdivision;
    const source = this.readInput().lanes[lane] || "";
    const bars = [];
    for (let barIndex = 0; barIndex < result.barCount; barIndex += 1) {
      const sourceTokens = source.split("|")[barIndex]?.trim().split(/\s+/).filter(Boolean) || [];
      const tokens = [];
      for (let stepInBar = 0; stepInBar < stepsPerBar; stepInBar += 1) {
        tokens.push(sourceTokens[stepInBar] || "-");
      }
      bars.push(tokens);
    }
    const barIndex = Math.floor(stepIndex / stepsPerBar);
    const stepInBar = stepIndex % stepsPerBar;
    bars[barIndex][stepInBar] = token || "-";
    const laneText = bars.map((tokens) => tokens.join(" ")).join(" | ");
    const laneInput = this.inputForLane(lane);
    if (laneInput) {
      laneInput.value = laneText;
    } else {
      this.extraLaneSources[lane] = laneText;
    }
  }

  createLaneHeaderCell(lane) {
    const cell = document.createElement("div");
    cell.className = "midi-studio-v2__grid-cell midi-studio-v2__grid-cell--label midi-studio-v2__grid-cell--instrument-column midi-studio-v2__lane-header-cell";
    cell.setAttribute("role", "rowheader");
    cell.dataset.lane = lane;
    cell.tabIndex = 0;

    const instrumentLabelElement = document.createElement("span");
    instrumentLabelElement.className = "midi-studio-v2__lane-title";
    instrumentLabelElement.dataset.laneLabel = lane;
    instrumentLabelElement.textContent = instrumentLabel(this.previewLaneState[lane]?.instrument) || laneLabel(lane);
    const typeSelect = this.createInstrumentTypeSelect(lane);
    const instrumentSelect = this.createInstrumentSelect(lane);

    const mute = this.createLaneToggle(lane, "mute");
    const solo = this.createLaneToggle(lane, "solo");
    const volume = this.createLaneSlider(lane, "volume");
    const pan = this.createLaneSlider(lane, "pan");
    const volumeButton = this.createLaneSliderButton(lane, "volume");
    const panButton = this.createLaneSliderButton(lane, "pan");
    const deleteButton = this.createDeleteLaneButton(lane);

    const main = document.createElement("div");
    main.className = "midi-studio-v2__lane-header-main";
    main.append(instrumentLabelElement, typeSelect, instrumentSelect);

    const toggles = document.createElement("div");
    toggles.className = "midi-studio-v2__lane-control-row";
    toggles.append(mute.label, solo.label, volumeButton, panButton, deleteButton);

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
      deleteButton,
      instrument: instrumentSelect,
      instrumentLabel: instrumentLabelElement,
      instrumentType: typeSelect,
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

  createInstrumentTypeSelect(lane) {
    const select = document.createElement("select");
    select.id = `previewInstrumentType${laneId(lane)}Select`;
    select.className = "midi-studio-v2__lane-type-select";
    select.dataset.laneInstrumentTypeSelect = lane;
    select.setAttribute("aria-label", `Instrument type ${laneLabel(lane)}`);
    INSTRUMENT_TYPE_GROUPS.forEach((typeGroup) => {
      const option = document.createElement("option");
      option.value = typeGroup;
      option.textContent = typeGroup;
      select.append(option);
    });
    select.value = this.previewLaneState[lane]?.instrumentType || instrumentTypeGroup(this.previewLaneState[lane]?.instrument);
    select.addEventListener("change", () => {
      const nextInstrument = defaultInstrumentForType(select.value);
      this.previewLaneState[lane].instrumentType = select.value;
      this.previewLaneState[lane].instrument = nextInstrument;
      this.populateInstrumentOptions(lane);
      this.updateLaneTitle(lane);
      this.onLaneSettingChange?.("instrument-type", {
        instrumentLabel: instrumentLabel(nextInstrument),
        instrumentType: select.value,
        instrumentValue: nextInstrument,
        lane,
        laneLabel: laneLabel(lane)
      });
    });
    return select;
  }

  createInstrumentSelect(lane) {
    const select = document.createElement("select");
    select.id = `previewInstrument${laneId(lane)}Select`;
    select.className = "midi-studio-v2__lane-instrument-select";
    select.dataset.laneInstrumentSelect = lane;
    select.dataset.previewInstrumentLane = lane;
    select.setAttribute("aria-label", `Instrument ${laneLabel(lane)}`);
    this.populateInstrumentOptions(lane, select);
    select.addEventListener("change", () => {
      const nextType = select.value ? instrumentTypeGroup(select.value) : this.previewLaneState[lane].instrumentType;
      this.previewLaneState[lane].instrument = select.value;
      this.previewLaneState[lane].instrumentType = nextType;
      const controls = this.previewLaneControls[lane];
      if (controls?.instrumentType) {
        controls.instrumentType.value = nextType;
      }
      this.updateLaneTitle(lane);
      this.onLaneSettingChange?.("instrument", {
        instrumentLabel: select.selectedOptions[0]?.textContent || "",
        instrumentType: nextType,
        instrumentValue: select.value,
        lane,
        laneLabel: laneLabel(lane)
      });
    });
    return select;
  }

  populateInstrumentOptions(lane, select = this.previewLaneControls[lane]?.instrument) {
    if (!select) {
      return;
    }
    const typeGroup = this.previewLaneState[lane]?.instrumentType || "Synth Lead";
    select.replaceChildren();
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Choose instrument";
    select.append(emptyOption);
    instrumentsForType(typeGroup).forEach((instrument) => {
      const option = document.createElement("option");
      option.value = instrument.id;
      option.textContent = instrument.label;
      select.append(option);
    });
    const selectedInstrument = this.previewLaneState[lane]?.instrument || "";
    select.value = instrumentsForType(typeGroup).some((instrument) => instrument.id === selectedInstrument)
      ? selectedInstrument
      : "";
  }

  updateLaneTitle(lane) {
    const controls = this.previewLaneControls[lane];
    if (!controls?.instrumentLabel) {
      return;
    }
    controls.instrumentLabel.textContent = instrumentLabel(this.previewLaneState[lane]?.instrument) || laneLabel(lane);
  }

  createLaneToggle(lane, kind) {
    const input = document.createElement("input");
    const label = document.createElement("label");
    const icon = document.createElement("span");
    const controlLabel = kind === "mute" ? "Mute" : "Solo";
    input.id = `preview${controlLabel}${laneId(lane)}Toggle`;
    input.type = "checkbox";
    input.checked = kind === "mute" ? this.previewLaneState[lane]?.muted === true : this.previewLaneState[lane]?.soloed === true;
    input.dataset[kind === "mute" ? "previewMuteLane" : "previewSoloLane"] = lane;
    input.setAttribute("aria-label", `${controlLabel} ${laneLabel(lane)}`);
    label.className = `tool-starter__toggle midi-studio-v2__lane-toggle midi-studio-v2__lane-toggle--${kind}`;
    label.classList.toggle("is-active", input.checked);
    label.dataset.laneControlKind = kind;
    label.htmlFor = input.id;
    icon.className = "midi-studio-v2__lane-toggle-icon";
    icon.setAttribute("aria-hidden", "true");
    this.preventPointerFocusScroll(label);
    input.addEventListener("change", () => {
      this.runInstrumentControlAction(() => {
        label.classList.toggle("is-active", input.checked);
        if (kind === "mute") {
          this.previewLaneState[lane].muted = input.checked;
        } else {
          this.previewLaneState[lane].soloed = input.checked;
        }
        this.onLaneSettingChange?.(kind, {
          enabled: input.checked,
          lane,
          laneLabel: laneLabel(lane)
        });
      });
    });
    label.append(input, icon);
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
    input.setAttribute("aria-label", `${controlLabel} ${laneLabel(lane)}`);
    const update = () => {
      const value = Number(input.value);
      if (kind === "volume") {
        this.previewLaneState[lane].volume = value;
      } else {
        this.previewLaneState[lane].pan = value;
      }
      this.onLaneSettingChange?.(kind, {
        lane,
        laneLabel: laneLabel(lane),
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
    button.setAttribute("aria-label", `Toggle ${controlLabel} slider for ${laneLabel(lane)}`);
    button.title = `Toggle ${controlLabel} slider`;
    button.textContent = kind === "volume" ? "◢" : "↔";
    button.addEventListener("click", () => this.toggleLaneSlider(lane, kind));
    return button;
  }

  createDeleteLaneButton(lane) {
    const button = document.createElement("button");
    button.className = "midi-studio-v2__lane-icon-button midi-studio-v2__lane-delete-button";
    button.type = "button";
    button.dataset.deleteInstrumentRow = lane;
    button.setAttribute("aria-label", `Delete instrument row ${laneLabel(lane)}`);
    button.title = "Delete instrument row";
    button.textContent = "x";
    this.preventPointerFocusScroll(button);
    button.addEventListener("click", () => {
      this.runInstrumentControlAction(() => this.deleteInstrumentRow(lane));
    });
    return button;
  }

  preventPointerFocusScroll(element) {
    element.addEventListener("pointerdown", (event) => {
      event.preventDefault();
    });
  }

  runInstrumentControlAction(action) {
    const scrollState = this.captureInstrumentScrollState();
    action();
    this.restoreInstrumentScrollState(scrollState);
  }

  captureInstrumentScrollState() {
    const leftPanel = this.instrumentList?.closest(".tool-starter__panel--left") || null;
    const instrumentPanel = this.instrumentList?.closest(".midi-studio-v2__instrument-list-panel") || null;
    return {
      instrumentPanel,
      instrumentScrollLeft: instrumentPanel?.scrollLeft || 0,
      instrumentScrollTop: instrumentPanel?.scrollTop || 0,
      leftPanel,
      leftScrollLeft: leftPanel?.scrollLeft || 0,
      leftScrollTop: leftPanel?.scrollTop || 0,
      windowScrollX: this.window.scrollX || 0,
      windowScrollY: this.window.scrollY || 0
    };
  }

  restoreInstrumentScrollState(scrollState) {
    this.applyInstrumentScrollState(scrollState);
    this.window.requestAnimationFrame?.(() => this.applyInstrumentScrollState(scrollState));
  }

  applyInstrumentScrollState(scrollState) {
    if (!scrollState) {
      return;
    }
    if (scrollState.leftPanel) {
      scrollState.leftPanel.scrollTop = scrollState.leftScrollTop;
      scrollState.leftPanel.scrollLeft = scrollState.leftScrollLeft;
    }
    if (scrollState.instrumentPanel) {
      scrollState.instrumentPanel.scrollTop = scrollState.instrumentScrollTop;
      scrollState.instrumentPanel.scrollLeft = scrollState.instrumentScrollLeft;
    }
    this.window.scrollTo(scrollState.windowScrollX, scrollState.windowScrollY);
    const activeElement = this.window.document.activeElement;
    if (activeElement?.closest?.(".midi-studio-v2__instrument-control-row")) {
      activeElement.blur();
    }
  }

  addInstrumentRow() {
    const lane = this.nextInstrumentLaneName();
    this.extraLaneSources[lane] = "";
    this.previewLaneState[lane] = defaultPreviewLaneState(lane);
    this.selectedLane = lane;
    this.emitGridStructureChange("add-lane", lane);
  }

  deleteInstrumentRow(lane) {
    if (!lane) {
      return;
    }
    if (FIXED_LANES.includes(lane)) {
      this.removedFixedLanes.add(lane);
      const laneInput = this.inputForLane(lane);
      if (laneInput) {
        laneInput.value = "";
      }
    } else {
      delete this.extraLaneSources[lane];
    }
    delete this.previewLaneState[lane];
    this.selectedLane = Object.keys(this.readInput().lanes)[0] || "";
    this.emitGridStructureChange("delete-lane", lane);
  }

  emitGridStructureChange(action, lane) {
    this.onNoteEdit?.(this.readInput(), { action, lane, laneLabel: laneLabel(lane) });
  }

  nextInstrumentLaneName() {
    const existing = new Set(Object.keys(this.readInput().lanes));
    let index = 1;
    let lane = `instrument-${index}`;
    while (existing.has(lane)) {
      index += 1;
      lane = `instrument-${index}`;
    }
    return lane;
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
        this.populateInstrumentOptions(lane, controls.instrument);
        controls.instrument.value = state.instrument || "";
      }
      if (controls.instrumentType) {
        controls.instrumentType.value = state.instrumentType || instrumentTypeGroup(state.instrument);
      }
      this.updateLaneTitle(lane);
      if (controls.mute) {
        controls.mute.checked = state.muted === true;
      }
      if (controls.solo) {
        controls.solo.checked = state.soloed === true;
      }
      if (controls.visibilityButton) {
        this.updateVisibilityButton(controls.visibilityButton, lane);
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
    outputCell.setAttribute("aria-label", `${laneLabel(cell.lane)} note cell, section ${cell.section}, bar ${cell.bar}, beat ${cell.beat}`);
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
    if (!this.currentResult?.ok) {
      return;
    }
    this.syncNoteTableCellState(cell);
    const laneText = this.noteTableLaneText(lane);
    if (laneInput) {
      laneInput.value = laneText;
    } else {
      this.extraLaneSources[lane] = laneText;
    }
    this.onNoteEdit?.(this.readInput(), { lane, laneLabel: laneLabel(lane) });
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
    if (this.currentResult?.ok) {
      this.render(this.currentResult);
      return;
    }
    this.previewLaneEntries().forEach(([entryLane, controls]) => {
      controls.row?.classList.toggle("is-selected", entryLane === lane);
      controls.row?.setAttribute("aria-selected", String(entryLane === lane));
    });
    this.renderSelectionDetails();
  }

  handleLaneSelection(lane) {
    this.selectLane(lane);
    this.onLaneSettingChange?.("select", { lane, laneLabel: laneLabel(lane) });
  }

  applySelectedLaneHighlight() {
    this.previewLaneEntries().forEach(([entryLane, controls]) => {
      controls.row?.classList.toggle("is-selected", entryLane === this.selectedLane);
      controls.row?.setAttribute("aria-selected", String(entryLane === this.selectedLane));
    });
    this.renderSelectionDetails();
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

  renderSelectionDetails() {
    if (!this.selectionDetails) {
      return;
    }
    const state = this.previewLaneState[this.selectedLane] || {};
    const rows = [
      ["Instrument", this.selectedLane ? laneLabel(this.selectedLane) : "none"],
      ["Type", state.instrumentType || "not selected"],
      ["Patch", instrumentLabel(state.instrument) || "not selected"],
      ["Visibility", state.visible === false ? "hidden" : "visible"],
      ["Mute", state.muted ? "on" : "off"],
      ["Solo", state.soloed ? "on" : "off"]
    ];
    if (this.selectedCell) {
      rows.push(["Selected cell", `${this.selectedCell.rowToken} / step ${this.selectedCell.stepIndex + 1}`]);
    }
    this.selectionDetails.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = value;
      row.append(term, description);
      this.selectionDetails.append(row);
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
      if (cell.classList.contains("midi-studio-v2__grid-cell--timing-header") || cell.classList.contains("midi-studio-v2__note-table-cell")) {
        cell.classList.add("midi-studio-v2__grid-cell--playhead-active");
      }
      const cellLanes = String(cell.dataset.noteLanes || "").split(/\s+/).filter(Boolean);
      if (cellLanes.some((lane) => this.activePreviewLanes.includes(lane))) {
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
