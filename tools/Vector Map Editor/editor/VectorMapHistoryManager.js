/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapHistoryManager.js
*/
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class VectorMapHistoryManager {
  constructor(maxDepth = 80) {
    this.maxDepth = Math.max(1, Math.floor(maxDepth));
    this.reset();
  }

  reset() {
    this.past = [];
    this.future = [];
  }

  canUndo() {
    return this.past.length > 0;
  }

  canRedo() {
    return this.future.length > 0;
  }

  push(label, beforeSnapshot, afterSnapshot) {
    if (!beforeSnapshot || !afterSnapshot) {
      return false;
    }
    const before = JSON.stringify(beforeSnapshot);
    const after = JSON.stringify(afterSnapshot);
    if (before === after) {
      return false;
    }
    this.past.push({
      label: label || "Edit",
      before: clone(beforeSnapshot),
      after: clone(afterSnapshot)
    });
    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }
    this.future = [];
    return true;
  }

  undo(applySnapshot) {
    if (!this.canUndo()) {
      return null;
    }
    const entry = this.past.pop();
    this.future.push(entry);
    applySnapshot?.(clone(entry.before));
    return entry.label;
  }

  redo(applySnapshot) {
    if (!this.canRedo()) {
      return null;
    }
    const entry = this.future.pop();
    this.past.push(entry);
    applySnapshot?.(clone(entry.after));
    return entry.label;
  }
}
