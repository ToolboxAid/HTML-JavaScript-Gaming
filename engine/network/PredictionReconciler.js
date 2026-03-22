/*
Toolbox Aid
David Quesenberry
03/22/2026
PredictionReconciler.js
*/
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function distance(a, b) {
  return Math.abs((a?.x ?? 0) - (b?.x ?? 0)) + Math.abs((a?.y ?? 0) - (b?.y ?? 0));
}

export default class PredictionReconciler {
  constructor({ applyInput } = {}) {
    this.applyInput = applyInput || ((state, input) => ({
      ...state,
      x: (state.x || 0) + (input.dx || 0),
      y: (state.y || 0) + (input.dy || 0),
    }));
    this.state = { x: 0, y: 0 };
    this.sequence = 0;
    this.history = [];
  }

  setState(state) {
    this.state = clone(state);
  }

  predict(input) {
    this.sequence += 1;
    this.state = this.applyInput(clone(this.state), input);
    this.history.push({
      sequence: this.sequence,
      input: clone(input),
    });
    return {
      sequence: this.sequence,
      state: clone(this.state),
    };
  }

  reconcile(authoritativeState, acknowledgedSequence = 0) {
    const before = clone(this.state);
    this.state = clone(authoritativeState);
    const pending = this.history.filter((entry) => entry.sequence > acknowledgedSequence);
    this.history = pending;
    pending.forEach((entry) => {
      this.state = this.applyInput(clone(this.state), entry.input);
    });

    return {
      corrected: distance(before, this.state) > 0,
      replayedInputs: pending.length,
      state: clone(this.state),
      before,
      authoritativeState: clone(authoritativeState),
    };
  }

  getState() {
    return clone(this.state);
  }
}
