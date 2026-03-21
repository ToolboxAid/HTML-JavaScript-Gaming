/*
Toolbox Aid
David Quesenberry
03/21/2026
StateMachine.js
*/
export default class StateMachine {
  constructor({ initial = 'idle', states = {} } = {}) {
    this.states = states;
    this.current = initial;
    this.enter(initial, null);
  }

  enter(next, previous) {
    const state = this.states[next];
    if (state && typeof state.enter === 'function') {
      state.enter(previous);
    }
  }

  update(context = {}) {
    const state = this.states[this.current];
    if (!state) {
      return;
    }

    let next = null;

    if (typeof state.update === 'function') {
      next = state.update(context) || null;
    }

    if (next && next !== this.current) {
      const previous = this.current;
      this.current = next;
      this.enter(next, previous);
    }
  }

  getState() {
    return this.current;
  }
}
