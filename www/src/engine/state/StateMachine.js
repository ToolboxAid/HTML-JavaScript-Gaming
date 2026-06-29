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
    this.enter(initial, null, {});
  }

  enter(next, previous, context) {
    const state = this.states[next];
    if (state && typeof state.enter === 'function') {
      state.enter({ previous, current: next, context });
    }
  }

  exit(current, next, context) {
    const state = this.states[current];
    if (state && typeof state.exit === 'function') {
      state.exit({ current, next, context });
    }
  }

  canTransition(next, context = {}) {
    const state = this.states[this.current];
    if (!state || typeof state.canTransition !== 'function') {
      return true;
    }

    return state.canTransition({ current: this.current, next, context }) !== false;
  }

  transitionTo(next, context = {}) {
    if (!next || next === this.current || !this.states[next] || !this.canTransition(next, context)) {
      return false;
    }

    const previous = this.current;
    this.exit(previous, next, context);
    this.current = next;
    this.enter(next, previous, context);
    return true;
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

    this.transitionTo(next, context);
  }

  getState() {
    return this.current;
  }
}
