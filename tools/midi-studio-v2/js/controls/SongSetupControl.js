export class SongSetupControl {
  constructor({ addSongButton }) {
    this.addSongButton = addSongButton;
  }

  mount({ onAddSong = () => {} } = {}) {
    this.addSongButton.addEventListener("click", () => onAddSong());
  }
}
