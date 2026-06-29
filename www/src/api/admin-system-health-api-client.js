import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readAdminSystemHealthStatus() {
  return requireServerApiData(
    safeRequestServerApi("/admin/system-health/status"),
    "Admin System Health status",
  );
}

export function runAdminSystemHealthStorageConnectivityAction(actionId) {
  return requireServerApiData(
    safeRequestServerApi("/admin/system-health/storage-connectivity-action", {
      body: { actionId },
      method: "POST",
    }),
    "Admin System Health storage connectivity action",
  );
}

export function runAdminSystemHealthStorageExpandedValidation() {
  return runAdminSystemHealthStorageConnectivityAction("storage-expanded-validation");
}

export function runAdminSystemHealthAction(actionId) {
  return requireServerApiData(
    safeRequestServerApi("/admin/system-health/action", {
      body: { actionId },
      method: "POST",
    }),
    "Admin System Health action",
  );
}
