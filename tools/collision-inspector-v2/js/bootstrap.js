import { CollisionInspectorV2App } from "./CollisionInspectorV2App.js";
import { CollisionInspectorV2Controls } from "./CollisionInspectorV2Controls.js";
import { CollisionInspectorV2Logger } from "./CollisionInspectorV2Logger.js";
import { CollisionInspectorV2Renderer } from "./CollisionInspectorV2Renderer.js";
import { CollisionInspectorV2Shell } from "./CollisionInspectorV2Shell.js";
import { GameManifestLoader } from "../../../src/tools/common/GameManifestLoader.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing Collision Inspector V2 element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  const elements = {
    body: document.body,
    boundsState: requireElement("#boundsState"),
    canvas: requireElement("#collisionCanvas"),
    clearLogButton: requireElement("#clearCollisionLogButton"),
    fileInput: requireElement("#collisionManifestInput"),
    log: requireElement("#collisionLog"),
    manifestSummary: requireElement("#manifestSummary"),
    modeSelect: requireElement("#collisionModeSelect"),
    modeState: requireElement("#modeState"),
    objectASelect: requireElement("#objectASelect"),
    objectBSelect: requireElement("#objectBSelect"),
    originState: requireElement("#originState"),
    overlapState: requireElement("#overlapState"),
    pointsState: requireElement("#pointsState"),
    resetButton: requireElement("#resetSimulationButton"),
    resultBadge: requireElement("#collisionResultBadge"),
    returnToWorkspaceButton: requireElement("#returnToWorkspaceButton"),
    rotationAInput: requireElement("#objectARotationInput"),
    rotationBInput: requireElement("#objectBRotationInput"),
    rotationState: requireElement("#rotationState"),
    summary: requireElement("#collisionSummary"),
    toolNav: requireElement('[data-launch-mode-nav="tool"]'),
    workspaceNav: requireElement('[data-launch-mode-nav="workspace"]'),
    zoomInput: requireElement("#collisionZoomInput"),
    zoomState: requireElement("#zoomState")
  };
  const app = new CollisionInspectorV2App({
    controls: new CollisionInspectorV2Controls({ elements, windowRef: window }),
    logger: new CollisionInspectorV2Logger({ logElement: elements.log }),
    manifestLoader: new GameManifestLoader({ windowRef: window }),
    renderer: new CollisionInspectorV2Renderer({ canvas: elements.canvas }),
    shell: new CollisionInspectorV2Shell({ documentRef: document, windowRef: window }),
    windowRef: window
  });
  window.__collisionInspectorV2App = app;
  void app.start();
});
