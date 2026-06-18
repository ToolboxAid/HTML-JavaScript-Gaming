import { safeRequestServerApi } from "../engine/api/server-api-client.js";

function unwrap(response, context) {
  if (!response.ok) {
    throw new Error(response.error);
  }
  if (!response.payload || !Object.prototype.hasOwnProperty.call(response.payload, "data")) {
    throw new Error(`${context} did not return server data. Restore the server-backed DB Viewer API.`);
  }
  return response.payload.data;
}

export function getDbViewerSnapshot() {
  return unwrap(safeRequestServerApi("/product-data/snapshot"), "DB Viewer snapshot");
}
