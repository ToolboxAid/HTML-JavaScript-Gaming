function songSheetRows(result) {
  if (!result?.ok) {
    return [
      ["Status", result?.message || "No Song Sheet parsed."]
    ];
  }
  return [
    ["Tempo", result.tempo],
    ["Key", result.key],
    ["Style", result.style],
    ["Sections", result.sectionSummary],
    ["Bars", result.bars],
    ["Chord count", result.chordCount],
    ["Estimated duration", `${result.estimatedDurationSeconds} seconds`],
    ["Loop sections", result.sections.filter((section) => section.loop).map((section) => section.label).join(", ") || "none"],
    ["Warnings", result.warningSummary]
  ];
}

export class SongSheetControl {
  constructor({ introInput, keyInput, loopInput, parseButton, styleInput, summary, tempoInput }) {
    this.introInput = introInput;
    this.keyInput = keyInput;
    this.loopInput = loopInput;
    this.parseButton = parseButton;
    this.styleInput = styleInput;
    this.summary = summary;
    this.tempoInput = tempoInput;
  }

  mount({ onParse }) {
    this.parseButton.addEventListener("click", () => onParse(this.composeGuidedSheet()));
  }

  applyGuidedDefaults({ intro, key, loop, style, tempo }) {
    this.tempoInput.value = tempo || "";
    this.keyInput.value = key || "";
    this.styleInput.value = style || "";
    this.introInput.value = intro || "";
    this.loopInput.value = loop || "";
  }

  composeGuidedSheet() {
    const tempo = this.tempoInput.value.trim();
    const key = this.keyInput.value.trim();
    const style = this.styleInput.value.trim();
    const intro = this.introInput.value.trim();
    const loop = this.loopInput.value.trim();
    const numericTempo = Number(tempo);
    if (!Number.isFinite(numericTempo) || numericTempo <= 0) {
      return {
        message: "Invalid tempo/BPM. Enter a positive number before parsing the guided Song Sheet.",
        ok: false
      };
    }
    if (!key) {
      return {
        message: "Missing key. Enter a key before parsing the guided Song Sheet.",
        ok: false
      };
    }
    const lines = [`tempo=${tempo}`, `key=${key}`];
    if (style) {
      lines.push(`style=${style}`);
    }
    lines.push("", "[intro]", intro, "", "[loop]", loop);
    return {
      ok: true,
      sourceText: lines.join("\n")
    };
  }

  render(result = null) {
    this.renderDefinitionList(songSheetRows(result));
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
