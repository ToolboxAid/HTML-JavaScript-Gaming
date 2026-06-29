import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

function requireAdminSetupApiData(response, context) {
  return requireServerApiData(response, context, {
    restoreMessage: "Restore the admin setup API.",
  });
}

export function readAdminSetupStatus() {
  return requireAdminSetupApiData(safeRequestServerApi("/admin/setup/status"), "Admin setup status");
}
