export class SongListControl {
  constructor({ duplicateSongButton, librarySelect, librarySummary, list, loadSongButton, saveSongButton }) {
    this.duplicateSongButton = duplicateSongButton;
    this.librarySelect = librarySelect;
    this.librarySummary = librarySummary;
    this.list = list;
    this.loadSongButton = loadSongButton;
    this.onSelect = () => {};
    this.saveSongButton = saveSongButton;
  }

  mount({ onDuplicateSong = () => {}, onLoadSong = () => {}, onSaveSong = () => {}, onSelect }) {
    this.onSelect = onSelect;
    this.list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-song-id]");
      if (button) {
        this.onSelect(button.dataset.songId || "");
      }
    });
    this.saveSongButton?.addEventListener("click", () => onSaveSong());
    this.loadSongButton?.addEventListener("click", () => onLoadSong(this.selectedSongLibraryAssetId()));
    this.duplicateSongButton?.addEventListener("click", () => onDuplicateSong());
    this.librarySelect?.addEventListener("change", () => this.renderSelectedLibrarySummary());
  }

  render(songs, selectedSongId, songLibraryAssets = []) {
    this.list.replaceChildren();
    if (!songs.length) {
      const empty = document.createElement("p");
      empty.className = "midi-studio-v2__empty";
      empty.textContent = "No MIDI songs loaded.";
      this.list.append(empty);
      this.renderSongLibrary(songLibraryAssets);
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
    this.renderSongLibrary(songLibraryAssets);
  }

  selectedSongLibraryAssetId() {
    return this.librarySelect?.value || "";
  }

  selectSongLibraryAsset(assetId) {
    if (!this.librarySelect) {
      return;
    }
    this.librarySelect.value = assetId;
    this.renderSelectedLibrarySummary();
  }

  renderSongLibrary(songLibraryAssets = []) {
    if (!this.librarySelect || !this.librarySummary) {
      return;
    }
    const current = this.librarySelect.value;
    this.librarySelect.replaceChildren();
    songLibraryAssets.forEach((asset) => {
      const option = document.createElement("option");
      option.value = asset.id;
      option.textContent = `${asset.label} | ${asset.generatedId}`;
      option.dataset.songLibraryAssetId = asset.id;
      option.dataset.songLibraryClassification = asset.classification || "";
      option.dataset.songLibraryGeneratedId = asset.generatedId || "";
      this.librarySelect.append(option);
    });
    if (songLibraryAssets.some((asset) => asset.id === current)) {
      this.librarySelect.value = current;
    } else if (songLibraryAssets.length) {
      this.librarySelect.selectedIndex = songLibraryAssets.length - 1;
    }
    this.librarySummary.dataset.songLibraryCount = String(songLibraryAssets.length);
    this.renderSelectedLibrarySummary();
  }

  renderSelectedLibrarySummary(message = "") {
    if (!this.librarySummary) {
      return;
    }
    if (message) {
      this.librarySummary.textContent = message;
      return;
    }
    const count = this.librarySelect?.options.length || 0;
    const selected = this.librarySelect?.selectedOptions?.[0] || null;
    this.librarySummary.textContent = selected
      ? `Selected song asset: ${selected.textContent}`
      : `${count} saved song asset${count === 1 ? "" : "s"}`;
  }

  setLibrarySummary(message, songLibraryAssets = null) {
    if (!this.librarySummary) {
      return;
    }
    if (Array.isArray(songLibraryAssets)) {
      this.librarySummary.dataset.songLibraryCount = String(songLibraryAssets.length);
    }
    this.librarySummary.textContent = message;
  }
}
