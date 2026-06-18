import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readMembershipCatalog() {
  return requireServerApiData(
    safeRequestServerApi("/memberships/catalog"),
    "Membership catalog",
  );
}
