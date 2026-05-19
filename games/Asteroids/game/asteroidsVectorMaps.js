const ASTEROIDS_VECTOR_MAP_TOOL_KEY = 'vector-map-editor';
const ASTEROIDS_VECTOR_MAP_DOCUMENT_KEY = 'vectorMapDocument';

export const ASTEROIDS_VECTOR_MAP_IDS = Object.freeze({
  attractAsteroid: 'vector.asteroids.attract.asteroid',
  attractShip: 'vector.asteroids.attract.ship',
  attractUfo: 'vector.asteroids.attract.ufo',
  bullet: 'vector.asteroids.bullet',
  shipCollision: 'vector.asteroids.ship.collision',
  shipLife: 'vector.asteroids.ship.life',
  ufoLargeCollision: 'vector.asteroids.ufo.large.collision',
  ufoSmallCollision: 'vector.asteroids.ufo.small.collision',
  uiTitle: 'vector.asteroids.ui.title',
});

export const ASTEROIDS_REQUIRED_VECTOR_MAP_IDS = Object.freeze([
  ASTEROIDS_VECTOR_MAP_IDS.attractAsteroid,
  ASTEROIDS_VECTOR_MAP_IDS.attractShip,
  ASTEROIDS_VECTOR_MAP_IDS.attractUfo,
  ASTEROIDS_VECTOR_MAP_IDS.bullet,
  ASTEROIDS_VECTOR_MAP_IDS.shipCollision,
  ASTEROIDS_VECTOR_MAP_IDS.shipLife,
  ASTEROIDS_VECTOR_MAP_IDS.ufoLargeCollision,
  ASTEROIDS_VECTOR_MAP_IDS.ufoSmallCollision,
  ASTEROIDS_VECTOR_MAP_IDS.uiTitle,
]);

export const ASTEROIDS_REQUIRED_OBJECT_VECTOR_ROLE_IDS = Object.freeze([
  'ship',
  'asteroidLarge',
  'asteroidMedium',
  'asteroidSmall',
  'ufoLarge',
  'ufoSmall',
]);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeString(value) {
  return String(value || '').trim();
}

function normalizeTags(value) {
  return Array.isArray(value)
    ? value.map((tag) => normalizeString(tag).toLowerCase()).filter(Boolean)
    : [];
}

function normalizeUsage(value) {
  return Array.isArray(value)
    ? value.map((entry) => normalizeString(entry).toLowerCase()).filter(Boolean)
    : [];
}

function normalizePoint(point) {
  return {
    x: Number(point?.x ?? 0),
    y: Number(point?.y ?? 0),
  };
}

function normalizePoints(points) {
  return Array.isArray(points)
    ? points.map(normalizePoint).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    : [];
}

function normalizeVectorEntry(entry) {
  const id = normalizeString(entry?.id);
  if (!id) {
    return null;
  }
  return {
    ...clone(entry),
    id,
    kind: normalizeString(entry.kind || 'polyline'),
    label: normalizeString(entry.label || id),
    points: normalizePoints(entry.points),
    usage: normalizeUsage(entry.usage),
  };
}

function logValidation(logger, level, message, details = {}) {
  if (!logger) {
    return;
  }
  if (typeof logger.log === 'function') {
    logger.log(level, message, details);
    return;
  }
  const method = level === 'FAIL' ? 'error' : (level === 'WARN' ? 'warn' : 'info');
  logger[method]?.(message, details);
}

