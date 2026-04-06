/*
Toolbox Aid
David Quesenberry
04/05/2026
collisionSummaryProvider.js
*/

import {
  asNonNegativeInteger,
  asObject,
  createProvider,
  getAdapter
} from "../shared/threeDDebugUtils.js";

export const PROVIDER_3D_COLLISION_SUMMARY = "provider.3d.collisions.snapshot";

function readCollisionSummary(raw) {
  const source = asObject(raw);
  return {
    colliderCount: asNonNegativeInteger(source.colliderCount, 0),
    triggerCount: asNonNegativeInteger(source.triggerCount, 0),
    broadphasePairs: asNonNegativeInteger(source.broadphasePairs, 0),
    narrowphasePairs: asNonNegativeInteger(source.narrowphasePairs, 0),
    activeContacts: asNonNegativeInteger(source.activeContacts, 0)
  };
}

export function createCollisionSummaryProvider(adapters = {}) {
  const adapter = getAdapter(adapters, "collisionSummary");
  return createProvider(
    PROVIDER_3D_COLLISION_SUMMARY,
    "3D Collision Summary",
    (context = {}) => {
      const source = adapter ? adapter(context) : asObject(context?.threeD?.collisionSummary);
      return readCollisionSummary(source);
    }
  );
}
