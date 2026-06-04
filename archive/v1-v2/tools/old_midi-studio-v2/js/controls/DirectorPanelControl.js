function text(value) {
  return Array.isArray(value) ? (value.join(", ") || "not declared") : String(value || "not declared");
}

export class DirectorPanelControl {
  constructor({ panel }) {
    this.panel = panel;
  }

  render(song, directorMode = {}) {
    this.panel.replaceChildren();
    const rows = song
      ? [
        ["Mode", directorMode.enabled === false ? "off" : "on"],
        ["Default intensity", directorMode.defaultIntensity || "not declared"],
        ["Mood", song.director.mood],
        ["Intensity", song.director.intensity],
        ["Usage", song.director.usage],
        ["Notes", song.director.notes]
      ]
      : [["Mode", directorMode.enabled === false ? "off" : "on"], ["Selection", "No song selected"]];
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "midi-studio-v2__director-row";
      const labelElement = document.createElement("span");
      labelElement.className = "midi-studio-v2__director-label";
      labelElement.textContent = label;
      const valueElement = document.createElement("span");
      valueElement.className = "midi-studio-v2__director-value";
      valueElement.textContent = text(value);
      row.append(labelElement, valueElement);
      this.panel.append(row);
    });
  }
}
