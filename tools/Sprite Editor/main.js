/*
Toolbox Aid
David Quesenberry
04/03/2026
main.js
*/
import { initializeSpriteEditorApp } from "./modules/spriteEditorApp.js";
import { registerToolBootContract } from "../../tools/shared/toolBootContract.js";

let spriteEditorApp = null;

const spriteEditorApi = {
  get state() {
    return spriteEditorApp;
  },
  applyProjectSystemState(snapshot) {
    if (spriteEditorApp && typeof spriteEditorApp.applyProjectSystemState === "function") {
      spriteEditorApp.applyProjectSystemState(snapshot);
    }
  }
};

function bootSpriteEditor() {
  if (!spriteEditorApp) {
    spriteEditorApp = initializeSpriteEditorApp();
  }
  window.spriteEditorApp = spriteEditorApi;
  return spriteEditorApi;
}

registerToolBootContract("sprite-editor", {
  init: bootSpriteEditor,
  destroy() {
    return true;
  },
  getApi() {
    return window.spriteEditorApp || null;
  }
});

bootSpriteEditor();
