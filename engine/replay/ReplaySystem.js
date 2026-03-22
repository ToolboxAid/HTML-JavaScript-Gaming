/*
Toolbox Aid
David Quesenberry
03/22/2026
ReplaySystem.js
*/
export default class ReplaySystem {
  constructor() {
    this.frames = [];
    this.playbackIndex = 0;
    this.recording = false;
    this.playing = false;
  }

  startRecording() {
    this.frames = [];
    this.recording = true;
    this.playing = false;
  }

  recordFrame(frame) {
    if (this.recording) {
      this.frames.push(structuredClone(frame));
    }
  }

  stopRecording() {
    this.recording = false;
    return [...this.frames];
  }

  startPlayback() {
    this.playbackIndex = 0;
    this.playing = true;
    this.recording = false;
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
