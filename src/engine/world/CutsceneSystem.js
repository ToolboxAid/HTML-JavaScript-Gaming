/*
Toolbox Aid
David Quesenberry
03/22/2026
CutsceneSystem.js
*/
export default class CutsceneSystem {
  constructor({ steps = [] } = {}) {
    this.steps = steps;
    this.index = 0;
    this.elapsed = 0;
    this.active = steps.length > 0;
  }

  update(dt, context = {}) {
    if (!this.active) {
      return null;
    }

    const step = this.steps[this.index];
    if (!step) {
      this.active = false;
      return null;
    }

    if (!step.started) {
      step.started = true;
      step.enter?.(context);
    }

    this.elapsed += dt;
    step.update?.(dt, context, this.elapsed);

    if (this.elapsed >= (step.duration ?? 0)) {
      step.exit?.(context);
      this.index += 1;
      this.elapsed = 0;
      if (this.index >= this.steps.length) {
        this.active = false;
      }
    }

    return this.getCurrentStep();
  }

  getCurrentStep() {
    return this.active ? this.steps[this.index] ?? null : null;
  }
}
