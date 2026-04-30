/*
Toolbox Aid
David Quesenberry
03/25/2026
main.js
*/
import { VectorMapEditorApp } from "./editor/VectorMapEditorApp.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import { readToolHostSharedContextFromLocation } from "../shared/toolHostSharedContext.js";

let vectorMapEditorApp = null;

function applyHostedWorkspacePayload(app) {
  if (!app || typeof app !== "object") {
    return false;
  }
  const hostContext = readToolHostSharedContextFromLocation(window.location);
  const payloadJson = hostContext?.sharedContext?.payloadJson;
  const vectorMapDocument = payloadJson?.vectorMapDocument;
  if (!vectorMapDocument || typeof vectorMapDocument !== "object" || Array.isArray(vectorMapDocument)) {
    return false;
  }
  if (!Array.isArray(vectorMapDocument.objects)) {
    return false;
  }

  app.cancelSpinAnimation?.();
  app.documentModel?.setData?.(vectorMapDocument);
  app.selectionModel?.clear?.();
  app.lastCollisionResult = null;
  app.historyManager?.reset?.();
  app.pendingHistoryEntry = null;
  app.workspaceViewMode = app.documentModel?.getData?.()?.mode;
  if (app.elements?.workspaceModeSelect) {
    app.elements.workspaceModeSelect.value = app.workspaceViewMode;
  }
  app.createInteractionController?.();
  app.interactionController?.setToolMode?.(app.elements?.toolModeSelect?.value);
  app.syncUIFromDocument?.();
  app.render?.();
  return true;
}

function startVectorMapEditor() {
  if (vectorMapEditorApp) {
    return vectorMapEditorApp;
  }
  const app = new VectorMapEditorApp(document);
  app.start();
  applyHostedWorkspacePayload(app);
  vectorMapEditorApp = app;
  window.vectorMapEditorApp = app;
  return app;
}

function bootVectorMapEditor() {
  if (vectorMapEditorApp) {
    window.vectorMapEditorApp = vectorMapEditorApp;
    return vectorMapEditorApp;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startVectorMapEditor, { once: true });
    return null;
  }
  return startVectorMapEditor();
}

registerToolBootContract("vector-map-editor", {
  init: bootVectorMapEditor,
  destroy() {
    return true;
  },
  getApi() {
    return window.vectorMapEditorApp || vectorMapEditorApp || null;
  }
});

bootVectorMapEditor();
