import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readPlatformBanner() {
  return requireServerApiData(
    safeRequestServerApi("/platform-settings/banner"),
    "Platform banner",
  );
}

export function readAdminPlatformBanner() {
  return requireServerApiData(
    safeRequestServerApi("/admin/platform-settings/banner"),
    "Admin platform banner",
  );
}

export function updateAdminPlatformBanner(banner) {
  return requireServerApiData(
    safeRequestServerApi("/admin/platform-settings/banner", {
      body: banner,
      method: "POST",
    }),
    "Admin platform banner update",
  );
}
