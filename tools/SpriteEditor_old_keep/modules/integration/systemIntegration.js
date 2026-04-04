import { createIntegrationRegistry } from "./integrationRegistry.js";
import {
  SYSTEM_INTEGRATION_EVENT_TYPES,
  createIntegrationContractError,
  ensureAllowedEventType
} from "./integrationContracts.js";

function createSystemIntegrationLayer({ eventBus } = {}) {
  const registry = createIntegrationRegistry({ eventBus });

  function emit(type, payload) {
    if (!eventBus || typeof eventBus.emit !== "function") return;
    eventBus.emit(type, payload);
  }

  function publish(eventType, payload) {
    const eventValidation = ensureAllowedEventType(eventType);
    if (!eventValidation.ok) {
      emit(SYSTEM_INTEGRATION_EVENT_TYPES.CONTRACT_ERROR, createIntegrationContractError(
        "DISALLOWED_EVENT_TYPE",
        eventValidation.reason,
        { eventType }
      ));
      return false;
    }
    emit(eventType, payload);
    return true;
  }

  function callPublicApi(systemId, methodName, ...args) {
    const api = registry.getPublicApi(systemId);
    if (!api) return { ok: false, value: null };
    const method = api && api[methodName];
    if (typeof method !== "function") return { ok: false, value: null };
    return { ok: true, value: method(...args) };
  }

  function runComposition(ownerId, compose) {
    if (typeof compose !== "function") return false;

    emit(SYSTEM_INTEGRATION_EVENT_TYPES.COMPOSITION_STARTED, {
      ownerId: String(ownerId || "unknown")
    });

    compose({
      publish,
      subscribe: (eventType, handler) => registry.subscribe(ownerId, eventType, handler),
      getPublicApi: (systemId) => registry.getPublicApi(systemId),
      callPublicApi
    });

    emit(SYSTEM_INTEGRATION_EVENT_TYPES.COMPOSITION_FINISHED, {
      ownerId: String(ownerId || "unknown")
    });

    return true;
  }

  function disposeOwner(ownerId) {
    registry.disposeOwnerSubscriptions(ownerId);
  }

  function disposeAll() {
    registry.disposeAllSubscriptions();
  }

  return {
    registerSystem: registry.registerSystem,
    unregisterSystem: registry.unregisterSystem,
    listSystems: registry.listSystemIds,
    getPublicApi: registry.getPublicApi,
    publish,
    runComposition,
    disposeOwner,
    disposeAll
  };
}

export { createSystemIntegrationLayer };
