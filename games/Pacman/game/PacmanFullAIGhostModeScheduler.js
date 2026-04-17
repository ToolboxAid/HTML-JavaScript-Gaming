/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAIGhostModeScheduler.js
*/
export default class PacmanFullAIGhostModeScheduler {
  constructor({ modeScheduleMs, frightenedDurationMs, frightenedFlashMs }) {
    this.schedule = modeScheduleMs;
    this.frightenedDurationMs = frightenedDurationMs;
    this.frightenedFlashMs = frightenedFlashMs;
    this.reset();
  }

  reset() {
    this.scheduleIndex = 0;
    this.scheduleElapsedMs = 0;
    this.baseMode = this.schedule[0]?.mode || 'scatter';
    this.frightenedMs = 0;
  }

  triggerFrightened() {
    this.frightenedMs = this.frightenedDurationMs;
    return true;
  }

  update(dtMs) {
    let modeChanged = false;
    let reversedOnChange = false;

    if (this.frightenedMs > 0) {
      this.frightenedMs = Math.max(0, this.frightenedMs - dtMs);
      if (this.frightenedMs === 0) {
        modeChanged = true;
        reversedOnChange = true;
      }
    } else {
      this.scheduleElapsedMs += dtMs;
      const current = this.schedule[this.scheduleIndex];
      if (current && this.scheduleElapsedMs >= current.durationMs) {
        this.scheduleElapsedMs = 0;
        this.scheduleIndex = (this.scheduleIndex + 1) % this.schedule.length;
        this.baseMode = this.schedule[this.scheduleIndex].mode;
        modeChanged = true;
        reversedOnChange = true;
      }
    }

    const mode = this.frightenedMs > 0 ? 'frightened' : this.baseMode;
    const frightenedFlashing = this.frightenedMs > 0 && this.frightenedMs <= this.frightenedFlashMs;
    return { mode, modeChanged, reversedOnChange, frightenedMs: this.frightenedMs, frightenedFlashing };
  }
}
