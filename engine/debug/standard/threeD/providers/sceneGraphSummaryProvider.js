/*
Toolbox Aid
David Quesenberry
04/05/2026
sceneGraphSummaryProvider.js
*/

import {
  asArray,
  asNonNegativeInteger,
  asObject,
  createProvider,
  getAdapter,
  sanitizeText
} from "../shared/threeDDebugUtils.js";

export const PROVIDER_3D_SCENE_GRAPH_SUMMARY = "provider.3d.sceneGraph.snapshot";

function readSceneGraphSummary(raw) {
  const source = asObject(raw);
  const rootNodeIds = asArray(source.rootNodeIds)
    .map((id) => sanitizeText(id))
    .filter(Boolean);
  return {
    nodeCount: asNonNegativeInteger(source.nodeCount, 0),
    rootCount: asNonNegativeInteger(source.rootCount, rootNodeIds.length),
    maxDepth: asNonNegativeInteger(source.maxDepth, 0),
    rootNodeIds
  };
}

export function createSceneGraphSummaryProvider(adapters = {}) {
  const adapter = getAdapter(adapters, "sceneGraphSummary");
  return createProvider(
    PROVIDER_3D_SCENE_GRAPH_SUMMARY,
    "3D Scene Graph Summary",
    (context = {}) => {
      const source = adapter ? adapter(context) : asObject(context?.threeD?.sceneGraphSummary);
      return readSceneGraphSummary(source);
    }
  );
}
