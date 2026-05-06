import { AssetManagerV2App } from "./AssetManagerV2App.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { ActionNavControl } from "./controls/ActionNavControl.js";
import { AssetCatalogControl } from "./controls/AssetCatalogControl.js";
import { AssetFormControl } from "./controls/AssetFormControl.js";
import { AssetManagerShellControl } from "./controls/AssetManagerShellControl.js";
import { InspectorControl } from "./controls/InspectorControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { AssetSchemaValidator } from "./services/AssetSchemaValidator.js";
import { WorkspaceBridge } from "./services/WorkspaceBridge.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required Asset Manager V2 element: ${selector}`);
  }
  return element;
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new AssetManagerV2App({
    accordions: Array.from(document.querySelectorAll(".accordion-v2"), (section) => new AccordionSection(section)),
    actionNav: new ActionNavControl({
      toolCopyJsonButton: requireElement("#toolCopyJsonButton"),
      toolExportButton: requireElement("#toolExportButton"),
      toolExportToolStateButton: requireElement("#toolExportToolStateButton"),
      toolNav: requireElement(".asset-manager-v2__tool__menu"),
      workspaceCopyManifestButton: requireElement("#workspaceCopyManifestButton"),
      workspaceInsertAssetsButton: requireElement("#workspaceInsertAssetsButton"),
      workspaceNav: requireElement(".asset-manager-v2__workspace__menu")
    }),
    assetCatalog: new AssetCatalogControl({
      countText: requireElement("#assetCountText"),
      list: requireElement("#assetList"),
      preview: requireElement("#assetPreview")
    }),
    assetForm: new AssetFormControl({
      addButton: requireElement("#addAssetButton"),
      assetIdInput: requireElement("#assetIdInput"),
      fileInput: requireElement("#assetFileInput"),
      kindInputs: Array.from(document.querySelectorAll('input[name="assetKind"]')),
      pathInput: requireElement("#assetPathInput"),
      pickFileButton: requireElement("#pickAssetFileButton"),
      roleSelect: requireElement("#assetRoleSelect"),
      redoButton: requireElement("#redoAssetButton"),
      stretchField: requireElement("#assetStretchOverrideField"),
      stretchInput: requireElement("#assetStretchOverrideInput"),
      undoButton: requireElement("#undoAssetButton"),
      updateButton: requireElement("#updateAssetButton"),
      windowRef: window
    }),
    inspector: new InspectorControl(requireElement("#inspectorOutput")),
    schemaValidator: new AssetSchemaValidator({
      schemaUrl: "../schemas/tools/asset-browser.schema.json"
    }),
    shell: new AssetManagerShellControl(),
    statusLog: new StatusLogControl({
      clearButton: requireElement("#clearStatusButton"),
      log: requireElement("#statusLog")
    }),
    windowRef: window,
    workspaceBridge: new WorkspaceBridge({ windowRef: window })
  });

  void app.start();
});
