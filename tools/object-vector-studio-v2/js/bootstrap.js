import { ToolStarterApp } from "./ToolStarterApp.js";
import { ActionNavControl } from "./controls/ActionNavControl.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { ToolStarterShellControl } from "./controls/ToolStarterShellControl.js";
import { ObjectVectorStudioV2SchemaService } from "./services/ObjectVectorStudioV2SchemaService.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required starter template element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  const accordions = Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section));
  const statusLog = new StatusLogControl({
    log: requireElement("#statusLog"),
    clearButton: requireElement("#clearStatusButton")
  });
  const app = new ToolStarterApp({
    accordions,
    actionNav: new ActionNavControl({
      returnToWorkspaceButton: requireElement("#returnToWorkspaceButton"),
      toolCopyJsonButton: requireElement("#objectVectorStudioV2CopyJsonButton"),
      toolExportJsonButton: requireElement("#objectVectorStudioV2ExportJsonButton"),
      toolImportJsonButton: requireElement("#objectVectorStudioV2ImportJsonButton"),
      toolImportJsonInput: requireElement("#objectVectorStudioV2ImportJsonInput"),
      toolNav: requireElement(".tool-starter__tool__menu"),
      workspaceNav: requireElement(".tool-starter__workspace__menu")
    }),
    elements: {
      jsonDetails: requireElement("#objectVectorStudioV2JsonDetails"),
      loadStatus: requireElement("#objectVectorStudioV2LoadStatus"),
      objectDetails: requireElement("#objectVectorStudioV2ObjectDetails"),
      objectTiles: requireElement("#objectVectorStudioV2ObjectTiles"),
      paletteGate: requireElement("#objectVectorStudioV2PaletteGate"),
      paletteSummary: requireElement("#objectVectorStudioV2PaletteSummary"),
      selectedItemVisibility: requireElement("#objectVectorStudioV2SelectedItemVisibility"),
      sourceSummary: requireElement("#objectVectorStudioV2SourceSummary"),
      toolToggles: Array.from(document.querySelectorAll("[data-shape-tool]"))
    },
    schemaService: new ObjectVectorStudioV2SchemaService(),
    shell: new ToolStarterShellControl(),
    statusLog,
    windowRef: window
  });

  app.start();
});
