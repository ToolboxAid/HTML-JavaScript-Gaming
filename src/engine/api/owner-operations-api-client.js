import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readOwnerOperationsStatus() {
  return requireServerApiData(
    safeRequestServerApi("/owner/operations/status"),
    "Owner Operations status",
  );
}

export function validateOwnerOperationsConnection() {
  return requireServerApiData(
    safeRequestServerApi("/owner/operations/validate", {
      method: "POST",
    }),
    "Owner Operations connection validation",
  );
}

export function runOwnerOperationAction(actionId) {
  return requireServerApiData(
    safeRequestServerApi("/owner/operations/action", {
      body: { actionId },
      method: "POST",
    }),
    "Owner Operations action",
  );
}
