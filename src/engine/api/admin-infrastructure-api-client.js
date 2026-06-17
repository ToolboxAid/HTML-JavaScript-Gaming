import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readAdminInfrastructureStoragePathStatus() {
  return requireServerApiData(
    safeRequestServerApi("/admin/infrastructure/storage-path-status"),
    "Admin Infrastructure storage path status",
  );
}

export function runAdminInfrastructureStorageConnectivityAction(actionId) {
  return requireServerApiData(
    safeRequestServerApi("/admin/infrastructure/storage-connectivity-action", {
      body: { actionId },
      method: "POST",
    }),
    "Admin Infrastructure storage connectivity action",
  );
}
