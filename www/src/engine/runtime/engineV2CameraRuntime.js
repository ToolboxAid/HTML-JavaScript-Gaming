/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2CameraRuntime.js
*/

import { clamp } from "../../shared/math/scalars.js";

export const ENGINE_V2_CAMERA_TYPES = Object.freeze({
  FOLLOW: "follow",
  FIXED: "fixed",
});

export const ENGINE_V2_CAMERA_ERRORS = Object.freeze({
  CONFIG_INVALID: "ENGINE_V2_CAMERA_CONFIG_INVALID",
  STATE_INVALID: "ENGINE_V2_CAMERA_STATE_INVALID",
  VIEWPORT_INVALID: "ENGINE_V2_CAMERA_VIEWPORT_INVALID",
  OBJECTS_INVALID: "ENGINE_V2_CAMERA_OBJECTS_INVALID",
  CAMERA_TYPE_INVALID: "ENGINE_V2_CAMERA_TYPE_INVALID",
  TARGET_REQUIRED: "ENGINE_V2_CAMERA_TARGET_REQUIRED",
  TARGET_MISSING: "ENGINE_V2_CAMERA_TARGET_MISSING",
  POSITION_REQUIRED: "ENGINE_V2_CAMERA_POSITION_REQUIRED",
  BOUNDS_INVALID: "ENGINE_V2_CAMERA_BOUNDS_INVALID",
  DEAD_ZONE_INVALID: "ENGINE_V2_CAMERA_DEAD_ZONE_INVALID",
  ZOOM_INVALID: "ENGINE_V2_CAMERA_ZOOM_INVALID",
});

export function resolveEngineV2Camera({ cameraConfig, cameraState, runtimeObjects, viewport }) {
  const errors = [];

  validateCameraConfig(cameraConfig).forEach((error) => errors.push(error));
  validateCameraState(cameraState).forEach((error) => errors.push(error));
  validateViewport(viewport).forEach((error) => errors.push(error));

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createCameraError(
      ENGINE_V2_CAMERA_ERRORS.OBJECTS_INVALID,
      "Engine V2 camera runtime requires runtimeObjects array.",
      "runtimeObjects"
    ));
  }

  if (errors.length > 0) {
    return createCameraResult({ camera: null, errors });
  }

  if (cameraConfig.cameraType === ENGINE_V2_CAMERA_TYPES.FOLLOW && !runtimeObjects.some((runtimeObject) => runtimeObject.instanceId === cameraConfig.targetInstanceId)) {
    errors.push(createCameraError(
      ENGINE_V2_CAMERA_ERRORS.TARGET_MISSING,
      "Follow camera target does not exist.",
      "cameraConfig.targetInstanceId"
    ));
  }

  if (errors.length > 0) {
    return createCameraResult({ camera: null, errors });
  }

  const camera = cameraConfig.cameraType === ENGINE_V2_CAMERA_TYPES.FIXED
    ? resolveFixedCamera(cameraConfig, viewport)
    : resolveFollowCamera(cameraConfig, cameraState, runtimeObjects, viewport);

  return createCameraResult({ camera: Object.freeze(camera), errors });
}

function resolveFixedCamera(cameraConfig, viewport) {
  const clampedPosition = clampCameraPosition(cameraConfig.position, cameraConfig.bounds, viewport, cameraConfig.zoom);

  return {
    cameraId: cameraConfig.cameraId,
    cameraType: cameraConfig.cameraType,
    x: clampedPosition.x,
    y: clampedPosition.y,
    zoom: cameraConfig.zoom,
    viewport: Object.freeze({ ...viewport }),
    bounds: Object.freeze({ ...cameraConfig.bounds }),
  };
}

function resolveFollowCamera(cameraConfig, cameraState, runtimeObjects, viewport) {
  const target = runtimeObjects.find((runtimeObject) => runtimeObject.instanceId === cameraConfig.targetInstanceId);
  const targetCenter = {
    x: target.position.x + target.size.width / 2,
    y: target.position.y + target.size.height / 2,
  };
  const deadZoneWorld = {
    x: cameraState.x + cameraConfig.deadZone.x,
    y: cameraState.y + cameraConfig.deadZone.y,
    width: cameraConfig.deadZone.width,
    height: cameraConfig.deadZone.height,
  };
  const nextPosition = { x: cameraState.x, y: cameraState.y };

  if (targetCenter.x < deadZoneWorld.x) {
    nextPosition.x = targetCenter.x - cameraConfig.deadZone.x;
  } else if (targetCenter.x > deadZoneWorld.x + deadZoneWorld.width) {
    nextPosition.x = targetCenter.x - cameraConfig.deadZone.x - cameraConfig.deadZone.width;
  }

  if (targetCenter.y < deadZoneWorld.y) {
    nextPosition.y = targetCenter.y - cameraConfig.deadZone.y;
  } else if (targetCenter.y > deadZoneWorld.y + deadZoneWorld.height) {
    nextPosition.y = targetCenter.y - cameraConfig.deadZone.y - cameraConfig.deadZone.height;
  }

  const clampedPosition = clampCameraPosition(nextPosition, cameraConfig.bounds, viewport, cameraConfig.zoom);

  return {
    cameraId: cameraConfig.cameraId,
    cameraType: cameraConfig.cameraType,
    targetInstanceId: cameraConfig.targetInstanceId,
    x: clampedPosition.x,
    y: clampedPosition.y,
    zoom: cameraConfig.zoom,
    viewport: Object.freeze({ ...viewport }),
    bounds: Object.freeze({ ...cameraConfig.bounds }),
    deadZone: Object.freeze({ ...cameraConfig.deadZone }),
  };
}

