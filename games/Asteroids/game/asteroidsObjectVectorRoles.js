export const ASTEROIDS_RUNTIME_OBJECT_ROLES = Object.freeze({
  bullet: Object.freeze({
    label: 'Bullet',
    tags: Object.freeze(['projectile', 'bullet']),
  }),
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

function normalizeString(value) {
  return String(value || '').trim();
}

function normalizeTags(value) {
  return asArray(value).map((tag) => normalizeSearchText(tag)).filter(Boolean);
}

function objectHasTags(object, tags) {
  const tagSet = new Set(normalizeTags(object?.tags));
  return normalizeTags(tags).every((tag) => tagSet.has(tag));
}

function normalizeSearchText(value) {
  return normalizeString(value).toLowerCase();
}

function oldObjectSignal(object) {
  const text = [
    object?.id,
    object?.name,
    ...asArray(object?.tags),
  ].map(normalizeSearchText).join(' ');
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

function roleTags(roleId) {
  return normalizeTags(ASTEROIDS_RUNTIME_OBJECT_ROLES[roleId]?.tags);
}

export function runtimeObjectRoleOptions(roleId) {
  const role = ASTEROIDS_RUNTIME_OBJECT_ROLES[roleId] || null;
  if (!role) {
    return {
      objectId: '',
      requireManifestBinding: false,
      runtimeRole: roleId,
      tags: [],
    };
  }
  return {
    objectId: '',
    requireManifestBinding: false,
    runtimeRole: roleId,
    tags: roleTags(roleId),
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

  const targetTags = roleTags(roleId);
  const candidates = objectList
    .map((object, index) => ({
      index,
      object,
      oldSignal: oldObjectSignal(object),
    }))
    .filter((candidate) => candidate.object && (!targetTags.length || objectHasTags(candidate.object, targetTags)));
  const oldCandidates = candidates.filter((candidate) => candidate.oldSignal);
  const activeCandidates = candidates.filter((candidate) => !candidate.oldSignal);

  if (!targetTags.length) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} does not define required object tags.`,
      {
        objectCount: objectList.length,
      }
    );
    return null;
  }

  if (!candidates.length) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} could not resolve an object from objects[].tags [${targetTags.join(', ')}].`,
      {
        objectCount: objectList.length,
        targetTags,
      }
    );
    return null;
  }

  if (oldCandidates.length) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} matches old/legacy object tag candidates [${targetTags.join(', ')}]; remove deprecated duplicates or retag them outside the active role.`,
      {
        candidates: oldCandidates.map(candidateLabel),
        objectCount: objectList.length,
        targetTags,
      }
    );
    return null;
  }

  if (activeCandidates.length > 1) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} matched multiple active objects from objects[].tags [${targetTags.join(', ')}].`,
      {
        candidates: activeCandidates.map(candidateLabel),
        objectCount: objectList.length,
        targetTags,
      }
    );
    return null;
  }

  return activeCandidates[0].object;
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
