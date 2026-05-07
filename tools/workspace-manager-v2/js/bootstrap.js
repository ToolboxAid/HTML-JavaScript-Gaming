import { WorkspaceManagerV2App } from "./WorkspaceManagerV2App.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { GameSelectorControl } from "./controls/GameSelectorControl.js";
import { LaunchControl } from "./controls/LaunchControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { WorkspaceSummaryControl } from "./controls/WorkspaceSummaryControl.js";
import { WorkspaceManagerV2ContextService } from "./services/WorkspaceManagerV2ContextService.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required Workspace Manager V2 element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new WorkspaceManagerV2App({
    accordions: Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section)),
    contextService: new WorkspaceManagerV2ContextService(),
    gameSelector: new GameSelectorControl({
      select: requireElement("#activeGameSelect"),
      summary: requireElement("#activeGameSummary")
    }),
    launchControl: new LaunchControl(requireElement("#launchAssetManagerV2Button")),
    saveControl: new LaunchControl(requireElement("#saveWorkspaceManifestButton")),
    statusLog: new StatusLogControl({
      clearButton: requireElement("#clearStatusButton"),
      log: requireElement("#statusLog")
    }),
    summary: new WorkspaceSummaryControl({
      assetRegistrySummary: requireElement("#activeAssetRegistrySummary"),
      contextOutput: requireElement("#workspaceContextOutput"),
      launchContextSummary: requireElement("#launchContextSummary"),
      paletteSummary: requireElement("#activePaletteSummary")
    })
  });

  window.__workspaceManagerV2App = app;
  app.start();
});
