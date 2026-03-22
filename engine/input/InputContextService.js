/*
Toolbox Aid
David Quesenberry
03/22/2026
InputContextService.js
*/
import ActionInputMap from './ActionInputMap.js';
import ActionInputService from './ActionInputService.js';

export default class InputContextService extends ActionInputService {
  constructor({ contexts = {}, initialContext = null } = {}) {
    const [firstContext] = Object.keys(contexts);
    const activeContext = initialContext || firstContext || 'default';
    super({
      actionMap: contexts[activeContext] instanceof ActionInputMap
        ? contexts[activeContext]
        : new ActionInputMap(contexts[activeContext] || {}),
    });

    this.contexts = new Map();
    for (const [name, bindings] of Object.entries(contexts)) {
      this.contexts.set(name, bindings instanceof ActionInputMap ? bindings : new ActionInputMap(bindings));
    }
    if (!this.contexts.has(activeContext)) {
      this.contexts.set(activeContext, new ActionInputMap());
    }
    this.activeContext = activeContext;
    this.actionMap = this.contexts.get(this.activeContext);
  }

  setContext(name) {
    if (!this.contexts.has(name)) {
      return false;
    }

    this.activeContext = name;
    this.actionMap = this.contexts.get(name);
    return true;
  }

  getContext() {
    return this.activeContext;
  }

  getContexts() {
    return Array.from(this.contexts.keys());
  }

  registerContext(name, bindings = {}) {
    this.contexts.set(name, bindings instanceof ActionInputMap ? bindings : new ActionInputMap(bindings));
    if (!this.activeContext) {
      this.setContext(name);
    }
  }
}
