import {
  requireServerApiData,
  safeRequestServerApi,
} from "../engine/api/server-api-client.js";

export function readAdminOperationsStatus() {
  return requireServerApiData(
    safeRequestServerApi("/admin/operations/status"),
    "Admin Operations status",
  );
}

export function runAdminOperationAction(actionId, options = {}) {
  return requireServerApiData(
    safeRequestServerApi("/admin/operations/action", {
      body: { actionId, ...options },
      method: "POST",
    }),
    "Admin Operations action",
  );
}
