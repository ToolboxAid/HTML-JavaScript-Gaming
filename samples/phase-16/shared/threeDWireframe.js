/*
Toolbox Aid
David Quesenberry
04/15/2026
threeDWireframe.js
*/
const BOX_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

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

export function drawWireBox(renderer, transform3D, size3D, cameraState, viewport, color = '#ffffff', lineWidth = 2) {
  const vertices = createBoxVertices(transform3D, size3D);
  const projected = vertices.map((vertex) => projectPoint(vertex, cameraState, viewport));

  for (const [startIndex, endIndex] of BOX_EDGES) {
    const start = projected[startIndex];
    const end = projected[endIndex];
    if (!start || !end) {
      continue;
    }
    renderer.drawLine(start.x, start.y, end.x, end.y, color, lineWidth);
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
