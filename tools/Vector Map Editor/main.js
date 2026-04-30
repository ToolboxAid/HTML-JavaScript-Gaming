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
const DEFAULT_NO_MAP_STATUS = "No map loaded. Load a map preset or import a map JSON document to begin.";

function readHostedVectorMapDocument() {
  const hostContext = readToolHostSharedContextFromLocation(window.location);
  const payloadJson = hostContext?.sharedContext?.payloadJson;
  const vectorMapDocument = payloadJson?.vectorMapDocument;
  if (!vectorMapDocument || typeof vectorMapDocument !== "object" || Array.isArray(vectorMapDocument)) {
    return null;
  }
  if (!Array.isArray(vectorMapDocument.objects)) {
    return null;
  }
  return vectorMapDocument;
}

function applyHostedWorkspacePayload(app, vectorMapDocument = null) {
  if (!app || typeof app !== "object") {
    return false;
  }
  const hostedVectorMapDocument = vectorMapDocument || readHostedVectorMapDocument();
  const objects = hostedVectorMapDocument?.objects;
  if (!hostedVectorMapDocument || typeof hostedVectorMapDocument !== "object" || Array.isArray(hostedVectorMapDocument)) {
    return false;
  }
  if (!Array.isArray(objects)) {
    return false;
  }

  app.cancelSpinAnimation?.();
  app.documentModel?.setData?.(hostedVectorMapDocument);
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
  const hostedVectorMapDocument = readHostedVectorMapDocument();
  const app = new VectorMapEditorApp(document);
  if (hostedVectorMapDocument) {
    const originalSetStatus = typeof app.setStatus === "function" ? app.setStatus.bind(app) : null;
    if (originalSetStatus) {
      app.setStatus = (message) => {
        if (message === DEFAULT_NO_MAP_STATUS) {
          return;
        }
        originalSetStatus(message);
      };
    }
    app.tryLoadPresetFromQuery = async () => false;
    app.documentModel?.setData?.(hostedVectorMapDocument);
  }
  app.start();
  if (hostedVectorMapDocument) {
    applyHostedWorkspacePayload(app, hostedVectorMapDocument);
    if (typeof app.setStatus === "function") {
      app.setStatus("Loaded hosted workspace payload.");
    }
  } else {
    applyHostedWorkspacePayload(app);
  }
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
