/*
Toolbox Aid
David Quesenberry
03/25/2026
AttractModeController.js
*/
const DEFAULT_PHASES = ['title', 'highScores', 'demo'];

export default class AttractModeController {
  constructor({
    idleTimeoutMs = 15000,
    phaseDurationMs = 8000,
    phases = DEFAULT_PHASES,
    isInputActive = () => false,
    onEnterAttract = null,
    onExitAttract = null,
    onEnterDemo = null,
    onExitDemo = null,
    onPhaseChange = null,
  } = {}) {
    this.idleTimeoutMs = Math.max(0, idleTimeoutMs);
    this.phaseDurationMs = Math.max(1, phaseDurationMs);
    this.phases = Array.isArray(phases) && phases.length ? [...phases] : [...DEFAULT_PHASES];
    this.isInputActive = isInputActive;

    this.onEnterAttract = onEnterAttract;
    this.onExitAttract = onExitAttract;
    this.onEnterDemo = onEnterDemo;
    this.onExitDemo = onExitDemo;
    this.onPhaseChange = onPhaseChange;

    this.active = false;
    this.phaseIndex = 0;
    this.idleMs = 0;
    this.phaseMs = 0;
  }

  get phase() {
    return this.phases[this.phaseIndex] ?? this.phases[0] ?? 'title';
  }

  getSnapshot() {
    return {
      active: this.active,
      phase: this.phase,
      idleMs: this.idleMs,
      phaseMs: this.phaseMs,
    };
  }

  resetIdle() {
    this.idleMs = 0;
  }

  update(dtSeconds = 0) {
    const dtMs = Math.max(0, dtSeconds * 1000);

    if (this.isInputActive?.()) {
      if (this.active) {
        this.exitAttract();
      } else {
        this.resetIdle();
      }
      return;
    }

    this.idleMs += dtMs;

    if (!this.active && this.idleMs >= this.idleTimeoutMs) {
      this.enterAttract();
    }

    if (!this.active) {
      return;
    }

    this.phaseMs += dtMs;
    if (this.phaseMs >= this.phaseDurationMs) {
      this.nextPhase();
    }
  }

  enterAttract() {
    if (this.active) {
      return;
    }

    this.active = true;
    this.phaseIndex = 0;
    this.phaseMs = 0;
    this.onEnterAttract?.();
    if (this.phase === 'demo') {
      this.onEnterDemo?.();
    }
    this.onPhaseChange?.(this.phase);
  }

  exitAttract() {
    if (!this.active) {
      this.resetIdle();
      return;
    }

    const wasDemo = this.phase === 'demo';
    if (wasDemo) {
      this.onExitDemo?.();
    }

    this.onExitAttract?.();
    this.active = false;
    this.phaseIndex = 0;
    this.phaseMs = 0;
    this.idleMs = 0;
  }

  nextPhase() {
    if (!this.active || !this.phases.length) {
      return;
    }

    const previousPhase = this.phase;
    this.phaseIndex = (this.phaseIndex + 1) % this.phases.length;
    this.phaseMs = 0;

    if (previousPhase === 'demo' && this.phase !== 'demo') {
      this.onExitDemo?.();
    }
    if (previousPhase !== 'demo' && this.phase === 'demo') {
      this.onEnterDemo?.();
    }

    this.onPhaseChange?.(this.phase);
  }
}

export { AttractModeController as LegacyAttractModeController };
