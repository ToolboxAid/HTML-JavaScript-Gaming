/*
Toolbox Aid
David Quesenberry
04/16/2026
createPhase19IntegrationFlow.js
*/
import createPhase19CoreServices from '../coreServices/createPhase19CoreServices.js';
import createPhase19RuntimeLayer from '../runtimeLayer/createPhase19RuntimeLayer.js';

export default function createPhase19IntegrationFlow({
  coreServices = createPhase19CoreServices(),
  runtimeLayer = createPhase19RuntimeLayer({ coreServices }),
} = {}) {
  let heartbeatEvents = 0;
  let runtimeStateEvents = 0;
  let lastHeartbeatTick = 0;
  let lastHeartbeatSeconds = 0;
  let lastRuntimeState = 'idle';
  let heartbeatUnsubscribe = null;
  let runtimeStateUnsubscribe = null;

  function attachChannels() {
    if (heartbeatUnsubscribe || runtimeStateUnsubscribe) return;
    const channel = runtimeLayer.getService('phase19.channel');
    if (!channel || typeof channel.subscribe !== 'function') return;

    heartbeatUnsubscribe = channel.subscribe('phase19.heartbeat', (payload) => {
      heartbeatEvents += 1;
      lastHeartbeatTick = Number(payload?.tick) || 0;
      lastHeartbeatSeconds = Number(payload?.t) || 0;
    });
    runtimeStateUnsubscribe = channel.subscribe('phase19.runtime.state', (payload) => {
      runtimeStateEvents += 1;
      lastRuntimeState = String(payload?.next || lastRuntimeState);
    });
  }

  function detachChannels() {
    if (typeof heartbeatUnsubscribe === 'function') {
      heartbeatUnsubscribe();
    }
    if (typeof runtimeStateUnsubscribe === 'function') {
      runtimeStateUnsubscribe();
    }
    heartbeatUnsubscribe = null;
    runtimeStateUnsubscribe = null;
  }

  function start(context = {}) {
    attachChannels();
    return runtimeLayer.start(context);
  }

  function update(dtSeconds, context = {}) {
    return runtimeLayer.update(dtSeconds, context);
  }

  function stop(context = {}) {
    const stopped = runtimeLayer.stop(context);
    detachChannels();
    return stopped;
  }

  function getSnapshot() {
    return {
      runtime: runtimeLayer.getSnapshot(),
      flow: {
        heartbeatEvents,
        runtimeStateEvents,
        lastHeartbeatTick,
        lastHeartbeatSeconds,
        lastRuntimeState,
        subscriptionsActive: Boolean(heartbeatUnsubscribe || runtimeStateUnsubscribe),
      },
    };
  }

  return {
    start,
    update,
    stop,
    getSnapshot,
    getService: runtimeLayer.getService,
    getState: runtimeLayer.getState,
    states: runtimeLayer.states,
    onBeforeUpdate: runtimeLayer.onBeforeUpdate,
    onAfterUpdate: runtimeLayer.onAfterUpdate,
    onStateChange: runtimeLayer.onStateChange,
    getCoreServices() {
      return coreServices;
    },
    getRuntimeLayer() {
      return runtimeLayer;
    },
  };
}
