import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readOwnerAiCreditSettings() {
  return requireServerApiData(
    safeRequestServerApi("/owner/ai-credits/settings"),
    "Owner AI credit settings",
  );
}

export function updateOwnerAiCreditSettings(payload) {
  return requireServerApiData(
    safeRequestServerApi("/owner/ai-credits/settings", {
      body: payload,
      method: "POST",
    }),
    "Owner AI credit settings update",
  );
}
