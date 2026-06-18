import {
  requireServerApiData,
  safeRequestServerApi,
} from "../engine/api/server-api-client.js";

export function readMarketplaceEntitlements() {
  return requireServerApiData(
    safeRequestServerApi("/marketplace/entitlements"),
    "Marketplace entitlements",
  );
}

export function readMarketplaceCategories() {
  return requireServerApiData(
    safeRequestServerApi("/marketplace/categories"),
    "Marketplace categories",
  );
}
