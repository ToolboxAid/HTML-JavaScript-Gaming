import { SPRITE_EDITOR_EVENT_TYPES } from "./eventTypes.js";

function setStatusMessage(app, message, durationMs) {
  app.statusMessage = message;
  app.flashMessageUntil = performance.now() + durationMs;
}

function setAlertMessage(app, message, durationMs) {
  setStatusMessage(app, message, durationMs);
  app.errorMessageUntil = app.flashMessageUntil;
}

function dispatchSpriteEditorEvent(app, type, payload) {
  if (!app || !app.eventBus || typeof app.eventBus.emit !== "function") return false;
  app.eventBus.emit(type, payload);
  return true;
}

function dispatchRender(app) {
  const payload = {};
  if (dispatchSpriteEditorEvent(app, SPRITE_EDITOR_EVENT_TYPES.RENDER_REQUEST, payload)) return;
  if (app && typeof app.renderAll === "function") app.renderAll();
}

function dispatchStatusMessage(app, message) {
  const payload = { message };
  if (dispatchSpriteEditorEvent(app, SPRITE_EDITOR_EVENT_TYPES.STATUS_MESSAGE_REQUEST, payload)) return;
  if (app) setStatusMessage(app, message, 1800);
}

function dispatchAlertMessage(app, message) {
  const payload = { message };
  if (dispatchSpriteEditorEvent(app, SPRITE_EDITOR_EVENT_TYPES.ALERT_MESSAGE_REQUEST, payload)) return;
  if (app) setAlertMessage(app, message, 2200);
}

function dispatchStatusMessageAndRender(app, message) {
  const payload = { message };
  if (dispatchSpriteEditorEvent(app, SPRITE_EDITOR_EVENT_TYPES.STATUS_MESSAGE_AND_RENDER_REQUEST, payload)) return;
  if (!app) return;
  setStatusMessage(app, message, 1800);
  if (typeof app.renderAll === "function") app.renderAll();
}

function installSpriteEditorEventDispatch(app) {
  if (!app || !app.eventBus || typeof app.eventBus.on !== "function") return;
  if (app.__spriteEditorEventDispatchInstalled) return;
  app.__spriteEditorEventDispatchInstalled = true;

  app.eventBus.on(SPRITE_EDITOR_EVENT_TYPES.RENDER_REQUEST, () => {
    if (typeof app.renderAll === "function") app.renderAll();
  });

  app.eventBus.on(SPRITE_EDITOR_EVENT_TYPES.STATUS_MESSAGE_REQUEST, (payload) => {
    setStatusMessage(app, payload && payload.message, 1800);
  });

  app.eventBus.on(SPRITE_EDITOR_EVENT_TYPES.ALERT_MESSAGE_REQUEST, (payload) => {
    setAlertMessage(app, payload && payload.message, 2200);
  });

  app.eventBus.on(SPRITE_EDITOR_EVENT_TYPES.STATUS_MESSAGE_AND_RENDER_REQUEST, (payload) => {
    setStatusMessage(app, payload && payload.message, 1800);
    if (typeof app.renderAll === "function") app.renderAll();
  });
}

export {
  dispatchAlertMessage,
  dispatchRender,
  dispatchStatusMessage,
  dispatchStatusMessageAndRender,
  installSpriteEditorEventDispatch
};
