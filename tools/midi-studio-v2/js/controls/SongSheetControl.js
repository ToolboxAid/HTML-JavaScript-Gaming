import { sectionTone, sectionToneRgba } from "../sectionColors.js";

const NAMED_SECTION_LABELS = ["Intro", "Verse", "Chorus", "Bridge", "Outro"];

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

function normalizedLabelKey(label) {
  return String(label || "").trim().toLowerCase();
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

function songSheetRows(result) {
  if (!result?.ok) {
    return [
      ["Sections", "not parsed"],
      ["Sequence", "not parsed"],
      ["Bars", "not parsed"],
      ["Chord count", "not parsed"],
      ["Estimated duration", "not parsed"]
    ];
  }
  return [
    ["Sections", result.sectionSummary],
    ["Sequence", result.sequence?.length ? result.sequence.join(", ") : result.sections.map((section) => section.label).join(", ")],
    ["Bars", result.bars],
    ["Chord count", result.chordCount],
    ["Estimated duration", `${result.estimatedDurationSeconds} seconds`]
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
    addSequenceButton,
    applyBassInput,
    applyChordsPadInput,
    applyDrumsInput,
    applyLeadInput,
    availableCount,
    availableSectionsList,
    customSectionsInput,
    duplicateSequenceButton,
    keyInput,
    moveSequenceDownButton,
    moveSequenceUpButton,
    namedSectionInputs,
    parseButton,
    removeSequenceButton,
    sequenceCount,
    sectionsInput,
    sequenceInput,
    sequenceList,
    styleInput,
    summary,
    tempoInput,
    warnings
  }) {
    this.addSequenceButton = addSequenceButton;
    this.applyBassInput = applyBassInput;
    this.applyChordsPadInput = applyChordsPadInput;
    this.applyDrumsInput = applyDrumsInput;
    this.applyLeadInput = applyLeadInput;
    this.availableCount = availableCount;
    this.availableSectionsList = availableSectionsList;
    this.customSectionsInput = customSectionsInput;
    this.duplicateSequenceButton = duplicateSequenceButton;
    this.keyInput = keyInput;
    this.moveSequenceDownButton = moveSequenceDownButton;
    this.moveSequenceUpButton = moveSequenceUpButton;
    this.namedSectionInputs = namedSectionInputs || {};
    this.parseButton = parseButton;
    this.removeSequenceButton = removeSequenceButton;
    this.sequenceCount = sequenceCount;
    this.sectionsInput = sectionsInput;
    this.sequenceInput = sequenceInput;
    this.sequenceList = sequenceList;
    this.styleInput = styleInput;
    this.summary = summary;
    this.tempoInput = tempoInput;
    this.warnings = warnings;
    this.userEditedSequence = false;
  }

  mount({ onFieldChange = () => {}, onMetadataChange = () => {}, onParse }) {
    this.parseButton.addEventListener("click", () => onParse(this.composeGuidedSheet()));
    this.tempoInput.addEventListener("input", () => onMetadataChange("tempo", this.tempoInput.value));
    this.keyInput.addEventListener("change", () => onMetadataChange("key", this.keyInput.value));
    this.styleInput.addEventListener("change", () => onMetadataChange("style", this.styleInput.value));

    Object.values(this.namedSectionInputs).forEach((input) => {
      input.addEventListener("input", () => {
        this.refreshSectionBuilder();
        onFieldChange("sections", this.sectionsInput.value);
      });
    });
    this.customSectionsInput.addEventListener("input", () => {
      this.refreshSectionBuilder();
      onFieldChange("sections", this.sectionsInput.value);
    });

    this.addSequenceButton.addEventListener("click", () => {
      const selected = this.availableSectionsList.selectedOptions[0];
      if (!selected) {
        return;
      }
      this.appendSequenceLabel(selected.value);
      this.userEditedSequence = true;
      this.syncSequenceState();
      onFieldChange("sequence", this.sequenceInput.value);
    });
    this.sequenceList.addEventListener("change", () => this.syncSequenceState());
    this.moveSequenceUpButton.addEventListener("click", () => {
      this.moveSelectedSequenceItem(-1);
      onFieldChange("sequence", this.sequenceInput.value);
    });
    this.moveSequenceDownButton.addEventListener("click", () => {
      this.moveSelectedSequenceItem(1);
      onFieldChange("sequence", this.sequenceInput.value);
    });
    this.duplicateSequenceButton.addEventListener("click", () => {
      this.duplicateSelectedSequenceItem();
      onFieldChange("sequence", this.sequenceInput.value);
    });
    this.removeSequenceButton.addEventListener("click", () => {
      this.removeSelectedSequenceItem();
      onFieldChange("sequence", this.sequenceInput.value);
    });

    [this.applyChordsPadInput, this.applyBassInput, this.applyDrumsInput, this.applyLeadInput].forEach((input) => {
      input.addEventListener("change", () => onFieldChange("applyTargets", this.applyTargets()));
    });
    this.setApplyTargets(null, { hasDrums: true });
    this.refreshSectionBuilder({ preserveSequence: false });
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

  refreshSectionBuilder({ preserveSequence = true } = {}) {
    const rows = this.availableSections();
    this.sectionsInput.value = this.sectionsTextFromRows(rows);
    this.renderAvailableSections(rows);
    const availableKeys = new Set(rows.map((section) => normalizedLabelKey(section.label)));
    let labels = preserveSequence ? this.sequenceItems().filter((label) => availableKeys.has(normalizedLabelKey(label))) : [];
    if (!this.userEditedSequence && !labels.length) {
      labels = rows.map((section) => section.label);
    }
    this.setSequenceLabels(labels);
    this.syncSequenceState();
  }

  renderAvailableSections(rows) {
    const current = this.availableSectionsList.value;
    this.availableSectionsList.replaceChildren();
    rows.forEach((section) => {
      const option = document.createElement("option");
      option.value = section.label;
      option.textContent = section.label;
      option.dataset.songSheetAvailableSection = section.label;
      option.dataset.songSheetSectionChords = section.chords;
      option.dataset.songSheetSectionChordCount = String(chordTokenCount(section.chords));
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
    this.moveSequenceUpButton.disabled = !hasSelection || this.sequenceList.selectedIndex <= 0;
    this.moveSequenceDownButton.disabled = !hasSelection || this.sequenceList.selectedIndex >= this.sequenceList.options.length - 1;
    this.duplicateSequenceButton.disabled = !hasSelection;
    this.removeSequenceButton.disabled = !hasSelection;
    this.updateSequenceCount(this.sequenceList.options.length);
    this.applySequenceOptionColors();
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
    const applyColor = (option) => {
      const colorIndex = colors.get(normalizedLabelKey(option.value)) ?? 0;
      option.dataset.songSheetSectionColorIndex = String(colorIndex);
      option.style.backgroundColor = sectionToneRgba(colorIndex, 0.22);
      option.style.color = sectionTone(colorIndex);
    };
    Array.from(this.availableSectionsList.options).forEach(applyColor);
    Array.from(this.sequenceList.options).forEach(applyColor);
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

  render(result = null) {
    if (this.summary) {
      this.renderDefinitionList(this.summary, songSheetRows(result), "summary");
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
      if (["bars", "chord-count", "estimated-duration"].includes(token)) {
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
