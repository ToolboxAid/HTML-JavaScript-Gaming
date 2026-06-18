import {
  requireServerApiData,
  safeRequestServerApi,
} from "../engine/api/server-api-client.js";

export function readOwnerMembershipSettings() {
  return requireServerApiData(
    safeRequestServerApi("/owner/memberships/settings"),
    "Owner membership settings",
  );
}

export function updateOwnerMembershipSettings(payload) {
  return requireServerApiData(
    safeRequestServerApi("/owner/memberships/settings", {
      body: payload,
      method: "POST",
    }),
    "Owner membership settings update",
  );
}
