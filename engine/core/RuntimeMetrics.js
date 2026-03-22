/*
Toolbox Aid
David Quesenberry
03/22/2026
RuntimeMetrics.js
*/
export default class RuntimeMetrics {
  constructor({ sampleWindowSeconds = 0.5 } = {}) {
    this.sampleWindowSeconds = sampleWindowSeconds;
    this.resetWindow();
    this.snapshot = {
      fps: 0,
      frameMs: 0,
      updateMs: 0,
      renderMs: 0,
      fixedUpdates: 0,
    };
  }

  resetWindow() {
    this.frameCount = 0;
    this.fixedUpdateCount = 0;
    this.elapsed = 0;
    this.frameTimeTotal = 0;
    this.updateTimeTotal = 0;
    this.renderTimeTotal = 0;
  }

  recordFrame({ dtSeconds = 0, frameMs = 0, updateMs = 0, renderMs = 0, fixedUpdates = 0 } = {}) {
    this.frameCount += 1;
    this.fixedUpdateCount += fixedUpdates;
    this.elapsed += dtSeconds;
    this.frameTimeTotal += frameMs;
    this.updateTimeTotal += updateMs;
    this.renderTimeTotal += renderMs;

    if (this.elapsed >= this.sampleWindowSeconds) {
      this.snapshot = {
        fps: this.frameCount / this.elapsed,
        frameMs: this.frameTimeTotal / this.frameCount,
        updateMs: this.updateTimeTotal / this.frameCount,
        renderMs: this.renderTimeTotal / this.frameCount,
        fixedUpdates: this.fixedUpdateCount,
      };
      this.resetWindow();
    }
  }

  getSnapshot() {
    return { ...this.snapshot };
  }
}
