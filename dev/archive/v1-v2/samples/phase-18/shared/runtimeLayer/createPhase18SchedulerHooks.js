/*
Toolbox Aid
David Quesenberry
04/16/2026
createPhase18SchedulerHooks.js
*/
function createHookChannel() {
  const handlers = new Set();

  function register(handler) {
    if (typeof handler !== 'function') return () => {};
    handlers.add(handler);
    return () => handlers.delete(handler);
  }

  function run(payload) {
    let executed = 0;
    for (const handler of handlers) {
      handler(payload);
      executed += 1;
    }
    return executed;
  }

  function count() {
    return handlers.size;
  }

  return {
    register,
    run,
    count,
  };
}

export default function createPhase18SchedulerHooks() {
  const beforeUpdate = createHookChannel();
  const afterUpdate = createHookChannel();
  const stateChange = createHookChannel();

  return {
    beforeUpdate,
    afterUpdate,
    stateChange,
    snapshot() {
      return {
        beforeUpdate: beforeUpdate.count(),
        afterUpdate: afterUpdate.count(),
        stateChange: stateChange.count(),
      };
    },
  };
}
