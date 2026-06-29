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

export function updateToolboxVoteOrder(toolId, order) {
  return requireServerApiData(
    safeRequestServerApi("/toolbox/votes/order", {
      body: { order, toolId },
      method: "POST",
    }),
    "Toolbox vote order update",
  );
}

export function reorderToolboxVoteRows(toolIds) {
  return requireServerApiData(
    safeRequestServerApi("/toolbox/votes/order-list", {
      body: { toolIds },
      method: "POST",
    }),
    "Toolbox vote row reorder",
  );
}

export function updateToolboxVoteMetadata(toolId, metadata) {
  return requireServerApiData(
    safeRequestServerApi("/toolbox/votes/metadata", {
      body: { ...metadata, toolId },
      method: "POST",
    }),
    "Toolbox vote metadata update",
  );
}
