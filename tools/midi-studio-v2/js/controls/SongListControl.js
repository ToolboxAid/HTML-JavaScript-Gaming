export class SongListControl {
  constructor({ list }) {
    this.list = list;
    this.onSelect = () => {};
  }

  mount({ onSelect }) {
    this.onSelect = onSelect;
    this.list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-song-id]");
      if (button) {
        this.onSelect(button.dataset.songId || "");
      }
    });
  }

  render(songs, selectedSongId) {
    this.list.replaceChildren();
    if (!songs.length) {
      const empty = document.createElement("p");
      empty.className = "midi-studio-v2__empty";
      empty.textContent = "No MIDI songs loaded.";
      this.list.append(empty);
      return;
    }
    songs.forEach((song) => {
      const button = document.createElement("button");
      button.className = "midi-studio-v2__song-button";
      button.type = "button";
      button.dataset.songId = song.id;
      button.setAttribute("role", "option");
      button.setAttribute("aria-pressed", String(song.id === selectedSongId));

      const title = document.createElement("span");
      title.className = "midi-studio-v2__song-title";
      title.textContent = song.name;
      const meta = document.createElement("span");
      meta.className = "midi-studio-v2__song-meta";
      meta.textContent = `${song.id} | ${song.sourceMidi || "missing sourceMidi"}`;
      button.append(title, meta);
      this.list.append(button);
    });
  }
}
