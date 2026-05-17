export const ASTEROIDS_RUNTIME_OBJECT_ROLES = Object.freeze({
  ship: Object.freeze({
    label: 'Ship',
    objectId: 'object.asteroids.ship',
  }),
  asteroidLarge: Object.freeze({
    label: 'Large Asteroid',
    objectId: 'object.asteroids.large-asteroid',
    size: 3,
  }),
  asteroidMedium: Object.freeze({
    label: 'Medium Asteroid',
    objectId: 'object.asteroids.medium-asteroid',
    size: 2,
  }),
  asteroidSmall: Object.freeze({
    label: 'Small Asteroid',
    objectId: 'object.asteroids.small-asteroid',
    size: 1,
  }),
  ufoLarge: Object.freeze({
    label: 'Large UFO',
    objectId: 'object.asteroids.large-ufo',
  }),
  ufoSmall: Object.freeze({
    label: 'Small UFO',
    objectId: 'object.asteroids.small-ufo',
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

function normalizeString(value) {
  return String(value || '').trim();
}

function normalizeSearchText(value) {
  return normalizeString(value).toLowerCase();
}

function oldObjectSignal(object) {
  const text = [
    object?.id,
    object?.name,
  ].map(normalizeSearchText).join(' ');
  return /(^|[.\s_-])(old|legacy|deprecated|archive|archived|renamed|stale)($|[.\s_-])/.test(text);
}

function candidateLabel(candidate) {
  const oldLabel = candidate.oldSignal ? ' old-signal' : '';
  return `${candidate.object?.id || 'unknown'} name="${candidate.object?.name || 'unknown'}" index=${candidate.index}${oldLabel}`;
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

export function runtimeObjectRoleOptions(roleId) {
  const role = ASTEROIDS_RUNTIME_OBJECT_ROLES[roleId] || null;
  if (!role) {
    return {
      objectId: '',
      runtimeRole: roleId,
    };
  }
  return {
    objectId: normalizeString(role.objectId),
    runtimeRole: roleId,
  };
}

export function resolveAsteroidsObjectVectorRole(objects, roleId, {
  logger = null,
} = {}) {
  const role = ASTEROIDS_RUNTIME_OBJECT_ROLES[roleId] || null;
  const objectList = asArray(objects);
  if (!role) {
    logResolution(logger, 'FAIL', `Asteroids Object Vector runtime role ${roleId || 'unknown'} is not configured.`);
    return null;
  }

  const targetObjectId = normalizeString(role.objectId);
  const targetObject = targetObjectId
    ? objectList.find((object) => object?.id === targetObjectId) || null
    : null;
  const candidates = objectList
    .map((object, index) => ({
      index,
      object,
      oldSignal: oldObjectSignal(object),
    }))
    .filter((candidate) => candidate.object);

  if (!targetObjectId) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} is missing its required object ID contract.`,
      {
        candidates: candidates.map(candidateLabel),
        objectCount: objectList.length,
      }
    );
    return null;
  }

  if (!targetObject) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} requires object ${targetObjectId} in root.tools.object-vector-studio-v2.objects.`,
      {
        candidates: candidates.map(candidateLabel),
        objectCount: objectList.length,
        targetObjectId,
      }
    );
    return null;
  }

  if (oldObjectSignal(targetObject)) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} object ${targetObjectId} is marked old/legacy; keep runtime object IDs on active Object Vector objects.`,
      {
        candidates: candidates.map(candidateLabel),
        targetObjectId,
      }
    );
    return null;
  }

  return targetObject;
}

export function validateAsteroidsRuntimeObjectRoles(objects, {
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
