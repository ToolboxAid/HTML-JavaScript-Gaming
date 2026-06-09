import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readToolboxVoteSnapshot() {
  return requireServerApiData(
    safeRequestServerApi("/toolbox/votes/snapshot"),
    "Toolbox votes snapshot",
  );
}

export function castToolboxVote(toolId, direction) {
  return requireServerApiData(
    safeRequestServerApi("/toolbox/votes/cast", {
      body: { direction, toolId },
      method: "POST",
    }),
    "Toolbox vote cast",
  );
}

