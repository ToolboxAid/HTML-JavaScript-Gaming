import { StorageInspectorV2App } from "./StorageInspectorV2App.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { DataControl } from "./controls/DataControl.js";
import { DirtyControl } from "./controls/DirtyControl.js";
import { EntryListControl } from "./controls/EntryListControl.js";
import { FilterControl } from "./controls/FilterControl.js";
import { JsonControl } from "./controls/JsonControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { storageInspectorV2RuntimeContract } from "./services/StorageInspectorV2RuntimeContract.js";
import { StorageInspectorV2StorageService } from "./services/StorageInspectorV2StorageService.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required Storage Inspector V2 element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new StorageInspectorV2App({
    accordions: Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section)),
    clearAllButton: requireElement("#clearAllStorageInspectorV2Button"),
    clearLocalButton: requireElement("#clearLocalStorageInspectorV2Button"),
    clearSessionButton: requireElement("#clearSessionStorageInspectorV2Button"),
    clearToolStateButton: requireElement("#clearToolStateStorageInspectorV2Button"),
    copyAllButton: requireElement("#copyStorageInspectorV2AllButton"),
    data: new DataControl({
      output: requireElement("#storageInspectorV2DataOutput")
    }),
    json: new JsonControl({
      output: requireElement("#storageInspectorV2JsonOutput")
    }),
    dirty: new DirtyControl({
      headerValue: requireElement("#storageInspectorV2DirtyHeaderValue"),
      output: requireElement("#storageInspectorV2DirtyOutput")
    }),
    entryList: new EntryListControl({
      container: requireElement("#storageInspectorV2EntryList")
    }),
    filters: new FilterControl({
      filterInput: requireElement("#storageInspectorV2FilterInput"),
      scopeSelect: requireElement("#storageScopeSelect"),
      summary: requireElement("#storageInspectorV2Summary")
    }),
    refreshButton: requireElement("#refreshStorageInspectorV2Button"),
    returnToWorkspaceButton: requireElement("#returnToWorkspaceButton"),
    runtimeContract: storageInspectorV2RuntimeContract(),
    statusLog: new StatusLogControl({
      clearButton: requireElement("#clearStorageInspectorV2StatusButton"),
      output: requireElement("#statusLog")
    }),
    storageService: new StorageInspectorV2StorageService()
  });
  window.__storageInspectorV2App = app;
  app.start();
});
