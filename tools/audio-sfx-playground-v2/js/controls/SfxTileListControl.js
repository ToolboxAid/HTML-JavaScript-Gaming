function soundSummary(sound) {
  return `${sound.waveform}, ${sound.frequencyHz} Hz, ${sound.durationMs} ms`;
}

export class SfxTileListControl {
  constructor({ list }) {
    this.list = list;
    this.onSelect = null;
  }

  mount({ onSelect }) {
    this.onSelect = onSelect;
  }

  render({ activeSoundId, soundEntries }) {
    if (soundEntries.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "tool-starter__hint audio-sfx__empty-list";
      emptyState.textContent = "Add a named SFX to create the first tile.";
      this.list.replaceChildren(emptyState);
      return;
    }

    const fragment = document.createDocumentFragment();
    soundEntries.forEach((entry) => {
      const tile = document.createElement("button");
      tile.className = "audio-sfx__tile";
      tile.type = "button";
      tile.setAttribute("role", "option");
      tile.setAttribute("aria-selected", entry.id === activeSoundId ? "true" : "false");
      tile.dataset.soundId = entry.id;

      const name = document.createElement("strong");
      name.textContent = entry.sound.name;

      const summary = document.createElement("span");
      summary.textContent = soundSummary(entry.sound);

      tile.append(name, summary);
      tile.addEventListener("click", () => {
        this.onSelect(entry.id);
      });
      fragment.append(tile);
    });
    this.list.replaceChildren(fragment);
  }
}