function clampCameraPosition(position, bounds, viewport, zoom) {
  const visibleWidth = viewport.width / zoom;
  const visibleHeight = viewport.height / zoom;

  return {
    x: clamp(position.x, bounds.x, Math.max(bounds.x, bounds.x + bounds.width - visibleWidth)),
    y: clamp(position.y, bounds.y, Math.max(bounds.y, bounds.y + bounds.height - visibleHeight)),
  };
}

function validateCameraConfig(cameraConfig) {
  const errors = [];

  if (!isRecord(cameraConfig) || !hasNonEmptyString(cameraConfig.cameraId)) {
    return [createCameraError(
      ENGINE_V2_CAMERA_ERRORS.CONFIG_INVALID,
      "Camera config requires cameraId.",
      "cameraConfig"
    )];
  }

  if (![ENGINE_V2_CAMERA_TYPES.FOLLOW, ENGINE_V2_CAMERA_TYPES.FIXED].includes(cameraConfig.cameraType)) {
    errors.push(createCameraError(
      ENGINE_V2_CAMERA_ERRORS.CAMERA_TYPE_INVALID,
      "Camera config uses unsupported cameraType.",
      "cameraConfig.cameraType"
    ));
  }

  if (!Number.isFinite(cameraConfig.zoom) || cameraConfig.zoom <= 0) {
    errors.push(createCameraError(
      ENGINE_V2_CAMERA_ERRORS.ZOOM_INVALID,
      "Camera config requires positive numeric zoom.",
      "cameraConfig.zoom"
    ));
  }

  if (!isRect(cameraConfig.bounds)) {
    errors.push(createCameraError(
      ENGINE_V2_CAMERA_ERRORS.BOUNDS_INVALID,
      "Camera config requires numeric bounds.",
      "cameraConfig.bounds"
    ));
  }

  if (cameraConfig.cameraType === ENGINE_V2_CAMERA_TYPES.FOLLOW) {
    if (!hasNonEmptyString(cameraConfig.targetInstanceId)) {
      errors.push(createCameraError(
        ENGINE_V2_CAMERA_ERRORS.TARGET_REQUIRED,
        "Follow camera config requires targetInstanceId.",
        "cameraConfig.targetInstanceId"
      ));
    }

    if (!isRect(cameraConfig.deadZone)) {
      errors.push(createCameraError(
        ENGINE_V2_CAMERA_ERRORS.DEAD_ZONE_INVALID,
        "Follow camera config requires numeric deadZone.",
        "cameraConfig.deadZone"
      ));
    }
  }

  if (cameraConfig.cameraType === ENGINE_V2_CAMERA_TYPES.FIXED && !isPosition(cameraConfig.position)) {
    errors.push(createCameraError(
      ENGINE_V2_CAMERA_ERRORS.POSITION_REQUIRED,
      "Fixed camera config requires explicit position.",
      "cameraConfig.position"
    ));
  }

  return errors;
}

function validateCameraState(cameraState) {
  if (!isPosition(cameraState)) {
    return [createCameraError(
      ENGINE_V2_CAMERA_ERRORS.STATE_INVALID,
      "Camera runtime requires explicit cameraState position.",
      "cameraState"
    )];
  }

  return [];
}

function validateViewport(viewport) {
  if (!isRecord(viewport) || !Number.isFinite(viewport.width) || viewport.width <= 0 || !Number.isFinite(viewport.height) || viewport.height <= 0) {
    return [createCameraError(
      ENGINE_V2_CAMERA_ERRORS.VIEWPORT_INVALID,
      "Camera runtime requires positive numeric viewport.",
      "viewport"
    )];
  }

  return [];
}

function createCameraResult({ camera, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    camera,
    errors: Object.freeze(errors),
  });
}

function createCameraError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRect(value) {
  return isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.width) && value.width > 0 && Number.isFinite(value.height) && value.height > 0;
}

function isPosition(value) {
  return isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
