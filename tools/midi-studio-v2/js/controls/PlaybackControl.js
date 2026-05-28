import { setUnwiredControlState } from "./UnwiredControlState.js";

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

  isPlaying() {
    return !this.stopButton.disabled;
  }

  setSelected(song, playbackStatus = {}) {
    this.playButton.disabled = !song;
    this.stopButton.disabled = true;
    this.applyPlayButtonStatus(Boolean(song), playbackStatus);
    this.stateOutput.textContent = song ? `Audible preview ready: ${song.name}.` : "No song selected.";
  }

  setPlaying(song) {
    this.playButton.disabled = true;
    this.stopButton.disabled = false;
    this.applyPlayButtonStatus(false);
    this.stateOutput.textContent = `Playing audible preview: ${song.name}`;
  }

  setStopped(song, playbackStatus = {}) {
    this.playButton.disabled = !song;
    this.stopButton.disabled = true;
    this.applyPlayButtonStatus(Boolean(song), playbackStatus);
    this.stateOutput.textContent = song ? `Stopped audible preview: ${song.name}.` : "No song selected.";
  }

  applyPlayButtonStatus(hasSong, playbackStatus = {}) {
    setUnwiredControlState(this.playButton, {
      active: hasSong && playbackStatus.unwired === true,
      detail: playbackStatus.detail || "",
      status: playbackStatus.status || "Incomplete"
    });
  }
}
