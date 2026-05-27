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
  constructor({ input, parseButton, summary }) {
    this.input = input;
    this.parseButton = parseButton;
    this.summary = summary;
  }

  mount({ onParse }) {
    this.parseButton.addEventListener("click", () => onParse(this.input.value));
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
