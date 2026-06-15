import { safeRequestServerApi } from "./server-api-client.js";

function unwrap(response, context) {
  if (!response.ok) {
    throw new Error(response.error);
  }
  if (!response.payload || !Object.prototype.hasOwnProperty.call(response.payload, "data")) {
    throw new Error(`${context} did not return server data. Restore the admin setup API.`);
  }
  return response.payload.data;
}

export function reseedAdminSetup() {
  return unwrap(safeRequestServerApi("/admin/setup/reseed", { method: "POST" }), "Admin setup reseed");
}

export function readAdminSetupStatus() {
  return unwrap(safeRequestServerApi("/admin/setup/status"), "Admin setup status");
}
