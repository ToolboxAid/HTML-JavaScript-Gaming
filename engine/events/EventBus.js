/*
Toolbox Aid
David Quesenberry
03/22/2026
EventBus.js
*/
export default class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, handler) {
    if (!eventName || typeof handler !== 'function') {
      return () => {};
    }

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    const entry = { handler, once: false };
    this.listeners.get(eventName).add(entry);
    return () => this.off(eventName, handler);
  }

  once(eventName, handler) {
    if (!eventName || typeof handler !== 'function') {
      return () => {};
    }

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    const entry = { handler, once: true };
    this.listeners.get(eventName).add(entry);
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    const entries = this.listeners.get(eventName);
    if (!entries) {
      return;
    }

    for (const entry of entries) {
      if (entry.handler === handler) {
        entries.delete(entry);
      }
    }

    if (entries.size === 0) {
      this.listeners.delete(eventName);
    }
  }

  emit(eventName, payload = undefined) {
    const entries = this.listeners.get(eventName);
    if (!entries || entries.size === 0) {
      return 0;
    }

    const snapshot = [...entries];
    let count = 0;

    snapshot.forEach((entry) => {
      entry.handler(payload, eventName);
      count += 1;

      if (entry.once) {
        entries.delete(entry);
      }
    });

    if (entries.size === 0) {
      this.listeners.delete(eventName);
    }

    return count;
  }

  listenerCount(eventName) {
    return this.listeners.get(eventName)?.size ?? 0;
  }

  clear(eventName = null) {
    if (eventName) {
      this.listeners.delete(eventName);
      return;
    }

    this.listeners.clear();
  }
}
