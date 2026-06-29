/*
Toolbox Aid
David Quesenberry
03/30/2026
registerWorldGameStateSystem.js
*/

import { WORLD_GAME_STATE_SYSTEM_ID } from '../constants.js';
import { createWorldGameStateSystem } from '../createWorldGameStateSystem.js';
import { createObjectiveProgressMirrorConsumer } from '../consumers/createObjectiveProgressMirrorConsumer.js';

function resolvePublishHook({ integrationApi, eventPipeline }) {
  if (eventPipeline && typeof eventPipeline.publish === 'function') {
    return (eventType, envelope) => eventPipeline.publish(eventType, envelope);
  }
  if (eventPipeline && typeof eventPipeline.publishEvent === 'function') {
    return (eventType, envelope) => eventPipeline.publishEvent(eventType, envelope);
  }
  if (eventPipeline && typeof eventPipeline.emit === 'function') {
    return (eventType, envelope) => eventPipeline.emit(eventType, envelope);
  }
  if (integrationApi && typeof integrationApi.publish === 'function') {
    return (eventType, envelope) => integrationApi.publish(eventType, envelope);
  }
  return null;
}

function registerWorldGameStateSystem({
  integrationApi = null,
  eventPipeline = null,
  stateSystem = null,
  consumerFactory = null,
  stateSystemOptions = null
} = {}) {
  const publishEvent = resolvePublishHook({ integrationApi, eventPipeline });
  const resolvedStateSystem = stateSystem || createWorldGameStateSystem({
    ...(stateSystemOptions || {}),
    publishEvent
  });
  const statePublicApi = typeof resolvedStateSystem.getPublicApi === 'function'
    ? resolvedStateSystem.getPublicApi()
    : resolvedStateSystem;

  const registerSystem = integrationApi && typeof integrationApi.registerSystem === 'function'
    ? integrationApi.registerSystem.bind(integrationApi)
    : null;
  const unregisterSystem = integrationApi && typeof integrationApi.unregisterSystem === 'function'
    ? integrationApi.unregisterSystem.bind(integrationApi)
    : null;
  const getPublicApi = integrationApi && typeof integrationApi.getPublicApi === 'function'
    ? integrationApi.getPublicApi.bind(integrationApi)
    : null;
  const runComposition = integrationApi && typeof integrationApi.runComposition === 'function'
    ? integrationApi.runComposition.bind(integrationApi)
    : null;
  const disposeOwner = integrationApi && typeof integrationApi.disposeOwner === 'function'
    ? integrationApi.disposeOwner.bind(integrationApi)
    : null;

  const systemRegistered = registerSystem
    ? registerSystem({
        systemId: WORLD_GAME_STATE_SYSTEM_ID,
        publicApi: statePublicApi
      }) === true
    : false;

  const consumer = typeof consumerFactory === 'function'
    ? consumerFactory({
        stateSystem: resolvedStateSystem,
        systemId: WORLD_GAME_STATE_SYSTEM_ID
      })
    : createObjectiveProgressMirrorConsumer();
  const consumerId = consumer && typeof consumer.getId === 'function'
    ? consumer.getId()
    : 'objectiveProgressMirrorConsumer';

  let consumerAttached = false;

  if (consumer && typeof consumer.attach === 'function' && runComposition) {
    let attachedViaComposition = false;
    runComposition(consumerId, ({ subscribe, getPublicApi: compositionGetPublicApi }) => {
      attachedViaComposition = consumer.attach({
        subscribe,
        getStateApi: () => {
          const apiFromComposition = typeof compositionGetPublicApi === 'function'
            ? compositionGetPublicApi(WORLD_GAME_STATE_SYSTEM_ID)
            : null;
          return apiFromComposition || statePublicApi;
        }
      });
    });
    consumerAttached = attachedViaComposition;
  }

  if (consumer && typeof consumer.attach === 'function' && !consumerAttached) {
    const subscribeDirect = eventPipeline && typeof eventPipeline.subscribe === 'function'
      ? eventPipeline.subscribe.bind(eventPipeline)
      : (eventPipeline && typeof eventPipeline.on === 'function'
          ? eventPipeline.on.bind(eventPipeline)
          : null);
    if (subscribeDirect) {
      consumerAttached = consumer.attach({
        subscribe: subscribeDirect,
        getStateApi: () => {
          const externalApi = getPublicApi ? getPublicApi(WORLD_GAME_STATE_SYSTEM_ID) : null;
          return externalApi || statePublicApi;
        }
      });
    }
  }

  function dispose() {
    if (consumer && typeof consumer.detach === 'function') {
      consumer.detach();
    }
    if (disposeOwner) {
      disposeOwner(consumerId);
    }
    if (systemRegistered && unregisterSystem) {
      unregisterSystem(WORLD_GAME_STATE_SYSTEM_ID);
    }
  }

  return {
    ok: true,
    systemId: WORLD_GAME_STATE_SYSTEM_ID,
    systemRegistered,
    consumerId,
    consumerAttached,
    stateSystem: resolvedStateSystem,
    getStateApi: () => statePublicApi,
    getConsumerApi: () => consumer || null,
    dispose
  };
}

export { registerWorldGameStateSystem };
