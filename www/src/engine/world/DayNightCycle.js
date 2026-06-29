/*
Toolbox Aid
David Quesenberry
03/22/2026
DayNightCycle.js
*/
export default class DayNightCycle {
  constructor({ durationSeconds = 10 } = {}) {
    this.durationSeconds = durationSeconds;
    this.time = 0;
  }

  update(dt) {
    this.time = (this.time + dt) % this.durationSeconds;
  }

  getPhaseRatio() {
    return this.time / this.durationSeconds;
  }

  getLightness() {
    return (Math.sin((this.getPhaseRatio() * Math.PI * 2) - Math.PI / 2) + 1) * 0.5;
  }
}
