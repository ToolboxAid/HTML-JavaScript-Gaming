/*
Toolbox Aid
David Quesenberry
04/16/2026
createPhase18RuntimeLayer.js
*/
import createPhase18SchedulerHooks from './createPhase18SchedulerHooks.js';

const RUNTIME_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  STOPPED: 'stopped',
};

export default function createPhase18RuntimeLayer({ coreServices } = {}) {
  const schedulerHooks = createPhase18SchedulerHooks();
  let runtimeState = RUNTIME_STATES.IDLE;
  let tickCount = 0;
  let lastDtSeconds = 0;

  function notifyStateChange(previous, next, context = {}) {
    schedulerHooks.stateChange.run({ previous, next, context });
    const channel = coreServices?.get?.('phase18.channel');
    if (channel && typeof channel.publish === 'function') {
      channel.publish('phase18.runtime.state', { previous, next });
    }
  }

  function transitionTo(nextState, context = {}) {
    if (runtimeState === nextState) return false;
    const previous = runtimeState;
    runtimeState = nextState;
    notifyStateChange(previous, nextState, context);
    return true;
  }

  function start(context = {}) {
    if (runtimeState === RUNTIME_STATES.RUNNING) return false;
    coreServices?.start?.({ ...context, runtimeLayer: api });
    transitionTo(RUNTIME_STATES.RUNNING, context);
    return true;
  }

  function update(dtSeconds, context = {}) {
    if (runtimeState !== RUNTIME_STATES.RUNNING) return 0;
    const dt = Math.max(0, Number(dtSeconds) || 0);
    lastDtSeconds = dt;
    tickCount += 1;

    const payload = { dtSeconds: dt, tick: tickCount, context };
    schedulerHooks.beforeUpdate.run(payload);
    coreServices?.update?.(dt, { ...context, runtimeLayer: api, tick: tickCount });
    schedulerHooks.afterUpdate.run(payload);
    return tickCount;
  }

  function stop(context = {}) {
    if (runtimeState !== RUNTIME_STATES.RUNNING) return false;
    transitionTo(RUNTIME_STATES.STOPPED, context);
    coreServices?.stop?.({ ...context, runtimeLayer: api });
    return true;
  }

  function getSnapshot() {
    return {
      state: runtimeState,
      tickCount,
      lastDtSeconds,
      hookCounts: schedulerHooks.snapshot(),
      serviceIds: coreServices?.listServiceIds?.() || [],
    };
  }

  const api = {
    start,
    update,
    stop,
    getSnapshot,
    getState() {
      return runtimeState;
    },
    getService(serviceId) {
      return coreServices?.get?.(serviceId) || null;
    },
    listServiceIds() {
      return coreServices?.listServiceIds?.() || [];
    },
    onBeforeUpdate(handler) {
      return schedulerHooks.beforeUpdate.register(handler);
    },
    onAfterUpdate(handler) {
      return schedulerHooks.afterUpdate.register(handler);
    },
    onStateChange(handler) {
      return schedulerHooks.stateChange.register(handler);
    },
    states: RUNTIME_STATES,
  };

  return api;
}
