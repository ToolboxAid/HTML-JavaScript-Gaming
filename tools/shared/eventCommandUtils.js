import { trimSafe } from "../../src/shared/utils/stringUtils.js";

export function sanitizeCommand(value, fallback = "") {
  const command = trimSafe(value);
  return command || fallback;
}

export function createCommandDispatcher(handlers = {}, options = {}) {
  const commandHandlers = handlers && typeof handlers === "object" ? handlers : {};
  const onUnknownCommand = typeof options.onUnknownCommand === "function"
    ? options.onUnknownCommand
    : null;

  return async function dispatchCommand(command, ...args) {
    const normalized = sanitizeCommand(command);
    const handler = normalized ? commandHandlers[normalized] : null;
    if (typeof handler !== "function") {
      if (onUnknownCommand) {
        onUnknownCommand(normalized, ...args);
      }
      return false;
    }
    await handler(...args);
    return true;
  };
}

export function bindEventHandlers(elements, eventName, handler) {
  const list = Array.isArray(elements) ? elements : [elements];
  list.forEach((element) => {
    if (element && typeof element.addEventListener === "function") {
      element.addEventListener(eventName, handler);
    }
  });
}
