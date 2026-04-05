/*
Toolbox Aid
David Quesenberry
04/05/2026
packUtils.js
*/

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function requireNoArgs({ args = [], commandName = "" } = {}) {
  if (Array.isArray(args) && args.length > 0) {
    return {
      ok: false,
      code: "INVALID_COMMAND_ARGS",
      message: `${commandName || "Command"} does not accept arguments.`,
      details: {
        args
      }
    };
  }
  return { ok: true };
}

export function requireAtLeastArgs(count, { args = [], commandName = "" } = {}) {
  const safeArgs = Array.isArray(args) ? args : [];
  if (safeArgs.length < count) {
    return {
      ok: false,
      code: "INVALID_COMMAND_ARGS",
      message: `${commandName || "Command"} requires at least ${count} argument(s).`,
      details: {
        args: safeArgs
      }
    };
  }
  return { ok: true };
}

export function safeSection(source, key) {
  return isObject(source?.[key]) ? source[key] : {};
}

export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function toLinePair(label, value) {
  const normalizedLabel = sanitizeText(label) || "value";
  if (value === undefined || value === null) {
    return `${normalizedLabel}=n/a`;
  }
  return `${normalizedLabel}=${String(value)}`;
}

export function delegateRuntimeCommand(context, commandName) {
  if (!sanitizeText(commandName)) {
    return null;
  }
  if (typeof context?.executeRuntimeCommand !== "function") {
    return null;
  }
  return context.executeRuntimeCommand(commandName, context);
}

export function standardDetails(extra = {}) {
  return isObject(extra) ? extra : {};
}
