/*
Toolbox Aid
David Quesenberry
03/22/2026
ReplaySystem.js
*/
import { asNonNegativeInteger } from '../../shared/math/numberNormalization.js';
import { createReplayModel, normalizeReplayModel, withFinalState } from './ReplayModel.js';
import { ReplayTimeline } from './ReplayTimeline.js';

export default class ReplaySystem {
  constructor({ timelineWindowFrames } = {}) {
    this.replay = createReplayModel();
    this.frames = this.replay.frames;
    this.playbackIndex = 0;
    this.recording = false;
    this.playing = false;
    this.timeline = new ReplayTimeline({ maxFrames: timelineWindowFrames });
  }

  createReplay({ metadata = null, initialState = null } = {}) {
    return createReplayModel({ metadata, initialState });
  }

  rebuildTimelineFromFrames() {
    this.timeline.loadFromSnapshots(this.frames);
  }

  startRecording({ metadata = null, initialState = null } = {}) {
    this.replay = createReplayModel({ metadata, initialState });
    this.frames = this.replay.frames;
    this.timeline.clear();
    this.recording = true;
    this.playing = false;
    this.playbackIndex = 0;
  }

  recordFrame(frame) {
    if (this.recording) {
      const clonedFrame = structuredClone(frame);
      this.frames.push(clonedFrame);
      this.timeline.pushSnapshot(this.frames.length - 1, clonedFrame);
    }
  }

  stopRecording({ finalState = null } = {}) {
    this.recording = false;
    this.replay = withFinalState(this.replay, finalState);
    this.frames = this.replay.frames;
    return [...this.frames];
  }

  getReplay() {
    return structuredClone(this.replay);
  }

  loadReplay(replay) {
    this.replay = normalizeReplayModel(replay);
    this.frames = this.replay.frames;
    this.rebuildTimelineFromFrames();
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

  getTimeline() {
    return this.timeline.toArray();
  }

  getTimelineSnapshot(frameId) {
    return this.timeline.getSnapshot(frameId);
  }

  getNearestTimelineSnapshot(frameId) {
    return this.timeline.getNearestSnapshot(frameId);
  }

  replaceReplayFromFrame(frameId, frames = []) {
    const normalizedFrameId = asNonNegativeInteger(frameId, this.frames.length);
    const prefix = this.frames.slice(0, normalizedFrameId);
    const replacementFrames = Array.isArray(frames)
      ? frames.map((frame) => structuredClone(frame))
      : [];
    const nextFrames = [...prefix, ...replacementFrames];

    this.replay = normalizeReplayModel({
      ...this.replay,
      frames: nextFrames
    });
    this.frames = this.replay.frames;
    this.timeline.replaceFromFrame(normalizedFrameId, replacementFrames);
    if (this.playbackIndex > this.frames.length) {
      this.playbackIndex = this.frames.length;
    }

    return this.getReplay();
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
