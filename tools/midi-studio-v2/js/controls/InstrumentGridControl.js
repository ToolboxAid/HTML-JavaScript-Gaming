import { PREVIEW_INSTRUMENT_PACKS, previewInstrumentById } from "../../../../src/engine/audio/PreviewInstrumentPacks.js";
import { OctaveTimelineCanvasRenderer } from "./OctaveTimelineCanvasRenderer.js";
import { setUnwiredControlState } from "./UnwiredControlState.js";
import { sectionTone } from "../sectionColors.js";

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
const OCTAVE_GRID_ZOOM = {
  default: 22,
  max: 38,
  min: 12,
  step: 4
};
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

function finiteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasOwnValue(source, key) {
  return Object.hasOwn(source || {}, key);
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
        advanced: defaultAdvancedState(),
        displayName: "",
        duration: 1,
        effects: defaultEffectsState(),
        instrument,
        instrumentType: instrumentTypeGroup(instrument),
        muted: false,
        octaveHigh: null,
        octaveLow: null,
        pan: 0,
        soloed: false,
        transpose: 0,
        velocity: 100,
        visible: true,
        volume: 1
      }
    ];
  }));
}

function defaultEffectsState() {
  return {
    brightnessTone: null,
    chorus: null,
    delay: null,
    filter: null,
    reverb: null
  };
}

function defaultAdvancedState() {
  return {
    controllerValues: null,
    gmProgram: null,
    midiChannel: null
  };
}

function clonePlainObject(value) {
  if (!value || typeof value !== "object") {
    return {};
  }
  return JSON.parse(JSON.stringify(value));
}

