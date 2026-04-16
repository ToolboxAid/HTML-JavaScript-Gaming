/*
Toolbox Aid
David Quesenberry
04/16/2026
collisionOverlaysProvider.js
*/

import {
  asArray,
  asNonNegativeInteger,
  asObject,
  createProvider,
  getAdapter,
  sanitizeText
} from "../shared/threeDDebugUtils.js";

export const PROVIDER_3D_COLLISION_OVERLAYS = "provider.3d.collisionOverlays.snapshot";

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  return fallback;
}

function toOverlayRow(rawOverlay, index) {
  if (typeof rawOverlay === "string") {
    const overlayId = sanitizeText(rawOverlay) || `overlay-${index + 1}`;
    return {
      overlayId,
      kind: "bounds",
      state: "active",
      enabled: true,
      order: index
    };
  }

  const source = asObject(rawOverlay);
  const overlayId = sanitizeText(source.overlayId) || sanitizeText(source.id) || `overlay-${index + 1}`;
  const kind = sanitizeText(source.kind) || sanitizeText(source.type) || "bounds";
  const state = sanitizeText(source.state) || sanitizeText(source.status) || "unknown";
  const enabled = toBoolean(source.enabled, state === "active");
  const order = asNonNegativeInteger(source.order, index);

  return {
    overlayId,
    kind,
    state,
    enabled,
    order
  };
}

function byDeterministicOrder(left, right) {
  if (left.order !== right.order) {
    return left.order - right.order;
  }
  return left.overlayId.localeCompare(right.overlayId);
}

function readCollisionOverlays(raw) {
  const source = asObject(raw);
  const rawRows = Array.isArray(source.overlayRows)
    ? source.overlayRows
    : Array.isArray(source.overlays)
      ? source.overlays
      : asArray(source.activeOverlays);

  const overlayRows = rawRows
    .map((overlay, index) => toOverlayRow(overlay, index))
    .sort(byDeterministicOrder);

  return {
    overlayRows,
    overlayCount: overlayRows.length,
    activeCount: overlayRows.filter((overlay) => overlay.enabled === true).length
  };
}

export function createCollisionOverlaysProvider(adapters = {}) {
  const adapter = getAdapter(adapters, "collisionOverlays");
  return createProvider(
    PROVIDER_3D_COLLISION_OVERLAYS,
    "3D Collision Overlays",
    (context = {}) => {
      const source = adapter ? adapter(context) : asObject(context?.threeD?.collisionOverlays);
      return readCollisionOverlays(source);
    }
  );
}
