function createEventBus() {
  const listenersByType = new Map();

  function getListeners(type) {
    if (!listenersByType.has(type)) {
      listenersByType.set(type, new Set());
    }
    return listenersByType.get(type);
  }

  return {
    on(type, handler) {
      if (typeof type !== "string" || !type || typeof handler !== "function") {
        return () => {};
      }
      const listeners = getListeners(type);
      listeners.add(handler);
      return () => {
        listeners.delete(handler);
        if (!listeners.size) {
          listenersByType.delete(type);
        }
      };
    },

    off(type, handler) {
      if (typeof type !== "string" || !type || typeof handler !== "function") return;
      const listeners = listenersByType.get(type);
      if (!listeners) return;
      listeners.delete(handler);
      if (!listeners.size) {
        listenersByType.delete(type);
      }
    },

    emit(type, payload) {
      if (typeof type !== "string" || !type) return;
      const listeners = listenersByType.get(type);
      if (!listeners || !listeners.size) return;
      const snapshot = Array.from(listeners);
      for (let i = 0; i < snapshot.length; i += 1) {
        snapshot[i](payload);
      }
    }
  };
}

export { createEventBus };