function defaultPreviewLaneState(lane) {
  const instrument = defaultInstrumentForLane(lane);
  return {
    advanced: defaultAdvancedState(),
    displayName: "",
    duration: 1,
    effects: defaultEffectsState(),
    instrument,
    instrumentType: instrumentTypeGroup(instrument),
    muted: false,
    octaveHigh: null,
    octaveLow: null,
    pan: 0,
    soloed: false,
    transpose: 0,
    velocity: 100,
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

function previewInstrumentWarning(value) {
  const instrument = previewInstrumentById(value);
  if (!instrument?.approximationWarning) {
    return "";
  }
  if (instrument.mappedPreviewInstrumentLabel) {
    return `${instrument.label} maps to ${instrument.mappedPreviewInstrumentLabel} for audible Preview Synth playback. ${instrument.approximationWarning}`;
  }
  return instrument.approximationWarning;
}

function audiblePreviewLabel(value) {
  const instrument = previewInstrumentById(value);
  return instrument?.mappedPreviewInstrumentLabel || instrument?.label || "";
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
    addInstrumentButton,
    auditionKeyboard,
    bassInput,
    beatsInput,
    chordsInput,
    closeInstrumentPanelButton,
    drumsInput,
    duplicateInstrumentButton,
    duplicateInstrumentPresetButton,
    generateArpeggioButton,
    generateBassButton,
    generateDrumsButton,
    generatePadButton,
    gridOutput,
    instrumentEditor,
    instrumentList,
    instrumentPresetSelect,
    instrumentPresetSummary,
    instrumentGridZoomInButton,
    instrumentGridZoomOutButton,
    jumpToSectionButton,
    laneTypeSelect,
    leadInput,
    loadInstrumentPresetButton,
    loopEndSelect,
    loopStartSelect,
    moveInstrumentDownButton,
    moveInstrumentUpButton,
    normalizeButton,
    padInput,
    playLoopButton,
    playSectionButton,
    playSequenceButton,
    quickInstrumentList,
    saveInstrumentPresetButton,
    sectionAvailability,
    sectionPresetButtons,
    sectionSelect,
    selectionDetails,
    sectionsInput,
    snapIndicator,
    stopTimingPreviewButton,
    subdivisionInput,
    summary,
    timelineAddInstrumentButton,
    timelineCloseInstrumentPanelButton,
    transportState,
    windowRef = window
  }) {
    this.addInstrumentButton = addInstrumentButton;
    this.auditionKeyboard = auditionKeyboard;
    this.bassInput = bassInput;
    this.beatsInput = beatsInput;
    this.chordsInput = chordsInput;
    this.closeInstrumentPanelButton = closeInstrumentPanelButton;
    this.drumsInput = drumsInput;
    this.duplicateInstrumentButton = duplicateInstrumentButton;
    this.duplicateInstrumentPresetButton = duplicateInstrumentPresetButton;
    this.generateArpeggioButton = generateArpeggioButton;
    this.generateBassButton = generateBassButton;
    this.generateDrumsButton = generateDrumsButton;
    this.generatePadButton = generatePadButton;
    this.generatedLanes = {};
    this.gridOutput = gridOutput;
    this.extraLaneSources = {};
    this.instrumentEditor = instrumentEditor;
    this.instrumentList = instrumentList;
    this.instrumentPresetSelect = instrumentPresetSelect;
    this.instrumentPresetSummary = instrumentPresetSummary;
    this.instrumentGridZoomInButton = instrumentGridZoomInButton;
    this.instrumentGridZoomOutButton = instrumentGridZoomOutButton;
    this.jumpToSectionButton = jumpToSectionButton;
    this.laneTypeSelect = laneTypeSelect;
    this.leadInput = leadInput;
    this.loadInstrumentPresetButton = loadInstrumentPresetButton;
    this.loopEndSelect = loopEndSelect;
    this.loopStartSelect = loopStartSelect;
    this.moveInstrumentDownButton = moveInstrumentDownButton;
    this.moveInstrumentUpButton = moveInstrumentUpButton;
    this.normalizeButton = normalizeButton;
    this.padInput = padInput;
    this.playLoopButton = playLoopButton;
    this.playSectionButton = playSectionButton;
    this.playSequenceButton = playSequenceButton;
    this.previewLaneControls = {};
    this.previewLaneState = clonePreviewLaneState();
    this.previewTempoBpm = 120;
    this.quickInstrumentList = quickInstrumentList;
    this.saveInstrumentPresetButton = saveInstrumentPresetButton;
    this.quickLaneControls = {};
    this.selectedEditorControls = null;
    this.sectionAvailability = sectionAvailability;
    this.sectionPresetButtons = sectionPresetButtons;
    this.sectionSelect = sectionSelect;
    this.selectionDetails = selectionDetails;
    this.sectionsInput = sectionsInput;
    this.snapIndicator = snapIndicator;
    this.stopTimingPreviewButton = stopTimingPreviewButton;
    this.subdivisionInput = subdivisionInput;
    this.summary = summary;
    this.timelineAddInstrumentButton = timelineAddInstrumentButton;
    this.timelineCloseInstrumentPanelButton = timelineCloseInstrumentPanelButton;
    this.transportState = transportState;
    this.window = windowRef;
    this.currentResult = null;
    this.activePreviewLanes = [];
    this.loopBounds = null;
    this.playTimer = null;
    this.playheadStep = 0;
    this.lastPlayheadHighlightStep = null;
    this.octaveCellSize = OCTAVE_GRID_ZOOM.default;
    this.deleteBlockedLane = null;
    this.laneOrder = [];
    this.pendingDeleteLane = null;
    this.recentlyDuplicatedLane = null;
    this.syncingTimelineScroll = false;
    this.timelineScrollProxy = null;
    this.timelineScrollProxySpacer = null;
    this.timelineCanvas = null;
    this.timelineCanvasRenderer = null;
    this.timelineCanvasRows = [];
    this.hoveredCell = null;
    this.instrumentPresetAssets = [];
    this.instrumentWorkflowStatus = "Instrument selection ready.";
    this.lastTimelinePointerHit = null;
    this.removedFixedLanes = new Set();
    this.selectedCell = null;
    this.selectedSectionBounds = null;
    this.selectedInstrumentId = "lead";
    this.suppressNextCellClick = false;
    this.timelinePointerEdit = null;
  }

  get selectedLane() {
    return this.selectedInstrumentId;
  }

  set selectedLane(lane) {
    this.selectedInstrumentId = lane;
  }

  mount({ onGenerate, onLaneSettingChange, onNormalize, onNoteEdit = () => {}, onTransport }) {
    this.onNoteEdit = onNoteEdit;
    this.onLaneSettingChange = onLaneSettingChange;
    this.onTransport = onTransport || (() => {});
    this.generateBassButton.addEventListener("click", () => onGenerate("bass", this.readInput()));
    this.generatePadButton.addEventListener("click", () => onGenerate("pad", this.readInput()));
    this.generateArpeggioButton.addEventListener("click", () => onGenerate("lead", this.readInput()));
    this.generateDrumsButton.addEventListener("click", () => onGenerate("drums", this.readInput()));
    this.normalizeButton.addEventListener("click", () => onNormalize(this.readInput()));
    this.jumpToSectionButton.addEventListener("click", () => this.jumpToSelectedSection(onTransport));
    this.playSectionButton.addEventListener("click", () => {
      void this.playSelectedSection(onTransport);
    });
    this.playSequenceButton?.addEventListener("click", () => {
      void this.playSequence(onTransport);
    });
    this.playLoopButton.addEventListener("click", () => {
      void this.playSelectedLoop(onTransport);
    });
    this.stopTimingPreviewButton.addEventListener("click", () => this.stopTimingPreview(onTransport));
    this.sectionPresetButtons.forEach((button) => {
      button.addEventListener("click", () => this.selectPresetSection(button.dataset.sectionPreset, onTransport));
    });
    this.sectionSelect.addEventListener("change", () => this.handleSectionSelectionChange(onTransport));
    [this.loopStartSelect, this.loopEndSelect].forEach((select) => {
      select.addEventListener("change", () => this.handleLoopRegionChange(onTransport));
    });
    [this.sectionsInput, this.beatsInput, this.subdivisionInput].forEach((input) => {
      input.addEventListener("input", () => this.updateSnapIndicator());
      input.addEventListener("change", () => this.updateSnapIndicator());
    });
    this.gridOutput.addEventListener("scroll", () => this.syncTimelineScrollState());
    this.instrumentGridZoomInButton?.addEventListener("click", () => this.adjustOctaveGridZoom(OCTAVE_GRID_ZOOM.step));
    this.instrumentGridZoomOutButton?.addEventListener("click", () => this.adjustOctaveGridZoom(-OCTAVE_GRID_ZOOM.step));
    [this.duplicateInstrumentButton, this.moveInstrumentUpButton, this.moveInstrumentDownButton].filter(Boolean).forEach((button) => {
      this.preventPointerFocusScroll(button);
    });
    this.addInstrumentButton?.addEventListener("click", () => this.addInstrumentRow());
    this.timelineAddInstrumentButton?.addEventListener("click", () => this.addInstrumentRow());
    this.duplicateInstrumentButton?.addEventListener("click", () => this.duplicateSelectedInstrument());
    this.moveInstrumentUpButton?.addEventListener("click", () => this.moveSelectedInstrument(-1));
    this.moveInstrumentDownButton?.addEventListener("click", () => this.moveSelectedInstrument(1));
    this.instrumentPresetSelect?.addEventListener("change", () => this.renderInstrumentPresetSummary());
    this.saveInstrumentPresetButton?.addEventListener("click", () => this.saveSelectedInstrumentPreset());
    this.loadInstrumentPresetButton?.addEventListener("click", () => this.loadSelectedInstrumentPreset());
    this.duplicateInstrumentPresetButton?.addEventListener("click", () => this.duplicateSelectedInstrumentPreset());
    this.closeInstrumentPanelButton?.addEventListener("click", () => this.toggleInstrumentPanel());
    this.timelineCloseInstrumentPanelButton?.addEventListener("click", () => this.toggleTimelineInstrumentPanel());
    this.setTransportEnabled(false);
    this.populateSectionControls([]);
    this.updateSnapIndicator();
    this.applyOctaveGridZoom();
    this.selectLane(this.selectedLane);
    this.renderQuickInstrumentList([]);
    this.renderSelectedInstrumentEditor();
    this.renderAuditionKeyboard();
    this.renderSelectionDetails();
    this.renderInstrumentPresetLibrary();
  }

  readInput() {
    const lanes = {};
    this.orderedLaneNames().forEach((lane) => {
      lanes[lane] = this.laneSourceValue(lane);
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

  applyGridDefaults({ bass, beatsPerBar, chords, drums, lanes = null, lead, pad, previewInstruments = {}, previewLaneSettings = null, sections, subdivision }) {
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
    this.laneOrder = Object.keys(laneSources);
    this.removedFixedLanes = new Set(FIXED_LANES.filter((lane) => !Object.hasOwn(laneSources, lane)));
    this.previewLaneState = clonePreviewLaneState(Object.keys(laneSources));
    if (!this.previewLaneState[this.selectedLane]) {
      this.selectedLane = Object.keys(laneSources)[0] || "lead";
    }
    this.generatedLanes = {};
    this.applyPreviewLaneSettings(previewLaneSettings || { instruments: previewInstruments }, previewInstruments);
    this.updateSnapIndicator();
  }

  applyPreviewInstruments(previewInstruments = {}) {
    this.applyPreviewLaneSettings({ instruments: previewInstruments }, previewInstruments);
  }

  applyPreviewLaneSettings(previewLaneSettings = {}, previewInstruments = {}) {
    const instruments = { ...(previewInstruments || {}), ...(previewLaneSettings.instruments || {}) };
    Object.entries(instruments).forEach(([lane, instrument]) => {
      if (this.previewLaneState[lane]) {
        this.previewLaneState[lane].instrument = String(instrument || "");
        this.previewLaneState[lane].instrumentType = instrumentTypeGroup(instrument);
      }
    });
    Object.entries(this.previewLaneState).forEach(([lane, state]) => {
      const instrument = instruments[lane];
      if (instrument !== undefined) {
        state.instrument = String(instrument || "");
        state.instrumentType = instrumentTypeGroup(instrument);
      }
      if (hasOwnValue(previewLaneSettings.instrumentTypes, lane)) {
        state.instrumentType = String(previewLaneSettings.instrumentTypes[lane] || state.instrumentType || instrumentTypeGroup(state.instrument));
      }
      if (hasOwnValue(previewLaneSettings.displayNames, lane)) {
        state.displayName = String(previewLaneSettings.displayNames[lane] || "");
      }
      if (hasOwnValue(previewLaneSettings.muted, lane)) {
        state.muted = previewLaneSettings.muted[lane] === true;
      }
      if (hasOwnValue(previewLaneSettings.soloed, lane)) {
        state.soloed = previewLaneSettings.soloed[lane] === true;
      }
      if (hasOwnValue(previewLaneSettings.visible, lane)) {
        state.visible = previewLaneSettings.visible[lane] !== false;
      }
      if (hasOwnValue(previewLaneSettings.volumes, lane)) {
        state.volume = Math.max(0, Math.min(1, finiteNumber(previewLaneSettings.volumes[lane], 1)));
      }
      if (hasOwnValue(previewLaneSettings.pans, lane)) {
        state.pan = Math.max(-1, Math.min(1, finiteNumber(previewLaneSettings.pans[lane], 0)));
      }
      if (hasOwnValue(previewLaneSettings.transposes, lane)) {
        state.transpose = Math.max(-24, Math.min(24, Math.round(finiteNumber(previewLaneSettings.transposes[lane], 0))));
      }
      if (hasOwnValue(previewLaneSettings.velocities, lane)) {
        state.velocity = Math.max(1, Math.min(127, Math.round(finiteNumber(previewLaneSettings.velocities[lane], 100))));
      }
      if (hasOwnValue(previewLaneSettings.durations, lane)) {
        state.duration = Math.max(0.1, Math.min(8, finiteNumber(previewLaneSettings.durations[lane], 1)));
      }
      if (hasOwnValue(previewLaneSettings.effects, lane)) {
        state.effects = { ...defaultEffectsState(), ...clonePlainObject(previewLaneSettings.effects[lane]) };
      }
      if (hasOwnValue(previewLaneSettings.advanced, lane)) {
        state.advanced = { ...defaultAdvancedState(), ...clonePlainObject(previewLaneSettings.advanced[lane]) };
      }
      const octaveRange = previewLaneSettings.octaveRanges?.[lane] || null;
      if (octaveRange) {
        const low = Array.isArray(octaveRange) ? octaveRange[0] : octaveRange.low;
        const high = Array.isArray(octaveRange) ? octaveRange[1] : octaveRange.high;
        state.octaveLow = Number.isFinite(Number(low)) ? Math.max(0, Math.min(8, Math.round(Number(low)))) : null;
        state.octaveHigh = Number.isFinite(Number(high)) ? Math.max(0, Math.min(8, Math.round(Number(high)))) : null;
      }
    });
    this.syncLaneHeaderControls();
  }

  selectedInstrumentPreset() {
    const id = this.instrumentPresetSelect?.value || "";
    return this.instrumentPresetAssets.find((preset) => preset.id === id) || null;
  }

  saveSelectedInstrumentPreset() {
    const lane = this.selectedLane;
    const state = this.previewLaneState[lane];
    if (!lane || !state) {
      this.renderInstrumentPresetSummary("Select an instrument before saving a preset.");
      return { ok: false };
    }
    const preset = {
      id: this.nextInstrumentPresetId(lane),
      label: this.displayNameForLane(lane),
      lane,
      settings: clonePlainObject(state)
    };
    this.instrumentPresetAssets.push(preset);
    this.setInstrumentWorkflowStatus(`Saved instrument preset ${preset.label} from ${laneLabel(lane)}.`);
    this.renderInstrumentPresetLibrary(preset.id, `Saved instrument preset: ${preset.label}`);
    return { ok: true, preset };
  }

  loadSelectedInstrumentPreset() {
    const preset = this.selectedInstrumentPreset();
    const lane = this.selectedLane;
    if (!preset || !lane || !this.previewLaneState[lane]) {
      this.renderInstrumentPresetSummary("Choose a preset and selected instrument before loading.");
      return { ok: false };
    }
    this.previewLaneState[lane] = {
      ...defaultPreviewLaneState(lane),
      ...clonePlainObject(preset.settings)
    };
    this.setInstrumentWorkflowStatus(`Loaded instrument preset ${preset.label} into ${laneLabel(lane)}; selectedInstrumentId synchronized to ${lane}.`);
    this.syncLaneHeaderControls();
    this.renderSelectedInstrumentEditor();
    this.renderAuditionKeyboard();
    this.renderSelectionDetails();
    this.renderInstrumentPresetLibrary(preset.id, `Loaded instrument preset: ${preset.label}`);
    this.onLaneSettingChange?.("instrument-preset-load", {
      lane,
      laneLabel: laneLabel(lane),
      presetLabel: preset.label
    });
    return { ok: true, preset };
  }

  duplicateSelectedInstrumentPreset() {
    const preset = this.selectedInstrumentPreset();
    if (!preset) {
      this.renderInstrumentPresetSummary("Choose a preset before duplicating.");
      return { ok: false };
    }
    const duplicate = {
      id: this.nextInstrumentPresetId(preset.lane),
      label: this.nextInstrumentPresetLabel(preset.label),
      lane: preset.lane,
      settings: clonePlainObject(preset.settings)
    };
    this.instrumentPresetAssets.push(duplicate);
    this.setInstrumentWorkflowStatus(`Duplicated instrument preset ${preset.label} as ${duplicate.label}.`);
    this.renderInstrumentPresetLibrary(duplicate.id, `Duplicated instrument preset: ${duplicate.label}`);
    return { ok: true, preset: duplicate };
  }

  nextInstrumentPresetId(lane) {
    const base = laneId(lane) || "instrument";
    let index = this.instrumentPresetAssets.length + 1;
    let id = `${base}-preset-${index}`;
    const ids = new Set(this.instrumentPresetAssets.map((preset) => preset.id));
    while (ids.has(id)) {
      index += 1;
      id = `${base}-preset-${index}`;
    }
    return id;
  }

  nextInstrumentPresetLabel(label) {
    const base = `${String(label || "Instrument Preset").replace(/\s+Copy\s+\d+$/i, "")} Copy`;
    const labels = new Set(this.instrumentPresetAssets.map((preset) => preset.label.toLowerCase()));
    let index = 1;
    let candidate = `${base} ${index}`;
    while (labels.has(candidate.toLowerCase())) {
      index += 1;
      candidate = `${base} ${index}`;
    }
    return candidate;
  }

  renderInstrumentPresetLibrary(selectedId = this.instrumentPresetSelect?.value || "", message = "") {
    if (!this.instrumentPresetSelect) {
      return;
    }
    this.instrumentPresetSelect.replaceChildren();
    this.instrumentPresetAssets.forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.label;
      option.dataset.instrumentPresetLane = preset.lane;
      option.dataset.instrumentPresetInstrument = preset.settings?.instrument || "";
      option.dataset.instrumentPresetType = preset.settings?.instrumentType || "";
      this.instrumentPresetSelect.append(option);
    });
    if (selectedId && this.instrumentPresetAssets.some((preset) => preset.id === selectedId)) {
      this.instrumentPresetSelect.value = selectedId;
    } else if (this.instrumentPresetSelect.options.length) {
      this.instrumentPresetSelect.selectedIndex = 0;
    }
    this.renderInstrumentPresetSummary(message);
  }

  renderInstrumentPresetSummary(message = "") {
    if (!this.instrumentPresetSummary) {
      return;
    }
    const count = this.instrumentPresetAssets.length;
    const preset = this.selectedInstrumentPreset();
    const summary = message || (preset
      ? `${count} saved instrument preset${count === 1 ? "" : "s"}; selected ${preset.label}`
      : `${count} saved instrument preset${count === 1 ? "" : "s"}`);
    this.instrumentPresetSummary.value = summary;
    this.instrumentPresetSummary.textContent = summary;
    this.instrumentPresetSummary.dataset.instrumentPresetCount = String(count);
    this.instrumentPresetSummary.dataset.selectedInstrumentPreset = preset?.label || "";
    if (this.saveInstrumentPresetButton) {
      this.saveInstrumentPresetButton.disabled = !this.selectedLane || !this.previewLaneState[this.selectedLane];
    }
    if (this.loadInstrumentPresetButton) {
      this.loadInstrumentPresetButton.disabled = count === 0;
    }
    if (this.duplicateInstrumentPresetButton) {
      this.duplicateInstrumentPresetButton.disabled = count === 0;
    }
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
    const settings = {
      advanced: {},
      displayNames: {},
      durations: {},
      effects: {},
      instrumentTypes: {},
      instruments: {},
      muted: {},
      octaveRanges: {},
      pans: {},
      soloed: {},
      transposes: {},
      velocities: {},
      visible: {},
      volumes: {}
    };
    this.orderedLaneNames().forEach((lane) => {
      const state = this.previewLaneState[lane] || defaultPreviewLaneState(lane);
      const [lowOctave, highOctave] = this.octaveRangeForLane(lane);
      settings.advanced[lane] = clonePlainObject(state.advanced || defaultAdvancedState());
      settings.displayNames[lane] = String(state.displayName || "");
      settings.durations[lane] = Number(state.duration ?? 1);
      settings.effects[lane] = clonePlainObject(state.effects || defaultEffectsState());
      settings.instrumentTypes[lane] = state.instrumentType || instrumentTypeGroup(state.instrument);
      settings.instruments[lane] = state.instrument || "";
      settings.muted[lane] = Boolean(state.muted);
      settings.octaveRanges[lane] = { high: highOctave, low: lowOctave };
      settings.pans[lane] = Number(state.pan ?? 0);
      settings.soloed[lane] = Boolean(state.soloed);
      settings.transposes[lane] = Number(state.transpose ?? 0);
      settings.velocities[lane] = Number(state.velocity ?? 100);
      settings.visible[lane] = state.visible !== false;
      settings.volumes[lane] = Number(state.volume ?? 1);
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

  orderedLaneNames() {
    const active = new Set([
      ...Object.keys(this.extraLaneSources),
      ...FIXED_LANES.filter((lane) => !this.removedFixedLanes.has(lane))
    ]);
    const ordered = [];
    this.laneOrder.forEach((lane) => {
      if (active.has(lane) && !ordered.includes(lane)) {
        ordered.push(lane);
      }
    });
    FIXED_LANES.forEach((lane) => {
      if (active.has(lane) && !ordered.includes(lane)) {
        ordered.push(lane);
      }
    });
    Object.keys(this.extraLaneSources).forEach((lane) => {
      if (active.has(lane) && !ordered.includes(lane)) {
        ordered.push(lane);
      }
    });
    this.laneOrder = ordered.slice();
    return ordered;
  }

  laneSourceValue(lane) {
    const fixedInput = this.inputForLane(lane);
    if (fixedInput && !this.removedFixedLanes.has(lane)) {
      return fixedInput.value;
    }
    return this.extraLaneSources[lane] || "";
  }

  selectedAuditionDetail(note = "C4") {
    const lane = this.selectedLane;
    const state = this.previewLaneState[lane] || {};
    const instrumentValue = state.instrument || "";
    const [octaveLow, octaveHigh] = lane ? this.octaveRangeForLane(lane) : ["", ""];
    return {
      duration: Number(state.duration ?? 1),
      instrumentLabel: instrumentLabel(instrumentValue),
      instrumentType: state.instrumentType || instrumentTypeGroup(instrumentValue),
      instrumentValue,
      instrumentWarning: previewInstrumentWarning(instrumentValue),
      lane,
      laneLabel: laneLabel(lane),
      note,
      octaveRange: { high: octaveHigh, low: octaveLow },
      pan: Number(state.pan ?? 0),
      previewInstrumentLabel: audiblePreviewLabel(instrumentValue),
      transpose: Number(state.transpose ?? 0),
      velocity: Number(state.velocity ?? 100),
      volume: Number(state.volume ?? 1)
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
    const timelineScrollState = this.captureTimelineScrollState();
    this.stopTimer({ clearPreviewLanes: true });
    this.currentResult = result?.ok ? result : null;
    this.renderDefinitionList(summaryRows(result));
    this.gridOutput.replaceChildren();
    this.previewLaneControls = {};
    this.lastPlayheadHighlightStep = null;
    this.timelineScrollProxy = null;
    this.timelineScrollProxySpacer = null;
    this.timelineCanvas = null;
    this.timelineCanvasRenderer = null;
    this.timelineCanvasRows = [];
    this.lastTimelinePointerHit = null;
    if (!result?.ok) {
      this.renderInstrumentList([]);
      this.renderQuickInstrumentList([]);
      this.renderSelectedInstrumentEditor();
      this.renderAuditionKeyboard();
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
    this.renderQuickInstrumentList(result.lanes);
    this.syncInstrumentManagementButtons();
    this.renderSelectedInstrumentEditor();
    this.renderAuditionKeyboard();
    this.renderGrid(result);
    this.setPlayheadStep(this.playheadStep);
    this.updateLoopRegion();
    this.updateSelectedSectionRegion();
    this.applySelectedLaneHighlight();
    this.revealSelectedInstrument();
    this.restoreTimelineScrollState(timelineScrollState);
    this.renderSelectionDetails();
  }

  syncEditedGridResult(result) {
    if (!result?.ok) {
      return;
    }
    this.currentResult = result;
    this.renderDefinitionList(summaryRows(result));
    this.syncArrangementSourceIndicators();
    this.renderCanvasTimeline(result);
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
      this.updateSectionPresetAvailability(sections);
      return;
    }
    this.sectionSelect.value = sections.some((section) => section.label === previousSection) ? previousSection : sections[0].label;
    this.loopStartSelect.value = sections.some((section) => section.label === previousLoopStart) ? previousLoopStart : sections[0].label;
    this.loopEndSelect.value = sections.some((section) => section.label === previousLoopEnd) ? previousLoopEnd : sections[sections.length - 1].label;
    this.updateSectionPresetAvailability(sections);
  }

  updateSectionPresetAvailability(sections) {
    const sectionByLabel = new Map(sections.map((section) => [section.label.toLowerCase(), section]));
    const unavailable = [];
    this.sectionPresetButtons.forEach((button) => {
      const label = String(button.dataset.sectionPreset || "").toLowerCase();
      const section = sectionByLabel.get(label) || null;
      const available = Boolean(section);
      button.disabled = !available;
      button.classList.toggle("is-unavailable", !available);
      button.classList.toggle("is-section-colored", available);
      button.setAttribute("aria-disabled", String(!available));
      if (available) {
        setUnwiredControlState(button, { active: false });
        const color = sectionTone(section.colorIndex);
        button.style.setProperty("--midi-studio-v2-section-color", color);
        button.dataset.sectionColor = color;
        button.dataset.sectionStartStep = String(section.startStep);
        button.dataset.sectionEndStep = String(section.endStep);
        button.title = `Select ${section.label} section`;
      } else {
        setUnwiredControlState(button, {
          active: true,
          detail: `${button.textContent.trim()} is not defined in the current Song Sheet sequence.`,
          status: "Incomplete"
        });
        button.style.removeProperty("--midi-studio-v2-section-color");
        delete button.dataset.sectionColor;
        delete button.dataset.sectionStartStep;
        delete button.dataset.sectionEndStep;
      }
      if (!available) {
        unavailable.push(button.textContent.trim());
      }
    });
    this.syncSectionPresetState();
    if (!this.sectionAvailability) {
      return;
    }
    this.sectionAvailability.textContent = unavailable.length
      ? `Section not available: ${unavailable.join(", ")}. Choose a listed custom section.`
      : "Quick sections available.";
  }

  syncSectionPresetState() {
    const selectedLabel = String(this.sectionSelect.value || "").toLowerCase();
    const loopBounds = this.loopBounds?.ok ? this.loopBounds : { ok: false };
    this.sectionPresetButtons.forEach((button) => {
      const label = String(button.dataset.sectionPreset || "").toLowerCase();
      const isSelected = Boolean(label && label === selectedLabel);
      const startStep = Number(button.dataset.sectionStartStep);
      const endStep = Number(button.dataset.sectionEndStep);
      const inLoop = loopBounds.ok
        && Number.isFinite(startStep)
        && Number.isFinite(endStep)
        && endStep >= loopBounds.startSection.startStep
        && startStep <= loopBounds.endSection.endStep;
      button.classList.toggle("is-selected-section", isSelected);
      button.classList.toggle("is-loop-section", inLoop);
      button.dataset.sectionSelected = String(isSelected);
      button.dataset.sectionLoop = String(inLoop);
    });
  }

  setTransportEnabled(enabled) {
    [
      this.jumpToSectionButton,
      this.playLoopButton,
      this.playSectionButton,
      this.playSequenceButton,
      this.sectionSelect,
      this.loopStartSelect,
      this.loopEndSelect,
      this.stopTimingPreviewButton
    ].forEach((control) => {
      control.disabled = !enabled;
    });
  }

  renderGrid(result) {
    const octaveRows = this.octaveRowsFor(result);
    const canvas = document.createElement("canvas");
    canvas.className = "midi-studio-v2__instrument-grid midi-studio-v2__note-table midi-studio-v2__octave-timeline midi-studio-v2__octave-timeline-canvas";
    canvas.dataset.octaveTimelineCanvas = "true";
    canvas.setAttribute("aria-label", "Canvas-backed octave timeline editor");
    canvas.setAttribute("role", "application");
    canvas.tabIndex = 0;
    canvas.addEventListener("pointermove", (event) => this.updateTimelineHover(event));
    canvas.addEventListener("pointerleave", () => this.clearTimelineHover());
    canvas.addEventListener("pointerdown", (event) => this.beginTimelinePointerEdit(event));
    canvas.addEventListener("click", (event) => {
      if (this.suppressNextCellClick) {
        this.suppressNextCellClick = false;
        return;
      }
      const sectionHit = this.timelineCanvasRenderer?.sectionHeaderFromPoint(event.clientX, event.clientY) || null;
      if (sectionHit) {
        this.selectTimelineHeaderSection(sectionHit, this.onTransport);
        return;
      }
      const keyboardHit = this.timelineCanvasRenderer?.keyboardKeyFromPoint(event.clientX, event.clientY) || null;
      if (keyboardHit) {
        this.auditionTimelineKeyboardKey(keyboardHit);
        return;
      }
      const hit = this.timelineCanvasRenderer?.cellFromPoint(event.clientX, event.clientY) || this.lastTimelinePointerHit || null;
      if (hit) {
        this.toggleTimelineCell(hit.rowToken, hit.stepIndex);
      }
    });
    canvas.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || !this.selectedCell) {
        return;
      }
      event.preventDefault();
      this.toggleTimelineCell(this.selectedCell.rowToken, this.selectedCell.stepIndex);
    });
    this.timelineCanvas = canvas;
    this.timelineCanvasRows = octaveRows;
    this.timelineCanvasRenderer = new OctaveTimelineCanvasRenderer({ canvas, windowRef: this.window });
    this.gridOutput.append(this.createTimelineScrollProxy());
    this.gridOutput.append(canvas);
    this.renderCanvasTimeline(result);
    this.updateTimelineScrollProxyWidth();
    this.window.requestAnimationFrame?.(() => this.updateTimelineScrollProxyWidth());
    this.applyOctaveGridZoom();
    this.applySelectedLaneHighlight();
  }

  renderCanvasTimeline(result = this.currentResult) {
    if (!this.timelineCanvasRenderer || !result?.ok) {
      return;
    }
    const rows = this.timelineCanvasRows.length ? this.timelineCanvasRows : this.octaveRowsFor(result);
    const referenceCells = this.referenceCells(result);
    const viewport = this.timelineCanvasViewport();
    this.timelineCanvasRenderer.setState({
      activePreviewLanes: this.activePreviewLanes,
      cellSize: this.octaveCellSize,
      loopBounds: this.loopBounds,
      notes: this.canvasNotesForResult(result, rows),
      paintPreviewKeys: this.timelinePointerEdit ? Array.from(this.timelinePointerEdit.paintedKeys) : [],
      paintPreviewMode: this.timelinePointerEdit?.mode || "paint",
      hoverCell: this.hoveredCell,
      playheadStep: this.playheadStep,
      referenceCells,
      rows,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      sections: result.sections,
      selectedCell: this.selectedCell,
      selectedLane: this.selectedLane,
      selectedSection: this.selectedSectionBounds,
      totalSteps: result.totalSteps,
      viewportHeight: viewport.height,
      viewportWidth: viewport.width
    });
    this.gridOutput.dataset.timelineRenderer = "canvas";
    this.gridOutput.dataset.timelineRows = String(rows.length);
    this.gridOutput.dataset.timelineSteps = String(result.totalSteps);
    this.gridOutput.dataset.timelineCellSize = String(this.octaveCellSize);
  }

  canvasNotesForResult(result, rows) {
    const visibleRows = new Set(rows.map((row) => row.value));
    return (result.timeline || []).flatMap((event) => {
      if (this.previewLaneState[event.lane]?.visible === false) {
        return [];
      }
      return this.rowsForEvent(event)
        .filter((rowToken) => visibleRows.has(rowToken))
        .map((rowToken) => ({
          kind: event.kind,
          lane: event.lane,
          rowToken,
          source: event.source,
          stepIndex: event.stepIndex,
          value: event.value
        }));
    });
  }

  timelineCanvasState() {
    return this.timelineCanvasRenderer?.snapshot() || null;
  }

  timelineCanvasCellCenter(rowToken, stepIndex) {
    return this.timelineCanvasRenderer?.cellCenter(rowToken, stepIndex) || null;
  }

  timelineCanvasSectionHeaderCenter(label, occurrenceIndex = 0) {
    return this.timelineCanvasRenderer?.sectionHeaderCenter(label, occurrenceIndex) || null;
  }

  adjustOctaveGridZoom(delta) {
    const nextSize = Math.max(OCTAVE_GRID_ZOOM.min, Math.min(OCTAVE_GRID_ZOOM.max, this.octaveCellSize + delta));
    if (nextSize === this.octaveCellSize) {
      this.applyOctaveGridZoom();
      return;
    }
    const scrollState = this.captureTimelineScrollState();
    this.octaveCellSize = nextSize;
    this.applyOctaveGridZoom();
    this.renderCanvasTimeline();
    this.updateTimelineScrollProxyWidth();
    this.restoreTimelineScrollState(scrollState);
  }

  applyOctaveGridZoom() {
    const size = `${this.octaveCellSize}px`;
    this.gridOutput?.style.setProperty("--midi-studio-v2-octave-cell-size", size);
    if (this.instrumentGridZoomOutButton) {
      this.instrumentGridZoomOutButton.disabled = this.octaveCellSize <= OCTAVE_GRID_ZOOM.min;
    }
    if (this.instrumentGridZoomInButton) {
      this.instrumentGridZoomInButton.disabled = this.octaveCellSize >= OCTAVE_GRID_ZOOM.max;
    }
    this.gridOutput?.setAttribute("data-timeline-cell-size", String(this.octaveCellSize));
  }

  createTimelineScrollProxy() {
    const proxy = document.createElement("div");
    proxy.className = "midi-studio-v2__timeline-scroll-proxy";
    proxy.setAttribute("aria-label", "Octave timeline horizontal scroll");
    proxy.tabIndex = 0;

    const spacer = document.createElement("div");
    spacer.className = "midi-studio-v2__timeline-scroll-proxy-spacer";
    proxy.append(spacer);

    proxy.addEventListener("scroll", () => this.syncTimelineScrollFromProxy());
    this.timelineScrollProxy = proxy;
    this.timelineScrollProxySpacer = spacer;
    return proxy;
  }

  updateTimelineScrollProxyWidth() {
    if (!this.timelineScrollProxySpacer || !this.gridOutput) {
      return;
    }
    const grid = this.gridOutput.querySelector(".midi-studio-v2__octave-timeline");
    const logicalWidth = Number(grid?.dataset.logicalWidth || 0);
    const scrollWidth = Math.max(logicalWidth || grid?.scrollWidth || 0, this.gridOutput.clientWidth || 0);
    this.timelineScrollProxySpacer.style.width = `${scrollWidth}px`;
    this.timelineScrollProxy.scrollLeft = this.gridOutput.scrollLeft;
  }

  referenceCells(result) {
    return result.cells.chords || result.cells[result.lanes[0]] || [];
  }

  renderInstrumentList(lanes = []) {
    if (!this.instrumentList) {
      return;
    }
    this.instrumentList.replaceChildren();
    this.instrumentList.dataset.selectedInstrumentId = this.selectedLane || "";
    this.instrumentList.dataset.instrumentWorkflowStatus = this.instrumentWorkflowStatus;
    this.previewLaneControls = {};
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

  renderQuickInstrumentList(lanes = []) {
    if (!this.quickInstrumentList) {
      return;
    }
    this.quickInstrumentList.replaceChildren();
    this.quickInstrumentList.dataset.selectedInstrumentId = this.selectedLane || "";
    this.quickInstrumentList.dataset.instrumentWorkflowStatus = this.instrumentWorkflowStatus;
    this.quickLaneControls = {};
    if (!lanes.length) {
      const empty = document.createElement("p");
      empty.className = "midi-studio-v2__empty";
      empty.textContent = "No timeline instruments loaded.";
      this.quickInstrumentList.append(empty);
      return;
    }
    lanes.forEach((lane) => {
      this.quickInstrumentList.append(this.createQuickInstrumentRow(lane));
    });
    this.syncQuickInstrumentControls();
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
    row.classList.toggle("is-delete-pending", this.pendingDeleteLane === lane || this.deleteBlockedLane === lane);
    row.classList.toggle("is-duplicate-confirmed", this.recentlyDuplicatedLane === lane);
    if (this.recentlyDuplicatedLane === lane) {
      row.dataset.duplicateConfirmation = "true";
    }

    const title = document.createElement("span");
    title.className = "midi-studio-v2__lane-title";
    title.dataset.laneLabel = lane;
    title.textContent = this.displayNameForLane(lane);

    const summary = document.createElement("span");
    summary.className = "midi-studio-v2__instrument-row-summary";
    summary.dataset.laneSummary = lane;
    summary.textContent = this.instrumentSummaryForLane(lane);

    const sourceCounts = this.createArrangementSourceBadge(lane);

    const deleteButton = this.createDeleteLaneButton(lane);

    const titleRow = document.createElement("div");
    titleRow.className = "midi-studio-v2__instrument-title-row";
    titleRow.append(title, deleteButton);

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
      instrumentLabel: title,
      row,
      sourceCounts,
      summary
    };
    row.append(titleRow, summary, sourceCounts);
    const deleteConfirmation = this.createDeleteConfirmation(lane);
    if (deleteConfirmation) {
      row.append(deleteConfirmation);
    }
    return row;
  }

  renderSelectedInstrumentEditor() {
    if (!this.instrumentEditor) {
      return;
    }
    this.instrumentEditor.replaceChildren();
    this.selectedEditorControls = null;
    const lane = this.selectedLane;
    const state = this.previewLaneState[lane];
    this.instrumentEditor.dataset.selectedInstrumentId = lane || "";
    if (!lane || !state) {
      const empty = document.createElement("p");
      empty.className = "midi-studio-v2__empty";
      empty.textContent = "Select an instrument to edit its settings.";
      this.instrumentEditor.append(empty);
      return;
    }
    this.selectedEditorControls = { lane };
    this.instrumentEditor.append(
      this.createIdentityBucket(lane),
      this.createMixBucket(lane),
      this.createPlaybackBucket(lane),
      this.createEffectsBucket(),
      this.createAdvancedBucket()
    );
  }

  createInstrumentEditorBucket(title, bucket, fields) {
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    section.className = "midi-studio-v2__instrument-editor-bucket";
    section.dataset.instrumentEditorBucket = bucket;
    heading.textContent = title;
    section.append(heading, ...fields);
    return section;
  }

  createIdentityBucket(lane) {
    const displayName = this.createDisplayNameInput(lane);
    const typeSelect = this.createInstrumentTypeSelect(lane);
    const instrumentSelect = this.createInstrumentSelect(lane);
    const previewMapping = this.createInstrumentDisplayOutput("audible-preview", this.previewMappingForLane(lane));
    this.selectedEditorControls.displayName = displayName;
    this.selectedEditorControls.instrumentType = typeSelect;
    this.selectedEditorControls.instrument = instrumentSelect;
    this.selectedEditorControls.previewMapping = previewMapping;
    return this.createInstrumentEditorBucket("Identity", "identity", [
      this.createEditorField("Instrument display name", displayName),
      this.createEditorField("GM Type", typeSelect),
      this.createEditorField("GM Instrument", instrumentSelect),
      this.createEditorField("Audible preview", previewMapping)
    ]);
  }

  createMixBucket(lane) {
    const volume = this.createLaneSlider(lane, "volume");
    const pan = this.createLaneSlider(lane, "pan");
    volume.input.hidden = false;
    pan.input.hidden = false;
    this.selectedEditorControls.volume = volume.input;
    this.selectedEditorControls.pan = pan.input;
    return this.createInstrumentEditorBucket("Mix", "mix", [
      this.createEditorField("Volume", volume.input),
      this.createEditorField("Pan/Balance", pan.input)
    ]);
  }

  createPlaybackBucket(lane) {
    const [lowOctave, highOctave] = this.octaveRangeForLane(lane);
    const playableRange = this.createInstrumentDisplayOutput("playable-range", this.playableRangeLabel(lane));
    playableRange.dataset.instrumentPlayableRangeLane = lane;
    const low = this.createInstrumentNumberInput(lane, "octaveLow", {
      ariaLabel: `Octave range low ${laneLabel(lane)}`,
      datasetName: "instrumentOctaveLowLane",
      max: 8,
      min: 0,
      step: 1,
      value: lowOctave
    });
    const high = this.createInstrumentNumberInput(lane, "octaveHigh", {
      ariaLabel: `Octave range high ${laneLabel(lane)}`,
      datasetName: "instrumentOctaveHighLane",
      max: 8,
      min: 0,
      step: 1,
      value: highOctave
    });
    const transpose = this.createInstrumentNumberInput(lane, "transpose", {
      ariaLabel: `Transpose ${laneLabel(lane)}`,
      datasetName: "instrumentTransposeLane",
      max: 24,
      min: -24,
      step: 1,
      value: this.previewLaneState[lane]?.transpose ?? 0
    });
    const velocity = this.createInstrumentNumberInput(lane, "velocity", {
      ariaLabel: `Velocity ${laneLabel(lane)}`,
      datasetName: "instrumentVelocityLane",
      max: 127,
      min: 1,
      step: 1,
      value: this.previewLaneState[lane]?.velocity ?? 100
    });
    const duration = this.createInstrumentNumberInput(lane, "duration", {
      ariaLabel: `Duration ${laneLabel(lane)}`,
      datasetName: "instrumentDurationLane",
      max: 8,
      min: 0.1,
      step: 0.1,
      value: this.previewLaneState[lane]?.duration ?? 1
    });
    this.selectedEditorControls.octaveLow = low;
    this.selectedEditorControls.octaveHigh = high;
    this.selectedEditorControls.playableRange = playableRange;
    this.selectedEditorControls.transpose = transpose;
    this.selectedEditorControls.velocity = velocity;
    this.selectedEditorControls.duration = duration;
    return this.createInstrumentEditorBucket("Playback", "playback", [
      this.createEditorField("Octave range", this.createOctaveRangeField(low, high)),
      this.createEditorField("Playable range", playableRange),
      this.createEditorField("Transpose", transpose),
      this.createEditorField("Velocity", velocity),
      this.createEditorField("Duration", duration)
    ]);
  }

  createEffectsBucket() {
    return this.createInstrumentEditorBucket("Effects", "effects", [
      this.createEditorField("Reverb", this.createUnwiredInstrumentInput("Reverb", "Reverb is planned but not implemented yet.")),
      this.createEditorField("Chorus", this.createUnwiredInstrumentInput("Chorus", "Chorus is planned but not implemented yet.")),
      this.createEditorField("Delay", this.createUnwiredInstrumentInput("Delay", "Delay is planned but not implemented yet.")),
      this.createEditorField("Filter", this.createUnwiredInstrumentInput("Filter", "Filter is planned but not implemented yet.")),
      this.createEditorField("Brightness/Tone", this.createUnwiredInstrumentInput("Brightness/Tone", "Brightness and tone controls are planned but not implemented yet."))
    ]);
  }

  createAdvancedBucket() {
    return this.createInstrumentEditorBucket("Advanced", "advanced", [
      this.createEditorField("MIDI Channel", this.createUnwiredInstrumentInput("MIDI Channel", "MIDI channel editing is planned but not implemented yet.")),
      this.createEditorField("GM Program", this.createUnwiredInstrumentInput("GM Program", "GM program editing is planned but not implemented yet.")),
      this.createEditorField("Controller Values", this.createUnwiredInstrumentInput("Controller Values", "MIDI controller values are planned but not implemented yet.", "textarea"))
    ]);
  }

  createEditorField(labelText, control) {
    const label = document.createElement("label");
    const text = document.createElement("span");
    const controlElement = this.primaryEditorControl(control);
    label.className = "tool-starter__field midi-studio-v2__field-card midi-studio-v2__instrument-editor-field";
    label.dataset.midiStudioFieldState = this.editorFieldState(controlElement);
    text.textContent = labelText;
    label.append(text, control);
    return label;
  }

  primaryEditorControl(control) {
    if (control?.matches?.("input, select, textarea, output")) {
      return control;
    }
    return control?.querySelector?.("input, select, textarea, output") || null;
  }

  editorFieldState(control) {
    if (!control) {
      return "readonly";
    }
    if (control.dataset?.midiStudioFutureControl !== undefined || control.dataset?.midiStudioUnwired) {
      return "unwired";
    }
    if (control.disabled || control.readOnly || control.tagName === "OUTPUT") {
      return "readonly";
    }
    return "editable";
  }

  createOctaveRangeField(lowInput, highInput) {
    const group = document.createElement("span");
    group.className = "midi-studio-v2__octave-range-field";
    group.append(lowInput, highInput);
    return group;
  }

  createDisplayNameInput(lane) {
    const input = document.createElement("input");
    input.id = `previewDisplayName${laneId(lane)}Input`;
    input.type = "text";
    input.dataset.instrumentDisplayNameLane = lane;
    input.value = this.previewLaneState[lane]?.displayName || "";
    input.placeholder = instrumentLabel(this.previewLaneState[lane]?.instrument) || laneLabel(lane);
    input.setAttribute("aria-label", `Instrument display name ${laneLabel(lane)}`);
    input.addEventListener("input", () => {
      this.previewLaneState[lane].displayName = input.value.trim();
      this.syncLaneHeaderControls();
      this.syncQuickInstrumentControls();
      this.renderSelectionDetails();
      this.onLaneSettingChange?.("display-name", {
        lane,
        laneLabel: laneLabel(lane),
        value: input.value.trim()
      });
    });
    return input;
  }

  createInstrumentDisplayOutput(kind, value) {
    const output = document.createElement("output");
    output.dataset.instrumentDerivedField = kind;
    output.value = value;
    output.textContent = value;
    output.setAttribute("aria-readonly", "true");
    return output;
  }

  previewMappingForLane(lane) {
    const state = this.previewLaneState[lane] || {};
    return audiblePreviewLabel(state.instrument) || "No audible preview selected";
  }

  updateSelectedInstrumentDisplayFields(lane) {
    if (this.selectedEditorControls?.lane !== lane) {
      return;
    }
    if (this.selectedEditorControls.previewMapping) {
      const value = this.previewMappingForLane(lane);
      this.selectedEditorControls.previewMapping.value = value;
      this.selectedEditorControls.previewMapping.textContent = value;
    }
    if (this.selectedEditorControls.playableRange) {
      const value = this.playableRangeLabel(lane);
      this.selectedEditorControls.playableRange.value = value;
      this.selectedEditorControls.playableRange.textContent = value;
      this.selectedEditorControls.playableRange.dataset.octaveMin = String(this.octaveRangeForLane(lane)[0]);
      this.selectedEditorControls.playableRange.dataset.octaveMax = String(this.octaveRangeForLane(lane)[1]);
    }
  }

  createInstrumentNumberInput(lane, kind, { ariaLabel, datasetName, max, min, step, value }) {
    const input = document.createElement("input");
    input.id = `preview${kind.charAt(0).toUpperCase()}${kind.slice(1)}${laneId(lane)}Input`;
    input.type = "number";
    input.inputMode = "decimal";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.dataset[datasetName] = lane;
    input.setAttribute("aria-label", ariaLabel);
    input.addEventListener("input", () => this.updatePlaybackSetting(lane, kind, input.value));
    input.addEventListener("change", () => this.updatePlaybackSetting(lane, kind, input.value));
    return input;
  }

  createUnwiredInstrumentInput(label, detail, elementType = "input") {
    const control = elementType === "textarea" ? document.createElement("textarea") : document.createElement("input");
    control.disabled = true;
    control.dataset.midiStudioFutureControl = "";
    control.dataset.midiStudioFutureDetail = detail;
    control.placeholder = label;
    control.setAttribute("aria-label", label);
    if (elementType !== "textarea") {
      control.type = "text";
    }
    control.value = "";
    setUnwiredControlState(control, {
      active: true,
      detail,
      status: "Not implemented"
    });
    return control;
  }

  updatePlaybackSetting(lane, kind, value) {
    const state = this.previewLaneState[lane];
    if (!state) {
      return;
    }
    if (kind === "octaveLow" || kind === "octaveHigh") {
      const [defaultLow, defaultHigh] = this.defaultOctaveRangeForLane(lane);
      const parsed = Math.max(0, Math.min(8, Math.round(finiteNumber(value, kind === "octaveLow" ? defaultLow : defaultHigh))));
      state[kind] = parsed;
      if (state.octaveLow !== null && state.octaveHigh !== null && state.octaveLow > state.octaveHigh) {
        if (kind === "octaveLow") {
          state.octaveHigh = state.octaveLow;
        } else {
          state.octaveLow = state.octaveHigh;
        }
      }
      this.render(this.currentResult);
      this.renderAuditionKeyboard();
      this.updateSelectedInstrumentDisplayFields(lane);
      this.onLaneSettingChange?.("octave-range", {
        lane,
        laneLabel: laneLabel(lane),
        value: this.octaveRangeForLane(lane).join("-")
      });
      return;
    }
    const range = {
      duration: { max: 8, min: 0.1 },
      transpose: { max: 24, min: -24 },
      velocity: { max: 127, min: 1 }
    }[kind];
    if (!range) {
      return;
    }
    const parsed = kind === "duration"
      ? finiteNumber(value, 1)
      : Math.round(finiteNumber(value, kind === "velocity" ? 100 : 0));
    state[kind] = Math.max(range.min, Math.min(range.max, parsed));
    this.renderAuditionKeyboard();
    this.renderSelectionDetails();
    this.onLaneSettingChange?.(kind, {
      lane,
      laneLabel: laneLabel(lane),
      value: state[kind]
    });
  }

  displayNameForLane(lane) {
    const state = this.previewLaneState[lane] || {};
    return String(state.displayName || "").trim() || instrumentLabel(state.instrument) || laneLabel(lane);
  }

  instrumentSummaryForLane(lane) {
    const state = this.previewLaneState[lane] || {};
    const typeGroup = state.instrumentType || instrumentTypeGroup(state.instrument);
    const patch = instrumentLabel(state.instrument) || "No GM instrument selected";
    return `${typeGroup} / ${patch}`;
  }

  arrangementSourceCountsForLane(lane) {
    const counts = { generated: 0, manual: 0, total: 0 };
    (this.currentResult?.timeline || []).forEach((event) => {
      if (event.lane !== lane) {
        return;
      }
      if (event.source === "generated") {
        counts.generated += 1;
      } else if (event.source === "manual") {
        counts.manual += 1;
      }
      counts.total += 1;
    });
    return counts;
  }

  createArrangementSourceBadge(lane) {
    const badge = document.createElement("span");
    badge.className = "midi-studio-v2__source-counts";
    badge.dataset.arrangementSourceCounts = lane;
    badge.setAttribute("aria-readonly", "true");
    this.updateArrangementSourceBadge(badge, lane);
    return badge;
  }

  updateArrangementSourceBadge(badge, lane) {
    if (!badge) {
      return;
    }
    const counts = this.arrangementSourceCountsForLane(lane);
    badge.dataset.generatedCount = String(counts.generated);
    badge.dataset.manualCount = String(counts.manual);
    badge.dataset.totalCount = String(counts.total);
    badge.textContent = `Generated ${counts.generated} / Manual ${counts.manual}`;
    badge.title = `${laneLabel(lane)} arrangement source counts: ${counts.generated} generated, ${counts.manual} manual`;
  }

  syncArrangementSourceIndicators() {
    Object.entries(this.previewLaneControls || {}).forEach(([lane, controls]) => {
      if (controls.sourceCounts) {
        this.updateArrangementSourceBadge(controls.sourceCounts, lane);
      }
      if (controls.summary) {
        controls.summary.textContent = this.instrumentSummaryForLane(lane);
      }
    });
    Object.entries(this.quickLaneControls || {}).forEach(([lane, controls]) => {
      if (controls.sourceCounts) {
        this.updateArrangementSourceBadge(controls.sourceCounts, lane);
      }
    });
  }

  playableRangeLabel(lane) {
    if (!lane || !this.previewLaneState[lane]) {
      return "No active playable range";
    }
    const [lowOctave, highOctave] = this.octaveRangeForLane(lane);
    if (this.selectedInstrumentIsPercussion() && lane === this.selectedLane) {
      return `Percussion rows, octaves ${lowOctave}-${highOctave}`;
    }
    return `C${lowOctave} to B${highOctave}`;
  }

  createQuickInstrumentRow(lane) {
    if (!this.previewLaneState[lane]) {
      this.previewLaneState[lane] = defaultPreviewLaneState(lane);
    }
    const row = document.createElement("div");
    row.className = "midi-studio-v2__quick-instrument-row";
    row.dataset.quickInstrumentLane = lane;
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-selected", String(this.selectedLane === lane));
    row.classList.toggle("is-duplicate-confirmed", this.recentlyDuplicatedLane === lane);
    if (this.recentlyDuplicatedLane === lane) {
      row.dataset.duplicateConfirmation = "true";
    }

    const title = document.createElement("span");
    title.className = "midi-studio-v2__quick-instrument-title";
    title.dataset.quickInstrumentLabel = lane;
    title.textContent = this.displayNameForLane(lane);

    const sourceCounts = this.createArrangementSourceBadge(lane);
    sourceCounts.classList.add("midi-studio-v2__source-counts--quick");

    const controls = document.createElement("div");
    controls.className = "midi-studio-v2__quick-instrument-controls";
    const mute = this.createQuickToggleButton(lane, "mute");
    const solo = this.createQuickToggleButton(lane, "solo");
    const visibilityButton = this.createVisibilityButton(lane);
    visibilityButton.classList.add("midi-studio-v2__quick-instrument-button");
    controls.append(mute, solo, visibilityButton);

    row.addEventListener("click", (event) => {
      if (event.target.closest("button")) {
        return;
      }
      this.handleLaneSelection(lane);
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      if (event.target.closest("button")) {
        return;
      }
      event.preventDefault();
      this.handleLaneSelection(lane);
    });
    this.quickLaneControls[lane] = {
      instrumentLabel: title,
      mute,
      row,
      solo,
      sourceCounts,
      visibilityButton
    };
    row.append(title, sourceCounts, controls);
    return row;
  }

  createQuickToggleButton(lane, kind) {
    const button = document.createElement("button");
    const icon = document.createElement("span");
    const controlLabel = kind === "mute" ? "Mute" : "Solo";
    button.className = `midi-studio-v2__lane-toggle midi-studio-v2__lane-toggle--${kind} midi-studio-v2__quick-instrument-button`;
    button.type = "button";
    button.dataset[kind === "mute" ? "timelineQuickMute" : "timelineQuickSolo"] = lane;
    icon.className = "midi-studio-v2__lane-toggle-icon";
    icon.setAttribute("aria-hidden", "true");
    this.preventPointerFocusScroll(button);
    button.addEventListener("click", () => {
      this.runInstrumentControlAction(() => this.toggleQuickLaneState(lane, kind));
    });
    button.append(icon);
    this.updateQuickToggleButton(button, lane, kind);
    return button;
  }

  updateQuickToggleButton(button, lane, kind) {
    const state = this.previewLaneState[lane] || {};
    const controlLabel = kind === "mute" ? "Mute" : "Solo";
    const active = kind === "mute" ? state.muted === true : state.soloed === true;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", `${controlLabel} ${laneLabel(lane)}`);
    button.title = `${controlLabel} ${laneLabel(lane)}`;
  }

  toggleQuickLaneState(lane, kind) {
    const state = this.previewLaneState[lane];
    if (!state) {
      return;
    }
    const field = kind === "mute" ? "muted" : "soloed";
    state[field] = !state[field];
    this.syncLaneHeaderControls();
    this.syncQuickInstrumentControls();
    this.onLaneSettingChange?.(kind, {
      enabled: state[field] === true,
      lane,
      laneLabel: laneLabel(lane)
    });
  }

  createInstrumentSliderField(labelText, input) {
    const label = document.createElement("label");
    const text = document.createElement("span");
    label.className = "midi-studio-v2__instrument-slider-field";
    text.textContent = labelText;
    label.append(text, input);
    return label;
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
    button.title = `${visible ? "Hide" : "Show"} ${laneLabel(lane)}`;
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
    const [lowOctave, highOctave] = this.octaveRangeForLane(this.selectedLane);
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

  beginTimelinePointerEdit(event) {
    if (event.button !== 0 || !this.currentResult?.ok) {
      return;
    }
    const hit = this.timelineCanvasRenderer?.cellFromPoint(event.clientX, event.clientY) || null;
    if (!hit) {
      this.lastTimelinePointerHit = null;
      return;
    }
    const { rowToken, stepIndex } = hit;
    this.lastTimelinePointerHit = hit;
    event.preventDefault();
    this.suppressNextCellClick = true;
    this.selectTimelineCell(rowToken, stepIndex, { focusCell: true });
    const mode = this.timelineCellHasSelectedLaneNote(rowToken, stepIndex) ? "erase" : "paint";
    this.timelinePointerEdit = {
      changed: false,
      lastKey: this.cellKey(rowToken, stepIndex),
      lastRowToken: rowToken,
      lastStepIndex: stepIndex,
      mode,
      paintedKeys: new Set(),
      pointerId: event.pointerId,
      startRowToken: rowToken,
      startStepIndex: stepIndex
    };
    this.applyTimelinePointerCell(rowToken, stepIndex);
    const onPointerMove = (moveEvent) => this.handleTimelinePointerMove(moveEvent);
    const onPointerUp = () => {
      this.window.removeEventListener("pointermove", onPointerMove);
      this.window.removeEventListener("pointerup", onPointerUp);
      this.finishTimelinePointerEdit();
    };
    this.timelinePointerEdit.onPointerMove = onPointerMove;
    this.timelinePointerEdit.onPointerUp = onPointerUp;
    this.window.addEventListener("pointermove", onPointerMove);
    this.window.addEventListener("pointerup", onPointerUp, { once: true });
  }

  updateTimelineHover(event) {
    if (!this.timelineCanvasRenderer || this.timelinePointerEdit) {
      return;
    }
    const hit = this.timelineCanvasRenderer.cellFromPoint(event.clientX, event.clientY) || null;
    const currentKey = this.hoveredCell ? this.cellKey(this.hoveredCell.rowToken, this.hoveredCell.stepIndex) : "";
    const nextKey = hit ? this.cellKey(hit.rowToken, hit.stepIndex) : "";
    if (currentKey === nextKey) {
      return;
    }
    this.hoveredCell = hit ? { rowToken: hit.rowToken, stepIndex: hit.stepIndex } : null;
    this.timelineCanvasRenderer.setHoverCell(this.hoveredCell);
  }

  clearTimelineHover() {
    if (!this.hoveredCell) {
      return;
    }
    this.hoveredCell = null;
    this.timelineCanvasRenderer?.setHoverCell(null);
  }

  handleTimelinePointerMove(event) {
    const edit = this.timelinePointerEdit;
    if (!edit || (event.pointerId !== undefined && event.pointerId !== edit.pointerId)) {
      return;
    }
    const target = this.timelineCellFromPoint(event);
    if (!target) {
      return;
    }
    const { rowToken, stepIndex } = target;
    if (!rowToken || !Number.isInteger(stepIndex)) {
      return;
    }
    const key = this.cellKey(rowToken, stepIndex);
    if (key === edit.lastKey) {
      return;
    }
    this.paintTimelineRange(edit.lastRowToken, edit.lastStepIndex, rowToken, stepIndex);
    edit.lastKey = key;
    edit.lastRowToken = rowToken;
    edit.lastStepIndex = stepIndex;
    this.selectTimelineCell(rowToken, stepIndex);
  }

  timelineCellFromPoint(event) {
    return this.timelineCanvasRenderer?.cellFromPoint(event.clientX, event.clientY) || null;
  }

  auditionTimelineKeyboardKey(hit) {
    if (!hit?.rowToken || !this.selectedLane) {
      return false;
    }
    const stepIndex = Number.isInteger(this.selectedCell?.stepIndex) ? this.selectedCell.stepIndex : 0;
    this.selectTimelineCell(hit.rowToken, stepIndex, { focusCell: true });
    this.onLaneSettingChange?.("audition-note", {
      ...this.selectedAuditionDetail(hit.rowToken),
      rowToken: hit.rowToken,
      source: "octave-timeline-keyboard"
    });
    return true;
  }

  paintTimelineRange(previousRowToken, previousStepIndex, rowToken, stepIndex) {
    const edit = this.timelinePointerEdit;
    if (!edit) {
      return;
    }
    const rows = this.timelineCanvasRows.length ? this.timelineCanvasRows : this.octaveRowsFor(this.currentResult);
    const previousRowIndex = rows.findIndex((row) => row.value === previousRowToken);
    const rowIndex = rows.findIndex((row) => row.value === rowToken);
    if (previousRowIndex < 0 || rowIndex < 0) {
      this.applyTimelinePointerCell(rowToken, stepIndex);
      return;
    }
    const rowDelta = rowIndex - previousRowIndex;
    const stepDelta = stepIndex - previousStepIndex;
    const distance = Math.max(Math.abs(rowDelta), Math.abs(stepDelta), 1);
    for (let index = 0; index <= distance; index += 1) {
      const nextRowIndex = Math.round(previousRowIndex + (rowDelta * index) / distance);
      const nextStepIndex = Math.round(previousStepIndex + (stepDelta * index) / distance);
      const nextRow = rows[nextRowIndex];
      if (nextRow) {
        this.applyTimelinePointerCell(nextRow.value, nextStepIndex);
      }
    }
  }

  applyTimelinePointerCell(rowToken, stepIndex) {
    const edit = this.timelinePointerEdit;
    const key = this.cellKey(rowToken, stepIndex);
    if (edit?.paintedKeys.has(key)) {
      return;
    }
    const active = edit?.mode !== "erase";
    if (this.setTimelineCellActive(rowToken, stepIndex, active)) {
      edit.changed = true;
      edit?.paintedKeys.add(key);
      this.timelineCanvasRenderer?.setPaintPreviewMode(edit?.mode || "paint");
      this.timelineCanvasRenderer?.setPaintPreview(Array.from(edit?.paintedKeys || []));
    }
  }

  finishTimelinePointerEdit() {
    const edit = this.timelinePointerEdit;
    if (!edit) {
      return;
    }
    this.timelineCanvasRenderer?.setPaintPreview([]);
    this.timelinePointerEdit = null;
    this.window.setTimeout(() => {
      this.suppressNextCellClick = false;
    }, 0);
    if (!edit.changed) {
      return;
    }
    this.onNoteEdit?.(this.readInput(), {
      action: edit.mode === "erase" ? "erase-notes" : "paint-notes",
      audition: edit.mode !== "erase",
      auditionRowToken: edit.lastRowToken,
      auditionStepIndex: edit.lastStepIndex,
      editMode: edit.mode,
      lane: this.selectedLane,
      laneLabel: laneLabel(this.selectedLane),
      rowToken: edit.startRowToken,
      stepIndex: edit.startStepIndex
    });
  }

  cellKey(rowToken, stepIndex) {
    return `${rowToken}:${stepIndex}`;
  }

  selectTimelineCell(rowToken, stepIndex, { focusCell = false } = {}) {
    this.selectedCell = { rowToken, stepIndex };
    this.applySelectedCellHighlight();
    if (focusCell) {
      this.selectedTimelineCellElement()?.focus({ preventScroll: true });
    }
    this.renderSelectionDetails();
  }

  selectedTimelineCellElement() {
    return this.selectedCell ? this.timelineCanvas : null;
  }

  applySelectedCellHighlight() {
    if (!this.timelineCanvasRenderer) {
      return;
    }
    this.timelineCanvasRenderer.setSelectedCell(this.selectedCell);
  }

  toggleTimelineCell(rowToken, stepIndex) {
    if (!this.currentResult?.ok || !this.selectedLane) {
      return;
    }
    this.selectTimelineCell(rowToken, stepIndex, { focusCell: true });
    const wasActive = this.timelineCellHasSelectedLaneNote(rowToken, stepIndex);
    const nextToken = this.toggleTimelineCellValue(rowToken, stepIndex);
    const isActive = !wasActive;
    this.onNoteEdit?.(this.readInput(), {
      action: "toggle-note",
      audition: isActive,
      auditionRowToken: rowToken,
      auditionStepIndex: stepIndex,
      editMode: isActive ? "paint" : "erase",
      lane: this.selectedLane,
      laneLabel: laneLabel(this.selectedLane),
      note: nextToken,
      rowToken,
      stepIndex
    });
  }

  timelineCellHasSelectedLaneNote(rowToken, stepIndex) {
    return this.rowsForSelectedToken(this.tokenForLaneStep(this.selectedLane, stepIndex)).includes(rowToken);
  }

  toggleTimelineCellValue(rowToken, stepIndex) {
    const existingToken = this.tokenForLaneStep(this.selectedLane, stepIndex);
    const activeRows = this.rowsForSelectedToken(existingToken);
    const nextActive = !activeRows.includes(rowToken);
    this.setTimelineCellActive(rowToken, stepIndex, nextActive);
    return this.tokenForLaneStep(this.selectedLane, stepIndex);
  }

  setTimelineCellActive(rowToken, stepIndex, active) {
    if (!this.currentResult?.ok || !this.selectedLane) {
      return false;
    }
    const existingToken = this.tokenForLaneStep(this.selectedLane, stepIndex);
    const existingParts = this.tokenPartsForSelectedToken(existingToken);
    const hasRow = this.rowsForSelectedToken(existingToken).includes(rowToken);
    if (active && hasRow) {
      return false;
    }
    if (!active && !hasRow) {
      return false;
    }
    const rowPart = this.tokenForRow(rowToken);
    const nextParts = active
      ? [...existingParts, rowPart]
      : existingParts.filter((part) => this.rowForTokenPart(part) !== rowToken);
    this.setLaneStepToken(this.selectedLane, stepIndex, nextParts.length ? this.joinTokenParts(nextParts) : "-");
    return true;
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

  deleteSelectedNotes() {
    if (!this.selectedCell || !this.currentResult?.ok) {
      return false;
    }
    const changed = this.setTimelineCellActive(this.selectedCell.rowToken, this.selectedCell.stepIndex, false);
    if (!changed) {
      return false;
    }
    this.onNoteEdit?.(this.readInput(), {
      action: "delete-selected-note",
      lane: this.selectedLane,
      laneLabel: laneLabel(this.selectedLane),
      rowToken: this.selectedCell.rowToken,
      stepIndex: this.selectedCell.stepIndex
    });
    return true;
  }

  duplicateSelectedNotes() {
    if (!this.selectedCell || !this.currentResult?.ok) {
      return false;
    }
    const rowToken = this.selectedCell.rowToken;
    const nextStepIndex = this.selectedCell.stepIndex + 1;
    if (nextStepIndex >= this.currentResult.totalSteps) {
      return false;
    }
    const changed = this.setTimelineCellActive(rowToken, nextStepIndex, true);
    this.selectTimelineCell(rowToken, nextStepIndex);
    if (!changed) {
      return false;
    }
    this.onNoteEdit?.(this.readInput(), {
      action: "duplicate-selected-note",
      lane: this.selectedLane,
      laneLabel: laneLabel(this.selectedLane),
      rowToken,
      stepIndex: nextStepIndex
    });
    return true;
  }

  moveSelectionByKey(key) {
    const movement = {
      ArrowDown: { row: 1, step: 0 },
      ArrowLeft: { row: 0, step: -1 },
      ArrowRight: { row: 0, step: 1 },
      ArrowUp: { row: -1, step: 0 }
    }[key];
    if (!movement || !this.currentResult?.ok) {
      return false;
    }
    const rows = this.octaveRowsFor(this.currentResult);
    if (!rows.length) {
      return false;
    }
    const currentRowIndex = Math.max(0, rows.findIndex((row) => row.value === this.selectedCell?.rowToken));
    const currentStepIndex = Number.isInteger(this.selectedCell?.stepIndex) ? this.selectedCell.stepIndex : 0;
    const nextRowIndex = Math.max(0, Math.min(rows.length - 1, currentRowIndex + movement.row));
    const nextStepIndex = Math.max(0, Math.min(this.currentResult.totalSteps - 1, currentStepIndex + movement.step));
    this.selectTimelineCell(rows[nextRowIndex].value, nextStepIndex, { focusCell: true });
    return true;
  }

  captureTimelineScrollState() {
    return {
      scrollLeft: this.gridOutput?.scrollLeft || 0,
      scrollTop: this.gridOutput?.scrollTop || 0
    };
  }

  timelineCanvasViewport() {
    const scrollLeft = this.gridOutput?.scrollLeft || 0;
    const width = this.gridOutput?.clientWidth || 0;
    const stickyHeight = this.timelineScrollProxy?.getBoundingClientRect?.().height || 0;
    let scrollTop = 0;
    if (this.gridOutput && this.timelineCanvas) {
      const gridRect = this.gridOutput.getBoundingClientRect();
      const canvasRect = this.timelineCanvas.getBoundingClientRect();
      scrollTop = Math.max(0, gridRect.top + stickyHeight - canvasRect.top);
    }
    return {
      height: Math.max(0, (this.gridOutput?.clientHeight || 0) - stickyHeight),
      scrollLeft,
      scrollTop,
      width
    };
  }

  restoreTimelineScrollState(scrollState) {
    this.applyTimelineScrollState(scrollState);
    this.window.requestAnimationFrame?.(() => this.applyTimelineScrollState(scrollState));
  }

  applyTimelineScrollState(scrollState) {
    if (!scrollState || !this.gridOutput) {
      return;
    }
    this.gridOutput.scrollLeft = scrollState.scrollLeft;
    this.gridOutput.scrollTop = scrollState.scrollTop;
    if (this.timelineScrollProxy) {
      this.timelineScrollProxy.scrollLeft = scrollState.scrollLeft;
    }
    this.syncTimelineScrollState();
  }

  syncTimelineScrollState() {
    if (!this.gridOutput) {
      return;
    }
    if (!this.syncingTimelineScroll && this.timelineScrollProxy) {
      this.syncingTimelineScroll = true;
      this.timelineScrollProxy.scrollLeft = this.gridOutput.scrollLeft;
      this.syncingTimelineScroll = false;
    }
    this.gridOutput.dataset.timelineScrollLeft = String(Math.round(this.gridOutput.scrollLeft));
    this.gridOutput.dataset.timelineScrollTop = String(Math.round(this.gridOutput.scrollTop));
    this.renderCanvasTimeline();
  }

  syncTimelineScrollFromProxy() {
    if (!this.gridOutput || !this.timelineScrollProxy || this.syncingTimelineScroll) {
      return;
    }
    this.syncingTimelineScroll = true;
    this.gridOutput.scrollLeft = this.timelineScrollProxy.scrollLeft;
    this.gridOutput.dataset.timelineScrollLeft = String(Math.round(this.gridOutput.scrollLeft));
    this.gridOutput.dataset.timelineScrollTop = String(Math.round(this.gridOutput.scrollTop));
    this.syncingTimelineScroll = false;
    this.renderCanvasTimeline();
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
    const sourceCounts = this.createArrangementSourceBadge(lane);
    main.append(instrumentLabelElement, sourceCounts, typeSelect, instrumentSelect);

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
      sourceCounts,
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
      this.populateInstrumentOptions(lane, this.previewLaneControls[lane]?.instrument);
      if (this.selectedEditorControls?.lane === lane) {
        this.populateInstrumentOptions(lane, this.selectedEditorControls.instrument);
      }
      this.updateLaneTitle(lane);
      this.updateSelectedInstrumentDisplayFields(lane);
      this.syncQuickInstrumentControls();
      this.renderAuditionKeyboard();
      this.renderSelectionDetails();
      this.onLaneSettingChange?.("instrument-type", {
        instrumentLabel: instrumentLabel(nextInstrument),
        instrumentWarning: previewInstrumentWarning(nextInstrument),
        instrumentType: select.value,
        instrumentValue: nextInstrument,
        lane,
        laneLabel: laneLabel(lane),
        previewInstrumentLabel: audiblePreviewLabel(nextInstrument)
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
      const editorControls = this.selectedEditorControls?.lane === lane ? this.selectedEditorControls : null;
      if (controls?.instrumentType) {
        controls.instrumentType.value = nextType;
      }
      if (editorControls?.instrumentType) {
        editorControls.instrumentType.value = nextType;
      }
      this.updateLaneTitle(lane);
      this.updateSelectedInstrumentDisplayFields(lane);
      this.syncQuickInstrumentControls();
      this.renderAuditionKeyboard();
      this.renderSelectionDetails();
      this.onLaneSettingChange?.("instrument", {
        instrumentLabel: select.selectedOptions[0]?.textContent || "",
        instrumentWarning: previewInstrumentWarning(select.value),
        instrumentType: nextType,
        instrumentValue: select.value,
        lane,
        laneLabel: laneLabel(lane),
        previewInstrumentLabel: audiblePreviewLabel(select.value)
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
      if (instrument.previewInstrumentId) {
        option.dataset.previewInstrumentId = instrument.previewInstrumentId;
        option.dataset.unsupportedPreview = "true";
      }
      if (instrument.approximationWarning) {
        option.title = instrument.approximationWarning;
      }
      select.append(option);
    });
    const selectedInstrument = this.previewLaneState[lane]?.instrument || "";
    select.value = instrumentsForType(typeGroup).some((instrument) => instrument.id === selectedInstrument)
      ? selectedInstrument
      : "";
  }

  updateLaneTitle(lane) {
    const controls = this.previewLaneControls[lane];
    if (controls?.instrumentLabel) {
      controls.instrumentLabel.textContent = this.displayNameForLane(lane);
    }
    if (controls?.summary) {
      controls.summary.textContent = this.instrumentSummaryForLane(lane);
    }
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
    input.title = `${controlLabel} ${laneLabel(lane)}`;
    label.className = `tool-starter__toggle midi-studio-v2__lane-toggle midi-studio-v2__lane-toggle--${kind}`;
    label.classList.toggle("is-active", input.checked);
    label.dataset.laneControlKind = kind;
    label.htmlFor = input.id;
    label.title = `${controlLabel} ${laneLabel(lane)}`;
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
        this.syncQuickInstrumentControls();
        this.renderSelectedInstrumentEditor();
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
      this.syncLaneHeaderControls();
      this.renderAuditionKeyboard();
      this.renderSelectionDetails();
      this.onLaneSettingChange?.(kind, {
        lane,
        laneLabel: laneLabel(lane),
        value: input.value
      });
    };
    input.addEventListener("input", update);
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
    button.dataset.deleteIcon = "trashcan";
    button.dataset.deleteInstrumentRow = lane;
    button.setAttribute("aria-label", `Delete instrument row ${laneLabel(lane)}`);
    button.title = `Delete instrument row ${laneLabel(lane)}`;
    const icon = document.createElement("span");
    icon.className = "midi-studio-v2__trashcan-icon";
    icon.setAttribute("aria-hidden", "true");
    button.append(icon);
    this.preventPointerFocusScroll(button);
    button.addEventListener("click", () => {
      this.runInstrumentControlAction(() => this.requestDeleteInstrumentRow(lane));
    });
    return button;
  }

  createDeleteConfirmation(lane) {
    if (this.deleteBlockedLane === lane) {
      const blocked = document.createElement("div");
      const message = document.createElement("span");
      blocked.className = "midi-studio-v2__delete-confirmation";
      blocked.dataset.deleteBlockedLane = lane;
      message.textContent = "Final instrument cannot be deleted.";
      blocked.append(message);
      return blocked;
    }
    if (this.pendingDeleteLane !== lane) {
      return null;
    }
    const confirmation = document.createElement("div");
    const message = document.createElement("span");
    const confirmButton = document.createElement("button");
    const cancelButton = document.createElement("button");
    confirmation.className = "midi-studio-v2__delete-confirmation";
    confirmation.dataset.deleteConfirmationLane = lane;
    message.textContent = `Delete ${this.displayNameForLane(lane)}?`;
    confirmButton.type = "button";
    confirmButton.dataset.confirmDeleteInstrumentRow = lane;
    confirmButton.textContent = "Confirm";
    confirmButton.setAttribute("aria-label", `Confirm delete instrument row ${laneLabel(lane)}`);
    cancelButton.type = "button";
    cancelButton.dataset.cancelDeleteInstrumentRow = lane;
    cancelButton.textContent = "Cancel";
    cancelButton.setAttribute("aria-label", `Cancel delete instrument row ${laneLabel(lane)}`);
    [confirmButton, cancelButton].forEach((button) => this.preventPointerFocusScroll(button));
    confirmButton.addEventListener("click", () => {
      this.runInstrumentControlAction(() => this.deleteInstrumentRow(lane));
    });
    cancelButton.addEventListener("click", () => {
      this.runInstrumentControlAction(() => this.cancelDeleteInstrumentRow(lane));
    });
    confirmation.append(message, confirmButton, cancelButton);
    return confirmation;
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
    this.laneOrder = [...this.orderedLaneNames(), lane];
    this.pendingDeleteLane = null;
    this.deleteBlockedLane = null;
    this.recentlyDuplicatedLane = null;
    this.selectedLane = lane;
    this.emitGridStructureChange("add-lane", lane);
  }

  duplicateSelectedInstrument() {
    const sourceLane = this.selectedLane;
    const lanes = this.readInput().lanes;
    if (!sourceLane || !Object.hasOwn(lanes, sourceLane)) {
      return false;
    }
    const identity = this.nextDuplicateInstrumentIdentity(sourceLane);
    const lane = identity.lane;
    const sourceState = this.previewLaneState[sourceLane] || defaultPreviewLaneState(sourceLane);
    this.extraLaneSources[lane] = String(lanes[sourceLane] || "");
    this.previewLaneState[lane] = {
      ...clonePlainObject(sourceState),
      displayName: identity.displayName
    };
    this.laneOrder = this.orderWithInsertedLane(sourceLane, lane);
    this.pendingDeleteLane = null;
    this.deleteBlockedLane = null;
    this.recentlyDuplicatedLane = lane;
    this.selectedLane = lane;
    this.setInstrumentWorkflowStatus(`Duplicated ${laneLabel(sourceLane)} as ${identity.displayName}; selectedInstrumentId synchronized to ${lane}.`);
    this.emitGridStructureChange("duplicate-lane", lane, {
      duplicateDisplayName: identity.displayName,
      sourceLane,
      sourceLaneLabel: laneLabel(sourceLane)
    });
    return true;
  }

  moveSelectedInstrument(direction) {
    const lanes = this.orderedLaneNames();
    const lane = this.selectedLane;
    const currentIndex = lanes.indexOf(lane);
    const nextIndex = currentIndex + direction;
    if (!lane || currentIndex < 0 || nextIndex < 0 || nextIndex >= lanes.length) {
      return false;
    }
    const nextOrder = lanes.slice();
    [nextOrder[currentIndex], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[currentIndex]];
    this.laneOrder = nextOrder;
    this.pendingDeleteLane = null;
    this.deleteBlockedLane = null;
    this.recentlyDuplicatedLane = null;
    this.setInstrumentWorkflowStatus(`Moved ${laneLabel(lane)} ${direction < 0 ? "up" : "down"}; selectedInstrumentId remains ${lane}.`);
    this.emitGridStructureChange(direction < 0 ? "move-lane-up" : "move-lane-down", lane, {
      direction: direction < 0 ? "up" : "down"
    });
    return true;
  }

  collapseInstrumentPanel() {
    const section = this.instrumentList?.closest(".accordion-v2") || null;
    this.setAccordionSectionOpen(section, false);
  }

  toggleInstrumentPanel() {
    const section = this.instrumentList?.closest(".accordion-v2") || null;
    this.setAccordionSectionOpen(section, !section?.classList.contains("is-open"));
  }

  collapseTimelineInstrumentPanel() {
    const section = this.quickInstrumentList?.closest(".accordion-v2") || null;
    this.setAccordionSectionOpen(section, false);
  }

  toggleTimelineInstrumentPanel() {
    const section = this.quickInstrumentList?.closest(".accordion-v2") || null;
    this.setAccordionSectionOpen(section, !section?.classList.contains("is-open"));
  }

  setAccordionSectionOpen(section, isOpen) {
    const header = section?.querySelector(".accordion-v2__header") || null;
    const content = section?.querySelector(".accordion-v2__content") || null;
    if (!section || !header || !content) {
      return false;
    }
    section.classList.toggle("is-open", isOpen);
    section.dataset.accordionV2Open = String(isOpen);
    header.setAttribute("aria-expanded", String(isOpen));
    content.hidden = !isOpen;
    const icon = header.querySelector(".accordion-v2__icon");
    if (icon) {
      icon.dataset.accordionV2IconState = isOpen ? "open" : "closed";
      icon.textContent = isOpen ? "X" : "+";
    }
    header.querySelectorAll("[data-accordion-v2-toggle-button]").forEach((button) => {
      button.dataset.accordionV2IconState = isOpen ? "open" : "closed";
      button.textContent = isOpen ? "X" : "+";
      const label = button.dataset[isOpen ? "accordionV2OpenLabel" : "accordionV2ClosedLabel"];
      if (label) {
        button.setAttribute("aria-label", label);
        button.title = label;
      }
    });
    return true;
  }

  requestDeleteInstrumentRow(lane) {
    if (!lane) {
      return false;
    }
    if (this.orderedLaneNames().length <= 1) {
      return this.showDeleteBlocked(lane);
    }
    this.pendingDeleteLane = lane;
    this.deleteBlockedLane = null;
    this.renderInstrumentList(this.currentResult?.lanes || this.orderedLaneNames());
    this.onLaneSettingChange?.("delete-confirmation", {
      lane,
      laneLabel: laneLabel(lane)
    });
    return true;
  }

  cancelDeleteInstrumentRow(lane) {
    this.pendingDeleteLane = null;
    this.deleteBlockedLane = null;
    this.renderInstrumentList(this.currentResult?.lanes || this.orderedLaneNames());
    this.onLaneSettingChange?.("delete-cancelled", {
      lane,
      laneLabel: laneLabel(lane)
    });
    return true;
  }

  showDeleteBlocked(lane) {
    this.pendingDeleteLane = null;
    this.deleteBlockedLane = lane;
    this.renderInstrumentList(this.currentResult?.lanes || this.orderedLaneNames());
    this.onLaneSettingChange?.("delete-blocked", {
      lane,
      laneLabel: laneLabel(lane)
    });
    return false;
  }

  deleteInstrumentRow(lane) {
    if (!lane) {
      return;
    }
    const lanesBefore = this.orderedLaneNames();
    if (lanesBefore.length <= 1) {
      this.showDeleteBlocked(lane);
      return false;
    }
    const laneIndex = lanesBefore.indexOf(lane);
    if (laneIndex < 0) {
      return false;
    }
    const nextSelectedLane = lanesBefore[laneIndex + 1] || lanesBefore[laneIndex - 1] || lanesBefore.find((entry) => entry !== lane) || "";
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
    this.laneOrder = lanesBefore.filter((entry) => entry !== lane);
    this.pendingDeleteLane = null;
    this.deleteBlockedLane = null;
    this.recentlyDuplicatedLane = null;
    this.selectedLane = nextSelectedLane;
    this.emitGridStructureChange("delete-lane", lane);
    return true;
  }

  emitGridStructureChange(action, lane, detail = {}) {
    this.onNoteEdit?.(this.readInput(), { action, lane, laneLabel: laneLabel(lane), ...detail });
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

  nextDuplicateInstrumentIdentity(sourceLane) {
    const existing = new Set(Object.keys(this.readInput().lanes));
    const base = this.duplicateBaseId(sourceLane);
    const displayBase = laneLabel(base);
    const existingNames = new Set(this.orderedLaneNames().map((lane) => this.displayNameForLane(lane).toLowerCase()));
    let index = 1;
    let lane = `${base}-${index}`;
    let displayName = `${displayBase} ${index}`;
    while (existing.has(lane) || existingNames.has(displayName.toLowerCase())) {
      index += 1;
      lane = `${base}-${index}`;
      displayName = `${displayBase} ${index}`;
    }
    return { displayName, lane };
  }

  duplicateBaseId(sourceLane) {
    const normalized = String(sourceLane || "instrument").trim().toLowerCase();
    const stripped = normalized
      .replace(/-copy(?:-\d+)?$/, "")
      .replace(/-\d+$/, "");
    return stripped || "instrument";
  }

  orderWithInsertedLane(sourceLane, lane) {
    const lanes = this.orderedLaneNames();
    const sourceIndex = lanes.indexOf(sourceLane);
    if (sourceIndex < 0) {
      return [...lanes, lane];
    }
    return [
      ...lanes.slice(0, sourceIndex + 1),
      lane,
      ...lanes.slice(sourceIndex + 1)
    ];
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

  syncInstrumentManagementButtons() {
    const lanes = this.orderedLaneNames();
    const selectedIndex = lanes.indexOf(this.selectedLane);
    if (this.duplicateInstrumentButton) {
      this.duplicateInstrumentButton.disabled = selectedIndex < 0;
    }
    if (this.moveInstrumentUpButton) {
      this.moveInstrumentUpButton.disabled = selectedIndex <= 0;
    }
    if (this.moveInstrumentDownButton) {
      this.moveInstrumentDownButton.disabled = selectedIndex < 0 || selectedIndex >= lanes.length - 1;
    }
  }

  revealSelectedInstrument() {
    const lane = this.selectedLane;
    if (!lane) {
      return;
    }
    this.window.requestAnimationFrame?.(() => {
      const quickRow = this.quickLaneControls?.[lane]?.row || null;
      const instrumentRow = this.previewLaneControls?.[lane]?.row || null;
      quickRow?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
      instrumentRow?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    });
  }

  syncLaneHeaderControls() {
    this.syncInstrumentManagementButtons();
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
      if (controls.sourceCounts) {
        this.updateArrangementSourceBadge(controls.sourceCounts, lane);
      }
    });
    if (this.selectedEditorControls?.lane) {
      const lane = this.selectedEditorControls.lane;
      const state = this.previewLaneState[lane];
      if (state) {
        if (this.selectedEditorControls.displayName) {
          this.selectedEditorControls.displayName.value = state.displayName || "";
        }
        if (this.selectedEditorControls.instrument) {
          this.populateInstrumentOptions(lane, this.selectedEditorControls.instrument);
          this.selectedEditorControls.instrument.value = state.instrument || "";
        }
        if (this.selectedEditorControls.instrumentType) {
          this.selectedEditorControls.instrumentType.value = state.instrumentType || instrumentTypeGroup(state.instrument);
        }
        if (this.selectedEditorControls.mute) {
          this.selectedEditorControls.mute.checked = state.muted === true;
        }
        if (this.selectedEditorControls.solo) {
          this.selectedEditorControls.solo.checked = state.soloed === true;
        }
        if (this.selectedEditorControls.volume) {
          this.selectedEditorControls.volume.value = String(state.volume ?? 1);
        }
        if (this.selectedEditorControls.pan) {
          this.selectedEditorControls.pan.value = String(state.pan ?? 0);
        }
        if (this.selectedEditorControls.transpose) {
          this.selectedEditorControls.transpose.value = String(state.transpose ?? 0);
        }
        if (this.selectedEditorControls.velocity) {
          this.selectedEditorControls.velocity.value = String(state.velocity ?? 100);
        }
        if (this.selectedEditorControls.duration) {
          this.selectedEditorControls.duration.value = String(state.duration ?? 1);
        }
        if (this.selectedEditorControls.octaveLow || this.selectedEditorControls.octaveHigh) {
          const [lowOctave, highOctave] = this.octaveRangeForLane(lane);
          if (this.selectedEditorControls.octaveLow) {
            this.selectedEditorControls.octaveLow.value = String(lowOctave);
          }
          if (this.selectedEditorControls.octaveHigh) {
            this.selectedEditorControls.octaveHigh.value = String(highOctave);
          }
        }
        this.updateSelectedInstrumentDisplayFields(lane);
      }
    }
    this.syncQuickInstrumentControls();
    this.renderAuditionKeyboard();
    this.renderInstrumentPresetSummary();
  }

  setInstrumentWorkflowStatus(message) {
    this.instrumentWorkflowStatus = String(message || "Instrument selection ready.");
    if (this.instrumentList) {
      this.instrumentList.dataset.instrumentWorkflowStatus = this.instrumentWorkflowStatus;
      this.instrumentList.dataset.selectedInstrumentId = this.selectedLane || "";
    }
    if (this.quickInstrumentList) {
      this.quickInstrumentList.dataset.instrumentWorkflowStatus = this.instrumentWorkflowStatus;
      this.quickInstrumentList.dataset.selectedInstrumentId = this.selectedLane || "";
    }
    if (this.auditionKeyboard) {
      this.auditionKeyboard.dataset.instrumentWorkflowStatus = this.instrumentWorkflowStatus;
      this.auditionKeyboard.dataset.selectedInstrumentId = this.selectedLane || "";
    }
  }

  syncQuickInstrumentControls() {
    if (this.instrumentList) {
      this.instrumentList.dataset.selectedInstrumentId = this.selectedLane || "";
      this.instrumentList.dataset.instrumentWorkflowStatus = this.instrumentWorkflowStatus;
    }
    if (this.quickInstrumentList) {
      this.quickInstrumentList.dataset.selectedInstrumentId = this.selectedLane || "";
      this.quickInstrumentList.dataset.instrumentWorkflowStatus = this.instrumentWorkflowStatus;
    }
    Object.entries(this.quickLaneControls || {}).forEach(([lane, controls]) => {
      const state = this.previewLaneState[lane];
      if (!state) {
        return;
      }
      controls.row?.classList.toggle("is-selected", lane === this.selectedLane);
      controls.row?.setAttribute("aria-selected", String(lane === this.selectedLane));
      if (controls.instrumentLabel) {
        controls.instrumentLabel.textContent = this.displayNameForLane(lane);
      }
      if (controls.mute) {
        this.updateQuickToggleButton(controls.mute, lane, "mute");
      }
      if (controls.solo) {
        this.updateQuickToggleButton(controls.solo, lane, "solo");
      }
      if (controls.visibilityButton) {
        this.updateVisibilityButton(controls.visibilityButton, lane);
      }
      if (controls.sourceCounts) {
        this.updateArrangementSourceBadge(controls.sourceCounts, lane);
      }
    });
  }

  auditionOctaveRange() {
    return this.octaveRangeForLane(this.selectedLane);
  }

  defaultOctaveRangeForLane(lane) {
    const state = this.previewLaneState[lane] || {};
    const typeGroup = state.instrumentType || instrumentTypeGroup(state.instrument);
    return NOTE_RANGE_BY_TYPE[typeGroup] || NOTE_RANGE_BY_TYPE["Synth Lead"];
  }

  octaveRangeForLane(lane) {
    const state = this.previewLaneState[lane] || {};
    const [defaultLow, defaultHigh] = this.defaultOctaveRangeForLane(lane);
    const hasLow = state.octaveLow !== null && state.octaveLow !== undefined && String(state.octaveLow).trim() !== "";
    const hasHigh = state.octaveHigh !== null && state.octaveHigh !== undefined && String(state.octaveHigh).trim() !== "";
    const low = hasLow && Number.isFinite(Number(state.octaveLow)) ? Number(state.octaveLow) : defaultLow;
    const high = hasHigh && Number.isFinite(Number(state.octaveHigh)) ? Number(state.octaveHigh) : defaultHigh;
    const safeLow = Math.max(0, Math.min(8, Math.round(low)));
    const safeHigh = Math.max(safeLow, Math.min(8, Math.round(high)));
    return [safeLow, safeHigh];
  }

  renderAuditionKeyboard() {
    if (!this.auditionKeyboard) {
      return;
    }
    this.auditionKeyboard.replaceChildren();
    const lane = this.selectedLane;
    const state = this.previewLaneState[lane];
    if (!lane || !state) {
      this.auditionKeyboard.dataset.selectedLane = "";
      this.auditionKeyboard.dataset.selectedInstrumentId = "";
      this.auditionKeyboard.dataset.instrumentWorkflowStatus = this.instrumentWorkflowStatus;
      this.auditionKeyboard.textContent = "No instrument selected.";
      return;
    }
    const [lowOctave, highOctave] = this.auditionOctaveRange();
    const playableRange = this.playableRangeLabel(lane);
    this.auditionKeyboard.dataset.selectedLane = lane;
    this.auditionKeyboard.dataset.selectedInstrumentId = lane;
    this.auditionKeyboard.dataset.instrumentWorkflowStatus = this.instrumentWorkflowStatus;
    this.auditionKeyboard.dataset.octaveMin = String(lowOctave);
    this.auditionKeyboard.dataset.octaveMax = String(highOctave);
    this.auditionKeyboard.dataset.playableRange = playableRange;
    this.auditionKeyboard.dataset.pan = String(state.pan ?? 0);
    this.auditionKeyboard.dataset.transpose = String(state.transpose ?? 0);
    this.auditionKeyboard.dataset.velocity = String(state.velocity ?? 100);
    this.auditionKeyboard.dataset.volume = String(state.volume ?? 1);
    this.auditionKeyboard.setAttribute("aria-label", `${laneLabel(lane)} audition keyboard, playable range ${playableRange}`);
    const rangeSummary = document.createElement("output");
    rangeSummary.className = "midi-studio-v2__audition-range-summary";
    rangeSummary.dataset.auditionRangeSummary = lane;
    rangeSummary.dataset.octaveMin = String(lowOctave);
    rangeSummary.dataset.octaveMax = String(highOctave);
    rangeSummary.value = playableRange;
    rangeSummary.textContent = playableRange;
    rangeSummary.setAttribute("aria-readonly", "true");
    this.auditionKeyboard.append(rangeSummary);
    for (let octave = lowOctave; octave <= highOctave; octave += 1) {
      NOTE_NAMES.forEach((noteName) => {
        const note = `${noteName}${octave}`;
        const key = document.createElement("button");
        key.className = "midi-studio-v2__audition-key";
        key.type = "button";
        key.dataset.auditionLane = lane;
        key.dataset.auditionNote = note;
        key.dataset.auditionPan = String(state.pan ?? 0);
        key.dataset.auditionTranspose = String(state.transpose ?? 0);
        key.dataset.auditionVelocity = String(state.velocity ?? 100);
        key.dataset.auditionVolume = String(state.volume ?? 1);
        key.dataset.keyKind = noteName.includes("#") ? "black" : "white";
        key.setAttribute("aria-label", `Audition ${note} on ${laneLabel(lane)} within ${playableRange}`);
        key.title = `Audition ${note}`;
        key.textContent = note;
        this.preventPointerFocusScroll(key);
        key.addEventListener("click", () => {
          this.runInstrumentControlAction(() => {
            this.onLaneSettingChange?.("audition-note", this.selectedAuditionDetail(note));
          });
        });
        this.auditionKeyboard.append(key);
      });
    }
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

  selectLane(lane) {
    if (!lane) {
      return;
    }
    this.selectedLane = lane;
    this.pendingDeleteLane = null;
    this.deleteBlockedLane = null;
    this.setInstrumentWorkflowStatus(`Selected ${laneLabel(lane)}; selectedInstrumentId synchronized to ${lane}.`);
    if (this.currentResult?.ok) {
      this.render(this.currentResult);
      return;
    }
    this.previewLaneEntries().forEach(([entryLane, controls]) => {
      controls.row?.classList.toggle("is-selected", entryLane === lane);
      controls.row?.setAttribute("aria-selected", String(entryLane === lane));
    });
    this.syncQuickInstrumentControls();
    this.syncInstrumentManagementButtons();
    this.revealSelectedInstrument();
    this.renderSelectedInstrumentEditor();
    this.renderAuditionKeyboard();
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
    this.syncQuickInstrumentControls();
    this.syncInstrumentManagementButtons();
    this.renderSelectedInstrumentEditor();
    this.renderAuditionKeyboard();
    this.renderCanvasTimeline();
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
    const [lowOctave, highOctave] = this.selectedLane ? this.octaveRangeForLane(this.selectedLane) : ["", ""];
    const rows = [
      ["Instrument", this.selectedLane ? this.displayNameForLane(this.selectedLane) : "none"],
      ["Type", state.instrumentType || "not selected"],
      ["Patch", instrumentLabel(state.instrument) || "not selected"],
      ["Octave range", this.selectedLane ? `${lowOctave}-${highOctave}` : "none"],
      ["Transpose", String(state.transpose ?? 0)],
      ["Velocity", String(state.velocity ?? 100)],
      ["Duration", String(state.duration ?? 1)],
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
      this.transportState.textContent = `Section not available: ${this.displaySectionLabel(sectionLabel)}. Choose a listed custom section.`;
      this.updateSectionPresetAvailability(this.currentResult?.sections || []);
      return;
    }
    this.sectionSelect.value = section.label;
    this.setPlayheadStep(section.startStep);
    this.updateSelectedSectionRegion();
    this.syncSectionPresetState();
    this.transportState.textContent = `Selected section: ${section.label}`;
    onTransport("select-section", { section });
  }

  selectTimelineHeaderSection(hit, onTransport) {
    const section = hit?.section;
    if (!section) {
      return;
    }
    this.sectionSelect.value = section.label;
    this.setPlayheadStep(section.startStep);
    this.selectedSectionBounds = section;
    this.renderCanvasTimeline();
    this.syncSectionPresetState();
    this.transportState.textContent = `Selected section: ${section.label}`;
    onTransport("select-section", {
      section,
      sequenceIndex: hit.sectionIndex,
      source: "timeline-header"
    });
  }

  selectSequenceSection(label, occurrenceIndex = null) {
    const section = this.sectionByLabelOccurrence(label, occurrenceIndex);
    if (!section) {
      return false;
    }
    this.sectionSelect.value = section.label;
    this.setPlayheadStep(section.startStep);
    this.selectedSectionBounds = section;
    this.renderCanvasTimeline();
    this.syncSectionPresetState();
    this.transportState.textContent = `Selected section: ${section.label}`;
    return true;
  }

  handleSectionSelectionChange(onTransport) {
    const section = this.sectionByLabel(this.sectionSelect.value);
    if (!section) {
      this.updateSelectedSectionRegion();
      onTransport("invalid-section", { label: this.sectionSelect.value || "(none)" });
      return;
    }
    this.setPlayheadStep(section.startStep);
    this.updateSelectedSectionRegion();
    this.syncSectionPresetState();
    this.transportState.textContent = `Selected section: ${section.label}`;
    onTransport("select-section", { section });
  }

  handleLoopRegionChange(onTransport) {
    const bounds = this.updateLoopRegion();
    if (!bounds.ok) {
      onTransport("invalid-loop", { message: bounds.message });
      return;
    }
    this.syncSectionPresetState();
    this.transportState.textContent = `Loop region set: ${bounds.startSection.label} -> ${bounds.endSection.label}`;
    onTransport("set-loop-region", { endSection: bounds.endSection, startSection: bounds.startSection });
  }

  jumpToSelectedSection(onTransport) {
    const section = this.sectionByLabel(this.sectionSelect.value);
    if (!section) {
      onTransport("invalid-section", { label: this.sectionSelect.value || "(none)" });
      return;
    }
    this.stopTimer();
    this.setPlayheadStep(section.startStep);
    this.updateSelectedSectionRegion();
    this.syncSectionPresetState();
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
    this.startTimingPreview({
      endStep: section.endStep,
      label: section.label,
      mode: "section",
      onComplete: () => onTransport("preview-complete", { label: section.label, mode: "section" }),
      startStep: section.startStep
    });
  }

  async playSelectedLoop(onTransport) {
    const bounds = this.selectedLoopBounds();
    if (!bounds.ok) {
      onTransport("invalid-loop", { message: bounds.message });
      return;
    }
    this.loopBounds = bounds;
    this.renderCanvasTimeline();
    this.syncSectionPresetState();
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

  async playSequence(onTransport) {
    if (!this.currentResult?.ok || !this.currentResult.sections.length || this.currentResult.totalSteps <= 0) {
      onTransport("invalid-sequence", { message: "Normalize populated Song Sequence sections before previewing the full sequence." });
      return;
    }
    const label = "Song Sequence";
    const startStep = 0;
    const endStep = this.currentResult.totalSteps - 1;
    const canStart = await onTransport("play-sequence", { endStep, label, startStep });
    if (canStart === false) {
      return;
    }
    this.startTimingPreview({
      endStep,
      label,
      mode: "sequence",
      onComplete: () => onTransport("preview-complete", { label, mode: "sequence" }),
      startStep
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

  startTimingPreview({ endStep, label, mode, onComplete = null, startStep }) {
    this.stopTimer();
    this.setPlayheadStep(startStep);
    this.gridOutput.dataset.previewPlaybackMode = mode;
    this.gridOutput.dataset.previewPlaybackLabel = label;
    const modeLabel = mode === "loop" ? "loop" : mode === "sequence" ? "sequence" : "section";
    this.transportState.textContent = `Playing ${modeLabel}: ${label}`;
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
        onComplete?.({ label, mode });
        return;
      }
      this.setPlayheadStep(nextStep);
    }, intervalMs);
    this.revealPlaybackStep(startStep);
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
    if (!this.playTimer) {
      this.gridOutput.dataset.previewPlaybackMode = "stopped";
      this.gridOutput.dataset.previewPlaybackLabel = "";
    }
  }

  setPreviewPlaybackLanes(lanes = []) {
    this.activePreviewLanes = Array.from(new Set(lanes));
    this.timelineCanvasRenderer?.setActivePreviewLanes(this.activePreviewLanes);
    this.setPlayheadStep(this.playheadStep);
  }

  clearPreviewPlaybackLanes() {
    this.activePreviewLanes = [];
    this.timelineCanvasRenderer?.setActivePreviewLanes([]);
  }

  setPlayheadStep(stepIndex) {
    const result = this.currentResult;
    if (!result?.ok) {
      this.playheadStep = 0;
      this.lastPlayheadHighlightStep = null;
      return;
    }
    const nextStep = Math.max(0, Math.min(stepIndex, result.totalSteps - 1));
    this.playheadStep = nextStep;
    this.timelineCanvasRenderer?.setPlayheadStep(nextStep);
    const activeCell = this.referenceCells(result)[nextStep] || null;
    this.gridOutput.dataset.playheadStep = String(nextStep);
    this.gridOutput.dataset.playheadBar = activeCell ? String(activeCell.bar) : "";
    this.gridOutput.dataset.playheadBeat = activeCell ? String(activeCell.beat) : "";
    this.gridOutput.dataset.playheadSection = activeCell?.section || "";
    this.lastPlayheadHighlightStep = nextStep;
    this.revealPlaybackStep(nextStep);
  }

  revealPlaybackStep(stepIndex) {
    if (!this.playTimer || !this.gridOutput || !this.timelineCanvasRenderer) {
      return;
    }
    const snapshot = this.timelineCanvasRenderer.snapshot();
    const stepX = snapshot.axisWidth + stepIndex * snapshot.cellSize;
    const left = this.gridOutput.scrollLeft;
    const right = left + this.gridOutput.clientWidth;
    const margin = Math.max(snapshot.cellSize * 2, 48);
    if (stepX >= left + snapshot.axisWidth + margin && stepX + snapshot.cellSize <= right - margin) {
      return;
    }
    const nextLeft = Math.max(0, stepX - snapshot.axisWidth - Math.round(this.gridOutput.clientWidth * 0.25));
    this.gridOutput.scrollLeft = nextLeft;
    if (this.timelineScrollProxy) {
      this.timelineScrollProxy.scrollLeft = nextLeft;
    }
    this.syncTimelineScrollState();
  }

  updateLoopRegion() {
    const bounds = this.selectedLoopBounds();
    if (!bounds.ok) {
      this.loopBounds = null;
      this.renderCanvasTimeline();
      return bounds;
    }
    this.loopBounds = bounds;
    this.renderCanvasTimeline();
    return bounds;
  }

  updateSelectedSectionRegion() {
    const section = this.sectionByLabel(this.sectionSelect.value);
    if (!section) {
      this.selectedSectionBounds = null;
      this.renderCanvasTimeline();
      return null;
    }
    this.selectedSectionBounds = section;
    this.renderCanvasTimeline();
    return section;
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

  sectionByLabelOccurrence(label, occurrenceIndex = null) {
    const normalized = String(label || "").trim().toLowerCase();
    if (!normalized || !this.currentResult?.sections?.length) {
      return null;
    }
    if (Number.isInteger(occurrenceIndex)) {
      const section = this.currentResult.sections[occurrenceIndex] || null;
      if (section?.label.toLowerCase() === normalized) {
        return section;
      }
    }
    return this.sectionByLabel(label);
  }

  displaySectionLabel(label) {
    const value = String(label || "").trim();
    return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "(none)";
  }
}
