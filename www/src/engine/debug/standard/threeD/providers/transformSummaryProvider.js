/*
Toolbox Aid
David Quesenberry
04/05/2026
transformSummaryProvider.js
*/

import {
  asArray,
  asNonNegativeInteger,
  asObject,
  createProvider,
  getAdapter,
  sanitizeText
} from "../shared/threeDDebugUtils.js";

export const PROVIDER_3D_TRANSFORM_SUMMARY = "provider.3d.transforms.snapshot";

function readTransformSummary(raw) {
  const source = asObject(raw);
  const selectedIds = asArray(source.selectedIds).map((id) => sanitizeText(id)).filter(Boolean);
  return {
    nodeCount: asNonNegativeInteger(source.nodeCount, 0),
    selectedCount: asNonNegativeInteger(source.selectedCount, selectedIds.length),
    selectedIds,
    frozenCount: asNonNegativeInteger(source.frozenCount, 0),
    dirtyCount: asNonNegativeInteger(source.dirtyCount, 0),
    activeNodeId: sanitizeText(source.activeNodeId) || "none"
  };
}

export function createTransformSummaryProvider(adapters = {}) {
  const adapter = getAdapter(adapters, "transformSummary");
  return createProvider(
    PROVIDER_3D_TRANSFORM_SUMMARY,
    "3D Transform Summary",
    (context = {}) => {
      const source = adapter ? adapter(context) : asObject(context?.threeD?.transformSummary);
      return readTransformSummary(source);
    }
  );
}
