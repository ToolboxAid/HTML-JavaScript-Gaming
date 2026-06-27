import { sectionTone, sectionToneRgba } from "../sectionColors.js";
import { setUnwiredControlState } from "./UnwiredControlState.js";

const NAMED_SECTION_LABELS = ["Intro", "Verse", "Chorus", "Bridge", "Outro"];
const SECTION_TEMPLATES = {
  Intro: "C F G C",
  Verse: "C Am F G",
  Chorus: "F G C C",
  Bridge: "Dm G Em Am",
  Outro: "F G C"
};
const ARRANGEMENT_TEMPLATES = {
  "intro-verse-chorus-outro": ["Intro", "Verse", "Chorus", "Outro"],
  "intro-verse-chorus-verse-chorus-outro": ["Intro", "Verse", "Chorus", "Verse", "Chorus", "Outro"],
  "intro-verse-chorus-bridge-chorus-outro": ["Intro", "Verse", "Chorus", "Bridge", "Chorus", "Outro"]
};
const DEFAULT_CLASSIFICATION_WORKFLOW = {
  generationHints: "Use balanced Chords/Pad and Bass first; enable Drums or Lead when the arrangement needs motion.",
  instrumentSuggestions: "Warm Pad, Synth Bass, Basic Drums, Retro Lead",
  sectionTemplates: SECTION_TEMPLATES,
  summary: "General game music defaults"
};
const CLASSIFICATION_WORKFLOWS = {
  ambient: {
    generationHints: "Favor Chords/Pad and Bass; keep Drums off unless the cue needs pulse.",
    instrumentSuggestions: "Warm Pad, Soft Bass, Airy Lead",
    sectionTemplates: { Intro: "C G Am F", Verse: "Am F C G", Chorus: "F C G Am", Bridge: "Dm Am F G", Outro: "F G C" },
    summary: "Ambient defaults"
  },
  boss: {
    generationHints: "Enable Bass and Drums for pressure; add Lead for a hook after the first pass.",
    instrumentSuggestions: "Aggressive Bass, Basic Drums, Brass Hit, Retro Lead",
    sectionTemplates: { Intro: "Em C D Em", Verse: "Em G D C", Chorus: "C D Em Em", Bridge: "Am C B Em", Outro: "Em D C Em" },
    summary: "Boss defaults"
  },
  chase: {
    generationHints: "Use short looping sections with Bass and Drums enabled.",
    instrumentSuggestions: "Synth Bass, Basic Drums, Pulse Lead",
    sectionTemplates: { Intro: "Am G F E", Verse: "Am Am G E", Chorus: "F G Am Am", Bridge: "Dm E F E", Outro: "Am G Am" },
    summary: "Chase defaults"
  },
  flying: {
    generationHints: "Use brighter Chords/Pad and Lead; keep Bass supportive.",
    instrumentSuggestions: "Bright Pad, Air Lead, Light Bass",
    sectionTemplates: { Intro: "C G D G", Verse: "G D Em C", Chorus: "C G Am D", Bridge: "Em C G D", Outro: "C D G" },
    summary: "Flying defaults"
  },
  loop: {
    generationHints: "Keep all populated sections short and use sequence duplication for build order.",
    instrumentSuggestions: "Warm Pad, Synth Bass, Basic Drums, optional Lead",
    sectionTemplates: { Intro: "C G", Verse: "C Am F G", Chorus: "F G C C", Bridge: "Dm G Em Am", Outro: "G F C" },
    summary: "Loop defaults"
  },
  menu: {
    generationHints: "Favor Chords/Pad and gentle Bass; keep Lead disabled unless the menu needs a motif.",
    instrumentSuggestions: "Soft Pad, Light Bass, Bell Lead",
    sectionTemplates: { Intro: "C F G C", Verse: "C G Am F", Chorus: "F C G C", Bridge: "Dm G C Am", Outro: "F G C" },
    summary: "Menu defaults"
  },
  puzzle: {
    generationHints: "Use sparse Chords/Pad and Bass; add Lead only for a repeating clue motif.",
    instrumentSuggestions: "Pluck Lead, Warm Pad, Soft Bass",
    sectionTemplates: { Intro: "Am C G Am", Verse: "Am Dm G C", Chorus: "F G Em Am", Bridge: "Dm F E Am", Outro: "Am G Am" },
    summary: "Puzzle defaults"
  },
  underwater: {
    generationHints: "Favor Chords/Pad and slow Bass; keep Drums light or disabled.",
    instrumentSuggestions: "Warm Pad, Soft Bass, Bell Lead",
    sectionTemplates: { Intro: "Dm Gm A Dm", Verse: "Dm Bb C Dm", Chorus: "Bb C Dm Dm", Bridge: "Gm Dm A Dm", Outro: "Bb A Dm" },
    summary: "Underwater defaults"
  },
  victory: {
    generationHints: "Use Chords/Pad, Bass, and Lead for a bright cadence.",
    instrumentSuggestions: "Brass Lead, Warm Pad, Round Bass",
    sectionTemplates: { Intro: "C G C", Verse: "C F G C", Chorus: "F G C C", Bridge: "Am F G C", Outro: "F G C" },
    summary: "Victory defaults"
  }
};

