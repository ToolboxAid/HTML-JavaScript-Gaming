const BUILD_DEBUG_MODE = 'prod';
const BUILD_DEBUG_ENABLED = false;
const DEBUG_STATE_STORAGE_KEY = 'toolbox.sample.asteroids.debug.enabled';

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function parseBooleanFlag(value, fallback) {
  const normalized = sanitizeText(value).toLowerCase();
  if (!normalized) {
    return fallback;
  }
  if (normalized === '1' || normalized === 'true' || normalized === 'on' || normalized === 'yes') {
    return true;
  }
  if (normalized === '0' || normalized === 'false' || normalized === 'off' || normalized === 'no') {
    return false;
  }
  return fallback;
}

export function normalizeDebugMode(value, fallback = 'prod') {
  const normalized = sanitizeText(value).toLowerCase();
  if (normalized === 'dev' || normalized === 'qa' || normalized === 'prod') {
    return normalized;
  }
  return fallback;
}

export function readStoredBoolean(key) {
  if (!key || typeof globalThis.localStorage === 'undefined') {
    return null;
  }

  try {
    const value = globalThis.localStorage.getItem(key);
    if (value === '1') {
      return true;
    }
    if (value === '0') {
      return false;
    }
  } catch {
    return null;
  }

  return null;
}

export function writeStoredBoolean(key, value) {
  if (!key || typeof globalThis.localStorage === 'undefined') {
    return;
  }

  try {
    globalThis.localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // Ignore storage failures to keep startup resilient.
  }
}

export function isLocalDebugEnvironment(documentRef) {
  const protocol = sanitizeText(documentRef?.location?.protocol) || sanitizeText(globalThis?.location?.protocol);
  const hostname = sanitizeText(documentRef?.location?.hostname) || sanitizeText(globalThis?.location?.hostname);

  if (protocol === 'file:') {
    return true;
  }

  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

export function resolveDebugConfig(documentRef) {
  const search = sanitizeText(documentRef?.location?.search) || sanitizeText(globalThis?.location?.search);
  const searchParams = new URLSearchParams(search);
  const queryMode = searchParams.get('debugMode');
  const queryEnabled = searchParams.get('debug');
  const queryRemember = searchParams.get('rememberDebug');
  const queryDemo = searchParams.get('debugDemo');
  const localDebugEnvironment = isLocalDebugEnvironment(documentRef);
  const rememberDebugState = parseBooleanFlag(queryRemember, false);
  const demoMode = parseBooleanFlag(queryDemo, false);
  const defaultMode = localDebugEnvironment
    ? 'dev'
    : normalizeDebugMode(BUILD_DEBUG_MODE, 'prod');
  const debugMode = normalizeDebugMode(queryMode, demoMode ? 'qa' : defaultMode);
  const fallbackEnabled = (BUILD_DEBUG_ENABLED === true || localDebugEnvironment) && debugMode !== 'prod';
  const storedDebugEnabled = rememberDebugState && queryEnabled === null
    ? readStoredBoolean(DEBUG_STATE_STORAGE_KEY)
    : null;
  const debugEnabled = demoMode
    ? true
    : parseBooleanFlag(queryEnabled, storedDebugEnabled ?? fallbackEnabled);

  if (rememberDebugState) {
    writeStoredBoolean(DEBUG_STATE_STORAGE_KEY, debugEnabled);
  }

  return {
    debugMode,
    debugEnabled,
    rememberDebugState,
    demoMode
  };
}
