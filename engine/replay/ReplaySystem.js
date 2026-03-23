/*
Toolbox Aid
David Quesenberry
03/22/2026
ReplaySystem.js
*/
export default class ReplaySystem {
  constructor() {
    this.replay = this.createReplay();
    this.frames = this.replay.frames;
    this.playbackIndex = 0;
    this.recording = false;
    this.playing = false;
  }

  createReplay({ metadata = null, initialState = null } = {}) {
    return {
      version: 1,
      metadata: metadata ? structuredClone(metadata) : null,
      initialState: initialState ? structuredClone(initialState) : null,
      frames: [],
      finalState: null,
    };
  }

  startRecording({ metadata = null, initialState = null } = {}) {
    this.replay = this.createReplay({ metadata, initialState });
    this.frames = this.replay.frames;
    this.recording = true;
    this.playing = false;
    this.playbackIndex = 0;
  }

  recordFrame(frame) {
    if (this.recording) {
      this.frames.push(structuredClone(frame));
    }
  }

  stopRecording({ finalState = null } = {}) {
    this.recording = false;
    this.replay.finalState = finalState ? structuredClone(finalState) : null;
    return [...this.frames];
  }

  getReplay() {
    return structuredClone(this.replay);
  }

  loadReplay(replay) {
    this.replay = replay ? structuredClone(replay) : this.createReplay();
    this.frames = this.replay.frames;
    this.playbackIndex = 0;
    this.recording = false;
    this.playing = false;
    return this.getReplay();
  }

  startPlayback(replay = null) {
    if (replay) {
      this.loadReplay(replay);
    }

    if (!this.frames.length) {
      this.playing = false;
      return false;
    }

    this.playbackIndex = 0;
    this.playing = true;
    this.recording = false;
    return true;
  }

  nextFrame() {
    if (!this.playing || this.playbackIndex >= this.frames.length) {
      this.playing = false;
      return null;
    }

    const frame = this.frames[this.playbackIndex];
    this.playbackIndex += 1;
    return frame;
  }
}
