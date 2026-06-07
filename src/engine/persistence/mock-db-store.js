import * as localMockDbAdapter from "../../dev-runtime/persistence/mock-db-store.js";

let runtimeAdapter = localMockDbAdapter;

export const MOCK_DB_KEYS = localMockDbAdapter.MOCK_DB_KEYS;

export function configureMockDbRuntimeAdapter(adapter) {
  if (!adapter || typeof adapter !== "object") {
    throw new Error("Mock DB runtime adapter must be an object.");
  }
  runtimeAdapter = adapter;
}

export function getMockDbRuntimeAdapter() {
  return runtimeAdapter;
}

export function createMockDbAuditFields(...args) {
  return runtimeAdapter.createMockDbAuditFields(...args);
}

export function getMockDbSessionUser(...args) {
  return runtimeAdapter.getMockDbSessionUser(...args);
}

export function getMockDbSystemUser(...args) {
  return runtimeAdapter.getMockDbSystemUser(...args);
}

export function loadMockDbTables(...args) {
  return runtimeAdapter.loadMockDbTables(...args);
}

export function mockDbPersistenceEnabled(...args) {
  return runtimeAdapter.mockDbPersistenceEnabled(...args);
}

export function normalizeMockDbTables(...args) {
  return runtimeAdapter.normalizeMockDbTables(...args);
}

export function registerMockDbTables(...args) {
  return runtimeAdapter.registerMockDbTables(...args);
}

export function saveMockDbTables(...args) {
  return runtimeAdapter.saveMockDbTables(...args);
}
