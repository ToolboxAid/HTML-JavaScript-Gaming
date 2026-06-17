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
