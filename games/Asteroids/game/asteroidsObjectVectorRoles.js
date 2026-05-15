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

function selectTaggedCandidate(candidates) {
  return [...candidates].sort((left, right) => {
    if (left.oldSignal !== right.oldSignal) {
      return left.oldSignal ? 1 : -1;
    }
    return right.index - left.index;
  })[0] || null;
}

export function runtimeObjectRoleOptions(roleId, runtimeBindings = {}) {
  const role = ASTEROIDS_RUNTIME_OBJECT_ROLES[roleId] || null;
  if (!role) {
    return {
      objectId: '',
      runtimeRole: roleId,
      tags: [],
    };
  }
  const bindings = asRecord(runtimeBindings);
  return {
    objectId: normalizeString(bindings[roleId]),
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

  if (candidates.length) {
    const selected = selectTaggedCandidate(candidates);
    if (candidates.length > 1) {
      logResolution(
        logger,
        'WARN',
        `Asteroids Object Vector runtime role ${roleId} matched multiple objects by tags [${role.tags.join(', ')}]; selected ${selected.object.id}.`,
        {
          candidates: candidates.map(candidateLabel),
          selectedObjectId: selected.object.id,
        }
      );
    }
    if (explicitObjectId && explicitObjectId !== selected.object.id) {
      logResolution(
        logger,
        'WARN',
        `Asteroids Object Vector runtime role ${roleId} ignored explicit objectId ${explicitObjectId}; manifest tags selected ${selected.object.id}.`,
        {
          explicitObjectId,
          explicitObjectHasRoleTags: Boolean(explicitObject && hasTags(explicitObject, role.tags)),
          selectedObjectId: selected.object.id,
          tags: [...role.tags],
        }
      );
    }
    return selected.object;
  }

  if (explicitObject) {
    logResolution(
      logger,
      'WARN',
      `Asteroids Object Vector runtime role ${roleId} found no object tagged [${role.tags.join(', ')}]; using explicit objectId ${explicitObject.id}.`,
      {
        explicitObjectId: explicitObject.id,
        tags: [...role.tags],
      }
    );
    return explicitObject;
  }

  logResolution(
    logger,
    'FAIL',
    `Asteroids Object Vector runtime role ${roleId} could not resolve an object tagged [${role.tags.join(', ')}].`,
    {
      explicitObjectId,
      objectCount: objectList.length,
      tags: [...role.tags],
    }
  );
  return null;
}
