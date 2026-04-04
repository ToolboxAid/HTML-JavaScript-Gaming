/*
Toolbox Aid
David Quesenberry
03/25/2026
main.js
*/
import { VectorMapEditorApp } from "./editor/VectorMapEditorApp.js";

window.addEventListener("DOMContentLoaded", () => {
  const app = new VectorMapEditorApp(document);
  app.start();
  window.vectorMapEditorApp = app;
});
