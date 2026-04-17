/*
Toolbox Aid
David Quesenberry
04/17/2026
voxelTileRenderPipeline.js
*/
export const TILE_RENDER_FACE_ORDER = Object.freeze(['top', 'south', 'east']);

export const NORMALIZED_TILE_UV_RING = Object.freeze([
  Object.freeze({ u: 0, v: 0 }),
  Object.freeze({ u: 1, v: 0 }),
  Object.freeze({ u: 1, v: 1 }),
  Object.freeze({ u: 0, v: 1 }),
]);

const FACE_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'top',
    vertexKeys: Object.freeze(['p001', 'p101', 'p111', 'p011']),
    normal: Object.freeze({ x: 0, y: 1, z: 0 }),
  }),
  Object.freeze({
    id: 'south',
    vertexKeys: Object.freeze(['p011', 'p111', 'p110', 'p010']),
    normal: Object.freeze({ x: 0, y: 0, z: 1 }),
  }),
  Object.freeze({
    id: 'east',
    vertexKeys: Object.freeze(['p100', 'p110', 'p111', 'p101']),
    normal: Object.freeze({ x: 1, y: 0, z: 0 }),
  }),
]);

function cloneNormal(normal) {
  return { x: normal.x, y: normal.y, z: normal.z };
}

function cloneUvRing() {
  return NORMALIZED_TILE_UV_RING.map((entry) => ({ u: entry.u, v: entry.v }));
}

function projectVoxelVertices(worldToScreen, x, y, z) {
  return {
    p000: worldToScreen(x, y, z),
    p100: worldToScreen(x + 1, y, z),
    p110: worldToScreen(x + 1, y, z + 1),
    p010: worldToScreen(x, y, z + 1),
    p001: worldToScreen(x, y + 1, z),
    p101: worldToScreen(x + 1, y + 1, z),
    p111: worldToScreen(x + 1, y + 1, z + 1),
    p011: worldToScreen(x, y + 1, z + 1),
  };
}

export function buildVoxelTileFaces(worldToScreen, x, y, z) {
  const vertices = projectVoxelVertices(worldToScreen, x, y, z);
  return FACE_DEFINITIONS.map((definition) => ({
    id: definition.id,
    points: definition.vertexKeys.map((key) => vertices[key]),
    uv: cloneUvRing(),
    normal: cloneNormal(definition.normal),
    winding: 'ccw',
  }));
}

export function drawVoxelTileFaces(renderer, worldToScreen, x, y, z, options = {}) {
  const {
    baseRgb = [255, 255, 255],
    shadeColor,
    faceShading = {},
    strokeColor = '#111827',
    lineWidth = 1,
  } = options;

  if (typeof shadeColor !== 'function') {
    throw new Error('drawVoxelTileFaces requires a shadeColor(baseRgb, scale) function.');
  }

  const faces = buildVoxelTileFaces(worldToScreen, x, y, z);
  for (let index = 0; index < faces.length; index += 1) {
    const face = faces[index];
    const shadeScale = Number.isFinite(faceShading[face.id]) ? faceShading[face.id] : 1;
    renderer.drawPolygon(face.points, {
      fillColor: shadeColor(baseRgb, shadeScale),
      strokeColor,
      lineWidth,
    });
  }
  return faces;
}
