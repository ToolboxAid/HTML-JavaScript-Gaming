import { safeRequestServerApi } from "./server-api-client.js";

function unwrap(response, context) {
  if (!response.ok) {
    throw new Error(response.error);
  }
  if (!response.payload || !Object.prototype.hasOwnProperty.call(response.payload, "data")) {
    throw new Error(`${context} did not return server data. Restore the server-backed DB Viewer API.`);
  }
  return response.payload.data;
}

export function getMockDbSnapshot() {
  return unwrap(safeRequestServerApi("/mock-db/snapshot"), "DB Viewer snapshot");
}

export function clearMockDb() {
  return unwrap(safeRequestServerApi("/mock-db/clear", { method: "POST" }), "Local Mem DB clear");
}

export function seedMockDb() {
  return unwrap(safeRequestServerApi("/mock-db/seed", { method: "POST" }), "Mock DB seed");
}
