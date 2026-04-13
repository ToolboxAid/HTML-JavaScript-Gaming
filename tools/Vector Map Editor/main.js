/*
Toolbox Aid
David Quesenberry
03/25/2026
main.js
*/
import { VectorMapEditorApp } from "./editor/VectorMapEditorApp.js";
import { registerToolBootContract } from "../../tools/shared/toolBootContract.js";

let vectorMapEditorApp = null;

function startVectorMapEditor() {
  if (vectorMapEditorApp) {
    return vectorMapEditorApp;
  }
  const app = new VectorMapEditorApp(document);
  app.start();
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
