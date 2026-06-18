import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readAiCreditDisplay() {
  return requireServerApiData(
    safeRequestServerApi("/ai-credits/display"),
    "AI credit display",
  );
}

