/*
Toolbox Aid
David Quesenberry
03/22/2026
RegressionPlaybackHarness.js
*/
export default class RegressionPlaybackHarness {
  constructor() {
    this.scenarios = new Map();
  }

  register(id, frames) {
    this.scenarios.set(id, frames.map((frame) => ({ ...frame })));
  }

  play(id) {
    return (this.scenarios.get(id) || []).map((frame) => ({ ...frame }));
  }
}
