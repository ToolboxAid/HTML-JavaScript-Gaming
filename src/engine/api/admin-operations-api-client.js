import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readAdminOperationsStatus() {
  return requireServerApiData(
    safeRequestServerApi("/admin/operations/status"),
    "Admin Operations status",
  );
}

export function runAdminOperationAction(actionId) {
  return requireServerApiData(
    safeRequestServerApi("/admin/operations/action", {
      body: { actionId },
      method: "POST",
    }),
    "Admin Operations action",
  );
}
