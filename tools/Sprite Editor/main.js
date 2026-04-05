/*
Toolbox Aid
David Quesenberry
04/03/2026
main.js
*/
import { initializeSpriteEditorApp } from "./modules/spriteEditorApp.js";

const spriteEditorApp = initializeSpriteEditorApp();
window.spriteEditorApp = {
  state: spriteEditorApp,
  applyProjectSystemState(snapshot) {
    spriteEditorApp.applyProjectSystemState(snapshot);
  }
};
