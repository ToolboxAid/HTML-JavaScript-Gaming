import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readGameJourneyCompletionMetrics() {
  const response = safeRequestServerApi("/game-journey/completion-metrics");
  return requireServerApiData(response, "Game Journey completion metrics");
}

export function updateGameJourneyCompletionMetric(bucketKey, updates = {}) {
  const response = safeRequestServerApi(`/game-journey/completion-metrics/${encodeURIComponent(bucketKey)}`, {
    body: updates,
    method: "POST",
  });
  return requireServerApiData(response, "Game Journey completion metric update");
}
