/*
Toolbox Aid
David Quesenberry
04/14/2026
ReplayTimeline.js
*/
import { asNonNegativeInteger, asPositiveInteger } from "../../shared/math/numberNormalization.js";
import {
  SHARED_REPLAY_TIMELINE_DEFAULT_WINDOW_FRAMES,
} from "../../shared/contracts/index.js";

function cloneEntry(entry) {
  return {
    frameId: entry.frameId,
    snapshot: structuredClone(entry.snapshot),
  };
}

class ReplayTimeline {
  constructor({ maxFrames = SHARED_REPLAY_TIMELINE_DEFAULT_WINDOW_FRAMES } = {}) {
    this.maxFrames = asPositiveInteger(maxFrames, SHARED_REPLAY_TIMELINE_DEFAULT_WINDOW_FRAMES);
    this.entries = [];
  }

  clear() {
    this.entries = [];
  }

  pushSnapshot(frameId, snapshot) {
    const normalizedFrameId = asNonNegativeInteger(frameId, this.entries.length);
    const entry = {
      frameId: normalizedFrameId,
      snapshot: structuredClone(snapshot),
    };
    this.entries.push(entry);
    this.pruneOldSnapshots();
    return cloneEntry(entry);
  }

  getSnapshot(frameId) {
    const normalizedFrameId = asNonNegativeInteger(frameId, -1);
    if (normalizedFrameId < 0) {
      return null;
    }

    for (let i = this.entries.length - 1; i >= 0; i -= 1) {
      const entry = this.entries[i];
      if (entry.frameId === normalizedFrameId) {
        return cloneEntry(entry);
      }
    }
    return null;
  }

  getNearestSnapshot(frameId) {
    const normalizedFrameId = asNonNegativeInteger(frameId, -1);
    if (normalizedFrameId < 0 || this.entries.length === 0) {
      return null;
    }

    for (let i = this.entries.length - 1; i >= 0; i -= 1) {
      const entry = this.entries[i];
      if (entry.frameId <= normalizedFrameId) {
        return cloneEntry(entry);
      }
    }
    return null;
  }

  getLatestSnapshot() {
    if (this.entries.length === 0) {
      return null;
    }
    return cloneEntry(this.entries[this.entries.length - 1]);
  }

  replaceFromFrame(frameId, snapshots = []) {
    const normalizedFrameId = asNonNegativeInteger(frameId, 0);
    const nextEntries = [];
    for (let i = 0; i < this.entries.length; i += 1) {
      const entry = this.entries[i];
      if (entry.frameId < normalizedFrameId) {
        nextEntries.push(entry);
      }
    }

    if (Array.isArray(snapshots)) {
      for (let i = 0; i < snapshots.length; i += 1) {
        nextEntries.push({
          frameId: normalizedFrameId + i,
          snapshot: structuredClone(snapshots[i]),
        });
      }
    }

    this.entries = nextEntries;
    this.pruneOldSnapshots();
    return this.toArray();
  }

  pruneOldSnapshots() {
    if (this.entries.length <= this.maxFrames) {
      return;
    }
    this.entries.splice(0, this.entries.length - this.maxFrames);
  }

  toArray() {
    return this.entries.map((entry) => cloneEntry(entry));
  }

  loadFromSnapshots(snapshots = []) {
    this.clear();
    if (!Array.isArray(snapshots)) {
      return [];
    }
    for (let i = 0; i < snapshots.length; i += 1) {
      this.pushSnapshot(i, snapshots[i]);
    }
    return this.toArray();
  }
}

export { ReplayTimeline };
