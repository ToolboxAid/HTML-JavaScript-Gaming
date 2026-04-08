/*
Toolbox Aid
David Quesenberry
04/06/2026
StateTimelineBuffer.js
*/

import { asPositiveInteger } from "@shared/utils/numberUtils.js";

function normalizeFrameId(frameId) {
  const numeric = Number(frameId);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.floor(numeric);
}

function cloneSnapshot(snapshot) {
  if (snapshot === null || typeof snapshot !== "object") {
    return {};
  }
  return {
    ...snapshot,
    entities: Array.isArray(snapshot.entities)
      ? snapshot.entities.map((entity) => ({
          ...entity,
          position: entity?.position ? { ...entity.position } : undefined,
          velocity: entity?.velocity ? { ...entity.velocity } : undefined,
          stateFlags: entity?.stateFlags ? { ...entity.stateFlags } : undefined
        }))
      : [],
    meta: snapshot.meta && typeof snapshot.meta === "object"
      ? { ...snapshot.meta }
      : undefined
  };
}

function lowerBound(sortedValues, target) {
  let left = 0;
  let right = sortedValues.length;
  while (left < right) {
    const mid = (left + right) >> 1;
    if (sortedValues[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}

export default class StateTimelineBuffer {
  constructor(options = {}) {
    this.maxFrames = asPositiveInteger(options.maxFrames, 180);
    this.snapshotMap = new Map();
    this.frameIds = [];
  }

  getMaxFrames() {
    return this.maxFrames;
  }

  setMaxFrames(maxFrames) {
    this.maxFrames = asPositiveInteger(maxFrames, this.maxFrames);
    this.pruneOldSnapshots();
  }

  pushSnapshot(frameId, snapshot) {
    const normalizedFrameId = normalizeFrameId(frameId);
    if (normalizedFrameId === null) {
      return false;
    }

    const clonedSnapshot = cloneSnapshot(snapshot);
    const alreadyPresent = this.snapshotMap.has(normalizedFrameId);
    this.snapshotMap.set(normalizedFrameId, clonedSnapshot);

    if (!alreadyPresent) {
      const index = lowerBound(this.frameIds, normalizedFrameId);
      this.frameIds.splice(index, 0, normalizedFrameId);
    }

    this.pruneOldSnapshots();
    return true;
  }

  pruneOldSnapshots() {
    const overflowCount = this.frameIds.length - this.maxFrames;
    if (overflowCount <= 0) {
      return;
    }

    const removed = this.frameIds.splice(0, overflowCount);
    removed.forEach((frameId) => {
      this.snapshotMap.delete(frameId);
    });
  }

  removeSnapshotsAfter(frameId) {
    const normalizedFrameId = normalizeFrameId(frameId);
    if (normalizedFrameId === null || this.frameIds.length === 0) {
      return 0;
    }

    const cutoffIndex = lowerBound(this.frameIds, normalizedFrameId + 1);
    if (cutoffIndex >= this.frameIds.length) {
      return 0;
    }

    const removed = this.frameIds.splice(cutoffIndex);
    removed.forEach((removedFrameId) => {
      this.snapshotMap.delete(removedFrameId);
    });
    return removed.length;
  }

  getSnapshot(frameId) {
    const normalizedFrameId = normalizeFrameId(frameId);
    if (normalizedFrameId === null || !this.snapshotMap.has(normalizedFrameId)) {
      return null;
    }

    return {
      frameId: normalizedFrameId,
      snapshot: cloneSnapshot(this.snapshotMap.get(normalizedFrameId))
    };
  }

  getNearestSnapshot(frameId) {
    const normalizedFrameId = normalizeFrameId(frameId);
    if (normalizedFrameId === null || this.frameIds.length === 0) {
      return null;
    }

    const exact = this.getSnapshot(normalizedFrameId);
    if (exact) {
      return {
        ...exact,
        alignment: "exact"
      };
    }

    const insertionIndex = lowerBound(this.frameIds, normalizedFrameId);
    const priorIndex = insertionIndex - 1;
    if (priorIndex < 0) {
      return null;
    }

    const nearestFrameId = this.frameIds[priorIndex];
    const nearestSnapshot = this.snapshotMap.get(nearestFrameId);
    return {
      frameId: nearestFrameId,
      snapshot: cloneSnapshot(nearestSnapshot),
      alignment: "approximate"
    };
  }

  getLatestSnapshot() {
    if (this.frameIds.length === 0) {
      return null;
    }
    const latestFrameId = this.frameIds[this.frameIds.length - 1];
    const snapshot = this.snapshotMap.get(latestFrameId);
    return {
      frameId: latestFrameId,
      snapshot: cloneSnapshot(snapshot)
    };
  }

  getOldestSnapshot() {
    if (this.frameIds.length === 0) {
      return null;
    }
    const oldestFrameId = this.frameIds[0];
    const snapshot = this.snapshotMap.get(oldestFrameId);
    return {
      frameId: oldestFrameId,
      snapshot: cloneSnapshot(snapshot)
    };
  }

  getStatus(options = {}) {
    const latest = this.getLatestSnapshot();
    const oldest = this.getOldestSnapshot();
    const referenceFrameId = normalizeFrameId(options.referenceFrameId);

    const hasReference = referenceFrameId !== null;
    const referenceMatch = hasReference ? this.getNearestSnapshot(referenceFrameId) : null;
    const latestFrameId = latest?.frameId ?? null;
    const oldestFrameId = oldest?.frameId ?? null;

    return {
      historySize: this.frameIds.length,
      historyLimit: this.maxFrames,
      oldestFrameId,
      latestFrameId,
      hasReferenceFrame: hasReference,
      referenceFrameId: hasReference ? referenceFrameId : null,
      alignment: referenceMatch?.alignment ?? "unavailable",
      alignedFrameId: referenceMatch?.frameId ?? null,
      frameGap: hasReference && referenceMatch
        ? Math.max(0, referenceFrameId - referenceMatch.frameId)
        : null
    };
  }
}
