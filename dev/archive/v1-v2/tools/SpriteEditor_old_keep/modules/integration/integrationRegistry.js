import {
  SYSTEM_INTEGRATION_EVENT_TYPES,
  createIntegrationContractError,
  ensureAllowedEventType,
  validateSystemContract
} from "./integrationContracts.js";

function createIntegrationRegistry({ eventBus }) {
  const contractsBySystemId = new Map();
  const subscriptionsByOwnerId = new Map();

  function emit(type, payload) {
    if (!eventBus || typeof eventBus.emit !== "function") return;
    eventBus.emit(type, payload);
  }

  function registerSystem(contract) {
    const validation = validateSystemContract(contract);
    if (!validation.ok) {
      emit(SYSTEM_INTEGRATION_EVENT_TYPES.CONTRACT_ERROR, createIntegrationContractError(
        "INVALID_SYSTEM_CONTRACT",
        validation.reason,
        { contract }
      ));
      return false;
    }

    const systemId = String(contract.systemId).trim();
    contractsBySystemId.set(systemId, {
      systemId,
      publicApi: contract.publicApi
    });

    emit(SYSTEM_INTEGRATION_EVENT_TYPES.SYSTEM_REGISTERED, { systemId });
    return true;
  }

  function unregisterSystem(systemId) {
    const normalizedId = String(systemId || "").trim();
    if (!normalizedId || !contractsBySystemId.has(normalizedId)) return false;
    contractsBySystemId.delete(normalizedId);
    emit(SYSTEM_INTEGRATION_EVENT_TYPES.SYSTEM_UNREGISTERED, { systemId: normalizedId });
    return true;
  }

  function getPublicApi(systemId) {
    const normalizedId = String(systemId || "").trim();
    const contract = contractsBySystemId.get(normalizedId);
    return contract ? contract.publicApi : null;
  }

  function listSystemIds() {
    return Array.from(contractsBySystemId.keys());
  }

  function subscribe(ownerId, eventType, handler) {
    const normalizedOwnerId = String(ownerId || "").trim();
    if (!normalizedOwnerId || typeof handler !== "function") return () => {};

    const eventValidation = ensureAllowedEventType(eventType);
    if (!eventValidation.ok) {
      emit(SYSTEM_INTEGRATION_EVENT_TYPES.CONTRACT_ERROR, createIntegrationContractError(
        "DISALLOWED_EVENT_TYPE",
        eventValidation.reason,
        { ownerId: normalizedOwnerId, eventType }
      ));
      return () => {};
    }

    if (!eventBus || typeof eventBus.on !== "function") return () => {};

    const unsubscribe = eventBus.on(eventType, handler);
    if (!subscriptionsByOwnerId.has(normalizedOwnerId)) {
      subscriptionsByOwnerId.set(normalizedOwnerId, new Set());
    }
    const ownerSubscriptions = subscriptionsByOwnerId.get(normalizedOwnerId);
    ownerSubscriptions.add(unsubscribe);

    return () => {
      unsubscribe();
      ownerSubscriptions.delete(unsubscribe);
      if (!ownerSubscriptions.size) {
        subscriptionsByOwnerId.delete(normalizedOwnerId);
      }
    };
  }

  function disposeOwnerSubscriptions(ownerId) {
    const normalizedOwnerId = String(ownerId || "").trim();
    const ownerSubscriptions = subscriptionsByOwnerId.get(normalizedOwnerId);
    if (!ownerSubscriptions) return;
    Array.from(ownerSubscriptions).forEach((dispose) => dispose());
    subscriptionsByOwnerId.delete(normalizedOwnerId);
  }

  function disposeAllSubscriptions() {
    Array.from(subscriptionsByOwnerId.keys()).forEach((ownerId) => {
      disposeOwnerSubscriptions(ownerId);
    });
  }

  return {
    registerSystem,
    unregisterSystem,
    getPublicApi,
    listSystemIds,
    subscribe,
    disposeOwnerSubscriptions,
    disposeAllSubscriptions
  };
}

export { createIntegrationRegistry };
