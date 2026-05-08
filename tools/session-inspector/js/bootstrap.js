import { SessionInspectorApp } from "./SessionInspectorApp.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { DetailsControl } from "./controls/DetailsControl.js";
import { EntryListControl } from "./controls/EntryListControl.js";
import { FilterControl } from "./controls/FilterControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { sessionInspectorRuntimeContract } from "./services/SessionInspectorRuntimeContract.js";
import { SessionInspectorStorageService } from "./services/SessionInspectorStorageService.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required Session Inspector element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new SessionInspectorApp({
    accordions: Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section)),
    details: new DetailsControl({
      output: requireElement("#sessionDetailsOutput")
    }),
    entryList: new EntryListControl({
      container: requireElement("#sessionEntryList")
    }),
    filters: new FilterControl({
      filterInput: requireElement("#sessionFilterInput"),
      scopeSelect: requireElement("#storageScopeSelect"),
      summary: requireElement("#sessionSummary")
    }),
    refreshButton: requireElement("#refreshSessionButton"),
    runtimeContract: sessionInspectorRuntimeContract(),
    statusLog: new StatusLogControl({
      clearButton: requireElement("#clearStatusButton"),
      output: requireElement("#statusLog")
    }),
    storageService: new SessionInspectorStorageService()
  });
  window.__sessionInspectorApp = app;
  app.start();
});
