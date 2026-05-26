function displayValue(value) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "not declared";
  }
  if (value === true) {
    return "true";
  }
  if (value === false) {
    return "false";
  }
  return String(value || "not declared");
}

export class SongDetailsControl {
  constructor({ details, instrumentSetField, inspector, renderedTargets, sourceField }) {
    this.details = details;
    this.instrumentSetField = instrumentSetField;
    this.inspector = inspector;
    this.renderedTargets = renderedTargets;
    this.sourceField = sourceField;
  }

  render(song, payload) {
    if (!song) {
      this.sourceField.value = "No song selected";
      this.instrumentSetField.value = "No song selected";
      this.renderDefinitionList(this.details, [["Selection", "No song selected"]]);
      this.renderDefinitionList(this.renderedTargets, [["WAV", "not declared"], ["MP3", "not declared"], ["OGG", "not declared"]]);
      this.inspector.textContent = JSON.stringify(payload || {}, null, 2);
      return;
    }
    this.sourceField.value = song.sourceMidi || "missing sourceMidi";
    this.instrumentSetField.value = song.instrumentSet || "not declared";
    this.renderDefinitionList(this.details, [
      ["Name", song.name],
      ["ID", song.id],
      ["Runtime preference", payload?.runtimePreference || "not declared"],
      ["Default runtime format", song.defaultRuntimeFormat || "not declared"],
      ["Loop enabled", song.loop.enabled],
      ["Loop start", song.loop.startSeconds],
      ["Loop end", song.loop.endSeconds],
      ["Tags", song.tags]
    ]);
    this.renderDefinitionList(this.renderedTargets, [
      ["WAV", song.rendered.wav],
      ["MP3", song.rendered.mp3],
      ["OGG", song.rendered.ogg]
    ]);
    this.inspector.textContent = JSON.stringify(song, null, 2);
  }

  showJson(value) {
    this.inspector.textContent = JSON.stringify(value || {}, null, 2);
  }

  renderDefinitionList(list, rows) {
    list.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = displayValue(value);
      row.append(term, description);
      list.append(row);
    });
  }
}
