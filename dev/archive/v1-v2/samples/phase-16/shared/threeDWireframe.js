/*
Toolbox Aid
David Quesenberry
04/15/2026
threeDWireframe.js
*/
import { getNextBottomRightDebugPanelRect } from '/src/engine/debug/DebugOverlayLayout.js';

const BOX_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];
const PHASE16_CAMERA_MODES = ['follow', 'wide', 'overhead'];

function createBoxVertices(transform3D, size3D) {
  const x = transform3D.x;
  const y = transform3D.y;
  const z = transform3D.z;
  const w = size3D.width;
  const h = size3D.height;
  const d = size3D.depth;
  return [
    { x, y, z },
    { x: x + w, y, z },
    { x: x + w, y: y + h, z },
    { x, y: y + h, z },
    { x, y, z: z + d },
    { x: x + w, y, z: z + d },
    { x: x + w, y: y + h, z: z + d },
    { x, y: y + h, z: z + d },
  ];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function parseHexChannel(channel) {
  return Number.parseInt(channel, 16);
}

function parseHexColor(color) {
  if (typeof color !== 'string' || !color.startsWith('#')) {
    return null;
  }

  if (color.length === 4) {
    const r = parseHexChannel(color[1] + color[1]);
    const g = parseHexChannel(color[2] + color[2]);
    const b = parseHexChannel(color[3] + color[3]);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b };
  }

  if (color.length === 7) {
    const r = parseHexChannel(color.slice(1, 3));
    const g = parseHexChannel(color.slice(3, 5));
    const b = parseHexChannel(color.slice(5, 7));
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b };
  }

  return null;
}

function colorFromRgb(rgb) {
  return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
}

function applyDepthCueToColor(color, depth, nearDepth, farDepth) {
  const rgb = parseHexColor(color);
  if (!rgb) {
    return color;
  }

  const depthT = clamp01((depth - nearDepth) / Math.max(0.0001, farDepth - nearDepth));
  const brightness = 1.08 - depthT * 0.5;
  return colorFromRgb({
    r: clamp(rgb.r * brightness, 0, 255),
    g: clamp(rgb.g * brightness, 0, 255),
    b: clamp(rgb.b * brightness, 0, 255),
  });
}

function rotateToCameraSpace(point, cameraState) {
  const yaw = -(cameraState.rotation.y ?? 0);
  const pitch = cameraState.rotation.x ?? 0;

  let x = point.x - cameraState.position.x;
  let y = point.y - cameraState.position.y;
  let z = point.z - cameraState.position.z;

  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const yawX = x * cosYaw - z * sinYaw;
  const yawZ = x * sinYaw + z * cosYaw;
  x = yawX;
  z = yawZ;

  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const pitchY = y * cosPitch - z * sinPitch;
  const pitchZ = y * sinPitch + z * cosPitch;

  return {
    x,
    y: pitchY,
    z: pitchZ,
  };
}

export function projectPoint(point, cameraState, viewport) {
  const localPoint = rotateToCameraSpace(point, cameraState);
  if (localPoint.z <= 0.2) {
    return null;
  }

  const scale = viewport.focalLength / localPoint.z;
  return {
    x: viewport.centerX + localPoint.x * scale,
    y: viewport.centerY - localPoint.y * scale,
    depth: localPoint.z,
  };
}

export function createProjectionViewport(viewport) {
  return {
    centerX: viewport.x + viewport.width * 0.5,
    centerY: viewport.y + viewport.height * 0.5,
    focalLength: viewport.focalLength,
  };
}

export function createPhase16ViewState({
  defaultCameraMode = 'follow',
  debugOverlayEnabled = true,
} = {}) {
  const initialCameraMode = PHASE16_CAMERA_MODES.includes(defaultCameraMode) ? defaultCameraMode : 'follow';
  return {
    cameraMode: initialCameraMode,
    debugOverlayEnabled,
    cameraToggleLatch: false,
    debugToggleLatch: false,
  };
}