function normalizeObjectVectorRoleBindings(document, errors) {
  const rawBindings = isRecord(document?.objectVectorRoles) ? document.objectVectorRoles : {};
  const bindings = {};

  ASTEROIDS_REQUIRED_OBJECT_VECTOR_ROLE_IDS.forEach((roleId) => {
    const binding = isRecord(rawBindings[roleId]) ? rawBindings[roleId] : null;
    if (!binding) {
      errors.push(`Asteroids vector map manifest is missing objectVectorRoles.${roleId}.`);
      return;
    }
    const objectId = normalizeString(binding.objectId);
    const tags = normalizeTags(binding.tags);
    if (!objectId) {
      errors.push(`Asteroids vector map manifest objectVectorRoles.${roleId}.objectId is required.`);
    }
    if (!tags.length) {
      errors.push(`Asteroids vector map manifest objectVectorRoles.${roleId}.tags must contain at least one tag.`);
    }
    bindings[roleId] = {
      objectId,
      tags,
    };
  });

  return bindings;
}

function usageCounts(vectors) {
  return vectors.reduce((counts, vector) => {
    vector.usage.forEach((usage) => {
      counts[usage] = (counts[usage] || 0) + 1;
    });
    return counts;
  }, {});
}

function minimumRequiredPointsForVector(id) {
  if (id === ASTEROIDS_VECTOR_MAP_IDS.uiTitle) {
    return 0;
  }
  if (id === ASTEROIDS_VECTOR_MAP_IDS.bullet) {
    return 3;
  }
  return 2;
}

export function loadAsteroidsVectorMapsFromManifest(manifest, {
  logger = null,
  sourceLabel = 'games/Asteroids/game.manifest.json',
} = {}) {
  const document = manifest?.tools?.[ASTEROIDS_VECTOR_MAP_TOOL_KEY]?.[ASTEROIDS_VECTOR_MAP_DOCUMENT_KEY];
  const errors = [];
  if (!isRecord(document)) {
    errors.push(`Asteroids vector map manifest is missing root.tools.${ASTEROIDS_VECTOR_MAP_TOOL_KEY}.${ASTEROIDS_VECTOR_MAP_DOCUMENT_KEY}.`);
  }
  const vectors = Array.isArray(document?.vectors)
    ? document.vectors.map(normalizeVectorEntry).filter(Boolean)
    : [];
  const vectorsById = new Map(vectors.map((vector) => [vector.id, vector]));
  ASTEROIDS_REQUIRED_VECTOR_MAP_IDS.forEach((id) => {
    const vector = vectorsById.get(id);
    if (!vector) {
      errors.push(`Asteroids vector map manifest is missing ${id}.`);
      return;
    }
    const minimumPoints = minimumRequiredPointsForVector(id);
    if (vector.points.length < minimumPoints) {
      errors.push(`Asteroids vector map ${id} must contain at least ${minimumPoints} points.`);
    }
  });
  const objectVectorRoles = normalizeObjectVectorRoleBindings(document, errors);
  if (errors.length) {
    errors.forEach((message) => logValidation(logger, 'FAIL', message, { sourceLabel }));
    return {
      errors,
      ok: false,
      vectorMaps: null,
    };
  }
  const vectorMaps = {
    document: clone(document),
    objectVectorRoles,
    sourceLabel,
    usageCounts: usageCounts(vectors),
    vectors,
    vectorsById,
  };
  logValidation(logger, 'OK', `Asteroids vector maps loaded from ${sourceLabel}: ${vectors.length} maps.`, {
    usageCounts: vectorMaps.usageCounts,
  });
  return {
    errors: [],
    ok: true,
    vectorMaps,
  };
}

export function getAsteroidsVectorMap(vectorMaps, id) {
  return vectorMaps?.vectorsById instanceof Map
    ? vectorMaps.vectorsById.get(id) || null
    : null;
}

export function getAsteroidsVectorPoints(vectorMaps, id) {
  return getAsteroidsVectorMap(vectorMaps, id)?.points || [];
}

export function requireAsteroidsVectorPoints(vectorMaps, id, label = id, minimumPoints = minimumRequiredPointsForVector(id)) {
  const points = getAsteroidsVectorPoints(vectorMaps, id);
  if (points.length < minimumPoints) {
    throw new Error(`Asteroids required manifest vector map ${label} (${id}) is missing or has fewer than ${minimumPoints} points.`);
  }
  return points;
}
