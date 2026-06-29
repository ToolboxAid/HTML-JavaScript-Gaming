import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

function requireDbViewerApiData(response, context) {
  return requireServerApiData(response, context, {
    restoreMessage: "Restore the server-backed DB Viewer API.",
  });
}

export function getDbViewerSnapshot() {
  return requireDbViewerApiData(safeRequestServerApi("/product-data/snapshot"), "DB Viewer snapshot");
}
