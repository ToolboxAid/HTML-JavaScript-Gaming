import { setUnwiredControlState } from "./UnwiredControlState.js";

export class PlaybackControl {
  constructor({ loopToggle, playButton, previewEngineSelect = null, soundFontPresetSelect = null, soundFontStatusOutput = null, stateOutput, stopButton }) {
    this.loopToggle = loopToggle;
    this.onPlay = () => {};
    this.onPreviewEngineChange = () => {};
    this.onStop = () => {};
    this.playButton = playButton;
    this.previewEngineSelect = previewEngineSelect;
    this.soundFontPresetSelect = soundFontPresetSelect;
    this.soundFontStatusOutput = soundFontStatusOutput;
    this.stateOutput = stateOutput;
    this.stopButton = stopButton;
  }

  mount({ onPlay, onPreviewEngineChange = () => {}, onStop }) {
    this.onPlay = onPlay;
    this.onPreviewEngineChange = onPreviewEngineChange;
    this.onStop = onStop;
    this.playButton.addEventListener("click", () => {
      void this.onPlay();
    });
    this.previewEngineSelect?.addEventListener("change", () => this.onPreviewEngineChange(this.previewEngine()));
    this.soundFontPresetSelect?.addEventListener("change", () => this.onPreviewEngineChange(this.previewEngine()));
    this.stopButton.addEventListener("click", () => this.onStop());
  }

  previewEngine() {
    return String(this.previewEngineSelect?.value || "fast-js-synth");
  }

  previewEngineLabel() {
    return this.previewEngine() === "soundfont" ? "SoundFont Preview" : "Fast JS Synth";
  }

  soundFontPreset() {
    return String(this.soundFontPresetSelect?.value || "");
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
    this.stateOutput.textContent = song ? `Audible preview ready: ${song.name}. Engine: ${this.previewEngineLabel()}.` : "No song selected.";
  }

  setPlaying(song, { loop = false } = {}) {
    this.playButton.disabled = true;
    this.stopButton.disabled = false;
    this.applyPlayButtonStatus(false);
    this.stateOutput.textContent = `Playing audible preview: ${song.name}${loop ? " (looping)" : ""}. Engine: ${this.previewEngineLabel()}.`;
  }

  setCompleted(song, playbackStatus = {}) {
    this.playButton.disabled = !song;
    this.stopButton.disabled = true;
    this.applyPlayButtonStatus(Boolean(song), playbackStatus);
    this.stateOutput.textContent = song ? `Completed audible preview: ${song.name}. Engine: ${this.previewEngineLabel()}.` : "No song selected.";
  }

  setStopped(song, playbackStatus = {}) {
    this.playButton.disabled = !song;
    this.stopButton.disabled = true;
    this.applyPlayButtonStatus(Boolean(song), playbackStatus);
    this.stateOutput.textContent = song ? `Stopped audible preview: ${song.name}. Engine: ${this.previewEngineLabel()}.` : "No song selected.";
  }

  setPreviewUnavailable(song, status = {}, playbackStatus = {}) {
    this.playButton.disabled = !song;
    this.stopButton.disabled = true;
    this.applyPlayButtonStatus(Boolean(song), playbackStatus);
    this.stateOutput.textContent = song
      ? `${status.label || this.previewEngineLabel()} unavailable: ${song.name}. ${status.message || "Preview engine unavailable."}`
      : "No song selected.";
  }

  setPreviewEngineStatus({ level = "INFO", message = "Fast JS Synth preview ready." } = {}) {
    if (!this.soundFontStatusOutput) {
      return;
    }
    this.soundFontStatusOutput.value = `${level}: ${message}`;
    this.soundFontStatusOutput.textContent = `${level}: ${message}`;
    this.soundFontStatusOutput.dataset.previewEngineStatus = level.toLowerCase();
  }

  applyPlayButtonStatus(hasSong, playbackStatus = {}) {
    setUnwiredControlState(this.playButton, {
      active: hasSong && playbackStatus.unwired === true,
      detail: playbackStatus.detail || "",
      status: playbackStatus.status || "Incomplete"
    });
  }
}