export function stepPhase16ViewToggles(viewState, input, { cameraToggleKey = 'KeyC', debugToggleKey = 'KeyV' } = {}) {
  if (!viewState) {
    return viewState;
  }

  const cameraPressed = input?.isDown(cameraToggleKey) === true;
  if (cameraPressed && !viewState.cameraToggleLatch) {
    const modeIndex = PHASE16_CAMERA_MODES.indexOf(viewState.cameraMode);
    const nextIndex = (modeIndex + 1 + PHASE16_CAMERA_MODES.length) % PHASE16_CAMERA_MODES.length;
    viewState.cameraMode = PHASE16_CAMERA_MODES[nextIndex];
  }
  viewState.cameraToggleLatch = cameraPressed;

  const debugPressed = input?.isDown(debugToggleKey) === true;
  if (debugPressed && !viewState.debugToggleLatch) {
    viewState.debugOverlayEnabled = !viewState.debugOverlayEnabled;
  }
  viewState.debugToggleLatch = debugPressed;

  return viewState;
}

function computeLookRotation(cameraPosition, targetPosition) {
  const dx = targetPosition.x - cameraPosition.x;
  const dy = targetPosition.y - cameraPosition.y;
  const dz = targetPosition.z - cameraPosition.z;
  const yaw = Math.atan2(dx, dz);
  const horizontal = Math.hypot(dx, dz) || 1;
  const pitch = Math.atan2(dy, horizontal);
  return { yaw, pitch };
}

function copyPose(basePose) {
  return {
    position: {
      x: basePose.position.x,
      y: basePose.position.y,
      z: basePose.position.z,
    },
    rotation: {
      x: basePose.rotation.x,
      y: basePose.rotation.y,
      z: basePose.rotation.z,
    },
  };
}

export function resolvePhase16CameraPose(basePose, focusPoint, cameraMode = 'follow') {
  const pose = copyPose(basePose);
  if (!focusPoint || cameraMode === 'follow') {
    return pose;
  }

  const baseOffset = {
    x: pose.position.x - focusPoint.x,
    y: pose.position.y - focusPoint.y,
    z: pose.position.z - focusPoint.z,
  };

  if (cameraMode === 'wide') {
    pose.position.x = focusPoint.x + baseOffset.x * 1.55;
    pose.position.y = focusPoint.y + baseOffset.y * 1.45 + 0.9;
    pose.position.z = focusPoint.z + baseOffset.z * 1.55;
    const look = computeLookRotation(pose.position, focusPoint);
    pose.rotation.x = look.pitch;
    pose.rotation.y = -look.yaw;
    pose.rotation.z = 0;
    return pose;
  }

  if (cameraMode === 'overhead') {
    pose.position.x = focusPoint.x + baseOffset.x * 0.12;
    pose.position.y = focusPoint.y + Math.max(11.5, Math.abs(baseOffset.y) * 2.3);
    pose.position.z = focusPoint.z + baseOffset.z * 0.12;
    const look = computeLookRotation(pose.position, focusPoint);
    pose.rotation.x = look.pitch;
    pose.rotation.y = -look.yaw;
    pose.rotation.z = 0;
    return pose;
  }

  return pose;
}

export function applyPhase16CameraMode(camera3D, viewState, basePose, focusPoint) {
  const cameraMode = viewState?.cameraMode ?? 'follow';
  const pose = resolvePhase16CameraPose(basePose, focusPoint, cameraMode);
  camera3D.setPosition(pose.position);
  camera3D.setRotation(pose.rotation);
  return pose;
}

export function drawDepthBackdrop(renderer, viewport, {
  bands = 8,
  alphaNear = 0.12,
  alphaFar = 0.38,
  tint = '9, 14, 28',
} = {}) {
  const safeBands = Math.max(1, bands);
  const bandHeight = viewport.height / safeBands;
  for (let i = 0; i < safeBands; i += 1) {
    const t = i / Math.max(1, safeBands - 1);
    const alpha = alphaNear + (alphaFar - alphaNear) * t;
    renderer.drawRect(
      viewport.x,
      viewport.y + i * bandHeight,
      viewport.width,
      bandHeight + 1,
      `rgba(${tint}, ${alpha.toFixed(3)})`,
    );
  }
}

