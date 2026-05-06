import { ToolStarterApp } from "./ToolStarterApp.js";
import { ActionNavControl } from "./controls/ActionNavControl.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { InspectorControl } from "./controls/InspectorControl.js";
import { PreviewPanelControl } from "./controls/PreviewPanelControl.js";
import { SourceInputControl } from "./controls/SourceInputControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { ToolStarterShellControl } from "./controls/ToolStarterShellControl.js";
import { ToolStateSerializer } from "./services/ToolStateSerializer.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required starter template element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  const accordions = Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section));
  const sourceInput = new SourceInputControl({
    input: requireElement("#sourceInput"),
    validationMessage: requireElement("#sourceValidationMessage")
  });
  const statusLog = new StatusLogControl({
    log: requireElement("#statusLog"),
    clearButton: requireElement("#clearStatusButton")
  });
  const app = new ToolStarterApp({
    accordions,
    actionNav: new ActionNavControl({
      runButton: requireElement("#runToolButton"),
      resetButton: requireElement("#resetToolButton"),
      exportButton: requireElement("#exportToolStateButton")
    }),
    inspector: new InspectorControl(requireElement("#inspectorOutput")),
    preview: new PreviewPanelControl(requireElement("#previewOutput")),
    serializer: new ToolStateSerializer("first-class-tool-starter"),
    shell: new ToolStarterShellControl(),
    sourceInput,
    statusLog
  });

  app.start();
});
