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

function songSheetRows(result) {
  if (!result?.ok) {
    return [
      ["Sections", "not parsed"],
      ["Bars", "not parsed"],
      ["Chord count", "not parsed"],
      ["Estimated duration", "not parsed"],
      ["Loop sections", "not parsed"],
      ["Warnings", result?.message || "No Song Sheet parsed."]
    ];
  }
  return [
    ["Sections", result.sectionSummary],
    ["Bars", result.bars],
    ["Chord count", result.chordCount],
    ["Estimated duration", `${result.estimatedDurationSeconds} seconds`],
    ["Loop sections", result.sections.filter((section) => section.loop).map((section) => section.label).join(", ") || "none"],
    ["Warnings", result.warningSummary]
  ];
}

export class SongSheetControl {
  constructor({ keyInput, loopSectionsInput, parseButton, sectionsInput, styleInput, summary, tempoInput }) {
    this.keyInput = keyInput;
    this.loopSectionsInput = loopSectionsInput;
    this.parseButton = parseButton;
    this.sectionsInput = sectionsInput;
    this.styleInput = styleInput;
    this.summary = summary;
    this.tempoInput = tempoInput;
  }

  mount({ onFieldChange = () => {}, onMetadataChange = () => {}, onParse }) {
    this.parseButton.addEventListener("click", () => onParse(this.composeGuidedSheet()));
    this.tempoInput.addEventListener("input", () => onMetadataChange("tempo", this.tempoInput.value));
    this.keyInput.addEventListener("change", () => onMetadataChange("key", this.keyInput.value));
    this.styleInput.addEventListener("change", () => onMetadataChange("style", this.styleInput.value));
    this.sectionsInput.addEventListener("input", () => onFieldChange("sections", this.sectionsInput.value));
    this.loopSectionsInput.addEventListener("input", () => onFieldChange("loopSections", this.loopSectionsInput.value));
  }

  applyGuidedDefaults({ intro, key, loop, loopSections, sections, style, tempo }) {
    this.tempoInput.value = tempo || "";
    this.keyInput.value = key || "";
    this.styleInput.value = style || "";
    this.sectionsInput.value = sections || this.sectionsTextFromLegacy({ intro, loop });
    this.loopSectionsInput.value = loopSections || (loop ? "loop" : "");
  }

  sectionsTextFromLegacy({ intro, loop } = {}) {
    const rows = [];
    if (String(intro || "").trim()) {
      rows.push(`intro: ${String(intro).trim()}`);
    }
    if (String(loop || "").trim()) {
      rows.push(`loop: ${String(loop).trim()}`);
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
    const lines = [`tempo=${tempo}`, `key=${key}`];
    if (style) {
      lines.push(`style=${style}`);
    }
    sections.rows.forEach((section) => {
      lines.push("", `[${section.label}]`, section.chords);
    });
    return {
      loopSections: this.loopSectionLabels(),
      loopSectionsText: this.loopSectionsInput.value.trim(),
      ok: true,
      sectionsText: this.sectionsInput.value.trim(),
      sourceText: lines.join("\n")
    };
  }

  structuredSections() {
    const entries = String(this.sectionsInput.value || "")
      .split(/[\n;]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (!entries.length) {
      return { ok: false, message: "Song Sheet Sections must include at least one section line." };
    }
    const rows = [];
    for (const entry of entries) {
      const bracketMatch = entry.match(/^\[([^\]]+)\]\s*(.*)$/);
      const separatorIndex = entry.indexOf(":");
      const label = bracketMatch
        ? bracketMatch[1].trim()
        : separatorIndex >= 0
          ? entry.slice(0, separatorIndex).trim()
          : `section${rows.length + 1}`;
      const chords = bracketMatch
        ? bracketMatch[2].trim()
        : separatorIndex >= 0
          ? entry.slice(separatorIndex + 1).trim()
          : entry;
      if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(label)) {
        return { ok: false, message: `Malformed section label in Song Sheet Sections: ${label || "(empty)"}` };
      }
      rows.push({ chords, label });
    }
    return { ok: true, rows };
  }

  loopSectionLabels() {
    return splitList(this.loopSectionsInput.value).map((label) => label.toLowerCase());
  }

  render(result = null) {
    if (!this.summary) {
      return;
    }
    this.renderDefinitionList(songSheetRows(result));
  }

  renderDefinitionList(rows) {
    this.summary.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      const token = fieldToken(label);
      row.dataset.songSheetSummaryField = token;
      term.textContent = label;
      description.textContent = value === undefined || value === null || value === "" ? "not declared" : String(value);
      description.dataset.songSheetReadonly = token;
      if (["bars", "chord-count", "estimated-duration"].includes(token)) {
        description.dataset.songSheetComputed = "true";
      }
      if (token === "warnings") {
        description.dataset.songSheetDiagnostics = "true";
      }
      row.append(term, description);
      this.summary.append(row);
    });
  }
}
