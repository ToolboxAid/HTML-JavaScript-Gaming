import { safeRequestServerApi } from "./server-api-client.js";

function unwrap(response, fallback) {
  if (!response.ok) {
    throw new Error(response.error);
  }
  return response.payload?.data || fallback;
}

export function getMockDbSnapshot() {
  return unwrap(safeRequestServerApi("/mock-db/snapshot"), {
    cleared: false,
    owners: {},
    schemas: {},
    tables: {},
    toolGroups: {},
  });
}

export function clearMockDb() {
  return unwrap(safeRequestServerApi("/mock-db/clear", { method: "POST" }), {});
}

export function seedMockDb() {
  return unwrap(safeRequestServerApi("/mock-db/seed", { method: "POST" }), {});
}
