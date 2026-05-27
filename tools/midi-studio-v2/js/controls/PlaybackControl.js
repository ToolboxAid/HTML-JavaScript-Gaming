export class PlaybackControl {
  constructor({ loopToggle, playButton, stateOutput, stopButton }) {
    this.loopToggle = loopToggle;
    this.onPlay = () => {};
    this.onStop = () => {};
    this.playButton = playButton;
    this.stateOutput = stateOutput;
    this.stopButton = stopButton;
  }

  mount({ onPlay, onStop }) {
    this.onPlay = onPlay;
    this.onStop = onStop;
    this.playButton.addEventListener("click", () => {
      void this.onPlay();
    });
    this.stopButton.addEventListener("click", () => this.onStop());
  }

  loopEnabled() {
    return this.loopToggle.checked;
  }

  setSelected(song) {
    this.playButton.disabled = !song;
    this.stopButton.disabled = true;
    this.stateOutput.textContent = song ? `Audible preview ready: ${song.name}.` : "No song selected.";
  }

  setPlaying(song) {
    this.playButton.disabled = true;
    this.stopButton.disabled = false;
    this.stateOutput.textContent = `Playing audible preview: ${song.name}`;
  }

  setStopped(song) {
    this.playButton.disabled = !song;
    this.stopButton.disabled = true;
    this.stateOutput.textContent = song ? `Stopped audible preview: ${song.name}.` : "No song selected.";
  }
}
