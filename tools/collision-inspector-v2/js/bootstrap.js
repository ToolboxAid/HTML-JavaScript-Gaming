import { CollisionInspectorV2App } from "./CollisionInspectorV2App.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing Collision Inspector V2 element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new CollisionInspectorV2App({
    elements: {
      body: document.body,
      boundsState: requireElement("#boundsState"),
      canvas: requireElement("#collisionCanvas"),
      clearLogButton: requireElement("#clearCollisionLogButton"),
      copyReportButton: requireElement("#copyCollisionReportButton"),
      fileInput: requireElement("#collisionManifestInput"),
      log: requireElement("#collisionLog"),
      manifestSummary: requireElement("#manifestSummary"),
      modeSelect: requireElement("#collisionModeSelect"),
      modeState: requireElement("#modeState"),
      objectASelect: requireElement("#objectASelect"),
      objectBSelect: requireElement("#objectBSelect"),
      overlapState: requireElement("#overlapState"),
      resetButton: requireElement("#resetSimulationButton"),
      resultBadge: requireElement("#collisionResultBadge"),
      returnToWorkspaceButton: requireElement("#returnToWorkspaceButton"),
      summary: requireElement("#collisionSummary"),
      toolNav: requireElement('[data-launch-mode-nav="tool"]'),
      workspaceNav: requireElement('[data-launch-mode-nav="workspace"]')
    },
    windowRef: window
  });
  window.__collisionInspectorV2App = app;
  void app.start();
});
