export const ASTEROIDS_RUNTIME_OBJECT_ROLES = Object.freeze({
  ship: Object.freeze({
    label: 'Ship',
    tags: Object.freeze(['player', 'ship']),
  }),
  asteroidLarge: Object.freeze({
    label: 'Large Asteroid',
    size: 3,
    tags: Object.freeze(['asteroid', 'large']),
  }),
  asteroidMedium: Object.freeze({
    label: 'Medium Asteroid',
    size: 2,
    tags: Object.freeze(['asteroid', 'medium']),
  }),
  asteroidSmall: Object.freeze({
    label: 'Small Asteroid',
    size: 1,
    tags: Object.freeze(['asteroid', 'small']),
  }),
  ufoLarge: Object.freeze({
    label: 'Large UFO',
    tags: Object.freeze(['ufo', 'large']),
  }),
  ufoSmall: Object.freeze({
    label: 'Small UFO',
    tags: Object.freeze(['ufo', 'small']),
  }),
});

export const ASTEROID_SIZE_RUNTIME_ROLES = Object.freeze({
  1: 'asteroidSmall',
  2: 'asteroidMedium',
  3: 'asteroidLarge',
});

export const ASTEROIDS_REQUIRED_RUNTIME_OBJECT_ROLE_IDS = Object.freeze(
  Object.keys(ASTEROIDS_RUNTIME_OBJECT_ROLES)
);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return String(value || '').trim();
}

function normalizeTag(value) {
  return normalizeString(value).toLowerCase();
}

function normalizeTags(value) {
  return asArray(value).map(normalizeTag).filter(Boolean);
}

function objectTagSet(object) {
  return new Set(normalizeTags(object?.tags));
}

function hasTags(object, tags) {
  const tagSet = objectTagSet(object);
  return normalizeTags(tags).every((tag) => tagSet.has(tag));
}

function oldObjectSignal(object) {
  const text = [
    object?.id,
    object?.name,
    ...asArray(object?.tags),
  ].map(normalizeTag).join(' ');
  return /(^|[.\s_-])(old|legacy|deprecated|archive|archived|renamed|stale)($|[.\s_-])/.test(text);
}

function candidateLabel(candidate) {
  const tags = normalizeTags(candidate.object?.tags).join(',');
  const oldLabel = candidate.oldSignal ? ' old-signal' : '';
  return `${candidate.object?.id || 'unknown'} tags=[${tags}] index=${candidate.index}${oldLabel}`;
}

function logResolution(logger, level, message, details = {}) {
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

export function runtimeObjectRoleOptions(roleId, runtimeBindings = {}) {
  const role = ASTEROIDS_RUNTIME_OBJECT_ROLES[roleId] || null;
  if (!role) {
    return {
      objectId: '',
      requireManifestBinding: true,
      runtimeRole: roleId,
      tags: [],
    };
  }
  const bindings = asRecord(runtimeBindings);
  return {
    objectId: normalizeString(bindings[roleId]),
    requireManifestBinding: true,
    runtimeRole: roleId,
    tags: [...role.tags],
  };
}

export function resolveAsteroidsObjectVectorRole(objects, roleId, {
  runtimeBindings = {},
  logger = null,
} = {}) {
  const role = ASTEROIDS_RUNTIME_OBJECT_ROLES[roleId] || null;
  const objectList = asArray(objects);
  if (!role) {
    logResolution(logger, 'FAIL', `Asteroids Object Vector runtime role ${roleId || 'unknown'} is not configured.`);
    return null;
  }

  const explicitObjectId = normalizeString(asRecord(runtimeBindings)[roleId]);
  const explicitObject = explicitObjectId
    ? objectList.find((object) => object?.id === explicitObjectId) || null
    : null;
  const candidates = objectList
    .map((object, index) => ({
      index,
      object,
      oldSignal: oldObjectSignal(object),
    }))
    .filter((candidate) => candidate.object && hasTags(candidate.object, role.tags));

  if (!explicitObjectId) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} is missing required manifest binding game.gameData.objectVectorRuntime.objectIds.${roleId}.`,
      {
        candidates: candidates.map(candidateLabel),
        objectCount: objectList.length,
        tags: [...role.tags],
      }
    );
    return null;
  }

  if (!explicitObject) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} manifest binding ${explicitObjectId} does not match any Object Vector object in game.manifest.json.`,
      {
        candidates: candidates.map(candidateLabel),
        explicitObjectId,
        objectCount: objectList.length,
        tags: [...role.tags],
      }
    );
    return null;
  }

  if (oldObjectSignal(explicitObject)) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} manifest binding ${explicitObjectId} points to an old/legacy object; update the manifest binding to the active object.`,
      {
        candidates: candidates.map(candidateLabel),
        explicitObjectId,
        tags: normalizeTags(explicitObject.tags),
      }
    );
    return null;
  }

  if (!hasTags(explicitObject, role.tags)) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} manifest binding ${explicitObjectId} is missing required tags [${role.tags.join(', ')}].`,
      {
        candidates: candidates.map(candidateLabel),
        explicitObjectId,
        objectTags: normalizeTags(explicitObject.tags),
        requiredTags: [...role.tags],
      }
    );
    return null;
  }

  if (!candidates.some((candidate) => candidate.object.id === explicitObjectId)) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} manifest binding ${explicitObjectId} was not found in tag candidates [${role.tags.join(', ')}].`,
      {
        candidates: candidates.map(candidateLabel),
        explicitObjectId,
        requiredTags: [...role.tags],
      }
    );
    return null;
  }

  if (candidates.length > 1) {
    logResolution(
      logger,
      'WARN',
      `Asteroids Object Vector runtime role ${roleId} matched multiple objects by tags [${role.tags.join(', ')}]; using explicit manifest binding ${explicitObjectId}.`,
      {
        candidates: candidates.map(candidateLabel),
        selectedObjectId: explicitObjectId,
      }
    );
  }

  return explicitObject;
}

export function validateAsteroidsRuntimeObjectBindings(objects, runtimeBindings = {}, {
  logger = null,
} = {}) {
  const errors = [];
  const warnings = [];
  const objectsByRole = {};
  const collectingLogger = {
    log(level, message, details = {}) {
      const entry = { details, level, message };
      if (level === 'FAIL') {
        errors.push(entry);
      } else if (level === 'WARN') {
        warnings.push(entry);
      }
      logResolution(logger, level, message, details);
    },
  };

  ASTEROIDS_REQUIRED_RUNTIME_OBJECT_ROLE_IDS.forEach((roleId) => {
    const object = resolveAsteroidsObjectVectorRole(objects, roleId, {
      logger: collectingLogger,
      runtimeBindings,
    });
    if (object) {
      objectsByRole[roleId] = object;
    }
  });

  const ok = errors.length === 0
    && ASTEROIDS_REQUIRED_RUNTIME_OBJECT_ROLE_IDS.every((roleId) => Boolean(objectsByRole[roleId]));
  return {
    errors,
    objectsByRole,
    ok,
    warnings,
  };
}
