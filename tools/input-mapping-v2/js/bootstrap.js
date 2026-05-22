import { ActionNavControl } from "./controls/ActionNavControl.js";
import { AccordionSection } from "./controls/AccordionSection.js";
import { ActionSelectionControl } from "./controls/ActionSelectionControl.js";
import { CaptureControl } from "./controls/CaptureControl.js";
import { DeviceListControl } from "./controls/DeviceListControl.js";
import { EngineInputSourceService } from "./services/EngineInputSourceService.js";
import { ExportControl } from "./controls/ExportControl.js";
import { GamepadDiagnosticsControl } from "./controls/GamepadDiagnosticsControl.js";
import { GestureListControl } from "./controls/GestureListControl.js";
import { InputMappingState } from "./services/InputMappingState.js";
import { InspectorControl } from "./controls/InspectorControl.js";
import { PreviewPanelControl } from "./controls/PreviewPanelControl.js";
import { StatusLogControl } from "./controls/StatusLogControl.js";
import { ToolStarterApp } from "./ToolStarterApp.js";
import { ToolStarterShellControl } from "./controls/ToolStarterShellControl.js";

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required Input Mapping V2 element: ${selector}`);
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
      workspaceCopyManifestButton: requireElement("#workspaceCopyManifestButton"),
      workspaceExportManifestButton: requireElement("#workspaceExportManifestButton"),
      workspaceImportManifestButton: requireElement("#workspaceImportManifestButton"),
      workspaceNav: requireElement(".tool-starter__workspace__menu")
    }),
    actionSelection: new ActionSelectionControl({
      actionHint: requireElement("#inputMappingV2ActionHint"),
      actionSelect: requireElement("#inputMappingV2ActionSelect"),
      addActionButton: requireElement("#inputMappingV2AddActionButton"),
      clearActionButton: requireElement("#inputMappingV2ClearActionButton"),
      customActionInput: requireElement("#inputMappingV2CustomActionInput"),
      deleteActionButton: requireElement("#inputMappingV2DeleteActionButton")
    }),
    capture: new CaptureControl({
      captureGamepadButtons: requireElement("#inputMappingV2GamepadCaptureButtons"),
      captureKeyboardButton: requireElement("#inputMappingV2CaptureKeyboardButton"),
      captureMessage: requireElement("#inputMappingV2CaptureMessage"),
      captureMouseButton: requireElement("#inputMappingV2CaptureMouseButton"),
      refreshGamepadsButton: requireElement("#inputMappingV2RefreshGamepadsButton"),
      selectedActionLabel: requireElement("#inputMappingV2SelectedActionLabel")
    }),
    deviceList: new DeviceListControl({
      container: requireElement("#inputMappingV2DeviceList"),
      rumbleFeedbackCheckbox: requireElement("#inputMappingV2RumbleFeedbackCheckbox")
    }),
    engineInputSources: new EngineInputSourceService({ windowRef: window }),
    exportControl: new ExportControl({
      copyJsonButton: requireElement("#toolCopyJsonButton"),
      exportButton: requireElement("#toolExportButton"),
      nav: requireElement("#inputMappingV2ExportNav")
    }),
    gamepadDiagnostics: new GamepadDiagnosticsControl(requireElement("#inputMappingV2Diagnostics")),
    gestureList: new GestureListControl(requireElement("#inputMappingV2GestureList")),
    inspector: new InspectorControl(requireElement("#inspectorOutput")),
    preview: new PreviewPanelControl(requireElement("#previewOutput")),
    shell: new ToolStarterShellControl(),
    state: new InputMappingState(),
    statusLog,
    windowRef: window
  });

  app.start();
});
