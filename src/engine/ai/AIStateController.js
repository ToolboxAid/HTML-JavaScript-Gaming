/*
Toolbox Aid
David Quesenberry
03/22/2026
AIStateController.js
*/
import { StateMachine } from '../state/index.js';

export default class AIStateController {
  constructor({ initial = 'idle', states = {} } = {}) {
    this.states = states;
    this.machine = new StateMachine({
      initial,
      states: Object.fromEntries(Object.entries(states).map(([name, definition]) => ([
        name,
        {
          enter: definition.enter,
          exit: definition.exit,
          canTransition: definition.canTransition,
          update: (context) => {
            if (typeof definition.act === 'function') {
              definition.act(context);
            }

            return typeof definition.transition === 'function'
              ? (definition.transition(context) || null)
              : null;
          },
        },
      ]))),
    });
  }

  update(context = {}) {
    this.machine.update(context);
  }

  getState() {
    return this.machine.getState();
  }
}
