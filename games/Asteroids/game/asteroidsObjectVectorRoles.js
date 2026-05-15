export const ASTEROIDS_RUNTIME_OBJECT_ROLES = Object.freeze({
  ship: Object.freeze({
    label: 'Ship',
  }),
  asteroidLarge: Object.freeze({
    label: 'Large Asteroid',
    size: 3,
  }),
  asteroidMedium: Object.freeze({
    label: 'Medium Asteroid',
    size: 2,
  }),
  asteroidSmall: Object.freeze({
    label: 'Small Asteroid',
    size: 1,
  }),
  ufoLarge: Object.freeze({
    label: 'Large UFO',
  }),
  ufoSmall: Object.freeze({
    label: 'Small UFO',
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

export function runtimeObjectRoleOptions(roleId, runtimeBindings = {}) {
  const role = ASTEROIDS_RUNTIME_OBJECT_ROLES[roleId] || null;
  if (!role) {
    return {
      objectId: '',
      requireManifestBinding: true,
      runtimeRole: roleId,
    };
  }
  const bindings = asRecord(runtimeBindings);
  return {
    objectId: normalizeString(bindings[roleId]),
    requireManifestBinding: true,
    runtimeRole: roleId,
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
    .filter((candidate) => candidate.object);

  if (!explicitObjectId) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} is missing required manifest binding game.gameData.objectVectorRuntime.objectIds.${roleId}.`,
      {
        candidates: candidates.map(candidateLabel),
        objectCount: objectList.length,
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
      }
    );
    return null;
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
