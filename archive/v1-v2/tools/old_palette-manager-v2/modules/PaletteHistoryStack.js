import { cloneSwatch, normalizeTags } from "./paletteUtils.js";

function cloneSnapshot(snapshot = {}) {
  return {
    userSwatches: Array.isArray(snapshot.userSwatches) ? snapshot.userSwatches.map(cloneSwatch) : [],
    selectedUserIndex: Number.isInteger(snapshot.selectedUserIndex) ? snapshot.selectedUserIndex : -1,
    availableTags: normalizeTags(snapshot.availableTags)
  };
}

function snapshotsMatch(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export class PaletteHistoryStack {
  constructor(initialSnapshot) {
    this.undoStack = [];
    this.redoStack = [];
    this.currentSnapshot = cloneSnapshot(initialSnapshot);
  }

  reset(snapshot) {
    this.undoStack = [];
    this.redoStack = [];
    this.currentSnapshot = cloneSnapshot(snapshot);
  }

  record(snapshot) {
    const nextSnapshot = cloneSnapshot(snapshot);
    if (snapshotsMatch(this.currentSnapshot, nextSnapshot)) {
      return;
    }
    this.undoStack.push(cloneSnapshot(this.currentSnapshot));
    this.currentSnapshot = nextSnapshot;
    this.redoStack = [];
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undo() {
    if (!this.canUndo()) {
      return null;
    }
    this.redoStack.push(cloneSnapshot(this.currentSnapshot));
    this.currentSnapshot = this.undoStack.pop();
    return cloneSnapshot(this.currentSnapshot);
  }

  redo() {
    if (!this.canRedo()) {
      return null;
    }
    this.undoStack.push(cloneSnapshot(this.currentSnapshot));
    this.currentSnapshot = this.redoStack.pop();
    return cloneSnapshot(this.currentSnapshot);
  }
}
