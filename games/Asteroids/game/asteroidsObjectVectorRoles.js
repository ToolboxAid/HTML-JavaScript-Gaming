export const ASTEROIDS_RUNTIME_OBJECT_ROLES = Object.freeze({
  bullet: Object.freeze({
    label: 'Bullet',
  }),
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

function roleBindingFor(roleBindings, roleId) {
  return roleBindings && typeof roleBindings === 'object' && !Array.isArray(roleBindings)
    ? roleBindings[roleId] || null
    : null;
}

export function runtimeObjectRoleOptions(roleId, roleBindings = {}) {
  const role = ASTEROIDS_RUNTIME_OBJECT_ROLES[roleId] || null;
  const binding = roleBindingFor(roleBindings, roleId);
  if (!role) {
    return {
      objectId: '',
      requireManifestBinding: true,
      runtimeRole: roleId,
      tags: [],
    };
  }
  return {
    objectId: normalizeString(binding?.objectId),
    requireManifestBinding: true,
    runtimeRole: roleId,
    tags: normalizeTags(binding?.tags),
  };
}

export function resolveAsteroidsObjectVectorRole(objects, roleId, {
  roleBindings = {},
  logger = null,
} = {}) {
  const role = ASTEROIDS_RUNTIME_OBJECT_ROLES[roleId] || null;
  const objectList = asArray(objects);
  if (!role) {
    logResolution(logger, 'FAIL', `Asteroids Object Vector runtime role ${roleId || 'unknown'} is not configured.`);
    return null;
  }

  const binding = roleBindingFor(roleBindings, roleId);
  const targetObjectId = normalizeString(binding?.objectId);
  const targetTags = normalizeTags(binding?.tags);
  const targetObject = targetObjectId
    ? objectList.find((object) => object?.id === targetObjectId) || null
    : null;
  const candidates = objectList
    .map((object, index) => ({
      index,
      object,
      oldSignal: oldObjectSignal(object),
    }))
    .filter((candidate) => candidate.object && (!targetTags.length || objectHasTags(candidate.object, targetTags)));

  if (!binding) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} requires a manifest objectVectorRoles.${roleId} binding.`,
      {
        candidates: candidates.map(candidateLabel),
        objectCount: objectList.length,
      }
    );
    return null;
  }

  if (!targetObjectId) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} manifest binding is missing objectId.`,
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
      `Asteroids Object Vector runtime role ${roleId} manifest binding requires object ${targetObjectId} in root.tools.object-vector-studio-v2.objects.`,
      {
        candidates: candidates.map(candidateLabel),
        objectCount: objectList.length,
        targetObjectId,
      }
    );
    return null;
  }

  if (targetTags.length && !objectHasTags(targetObject, targetTags)) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} manifest binding ${targetObjectId} is missing required tags [${targetTags.join(', ')}].`,
      {
        candidates: candidates.map(candidateLabel),
        objectTags: normalizeTags(targetObject.tags),
        targetObjectId,
        targetTags,
      }
    );
    return null;
  }

  if (oldObjectSignal(targetObject)) {
    logResolution(
      logger,
      'FAIL',
      `Asteroids Object Vector runtime role ${roleId} manifest binding ${targetObjectId} is marked old/legacy; keep runtime object IDs on active Object Vector objects.`,
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
  roleBindings = {},
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
      roleBindings,
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
