export default class StatsTracker {
  constructor({ sampleWindowSeconds = 0.5 } = {}) {
    this.sampleWindowSeconds = sampleWindowSeconds;
    this.frameCounter = 0;
    this.frameAccumulator = 0;
    this.displayFps = 0;
  }

  update(dt) {
    this.frameCounter += 1;
    this.frameAccumulator += dt;

    if (this.frameAccumulator >= this.sampleWindowSeconds) {
      this.displayFps = this.frameCounter / this.frameAccumulator;
      this.frameCounter = 0;
      this.frameAccumulator = 0;
    }
  }

  getFps() {
    return this.displayFps;
  }
}
