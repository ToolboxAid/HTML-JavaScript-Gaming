/*
Toolbox Aid
David Quesenberry
04/03/2026
main.js
*/
import { initializeSpriteEditorApp } from "./modules/spriteEditorApp.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

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
  setupFullscreenSidePanels();
  return spriteEditorApi;
}

function setupFullscreenSidePanels() {
  const leftSidebar = document.getElementById("leftSidebar");
  const rightSidebar = document.getElementById("rightSidebar");
  const showLeftPanelButton = document.getElementById("showLeftPanelButton");
  const showRightPanelButton = document.getElementById("showRightPanelButton");
  const closeLeftOverlayButton = document.getElementById("closeLeftOverlayButton");
  const closeRightOverlayButton = document.getElementById("closeRightOverlayButton");

  if (!leftSidebar || !rightSidebar || !showLeftPanelButton || !showRightPanelButton || !closeLeftOverlayButton || !closeRightOverlayButton) {
    return;
  }

  const syncOverlayToggleButtons = () => {
    const leftVisible = leftSidebar.classList.contains("visible-overlay");
    const rightVisible = rightSidebar.classList.contains("visible-overlay");
    showLeftPanelButton.style.display = leftVisible ? "none" : "";
    showRightPanelButton.style.display = rightVisible ? "none" : "";
  };

  const syncFullscreenClass = () => {
    const isFullscreen = Boolean(document.fullscreenElement);
    document.body.classList.toggle("fullscreen-mode", isFullscreen);
    if (!isFullscreen) {
      leftSidebar.classList.remove("visible-overlay");
      rightSidebar.classList.remove("visible-overlay");
    }
    syncOverlayToggleButtons();
  };

  showLeftPanelButton.addEventListener("click", () => {
    leftSidebar.classList.toggle("visible-overlay");
    syncOverlayToggleButtons();
  });

  showRightPanelButton.addEventListener("click", () => {
    rightSidebar.classList.toggle("visible-overlay");
    syncOverlayToggleButtons();
  });

  closeLeftOverlayButton.addEventListener("click", () => {
    leftSidebar.classList.remove("visible-overlay");
    syncOverlayToggleButtons();
  });

  closeRightOverlayButton.addEventListener("click", () => {
    rightSidebar.classList.remove("visible-overlay");
    syncOverlayToggleButtons();
  });

  document.addEventListener("fullscreenchange", syncFullscreenClass);
  syncFullscreenClass();
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
