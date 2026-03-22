/*
Toolbox Aid
David Quesenberry
03/22/2026
EventScriptSystem.js
*/
export default class EventScriptSystem {
  constructor({ bus, scripts = [] } = {}) {
    this.bus = bus;
    this.scripts = [];
    this.unsubscribers = [];
    scripts.forEach((script) => this.register(script));
  }

  register(script) {
    this.scripts.push(script);
    const unsubscribe = this.bus.on(script.event, (payload) => {
      script.actions?.forEach((action) => {
        action(payload, this.bus);
      });
    });
    this.unsubscribers.push(unsubscribe);
  }

  dispose() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
  }
}
