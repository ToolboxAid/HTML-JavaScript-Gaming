/*
Toolbox Aid
David Quesenberry
03/22/2026
RollbackDiagnostics.js
*/
export default class RollbackDiagnostics {
  constructor() {
    this.events = [];
  }

  record({
    frame,
    corrected = false,
    replayedInputs = 0,
    before = null,
    after = null,
  } = {}) {
    this.events.push({
      frame,
      corrected,
      replayedInputs,
      before,
      after,
    });
    this.events = this.events.slice(-12);
  }

  getSummary() {
    const corrections = this.events.filter((event) => event.corrected).length;
    const replayedInputs = this.events.reduce((sum, event) => sum + event.replayedInputs, 0);
    return {
      events: [...this.events],
      corrections,
      replayedInputs,
    };
  }
}
