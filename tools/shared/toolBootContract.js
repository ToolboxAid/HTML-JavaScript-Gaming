import { trimSafe } from "../../src/shared/utils/stringUtils.js";

const BOOT_REGISTRY_KEY = "__TOOLS_BOOT_CONTRACT_REGISTRY__";

function getBootRegistry() {
  if (!globalThis[BOOT_REGISTRY_KEY] || typeof globalThis[BOOT_REGISTRY_KEY] !== "object") {
    globalThis[BOOT_REGISTRY_KEY] = {};
  }
  return globalThis[BOOT_REGISTRY_KEY];
}

function sanitizeToolId(toolId) {
  return trimSafe(toolId);
}

export function registerToolBootContract(toolId, contract = {}) {
  const id = sanitizeToolId(toolId);
  if (!id) {
    throw new Error("Tool boot contract requires a non-empty tool id.");
  }

  const safeContract = {
    toolId: id,
    init: typeof contract.init === "function" ? contract.init : (() => null),
    destroy: typeof contract.destroy === "function" ? contract.destroy : (() => true),
    getApi: typeof contract.getApi === "function" ? contract.getApi : (() => null)
  };

  const registry = getBootRegistry();
  registry[id] = safeContract;
  return safeContract;
}

export function getToolBootContract(toolId) {
  const id = sanitizeToolId(toolId);
  if (!id) {
    return null;
  }
  const registry = getBootRegistry();
  return registry[id] || null;
}
