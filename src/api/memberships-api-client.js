import {
  requireServerApiData,
  safeRequestServerApi,
} from "../engine/api/server-api-client.js";

export function readMembershipCatalog() {
  return requireServerApiData(
    safeRequestServerApi("/memberships/catalog"),
    "Membership catalog",
  );
}