export function drawPhase16DebugOverlay(renderer, viewport, viewState, lines = [], { stack = null } = {}) {
  if (!viewState?.debugOverlayEnabled) {
    return;
  }

  const overlayLines = [
    `View mode: ${viewState.cameraMode}`,
    'Depth cue: enabled',
    'Toggle camera: C | Toggle debug: V',
    ...lines,
  ];

  const width = Math.min(420, viewport.width - 24);
  const height = 30 + overlayLines.length * 18;
  const defaultX = viewport.x + 12;
  const defaultY = viewport.y + 12;
  const rect = stack
    ? getNextBottomRightDebugPanelRect(stack, width, height)
    : { x: defaultX, y: defaultY, width, height };
  renderer.drawRect(rect.x, rect.y, rect.width, rect.height, 'rgba(15, 23, 42, 0.84)');
  renderer.strokeRect(rect.x, rect.y, rect.width, rect.height, '#475569', 1);
  overlayLines.forEach((line, index) => {
    renderer.drawText(line, rect.x + 10, rect.y + 22 + index * 18, {
      color: '#e2e8f0',
      font: '13px monospace',
    });
  });
}

export function drawWireBox(renderer, transform3D, size3D, cameraState, viewport, color = '#ffffff', lineWidthOrOptions = 2) {
  const options = typeof lineWidthOrOptions === 'number'
    ? { lineWidth: lineWidthOrOptions }
    : (lineWidthOrOptions ?? {});
  const lineWidth = options.lineWidth ?? 2;
  const depthCueEnabled = options.depthCueEnabled !== false;
  const nearDepth = options.nearDepth ?? 3;
  const farDepth = options.farDepth ?? 44;

  const vertices = createBoxVertices(transform3D, size3D);
  const projected = vertices.map((vertex) => projectPoint(vertex, cameraState, viewport));

  for (const [startIndex, endIndex] of BOX_EDGES) {
    const start = projected[startIndex];
    const end = projected[endIndex];
    if (!start || !end) {
      continue;
    }
    const edgeDepth = (start.depth + end.depth) * 0.5;
    const edgeColor = depthCueEnabled ? applyDepthCueToColor(color, edgeDepth, nearDepth, farDepth) : color;
    const depthT = clamp01((edgeDepth - nearDepth) / Math.max(0.0001, farDepth - nearDepth));
    const widthScale = depthCueEnabled ? (1.12 - depthT * 0.45) : 1;
    renderer.drawLine(start.x, start.y, end.x, end.y, edgeColor, Math.max(1, lineWidth * widthScale));
  }
}

export function drawGroundGrid(
  renderer,
  {
    minX = -8,
    maxX = 8,
    minZ = 2,
    maxZ = 24,
    y = -1,
    step = 2,
    xColor = '#22354f',
    zColor = '#334155',
  },
  cameraState,
  viewport,
) {
  for (let lineZ = minZ; lineZ <= maxZ; lineZ += step) {
    const start = projectPoint({ x: minX, y, z: lineZ }, cameraState, viewport);
    const end = projectPoint({ x: maxX, y, z: lineZ }, cameraState, viewport);
    if (start && end) {
      renderer.drawLine(start.x, start.y, end.x, end.y, zColor, 1);
    }
  }

  for (let lineX = minX; lineX <= maxX; lineX += step) {
    const start = projectPoint({ x: lineX, y, z: minZ }, cameraState, viewport);
    const end = projectPoint({ x: lineX, y, z: maxZ }, cameraState, viewport);
    if (start && end) {
      renderer.drawLine(start.x, start.y, end.x, end.y, xColor, 1);
    }
  }
}
