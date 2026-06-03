/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2VendorSystem.js
*/

export const ENGINE_V2_VENDOR_ACTIONS = Object.freeze({
  BUY: "buy",
  SELL: "sell",
  EXCHANGE: "exchange",
});

export const ENGINE_V2_VENDOR_ERRORS = Object.freeze({
  DEFINITIONS_INVALID: "ENGINE_V2_VENDOR_DEFINITIONS_INVALID",
  REQUESTS_INVALID: "ENGINE_V2_VENDOR_REQUESTS_INVALID",
  CURRENCIES_INVALID: "ENGINE_V2_VENDOR_CURRENCIES_INVALID",
  DEFINITION_INVALID: "ENGINE_V2_VENDOR_DEFINITION_INVALID",
  REQUEST_INVALID: "ENGINE_V2_VENDOR_REQUEST_INVALID",
  VENDOR_MISSING: "ENGINE_V2_VENDOR_MISSING",
  OFFER_MISSING: "ENGINE_V2_VENDOR_OFFER_MISSING",
  CURRENCY_MISSING: "ENGINE_V2_VENDOR_CURRENCY_MISSING",
});

export function resolveEngineV2Vendor({ vendorDefinitions, vendorRequests, currencyDefinitions }) {
  const errors = [];

  if (!Array.isArray(vendorDefinitions)) {
    errors.push(createVendorError(ENGINE_V2_VENDOR_ERRORS.DEFINITIONS_INVALID, "Vendor system requires vendorDefinitions array.", "vendorDefinitions"));
  }

  if (!Array.isArray(vendorRequests)) {
    errors.push(createVendorError(ENGINE_V2_VENDOR_ERRORS.REQUESTS_INVALID, "Vendor system requires vendorRequests array.", "vendorRequests"));
  }

  if (!Array.isArray(currencyDefinitions)) {
    errors.push(createVendorError(ENGINE_V2_VENDOR_ERRORS.CURRENCIES_INVALID, "Vendor system requires currencyDefinitions array.", "currencyDefinitions"));
  }

  if (errors.length > 0) {
    return createVendorResult({ vendorEvents: [], inventoryActions: [], economyActions: [], errors });
  }

  vendorDefinitions.forEach((definition, index) => validateVendorDefinition(definition, `vendorDefinitions[${index}]`).forEach((error) => errors.push(error)));
  vendorRequests.forEach((request, index) => validateVendorRequest(request, `vendorRequests[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createVendorResult({ vendorEvents: [], inventoryActions: [], economyActions: [], errors });
  }

  const vendorsById = new Map(vendorDefinitions.map((definition) => [definition.vendorId, definition]));
  const currencyIds = new Set(currencyDefinitions.map((definition) => definition.currencyId));
  const vendorEvents = [];
  const inventoryActions = [];
  const economyActions = [];

  vendorRequests.forEach((request, index) => {
    const path = `vendorRequests[${index}]`;
    const vendor = vendorsById.get(request.vendorId);

    if (!vendor) {
      errors.push(createVendorError(ENGINE_V2_VENDOR_ERRORS.VENDOR_MISSING, "Vendor request references missing vendor.", `${path}.vendorId`));
      return;
    }

    const offer = vendor.offers.find((entry) => entry.offerId === request.offerId);

    if (!offer) {
      errors.push(createVendorError(ENGINE_V2_VENDOR_ERRORS.OFFER_MISSING, "Vendor request references missing offer.", `${path}.offerId`));
      return;
    }

    if (!currencyIds.has(offer.currencyId)) {
      errors.push(createVendorError(ENGINE_V2_VENDOR_ERRORS.CURRENCY_MISSING, "Vendor offer references missing currency.", `vendorDefinitions.${vendor.vendorId}.offers`));
      return;
    }

    vendorEvents.push(Object.freeze({ requestId: request.requestId, vendorId: request.vendorId, offerId: request.offerId, actionType: request.actionType }));

    if (request.actionType === ENGINE_V2_VENDOR_ACTIONS.BUY) {
      economyActions.push(Object.freeze({ actionId: request.requestId, actionType: "spend", ownerInstanceId: request.actorInstanceId, currencyId: offer.currencyId, amount: offer.price }));
      inventoryActions.push(Object.freeze({ actionId: request.requestId, actionType: "add", inventoryId: request.actorInventoryId, itemId: offer.itemId, quantity: offer.quantity }));
    } else if (request.actionType === ENGINE_V2_VENDOR_ACTIONS.SELL) {
      economyActions.push(Object.freeze({ actionId: request.requestId, actionType: "add", ownerInstanceId: request.actorInstanceId, currencyId: offer.currencyId, amount: offer.price }));
      inventoryActions.push(Object.freeze({ actionId: request.requestId, actionType: "remove", inventoryId: request.actorInventoryId, itemId: offer.itemId, quantity: offer.quantity }));
    } else {
      economyActions.push(Object.freeze({ actionId: request.requestId, actionType: "exchange", ownerInstanceId: request.actorInstanceId, currencyId: offer.currencyId, amount: offer.price, targetCurrencyId: offer.targetCurrencyId, targetAmount: offer.targetAmount }));
    }
  });

  if (errors.length > 0) {
    return createVendorResult({ vendorEvents: [], inventoryActions: [], economyActions: [], errors });
  }

  return createVendorResult({ vendorEvents, inventoryActions, economyActions, errors });
}

function validateVendorDefinition(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.vendorId) || !hasNonEmptyString(definition.ownerInstanceId) || !Array.isArray(definition.offers)) {
    return [createVendorError(ENGINE_V2_VENDOR_ERRORS.DEFINITION_INVALID, "Vendor definition requires vendorId, ownerInstanceId, and offers.", path)];
  }

  if (!definition.offers.every((offer) => isRecord(offer) && hasNonEmptyString(offer.offerId) && hasNonEmptyString(offer.itemId) && hasNonEmptyString(offer.currencyId) && Number.isFinite(offer.price) && offer.price >= 0 && Number.isInteger(offer.quantity) && offer.quantity > 0)) {
    return [createVendorError(ENGINE_V2_VENDOR_ERRORS.DEFINITION_INVALID, "Vendor offers require offerId, itemId, currencyId, price, and quantity.", `${path}.offers`)];
  }

  return [];
}

function validateVendorRequest(request, path) {
  if (!isRecord(request) || !hasNonEmptyString(request.requestId) || !hasNonEmptyString(request.vendorId) || !hasNonEmptyString(request.offerId) || !hasNonEmptyString(request.actorInstanceId) || !hasNonEmptyString(request.actorInventoryId) || !Object.values(ENGINE_V2_VENDOR_ACTIONS).includes(request.actionType)) {
    return [createVendorError(ENGINE_V2_VENDOR_ERRORS.REQUEST_INVALID, "Vendor request requires requestId, vendorId, offerId, actor IDs, and actionType.", path)];
  }

  return [];
}

function createVendorResult({ vendorEvents, inventoryActions, economyActions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    vendorEvents: Object.freeze(vendorEvents),
    inventoryActions: Object.freeze(inventoryActions),
    economyActions: Object.freeze(economyActions),
    errors: Object.freeze(errors),
  });
}

function createVendorError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