function fieldToken(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitList(value) {
  return String(value || "")
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function chordTokenCount(value) {
  return String(value || "")
    .replace(/[|,;]/g, " ")
    .split(/\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .length;
}

function estimatedSectionSeconds(chordCount, tempo) {
  const numericTempo = Number(tempo);
  if (!Number.isFinite(numericTempo) || numericTempo <= 0 || !Number.isFinite(chordCount) || chordCount <= 0) {
    return 0;
  }
  return Number(((chordCount * 4 * 60) / numericTempo).toFixed(3));
}

function formatDuration(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) {
    return "0 seconds";
  }
  return `${value} second${value === 1 ? "" : "s"}`;
}

function sectionMetricsLabel(section, count = chordTokenCount(section.chords)) {
  const barText = `${count} bar${count === 1 ? "" : "s"}`;
  const chordText = `${count} chord${count === 1 ? "" : "s"}`;
  return `${section.label} - ${barText} / ${chordText}`;
}

function sectionEditorMetricsLabel(section, tempo) {
  const count = chordTokenCount(section.chords);
  if (!count) {
    return "Empty - add chords to populate Available Sections.";
  }
  return `${section.chords} | ${count} bar${count === 1 ? "" : "s"} | ${formatDuration(estimatedSectionSeconds(count, tempo))}`;
}

function normalizedLabelKey(label) {
  return String(label || "").trim().toLowerCase();
}

function classificationWorkflowFor(classification) {
  const key = normalizedLabelKey(classification).replace(/\s+/g, "-");
  return {
    ...DEFAULT_CLASSIFICATION_WORKFLOW,
    ...(CLASSIFICATION_WORKFLOWS[key] || {}),
    classification: String(classification || "").trim() || "General",
    sectionTemplates: {
      ...SECTION_TEMPLATES,
      ...(CLASSIFICATION_WORKFLOWS[key]?.sectionTemplates || {})
    }
  };
}

function sectionRowsFromText(sourceText = "") {
  const rows = [];
  String(sourceText || "")
    .split(/[\n;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const bracketMatch = entry.match(/^\[([^\]]+)\]\s*(.*)$/);
      const separatorIndex = entry.indexOf(":");
      const label = bracketMatch
        ? bracketMatch[1].trim()
        : separatorIndex >= 0
          ? entry.slice(0, separatorIndex).trim()
          : "";
      const chords = bracketMatch
        ? bracketMatch[2].trim()
        : separatorIndex >= 0
          ? entry.slice(separatorIndex + 1).trim()
          : entry.trim();
      if (label) {
        rows.push({ chords, label });
      }
    });
  return rows;
}

function songSheetRows(result, generationSummary = null) {
  if (!result?.ok) {
    return [
      ["Sections", "not parsed"],
      ["Sequence", "not parsed"],
      ["Bars", "not parsed"],
      ["Chord count", "not parsed"],
      ["Estimated duration", "not parsed"],
      ["Sections used", "not generated"],
      ["Generated bars", "not generated"],
      ["Generated notes", "not generated"],
      ["Generated instruments", "not generated"],
      ["Bars generated", "not generated"],
      ["Notes generated", "not generated"],
      ["Generation targets", "not generated"],
      ["Lane mapping", "not generated"],
      ["Manual lanes preserved", "not generated"],
      ["Generated notes before regeneration", "not checked"],
      ["Manual notes before regeneration", "not checked"],
      ["Regeneration protection", "not checked"],
      ["Target lanes affected", "not generated"]
    ];
  }
  const summary = generationSummary || {};
  return [
    ["Sections", result.sectionSummary],
    ["Sequence", result.sequence?.length ? result.sequence.join(", ") : result.sections.map((section) => section.label).join(", ")],
    ["Bars", result.bars],
    ["Chord count", result.chordCount],
    ["Estimated duration", `${result.estimatedDurationSeconds} seconds`],
    ["Sections used", summary.sectionsUsed || "not generated"],
    ["Generated bars", summary.barsGenerated ?? "not generated"],
    ["Generated notes", summary.notesGenerated ?? "not generated"],
    ["Generated instruments", summary.generatedInstruments || "not generated"],
    ["Bars generated", summary.barsGenerated ?? "not generated"],
    ["Notes generated", summary.notesGenerated ?? "not generated"],
    ["Generation targets", summary.generationTargets || "not generated"],
    ["Lane mapping", summary.laneMapping || "not generated"],
    ["Manual lanes preserved", summary.manualLanesPreserved || "not generated"],
    ["Generated notes before regeneration", summary.generatedNotesBeforeRegeneration ?? "not checked"],
    ["Manual notes before regeneration", summary.manualNotesBeforeRegeneration ?? "not checked"],
    ["Regeneration protection", summary.regenerationProtection || "not checked"],
    ["Target lanes affected", summary.targetLanesAffected || "not generated"]
  ];
}

function warningRows(result) {
  if (!result?.ok) {
    const message = result?.message || "No Song Sheet parsed.";
    return [
      ["Parse warnings", "none"],
      ["Section warnings", "none"],
      ["Song Sheet warnings", "none"],
      ["Validation warnings", message]
    ];
  }
  const warnings = Array.isArray(result.warnings) ? result.warnings : [];
  const sectionWarnings = warnings.filter((warning) => /^Section\s/i.test(String(warning)));
  return [
    ["Parse warnings", result.warningSummary || "none"],
    ["Section warnings", sectionWarnings.length ? sectionWarnings.join("; ") : "none"],
    ["Song Sheet warnings", result.warningSummary || "none"],
    ["Validation warnings", "none"]
  ];
}

export class SongSheetControl {
  constructor({
    addCustomSectionButton,
    addSequenceButton,
    applyArrangementTemplateButton,
    applyBassInput,
    applyChordsPadInput,
    applyDrumsInput,
    applyLeadInput,
    applyTemplateButton,
    arrangementTemplateSelect,
    arrangementTemplateSummary,
    availableCount,
    availableSectionsList,
    classificationGuide,
    customSectionMetrics,
    customSectionsInput,
    duplicateSectionButton,
    duplicateSequenceButton,
    keyInput,
    loadSectionButton,
    moveSequenceDownButton,
    moveSequenceUpButton,
    namedSectionInputs,
    parseButton,
    regenerateButton,
    removeSequenceButton,
    saveSectionButton,
    sequenceCount,
    sequenceSummary,
    sectionLibrarySelect,
    sectionLibrarySummary,
    sectionMetricOutputs,
    sectionsInput,
    sequenceInput,
    sequenceList,
    styleInput,
    summary,
    templatePreview,
    templateSectionSelect,
    tempoInput,
    warnings
  }) {
    this.addCustomSectionButton = addCustomSectionButton;
    this.addSequenceButton = addSequenceButton;
    this.applyArrangementTemplateButton = applyArrangementTemplateButton;
    this.applyBassInput = applyBassInput;
    this.applyChordsPadInput = applyChordsPadInput;
    this.applyDrumsInput = applyDrumsInput;
    this.applyLeadInput = applyLeadInput;
    this.applyTemplateButton = applyTemplateButton;
    this.arrangementTemplateSelect = arrangementTemplateSelect;
    this.arrangementTemplateSummary = arrangementTemplateSummary;
    this.availableCount = availableCount;
    this.availableSectionsList = availableSectionsList;
    this.classificationGuide = classificationGuide;
    this.customSectionMetrics = customSectionMetrics;
    this.customSectionsInput = customSectionsInput;
    this.duplicateSectionButton = duplicateSectionButton;
    this.duplicateSequenceButton = duplicateSequenceButton;
    this.keyInput = keyInput;
    this.loadSectionButton = loadSectionButton;
    this.moveSequenceDownButton = moveSequenceDownButton;
    this.moveSequenceUpButton = moveSequenceUpButton;
    this.namedSectionInputs = namedSectionInputs || {};
    this.parseButton = parseButton;
    this.regenerateButton = regenerateButton;
    this.removeSequenceButton = removeSequenceButton;
    this.saveSectionButton = saveSectionButton;
    this.sequenceCount = sequenceCount;
    this.sequenceSummary = sequenceSummary;
    this.sectionLibrarySelect = sectionLibrarySelect;
    this.sectionLibrarySummary = sectionLibrarySummary;
    this.sectionMetricOutputs = sectionMetricOutputs || {};
    this.sectionsInput = sectionsInput;
    this.sequenceInput = sequenceInput;
    this.sequenceList = sequenceList;
    this.styleInput = styleInput;
    this.summary = summary;
    this.templatePreview = templatePreview;
    this.templateSectionSelect = templateSectionSelect;
    this.tempoInput = tempoInput;
    this.warnings = warnings;
    this.defaultRegenerateLabel = regenerateButton?.textContent || "Regenerate Arrangement";
    this.classificationWorkflow = classificationWorkflowFor("");
    this.regenerationPending = false;
    this.sectionLibraryAssets = [];
    this.userEditedSequence = false;
  }

  mount({ onFieldChange = () => {}, onMetadataChange = () => {}, onParse, onRegenerate = onParse, onSectionLibraryAction = () => {}, onSequenceSelect = () => {}, onTemplateApply = () => {} }) {
    this.initializeTemplateLibrary();
    this.initializeArrangementTemplates();
    this.parseButton.addEventListener("click", () => {
      this.setRegenerationPending(false);
      onParse(this.composeGuidedSheet());
    });
    this.regenerateButton.addEventListener("click", () => onRegenerate(this.composeGuidedSheet()));
    this.tempoInput.addEventListener("input", () => {
      this.renderSectionMetrics(this.availableSections());
      onMetadataChange("tempo", this.tempoInput.value);
    });
    this.keyInput.addEventListener("change", () => onMetadataChange("key", this.keyInput.value));
    this.styleInput.addEventListener("change", () => onMetadataChange("style", this.styleInput.value));

    Object.values(this.namedSectionInputs).forEach((input) => {
      input.addEventListener("input", () => {
        this.setRegenerationPending(false);
        this.refreshSectionBuilder();
        onFieldChange("sections", this.sectionsInput.value);
      });
    });
    this.customSectionsInput.addEventListener("input", () => {
      this.setRegenerationPending(false);
      this.refreshSectionBuilder();
      onFieldChange("sections", this.sectionsInput.value);
    });
    this.addCustomSectionButton.addEventListener("click", () => {
      this.setRegenerationPending(false);
      this.addCustomSection();
      onFieldChange("sections", this.sectionsInput.value);
    });
    this.templateSectionSelect?.addEventListener("change", () => this.updateTemplatePreview());
    this.applyTemplateButton?.addEventListener("click", () => {
      const applied = this.applySelectedSectionTemplate();
      if (!applied.ok) {
        return;
      }
      this.setRegenerationPending(false);
      onTemplateApply(applied);
      onFieldChange("sections", this.sectionsInput.value);
    });
    this.sectionLibrarySelect?.addEventListener("change", () => this.renderSectionLibrarySummary());
    this.saveSectionButton?.addEventListener("click", () => {
      const saved = this.saveSelectedSectionAsset();
      onSectionLibraryAction(saved);
      if (saved.ok) {
        this.setRegenerationPending(false);
      }
    });
    this.loadSectionButton?.addEventListener("click", () => {
      const loaded = this.loadSelectedSectionAsset();
      onSectionLibraryAction(loaded);
      if (!loaded.ok) {
        return;
      }
      this.setRegenerationPending(false);
      onFieldChange("sections", this.sectionsInput.value);
    });
    this.duplicateSectionButton?.addEventListener("click", () => {
      const duplicated = this.duplicateSelectedSectionAsset();
      onSectionLibraryAction(duplicated);
      if (!duplicated.ok) {
        return;
      }
      this.setRegenerationPending(false);
      onFieldChange("sections", this.sectionsInput.value);
    });
    this.arrangementTemplateSelect?.addEventListener("change", () => this.renderArrangementTemplateSummary());
    this.applyArrangementTemplateButton?.addEventListener("click", () => {
      const applied = this.applySelectedArrangementTemplate();
      if (!applied.ok) {
        return;
      }
      this.setRegenerationPending(false);
      onSequenceSelect(this.selectedSequenceDetail());
      onFieldChange("sequence", this.sequenceInput.value);
    });

    this.addSequenceButton.addEventListener("click", () => {
      const selected = this.availableSectionsList.selectedOptions[0];
      if (!selected) {
        return;
      }
      this.setRegenerationPending(false);
      this.appendSequenceLabel(selected.value);
      this.userEditedSequence = true;
      this.syncSequenceState();
      onFieldChange("sequence", this.sequenceInput.value);
    });
    this.sequenceList.addEventListener("change", () => {
      this.syncSequenceState();
      onSequenceSelect(this.selectedSequenceDetail());
    });
    this.moveSequenceUpButton.addEventListener("click", () => {
      this.setRegenerationPending(false);
      this.moveSelectedSequenceItem(-1);
      onSequenceSelect(this.selectedSequenceDetail());
      onFieldChange("sequence", this.sequenceInput.value);
    });
    this.moveSequenceDownButton.addEventListener("click", () => {
      this.setRegenerationPending(false);
      this.moveSelectedSequenceItem(1);
      onSequenceSelect(this.selectedSequenceDetail());
      onFieldChange("sequence", this.sequenceInput.value);
    });
    this.duplicateSequenceButton.addEventListener("click", () => {
      this.setRegenerationPending(false);
      this.duplicateSelectedSequenceItem();
      onSequenceSelect(this.selectedSequenceDetail());
      onFieldChange("sequence", this.sequenceInput.value);
    });
    this.removeSequenceButton.addEventListener("click", () => {
      this.setRegenerationPending(false);
      this.removeSelectedSequenceItem();
      onSequenceSelect(this.selectedSequenceDetail());
      onFieldChange("sequence", this.sequenceInput.value);
    });

    [this.applyChordsPadInput, this.applyBassInput, this.applyDrumsInput, this.applyLeadInput].forEach((input) => {
      input.addEventListener("change", () => {
        this.setRegenerationPending(false);
        onFieldChange("applyTargets", this.applyTargets());
      });
    });
    this.setApplyTargets(null, { hasDrums: true });
    this.applyClassificationWorkflow("");
    this.refreshSectionBuilder({ preserveSequence: false });
    this.renderSectionLibrary();
    this.renderArrangementTemplateSummary();
  }

  applyClassificationWorkflow(classification) {
    this.classificationWorkflow = classificationWorkflowFor(classification);
    this.initializeTemplateLibrary();
    this.renderClassificationGuide();
    this.updateTemplatePreview();
    return this.classificationWorkflow;
  }

  renderClassificationGuide() {
    if (!this.classificationGuide) {
      return;
    }
    const workflow = this.classificationWorkflow || classificationWorkflowFor("");
    this.classificationGuide.value = `${workflow.summary}: ${workflow.instrumentSuggestions}. ${workflow.generationHints}`;
    this.classificationGuide.textContent = this.classificationGuide.value;
    this.classificationGuide.dataset.classificationWorkflow = workflow.classification;
    this.classificationGuide.dataset.classificationInstrumentSuggestions = workflow.instrumentSuggestions;
    this.classificationGuide.dataset.classificationGenerationHints = workflow.generationHints;
  }

  initializeTemplateLibrary() {
    if (!this.templateSectionSelect) {
      return;
    }
    Array.from(this.templateSectionSelect.options).forEach((option) => {
      const label = option.value || option.textContent;
      option.dataset.songSheetTemplateSection = label;
      option.dataset.songSheetTemplateChords = this.templateChordsFor(label);
    });
    this.updateTemplatePreview();
  }

  templateChordsFor(label) {
    return this.classificationWorkflow?.sectionTemplates?.[label] || SECTION_TEMPLATES[label] || "";
  }

  updateTemplatePreview() {
    if (!this.templatePreview || !this.templateSectionSelect) {
      return;
    }
    const label = this.templateSectionSelect.value || NAMED_SECTION_LABELS[0];
    const chords = this.templateChordsFor(label);
    this.templatePreview.textContent = `${label} template: ${chords || "not available"}`;
    this.templatePreview.dataset.songSheetTemplatePreview = label;
    this.templatePreview.dataset.songSheetTemplateChords = chords;
    this.templatePreview.dataset.songSheetTemplateClassification = this.classificationWorkflow?.classification || "General";
    setUnwiredControlState(this.applyTemplateButton, {
      active: !chords,
      detail: `${label} template is not complete for ${this.classificationWorkflow?.classification || "General"}.`,
      status: "Incomplete template"
    });
  }

  applySelectedSectionTemplate() {
    const label = this.templateSectionSelect?.value || NAMED_SECTION_LABELS[0];
    const chords = this.templateChordsFor(label);
    const input = this.namedSectionInputs[label];
    if (!input || !chords) {
      return { ok: false, message: `No section template is available for ${label || "(none)"}.` };
    }
    const existing = String(input.value || "").trim();
    input.value = existing ? `${existing} ${chords}` : chords;
    this.refreshSectionBuilder();
    input.focus();
    return { chords, insertedIntoPopulated: Boolean(existing), label, ok: true };
  }

  initializeArrangementTemplates() {
    if (!this.arrangementTemplateSelect) {
      return;
    }
    Array.from(this.arrangementTemplateSelect.options).forEach((option) => {
      const labels = ARRANGEMENT_TEMPLATES[option.value] || [];
      option.dataset.songSheetArrangementTemplate = option.value;
      option.dataset.songSheetArrangementSequence = labels.join(", ");
    });
  }

  selectedArrangementTemplate() {
    const value = this.arrangementTemplateSelect?.value || Object.keys(ARRANGEMENT_TEMPLATES)[0];
    return {
      labels: ARRANGEMENT_TEMPLATES[value] || [],
      value
    };
  }

  renderArrangementTemplateSummary(message = "") {
    if (!this.arrangementTemplateSummary) {
      return;
    }
    const template = this.selectedArrangementTemplate();
    const available = new Set(this.availableSections().map((section) => normalizedLabelKey(section.label)));
    const missing = template.labels.filter((label) => !available.has(normalizedLabelKey(label)));
    const summary = message || (missing.length
      ? `Needs populated sections: ${missing.join(", ")}`
      : template.labels.join(", "));
    this.arrangementTemplateSummary.value = summary;
    this.arrangementTemplateSummary.textContent = summary;
    this.arrangementTemplateSummary.dataset.songSheetArrangementTemplate = template.value;
    this.arrangementTemplateSummary.dataset.songSheetArrangementSequence = template.labels.join(", ");
    this.arrangementTemplateSummary.dataset.songSheetArrangementMissing = missing.join(", ");
    if (this.applyArrangementTemplateButton) {
      this.applyArrangementTemplateButton.disabled = missing.length > 0 || template.labels.length === 0;
      this.applyArrangementTemplateButton.dataset.songSheetArrangementTemplateReady = String(!this.applyArrangementTemplateButton.disabled);
    }
  }

  applySelectedArrangementTemplate() {
    const template = this.selectedArrangementTemplate();
    const available = new Set(this.availableSections().map((section) => normalizedLabelKey(section.label)));
    const missing = template.labels.filter((label) => !available.has(normalizedLabelKey(label)));
    if (!template.labels.length || missing.length) {
      this.renderArrangementTemplateSummary(`Cannot apply template; populate ${missing.join(", ") || "required sections"}.`);
      return { ok: false };
    }
    this.setSequenceLabels(template.labels);
    this.userEditedSequence = true;
    this.syncSequenceState();
    this.renderArrangementTemplateSummary(`Applied: ${template.labels.join(", ")}`);
    return { labels: template.labels, ok: true, value: template.value };
  }

  selectedAvailableSection() {
    const selected = this.availableSectionsList?.selectedOptions?.[0] || this.availableSectionsList?.options?.[0] || null;
    if (!selected) {
      return null;
    }
    return {
      chords: selected.dataset.songSheetSectionChords || "",
      label: selected.value
    };
  }

  selectedSectionAsset() {
    const id = this.sectionLibrarySelect?.value || "";
    return this.sectionLibraryAssets.find((asset) => asset.id === id) || null;
  }

  saveSelectedSectionAsset() {
    const section = this.selectedAvailableSection();
    if (!section?.label || !section.chords) {
      const message = "Save Section failed: choose a populated Available Section before saving.";
      this.renderSectionLibrarySummary(message);
      return { action: "save", message, ok: false };
    }
    const asset = {
      chords: section.chords,
      id: this.nextSectionAssetId(section.label),
      label: section.label
    };
    this.sectionLibraryAssets.push(asset);
    const message = `Saved section asset: ${asset.label}.`;
    this.renderSectionLibrary(asset.id, message);
    return { action: "save", asset, message, ok: true };
  }

  loadSelectedSectionAsset() {
    const asset = this.selectedSectionAsset();
    if (!asset) {
      const message = "Load Section failed: choose a saved section asset before loading.";
      this.renderSectionLibrarySummary(message);
      return { action: "load", message, ok: false };
    }
    if (!String(asset.chords || "").trim()) {
      const message = `Load Section failed: ${asset.label || asset.id} is empty and cannot populate the Song Sheet.`;
      this.renderSectionLibrarySummary(message);
      return { action: "load", message, ok: false };
    }
    this.applySectionAssetToEditor(asset);
    this.refreshSectionBuilder();
    const message = `Loaded section asset: ${asset.label}.`;
    this.renderSectionLibrary(asset.id, message);
    return { action: "load", asset, message, ok: true };
  }

  duplicateSelectedSectionAsset() {
    const asset = this.selectedSectionAsset();
    if (!asset) {
      const message = "Duplicate Section failed: choose a saved section asset before duplicating.";
      this.renderSectionLibrarySummary(message);
      return { action: "duplicate", message, ok: false };
    }
    if (!String(asset.chords || "").trim()) {
      const message = `Duplicate Section failed: ${asset.label || asset.id} is empty and cannot be saved as a reusable section.`;
      this.renderSectionLibrarySummary(message);
      return { action: "duplicate", message, ok: false };
    }
    const label = this.nextReusableSectionLabel(asset.label);
    const duplicate = {
      chords: asset.chords,
      id: this.nextSectionAssetId(label),
      label
    };
    this.upsertCustomSection(label, asset.chords);
    this.sectionLibraryAssets.push(duplicate);
    this.refreshSectionBuilder();
    const message = `Duplicated section asset: ${label}.`;
    this.renderSectionLibrary(duplicate.id, message);
    return { action: "duplicate", asset: duplicate, message, ok: true };
  }

  applySectionAssetToEditor(asset) {
    const namedLabel = NAMED_SECTION_LABELS.find((label) => normalizedLabelKey(label) === normalizedLabelKey(asset.label));
    if (namedLabel) {
      this.namedSectionInputs[namedLabel].value = asset.chords;
      return;
    }
    this.upsertCustomSection(asset.label, asset.chords);
  }

  upsertCustomSection(label, chords) {
    const normalized = normalizedLabelKey(label);
    const rows = sectionRowsFromText(this.customSectionsInput.value);
    const index = rows.findIndex((section) => normalizedLabelKey(section.label) === normalized);
    if (index >= 0) {
      rows[index] = { chords, label };
    } else {
      rows.push({ chords, label });
    }
    this.customSectionsInput.value = this.sectionsTextFromRows(rows);
  }

  nextReusableSectionLabel(label) {
    const base = `${String(label || "Section").replace(/[^A-Za-z0-9_-]+/g, "") || "Section"}Copy`;
    const labels = new Set([
      ...this.availableSections().map((section) => normalizedLabelKey(section.label)),
      ...this.sectionLibraryAssets.map((asset) => normalizedLabelKey(asset.label))
    ]);
    let index = 1;
    let candidate = `${base}${index}`;
    while (labels.has(normalizedLabelKey(candidate))) {
      index += 1;
      candidate = `${base}${index}`;
    }
    return candidate;
  }

  nextSectionAssetId(label) {
    const base = fieldToken(label) || "section";
    let index = this.sectionLibraryAssets.length + 1;
    let id = `${base}-${index}`;
    const ids = new Set(this.sectionLibraryAssets.map((asset) => asset.id));
    while (ids.has(id)) {
      index += 1;
      id = `${base}-${index}`;
    }
    return id;
  }

  renderSectionLibrary(selectedId = this.sectionLibrarySelect?.value || "", message = "") {
    if (!this.sectionLibrarySelect) {
      return;
    }
    this.sectionLibrarySelect.replaceChildren();
    this.sectionLibraryAssets.forEach((asset) => {
      const option = document.createElement("option");
      const chordCount = chordTokenCount(asset.chords);
      option.value = asset.id;
      option.textContent = `${asset.label} - ${chordCount} bar${chordCount === 1 ? "" : "s"}`;
      option.dataset.songSheetSectionAssetLabel = asset.label;
      option.dataset.songSheetSectionAssetChords = asset.chords;
      option.dataset.songSheetSectionAssetBarCount = String(chordCount);
      this.sectionLibrarySelect.append(option);
    });
    if (selectedId && this.sectionLibraryAssets.some((asset) => asset.id === selectedId)) {
      this.sectionLibrarySelect.value = selectedId;
    } else if (this.sectionLibrarySelect.options.length) {
      this.sectionLibrarySelect.selectedIndex = 0;
    }
    this.renderSectionLibrarySummary(message);
  }

  renderSectionLibrarySummary(message = "") {
    if (!this.sectionLibrarySummary) {
      return;
    }
    const count = this.sectionLibraryAssets.length;
    const selected = this.selectedSectionAsset();
    const summary = message || (selected
      ? `${count} saved section asset${count === 1 ? "" : "s"}; selected ${selected.label}`
      : `${count} saved section asset${count === 1 ? "" : "s"}`);
    this.sectionLibrarySummary.value = summary;
    this.sectionLibrarySummary.textContent = summary;
    this.sectionLibrarySummary.dataset.songSheetSectionLibraryCount = String(count);
    this.sectionLibrarySummary.dataset.songSheetSelectedSectionAsset = selected?.label || "";
    if (this.saveSectionButton) {
      this.saveSectionButton.disabled = this.availableSections().length === 0;
    }
    if (this.loadSectionButton) {
      this.loadSectionButton.disabled = count === 0;
    }
    if (this.duplicateSectionButton) {
      this.duplicateSectionButton.disabled = count === 0;
    }
  }

  setRegenerationPending(isPending) {
    this.regenerationPending = isPending === true;
    if (!this.regenerateButton) {
      return;
    }
    this.regenerateButton.dataset.regenerationPending = String(this.regenerationPending);
    this.regenerateButton.textContent = this.regenerationPending
      ? "Confirm Regenerate Arrangement"
      : this.defaultRegenerateLabel;
  }

  applyGuidedDefaults({ applyTargets, hasDrums = false, intro, key, loop, sections, sequence, style, tempo }) {
    this.tempoInput.value = tempo || "";
    this.keyInput.value = key || "";
    this.styleInput.value = style || "";
    this.applySectionText(sections || this.sectionsTextFromLegacy({ intro, loop }));
    this.userEditedSequence = Boolean(sequence);
    this.refreshSectionBuilder({ preserveSequence: false });
    const sequenceLabels = splitList(sequence);
    if (sequenceLabels.length) {
      this.setSequenceLabels(sequenceLabels);
    } else {
      this.setSequenceLabels(this.availableSections().map((section) => section.label));
    }
    this.setApplyTargets(applyTargets, { hasDrums });
    this.syncSequenceState();
  }

  applySectionText(sourceText = "") {
    const rows = sectionRowsFromText(sourceText);
    const usedNamedKeys = new Set();
    NAMED_SECTION_LABELS.forEach((label) => {
      const match = rows.find((row) => normalizedLabelKey(row.label) === normalizedLabelKey(label));
      this.namedSectionInputs[label].value = match?.chords || "";
      if (match) {
        usedNamedKeys.add(normalizedLabelKey(match.label));
      }
    });
    this.customSectionsInput.value = rows
      .filter((row) => !usedNamedKeys.has(normalizedLabelKey(row.label)))
      .map((row) => `${row.label}: ${row.chords}`)
      .join("\n");
  }

  sectionsTextFromLegacy({ intro, loop } = {}) {
    const rows = [];
    if (String(intro || "").trim()) {
      rows.push(`Intro: ${String(intro).trim()}`);
    }
    if (String(loop || "").trim()) {
      rows.push(`Loop: ${String(loop).trim()}`);
    }
    return rows.join("\n");
  }

  composeGuidedSheet() {
    const tempo = this.tempoInput.value.trim();
    const key = this.keyInput.value.trim();
    const style = this.styleInput.value.trim();
    const numericTempo = Number(tempo);
    if (!Number.isFinite(numericTempo) || numericTempo <= 0) {
      return {
        message: "Invalid tempo/BPM. Enter a positive number in Song Details before parsing the Song Sheet.",
        ok: false
      };
    }
    if (!key) {
      return {
        message: "Missing key. Enter a key in Song Details before parsing the Song Sheet.",
        ok: false
      };
    }
    const sections = this.structuredSections();
    if (!sections.ok) {
      return sections;
    }
    const sequence = this.sequenceLabels(sections.rows);
    if (!sequence.ok) {
      return sequence;
    }
    const lines = [`tempo=${tempo}`, `key=${key}`];
    if (style) {
      lines.push(`style=${style}`);
    }
    lines.push(`sequence=${sequence.labels.join(", ")}`);
    sections.rows.forEach((section) => {
      lines.push("", `[${section.label}]`, section.chords);
    });
    return {
      applyTargets: this.applyTargets(),
      ok: true,
      sequence: sequence.labels,
      sequenceText: sequence.labels.join(", "),
      sectionsText: this.sectionsInput.value.trim(),
      sourceText: lines.join("\n")
    };
  }

  structuredSections() {
    const rows = this.availableSections();
    if (!rows.length) {
      return { ok: false, message: "Song Sheet must include at least one populated musical section." };
    }
    const duplicate = rows.find((row, index) => rows.findIndex((entry) => normalizedLabelKey(entry.label) === normalizedLabelKey(row.label)) !== index);
    if (duplicate) {
      return { ok: false, message: `Duplicate musical section definition: ${duplicate.label}` };
    }
    const malformed = rows.find((row) => !/^[A-Za-z][A-Za-z0-9_-]*$/.test(row.label));
    if (malformed) {
      return { ok: false, message: `Malformed section label in Song Sheet Sections: ${malformed.label || "(empty)"}` };
    }
    return { ok: true, rows };
  }

  availableSections() {
    const rows = [];
    NAMED_SECTION_LABELS.forEach((label) => {
      const chords = String(this.namedSectionInputs[label]?.value || "").trim();
      if (chords) {
        rows.push({ chords, label });
      }
    });
    sectionRowsFromText(this.customSectionsInput.value)
      .filter((section) => section.chords.trim())
      .forEach((section) => rows.push(section));
    return rows;
  }

  addCustomSection() {
    const label = this.nextCustomSectionLabel();
    const prefix = this.customSectionsInput.value.trim() ? `${this.customSectionsInput.value.trimEnd()}\n` : "";
    this.customSectionsInput.value = `${prefix}${label}: `;
    this.refreshSectionBuilder();
    this.customSectionsInput.focus();
    this.customSectionsInput.setSelectionRange(this.customSectionsInput.value.length, this.customSectionsInput.value.length);
  }

  nextCustomSectionLabel() {
    const labels = new Set([
      ...NAMED_SECTION_LABELS.map(normalizedLabelKey),
      ...sectionRowsFromText(this.customSectionsInput.value).map((section) => normalizedLabelKey(section.label))
    ]);
    let index = 1;
    while (labels.has(normalizedLabelKey(`Custom${index}`))) {
      index += 1;
    }
    return `Custom${index}`;
  }

  refreshSectionBuilder({ preserveSequence = true } = {}) {
    const rows = this.availableSections();
    this.sectionsInput.value = this.sectionsTextFromRows(rows);
    this.renderAvailableSections(rows);
    this.renderSectionMetrics(rows);
    const availableKeys = new Set(rows.map((section) => normalizedLabelKey(section.label)));
    let labels = preserveSequence ? this.sequenceItems().filter((label) => availableKeys.has(normalizedLabelKey(label))) : [];
    if (!this.userEditedSequence && !labels.length) {
      labels = rows.map((section) => section.label);
    }
    this.setSequenceLabels(labels);
    this.renderSectionLibrary();
    this.renderArrangementTemplateSummary();
    this.syncSequenceState();
  }

  renderAvailableSections(rows) {
    const current = this.availableSectionsList.value;
    this.availableSectionsList.replaceChildren();
    if (!rows.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Populate a section to make it available.";
      option.disabled = true;
      option.selected = true;
      option.dataset.songSheetAvailableSectionsEmpty = "true";
      this.availableSectionsList.append(option);
    }
    rows.forEach((section) => {
      const option = document.createElement("option");
      option.value = section.label;
      const chordCount = chordTokenCount(section.chords);
      option.textContent = sectionMetricsLabel(section, chordCount);
      option.dataset.songSheetAvailableSection = section.label;
      option.dataset.songSheetSectionBarCount = String(chordCount);
      option.dataset.songSheetSectionChords = section.chords;
      option.dataset.songSheetSectionChordCount = String(chordCount);
      option.dataset.songSheetSectionDurationSeconds = String(estimatedSectionSeconds(chordCount, this.tempoInput.value));
      option.title = option.textContent;
      this.availableSectionsList.append(option);
    });
    if (rows.some((section) => section.label === current)) {
      this.availableSectionsList.value = current;
    } else if (rows.length) {
      this.availableSectionsList.selectedIndex = 0;
    }
    this.addSequenceButton.disabled = rows.length === 0;
    this.updateAvailableCount(rows.length);
    this.applySequenceOptionColors();
  }

  renderSectionMetrics(rows = this.availableSections()) {
    const byLabel = new Map(rows.map((section) => [normalizedLabelKey(section.label), section]));
    NAMED_SECTION_LABELS.forEach((label) => {
      const output = this.sectionMetricOutputs[label];
      if (!output) {
        return;
      }
      const section = byLabel.get(normalizedLabelKey(label)) || { chords: "", label };
      const count = chordTokenCount(section.chords);
      output.textContent = sectionEditorMetricsLabel(section, this.tempoInput.value);
      output.dataset.songSheetSectionChordCount = String(count);
      output.dataset.songSheetSectionBarCount = String(count);
      output.dataset.songSheetSectionDurationSeconds = String(estimatedSectionSeconds(count, this.tempoInput.value));
      output.dataset.songSheetSectionPopulated = String(count > 0);
    });
    if (this.customSectionMetrics) {
      const customRows = sectionRowsFromText(this.customSectionsInput.value)
        .filter((section) => section.chords.trim());
      this.customSectionMetrics.textContent = customRows.length
        ? customRows.map((section) => `${section.label}: ${sectionEditorMetricsLabel(section, this.tempoInput.value)}`).join("; ")
        : "Empty - add CustomName: C G to populate Available Sections.";
      this.customSectionMetrics.dataset.songSheetCustomSectionCount = String(customRows.length);
      this.customSectionMetrics.dataset.songSheetSectionPopulated = String(customRows.length > 0);
    }
  }

  sectionsTextFromRows(rows) {
    return rows.map((section) => `${section.label}: ${section.chords}`).join("\n");
  }

  sequenceLabels(sectionRows = []) {
    const labels = this.sequenceItems();
    const resolved = labels.length ? labels : sectionRows.map((section) => section.label);
    if (!resolved.length) {
      return { ok: false, message: "Song Sequence must include at least one populated musical section." };
    }
    const defined = new Set(sectionRows.map((section) => normalizedLabelKey(section.label)));
    const missing = resolved.find((label) => !defined.has(normalizedLabelKey(label)));
    if (missing) {
      return { ok: false, message: `Song Sequence references missing or empty musical section: ${missing}` };
    }
    return { labels: resolved, ok: true };
  }

  appendSequenceLabel(label) {
    const option = this.createSequenceOption(label);
    this.sequenceList.append(option);
    this.sequenceList.selectedIndex = this.sequenceList.options.length - 1;
  }

  createSequenceOption(label) {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    option.dataset.songSheetSequenceSection = label;
    return option;
  }

  moveSelectedSequenceItem(direction) {
    const index = this.sequenceList.selectedIndex;
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= this.sequenceList.options.length) {
      return;
    }
    const option = this.sequenceList.options[index];
    const reference = direction < 0 ? this.sequenceList.options[nextIndex] : this.sequenceList.options[nextIndex].nextSibling;
    this.sequenceList.insertBefore(option, reference);
    this.sequenceList.selectedIndex = nextIndex;
    this.userEditedSequence = true;
    this.syncSequenceState();
  }

  removeSelectedSequenceItem() {
    const index = this.sequenceList.selectedIndex;
    if (index < 0) {
      return;
    }
    this.sequenceList.options[index].remove();
    this.sequenceList.selectedIndex = Math.min(index, this.sequenceList.options.length - 1);
    this.userEditedSequence = true;
    this.syncSequenceState();
  }

  duplicateSelectedSequenceItem() {
    const index = this.sequenceList.selectedIndex;
    if (index < 0) {
      return;
    }
    const source = this.sequenceList.options[index];
    const duplicate = this.createSequenceOption(source.value);
    this.sequenceList.insertBefore(duplicate, this.sequenceList.options[index + 1] || null);
    this.sequenceList.selectedIndex = index + 1;
    this.userEditedSequence = true;
    this.syncSequenceState();
  }

  setSequenceLabels(labels) {
    this.sequenceList.replaceChildren();
    labels.forEach((label) => this.appendSequenceLabel(label));
    if (this.sequenceList.options.length) {
      this.sequenceList.selectedIndex = 0;
    }
    this.syncSequenceState();
  }

  sequenceItems() {
    return Array.from(this.sequenceList.options).map((option) => option.value);
  }

  syncSequenceState() {
    this.sequenceInput.value = this.sequenceItems().join(", ");
    const hasSelection = this.sequenceList.selectedIndex >= 0;
    const selected = hasSelection ? this.sequenceList.options[this.sequenceList.selectedIndex] : null;
    this.moveSequenceUpButton.disabled = !hasSelection || this.sequenceList.selectedIndex <= 0;
    this.moveSequenceDownButton.disabled = !hasSelection || this.sequenceList.selectedIndex >= this.sequenceList.options.length - 1;
    this.duplicateSequenceButton.disabled = !hasSelection;
    this.removeSequenceButton.disabled = !hasSelection;
    this.updateSequenceCount(this.sequenceList.options.length);
    this.updateSequenceSummary();
    this.applySequenceOptionColors();
    this.sequenceList.dataset.songSheetSelectedSection = selected?.value || "";
    this.sequenceList.dataset.songSheetSelectedSectionColorIndex = selected?.dataset.songSheetSectionColorIndex || "";
    if (selected?.style.backgroundColor) {
      this.sequenceList.style.setProperty("--midi-studio-v2-selected-section-bg", selected.style.backgroundColor);
      this.sequenceList.style.setProperty("--midi-studio-v2-selected-section-color", selected.style.color || "");
    } else {
      this.sequenceList.style.removeProperty("--midi-studio-v2-selected-section-bg");
      this.sequenceList.style.removeProperty("--midi-studio-v2-selected-section-color");
    }
  }

  updateAvailableCount(count) {
    if (!this.availableCount) {
      return;
    }
    this.availableCount.textContent = `${count} populated`;
    this.availableCount.dataset.songSheetAvailableCount = String(count);
  }

  updateSequenceCount(count) {
    if (!this.sequenceCount) {
      return;
    }
    this.sequenceCount.textContent = `${count} item${count === 1 ? "" : "s"}`;
    this.sequenceCount.dataset.songSheetSequenceCount = String(count);
  }

  updateSequenceSummary() {
    if (!this.sequenceSummary) {
      return;
    }
    const metrics = this.sequenceSummaryMetrics();
    this.sequenceSummary.value = `${metrics.sectionCount} section${metrics.sectionCount === 1 ? "" : "s"} / ${metrics.barCount} bar${metrics.barCount === 1 ? "" : "s"} / ${formatDuration(metrics.durationSeconds)}`;
    this.sequenceSummary.textContent = this.sequenceSummary.value;
    this.sequenceSummary.dataset.songSheetSequenceSectionCount = String(metrics.sectionCount);
    this.sequenceSummary.dataset.songSheetSequenceBarCount = String(metrics.barCount);
    this.sequenceSummary.dataset.songSheetSequenceDurationSeconds = String(metrics.durationSeconds);
  }

  sequenceSummaryMetrics() {
    const byLabel = new Map(this.availableSections().map((section) => [normalizedLabelKey(section.label), section]));
    return this.sequenceItems().reduce((metrics, label) => {
      const section = byLabel.get(normalizedLabelKey(label));
      const bars = section ? chordTokenCount(section.chords) : 0;
      metrics.sectionCount += 1;
      metrics.barCount += bars;
      metrics.durationSeconds += estimatedSectionSeconds(bars, this.tempoInput.value);
      metrics.durationSeconds = Number(metrics.durationSeconds.toFixed(3));
      return metrics;
    }, { barCount: 0, durationSeconds: 0, sectionCount: 0 });
  }

  sectionColorIndexMap() {
    const map = new Map();
    let nextIndex = 0;
    [...this.sequenceItems(), ...this.availableSections().map((section) => section.label)].forEach((label) => {
      const key = normalizedLabelKey(label);
      if (!key || map.has(key)) {
        return;
      }
      map.set(key, nextIndex % 5);
      nextIndex += 1;
    });
    return map;
  }

  applySequenceOptionColors() {
    const colors = this.sectionColorIndexMap();
    const selectedIndex = this.sequenceList.selectedIndex;
    const applyColor = (option, index = -1) => {
      if (!option.value) {
        option.style.removeProperty("background-color");
        option.style.removeProperty("color");
        return;
      }
      const colorIndex = colors.get(normalizedLabelKey(option.value)) ?? 0;
      option.dataset.songSheetSectionColorIndex = String(colorIndex);
      if (option.parentElement === this.sequenceList) {
        const selected = index === selectedIndex;
        option.dataset.songSheetSequenceSelected = String(selected);
        option.classList.toggle("is-selected-sequence-section", selected);
      }
      option.style.backgroundColor = sectionToneRgba(colorIndex, 0.22);
      option.style.color = sectionTone(colorIndex);
    };
    Array.from(this.availableSectionsList.options).forEach(applyColor);
    Array.from(this.sequenceList.options).forEach(applyColor);
  }

  selectSequenceItem(label, occurrenceIndex = null) {
    const options = Array.from(this.sequenceList.options);
    const normalized = normalizedLabelKey(label);
    const index = Number.isInteger(occurrenceIndex)
      ? occurrenceIndex
      : options.findIndex((option) => normalizedLabelKey(option.value) === normalized);
    const boundedIndex = index >= 0 && index < options.length && (!normalized || normalizedLabelKey(options[index].value) === normalized)
      ? index
      : options.findIndex((option) => normalizedLabelKey(option.value) === normalized);
    if (boundedIndex < 0) {
      return false;
    }
    this.sequenceList.selectedIndex = boundedIndex;
    this.syncSequenceState();
    return true;
  }

  selectedSequenceDetail() {
    const index = this.sequenceList.selectedIndex;
    const option = index >= 0 ? this.sequenceList.options[index] : null;
    return {
      colorIndex: option?.dataset.songSheetSectionColorIndex || "",
      index,
      label: option?.value || "",
      sequence: this.sequenceItems()
    };
  }

  setApplyTargets(targets = null, { hasDrums = false } = {}) {
    const normalized = targets && typeof targets === "object" ? targets : {};
    this.applyChordsPadInput.checked = normalized.chordsPad !== false;
    this.applyBassInput.checked = normalized.bass !== false;
    this.applyDrumsInput.checked = normalized.drums === undefined ? hasDrums : normalized.drums === true;
    this.applyLeadInput.checked = normalized.lead === true;
  }

  applyTargets() {
    return {
      bass: this.applyBassInput.checked,
      chordsPad: this.applyChordsPadInput.checked,
      drums: this.applyDrumsInput.checked,
      lead: this.applyLeadInput.checked
    };
  }

  render(result = null, generationSummary = null) {
    if (this.summary) {
      this.renderDefinitionList(this.summary, songSheetRows(result, generationSummary), "summary");
    }
    if (this.warnings) {
      this.renderDefinitionList(this.warnings, warningRows(result), "warning");
    }
  }

  renderDefinitionList(target, rows, kind = "summary") {
    target.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      const token = fieldToken(label);
      row.className = "midi-studio-v2__field-card midi-studio-v2__song-sheet-display-field";
      if (kind === "warning") {
        row.dataset.songSheetWarningField = token;
      } else {
        row.dataset.songSheetSummaryField = token;
      }
      row.dataset.midiStudioFieldState = "readonly";
      row.setAttribute("aria-readonly", "true");
      term.textContent = label;
      description.textContent = value === undefined || value === null || value === "" ? "not declared" : String(value);
      description.dataset.songSheetReadonly = token;
      if (["bars", "chord-count", "estimated-duration", "bars-generated", "notes-generated", "generated-bars", "generated-notes", "generated-instruments"].includes(token)) {
        description.dataset.songSheetComputed = "true";
      }
      if (kind === "warning" || token === "warnings") {
        description.dataset.songSheetDiagnostics = "true";
      }
      row.append(term, description);
      target.append(row);
    });
  }
}
