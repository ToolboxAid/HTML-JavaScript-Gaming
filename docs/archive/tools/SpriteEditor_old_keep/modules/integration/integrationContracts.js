import { SPRITE_EDITOR_EVENT_TYPES } from "../events/eventTypes.js";

const SYSTEM_INTEGRATION_EVENT_TYPES = Object.freeze({
  SYSTEM_REGISTERED: "spriteEditor:integration:systemRegistered",
  SYSTEM_UNREGISTERED: "spriteEditor:integration:systemUnregistered",
  COMPOSITION_STARTED: "spriteEditor:integration:compositionStarted",
  COMPOSITION_FINISHED: "spriteEditor:integration:compositionFinished",
  CONTRACT_ERROR: "spriteEditor:integration:contractError"
});

const SYSTEM_INTEGRATION_ALLOWED_EVENT_TYPES = Object.freeze({
  ...SPRITE_EDITOR_EVENT_TYPES,
  ...SYSTEM_INTEGRATION_EVENT_TYPES
});

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function validateSystemContract(contract) {
  if (!isPlainObject(contract)) return { ok: false, reason: "Contract must be an object." };
  const systemId = String(contract.systemId || "").trim();
  if (!systemId) return { ok: false, reason: "Contract requires a non-empty systemId." };
  if (!isPlainObject(contract.publicApi)) return { ok: false, reason: "Contract requires a publicApi object." };
  return { ok: true };
}

function ensureAllowedEventType(eventType) {
  const normalized = String(eventType || "").trim();
  if (!normalized) return { ok: false, reason: "Event type is required." };
  const knownEventType = Object.values(SYSTEM_INTEGRATION_ALLOWED_EVENT_TYPES).includes(normalized);
  const looksNamespaced = /^[a-z][a-z0-9]*(?:[.:][a-zA-Z0-9_-]+){2,}$/.test(normalized);
  if (!knownEventType && !looksNamespaced) {
    return { ok: false, reason: `Event type is not approved: ${normalized}` };
  }
  return { ok: true };
}

function createIntegrationContractError(code, message, details = null) {
  return {
    code: String(code || "INTEGRATION_CONTRACT_ERROR"),
    message: String(message || "Integration contract error."),
    details: details || null
  };
}

export {
  SYSTEM_INTEGRATION_ALLOWED_EVENT_TYPES,
  SYSTEM_INTEGRATION_EVENT_TYPES,
  createIntegrationContractError,
  ensureAllowedEventType,
  validateSystemContract
};
