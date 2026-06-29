const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeDelay(value) {
  return Math.max(0, Math.floor(toFiniteNumber(value)));
}

function toDate(value = Date.now()) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError("value must be a valid date, timestamp, or date string.");
  }
  return date;
}

/**
 * Formats a duration in milliseconds using compact day/hour/minute/second units.
 *
 * @param {number} milliseconds Duration in milliseconds.
 * @returns {string} Compact duration text.
 */
export function formatDuration(milliseconds) {
  const raw = toFiniteNumber(milliseconds);
  const sign = raw < 0 ? "-" : "";
  let remaining = Math.round(Math.abs(raw));

  if (remaining < SECOND_MS) {
    return `${sign}${remaining}ms`;
  }

  const units = [
    [DAY_MS, "d"],
    [HOUR_MS, "h"],
    [MINUTE_MS, "m"],
    [SECOND_MS, "s"],
  ];
  const parts = [];

  for (const [unitMs, label] of units) {
    const count = Math.floor(remaining / unitMs);
    if (count > 0) {
      parts.push(`${count}${label}`);
      remaining -= count * unitMs;
    }
  }

  if (remaining > 0) {
    parts.push(`${remaining}ms`);
  }

  return `${sign}${parts.join(" ")}`;
}

/**
 * Converts a date-like value to a Unix timestamp in milliseconds.
 *
 * @param {Date|string|number} [value] Date-like value.
 * @returns {number} Unix timestamp in milliseconds.
 */
export function toUnixMilliseconds(value = Date.now()) {
  return toDate(value).getTime();
}

/**
 * Converts a date-like value to an ISO-8601 timestamp.
 *
 * @param {Date|string|number} [value] Date-like value.
 * @returns {string} ISO timestamp.
 */
export function toIsoTimestamp(value = Date.now()) {
  return toDate(value).toISOString();
}

/**
 * Resolves after the provided delay.
 *
 * @param {number} milliseconds Delay in milliseconds.
 * @returns {Promise<void>} Promise that resolves after the delay.
 */
export function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, normalizeDelay(milliseconds));
  });
}

/**
 * Creates a debounced function that runs after calls settle.
 *
 * @param {Function} callback Function to debounce.
 * @param {number} waitMs Debounce delay in milliseconds.
 * @returns {Function & {cancel: Function}} Debounced function.
 */
export function debounce(callback, waitMs = 0) {
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function.");
  }

  let timeoutId = null;
  const delay = normalizeDelay(waitMs);

  function debounced(...args) {
    const context = this;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      callback.apply(context, args);
    }, delay);
  }

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Creates a throttled function that runs at most once per wait window.
 *
 * @param {Function} callback Function to throttle.
 * @param {number} waitMs Throttle window in milliseconds.
 * @returns {Function & {cancel: Function}} Throttled function.
 */
export function throttle(callback, waitMs = 0) {
  if (typeof callback !== "function") {
    throw new TypeError("callback must be a function.");
  }

  const delay = normalizeDelay(waitMs);
  let lastRun = 0;
  let timeoutId = null;
  let pendingArgs = null;
  let pendingContext = null;

  function invoke(timestamp) {
    lastRun = timestamp;
    timeoutId = null;
    callback.apply(pendingContext, pendingArgs);
    pendingArgs = null;
    pendingContext = null;
  }

  function throttled(...args) {
    const now = Date.now();
    pendingArgs = args;
    pendingContext = this;
    const remaining = delay - (now - lastRun);

    if (remaining <= 0 || remaining > delay) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      invoke(now);
      return;
    }

    if (timeoutId === null) {
      timeoutId = setTimeout(() => invoke(Date.now()), remaining);
    }
  }

  throttled.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingArgs = null;
    pendingContext = null;
  };

  return throttled;
}
