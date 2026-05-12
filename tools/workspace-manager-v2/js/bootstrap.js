import { WorkspaceManagerV2App } from "./WorkspaceManagerV2App.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { GameSelectorControl } from "./controls/GameSelectorControl.js";
import { ManifestMenuControl } from "./controls/ManifestMenuControl.js";
import { RepoDestinationControl } from "./controls/RepoDestinationControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { ToolTilesControl } from "./controls/ToolTilesControl.js";
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
  const statusLog = new StatusLogControl({
    clearButton: requireElement("#clearStatusButton"),
    log: requireElement("#statusLog")
  });
  const app = new WorkspaceManagerV2App({
    accordions: Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section)),
    contextService: new WorkspaceManagerV2ContextService(),
    gameSelector: new GameSelectorControl({
      onSummary: (message) => {
        statusLog.info(message);
      },
      select: requireElement("#activeGameSelect")
    }),
    menu: new ManifestMenuControl({
      cancelButton: requireElement("#cancelWorkspaceButton"),
      closeButton: requireElement("#closeWorkspaceButton"),
      saveButton: requireElement("#saveWorkspaceButton"),
      uatButton: requireElement("#seedUatManifestButton")
    }),
    repoDestination: new RepoDestinationControl({
      pickRepoButton: requireElement("#pickRepoBtn"),
      repoSelectedValue: requireElement("#repoSelectedValue")
    }),
    statusLog,
    summary: new WorkspaceSummaryControl({
      copyButton: requireElement("#copyWorkspaceJsonButton"),
      contextOutput: requireElement("#workspaceContextOutput")
    }),
    toolTiles: new ToolTilesControl({
      container: requireElement("#workspaceToolTiles")
    })
  });

  window.__workspaceManagerV2App = app;
  app.start();
});
