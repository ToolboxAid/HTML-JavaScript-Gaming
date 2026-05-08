import { SessionInspectorV2App } from "./SessionInspectorV2App.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { DetailsControl } from "./controls/DetailsControl.js";
import { EntryListControl } from "./controls/EntryListControl.js";
import { FilterControl } from "./controls/FilterControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { sessionInspectorV2RuntimeContract } from "./services/SessionInspectorV2RuntimeContract.js";
import { SessionInspectorV2StorageService } from "./services/SessionInspectorV2StorageService.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required Session Inspector V2 element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new SessionInspectorV2App({
    accordions: Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section)),
    details: new DetailsControl({
      output: requireElement("#sessionInspectorV2DetailsOutput")
    }),
    deleteAllButton: requireElement("#deleteAllSessionInspectorV2Button"),
    entryList: new EntryListControl({
      container: requireElement("#sessionInspectorV2EntryList")
    }),
    filters: new FilterControl({
      filterInput: requireElement("#sessionInspectorV2FilterInput"),
      scopeSelect: requireElement("#storageScopeSelect"),
      summary: requireElement("#sessionInspectorV2Summary")
    }),
    refreshButton: requireElement("#refreshSessionInspectorV2Button"),
    runtimeContract: sessionInspectorV2RuntimeContract(),
    statusLog: new StatusLogControl({
      clearButton: requireElement("#clearSessionInspectorV2StatusButton"),
      output: requireElement("#statusLog")
    }),
    storageService: new SessionInspectorV2StorageService()
  });
  window.__sessionInspectorV2App = app;
  app.start();
});
