/*
Toolbox Aid
David Quesenberry
04/05/2026
cameraSummaryProvider.js
*/

import {
  asFinite,
  asObject,
  createProvider,
  getAdapter,
  sanitizeText
} from "../shared/threeDDebugUtils.js";

export const PROVIDER_3D_CAMERA_SUMMARY = "provider.3d.camera.snapshot";

function readCameraSummary(raw) {
  const source = asObject(raw);
  const position = asObject(source.position);
  const rotation = asObject(source.rotation);
  return {
    activeCameraId: sanitizeText(source.activeCameraId) || "none",
    mode: sanitizeText(source.mode) || "unknown",
    position: {
      x: asFinite(position.x, 0),
      y: asFinite(position.y, 0),
      z: asFinite(position.z, 0)
    },
    rotation: {
      x: asFinite(rotation.x, 0),
      y: asFinite(rotation.y, 0),
      z: asFinite(rotation.z, 0)
    },
    fov: asFinite(source.fov, 0),
    zoom: asFinite(source.zoom, 1),
    near: asFinite(source.near, 0.1),
    far: asFinite(source.far, 1000)
  };
}

export function createCameraSummaryProvider(adapters = {}) {
  const adapter = getAdapter(adapters, "cameraSummary");
  return createProvider(
    PROVIDER_3D_CAMERA_SUMMARY,
    "3D Camera Summary",
    (context = {}) => {
      const source = adapter ? adapter(context) : asObject(context?.threeD?.cameraSummary);
      return readCameraSummary(source);
    }
  );
}
