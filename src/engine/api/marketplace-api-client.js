import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

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
