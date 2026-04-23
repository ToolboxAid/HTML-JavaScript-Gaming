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
  const leftPanelAccordions = Array.from(document.querySelectorAll("#leftSidebar .panel-accordion"));
  const rightPanelAccordions = Array.from(document.querySelectorAll("#rightSidebar .panel-accordion"));
  const overlayToggleButtons = Array.from(document.querySelectorAll("[data-overlay-toggle]"));

  if (!leftSidebar || !rightSidebar || overlayToggleButtons.length === 0) {
    return;
  }

  const getOverlaySidebar = (side) => (side === "left" ? leftSidebar : rightSidebar);
  const getOverlayPanels = (side) => (side === "left" ? leftPanelAccordions : rightPanelAccordions);

  const syncOverlayToggleButtons = () => {
    const fullscreenActive = Boolean(document.fullscreenElement);
    overlayToggleButtons.forEach((button) => {
      const side = button.dataset.overlaySide === "left" ? "left" : "right";
      const targetId = button.dataset.overlayTarget || "";
      const sidebar = getOverlaySidebar(side);
      const target = targetId ? document.getElementById(targetId) : null;
      const active = Boolean(
        fullscreenActive
        && sidebar.classList.contains("visible-overlay")
        && target instanceof HTMLElement
        && target.open
      );
      button.setAttribute("aria-expanded", active ? "true" : "false");
      const symbol = button.querySelector(".overlay-toggle-symbol");
      if (symbol) {
        symbol.textContent = active ? "-" : "+";
      }
      button.classList.toggle(
        "is-hidden-while-overlay-open",
        Boolean(fullscreenActive && sidebar.classList.contains("visible-overlay"))
      );
    });
  };

  const toggleOverlayPanel = (side, targetId) => {
    const sidebar = getOverlaySidebar(side);
    const panels = getOverlayPanels(side);
    if (!(sidebar instanceof HTMLElement) || !Array.isArray(panels) || panels.length === 0) {
      return;
    }
    const target = panels.find((panel) => panel.id === targetId);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const fullscreenActive = Boolean(document.fullscreenElement);
    if (!fullscreenActive) {
      target.open = !target.open;
      syncOverlayToggleButtons();
      return;
    }

    if (!sidebar.classList.contains("visible-overlay")) {
      sidebar.classList.add("visible-overlay");
      target.open = true;
    } else {
      target.open = !target.open;
    }
    if (!panels.some((panel) => panel.open)) {
      sidebar.classList.remove("visible-overlay");
    }
    syncOverlayToggleButtons();
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

  overlayToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const side = button.dataset.overlaySide === "left" ? "left" : "right";
      const targetId = button.dataset.overlayTarget || "";
      toggleOverlayPanel(side, targetId);
    });
  });

  leftPanelAccordions.forEach((panel) => {
    panel.addEventListener("toggle", () => {
      if (!document.fullscreenElement) {
        return;
      }
      if (panel.open) {
        leftSidebar.classList.add("visible-overlay");
      } else if (!leftPanelAccordions.some((entry) => entry.open)) {
        leftSidebar.classList.remove("visible-overlay");
      }
      syncOverlayToggleButtons();
    });
  });

  rightPanelAccordions.forEach((panel) => {
    panel.addEventListener("toggle", () => {
      if (!document.fullscreenElement) {
        return;
      }
      if (panel.open) {
        rightSidebar.classList.add("visible-overlay");
      } else if (!rightPanelAccordions.some((entry) => entry.open)) {
        rightSidebar.classList.remove("visible-overlay");
      }
      syncOverlayToggleButtons();
    });
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
