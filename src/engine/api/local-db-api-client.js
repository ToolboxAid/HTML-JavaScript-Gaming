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

export function getLocalDbSnapshot() {
  return unwrap(safeRequestServerApi("/local-db/snapshot"), "DB Viewer snapshot");
}

export function clearLocalDb() {
  return unwrap(safeRequestServerApi("/local-db/clear", { method: "POST" }), "Local DB clear");
}

export function seedLocalDb() {
  return unwrap(safeRequestServerApi("/local-db/seed", { method: "POST" }), "Local DB seed");
}
