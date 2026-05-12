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
      addObjectButton: requireElement("#objectVectorStudioV2AddObjectButton"),
      angleSnapButton: requireElement("#objectVectorStudioV2AngleSnapButton"),
      categoryFilter: requireElement("#objectVectorStudioV2CategoryFilter"),
      coordinateDisplay: requireElement("#objectVectorStudioV2CoordinateDisplay"),
      createTemplateButton: requireElement("#objectVectorStudioV2CreateTemplateButton"),
      createStateButton: requireElement("#objectVectorStudioV2CreateStateButton"),
      deleteObjectButton: requireElement("#objectVectorStudioV2DeleteObjectButton"),
      duplicateFrameButton: requireElement("#objectVectorStudioV2DuplicateFrameButton"),
      duplicateObjectButton: requireElement("#objectVectorStudioV2DuplicateObjectButton"),
      exportSvgButton: requireElement("#objectVectorStudioV2ExportSvgButton"),
      fpsInput: requireElement("#objectVectorStudioV2FpsInput"),
      frameEarlierButton: requireElement("#objectVectorStudioV2FrameEarlierButton"),
      frameLaterButton: requireElement("#objectVectorStudioV2FrameLaterButton"),
      frameTimeline: requireElement("#objectVectorStudioV2FrameTimeline"),
      flattenObjectButton: requireElement("#objectVectorStudioV2FlattenObjectButton"),
      gridRenderButton: requireElement("#objectVectorStudioV2GridRenderButton"),
      gridSnapButton: requireElement("#objectVectorStudioV2GridSnapButton"),
      jsonDetails: requireElement("#objectVectorStudioV2JsonDetails"),
      loadStatus: requireElement("#objectVectorStudioV2LoadStatus"),
      loopToggle: requireElement("#objectVectorStudioV2LoopToggle"),
      objectCount: requireElement("#objectVectorStudioV2ObjectCount"),
      objectDetails: requireElement("#objectVectorStudioV2ObjectDetails"),
      objectNameInput: requireElement("#objectVectorStudioV2ObjectNameInput"),
      objectTiles: requireElement("#objectVectorStudioV2ObjectTiles"),
      objectTypeSelect: requireElement("#objectVectorStudioV2ObjectTypeSelect"),
      paletteGate: requireElement("#objectVectorStudioV2PaletteGate"),
      paletteSummary: requireElement("#objectVectorStudioV2PaletteSummary"),
      panLeftButton: requireElement("#objectVectorStudioV2PanLeftButton"),
      panRightButton: requireElement("#objectVectorStudioV2PanRightButton"),
      onionSkinToggle: requireElement("#objectVectorStudioV2OnionSkinToggle"),
      pauseButton: requireElement("#objectVectorStudioV2PauseButton"),
      playButton: requireElement("#objectVectorStudioV2PlayButton"),
      renameObjectButton: requireElement("#objectVectorStudioV2RenameObjectButton"),
      renderSummary: requireElement("#objectVectorStudioV2RenderSummary"),
      renderSurface: requireElement("#objectVectorStudioV2RenderSurface"),
      resetViewButton: requireElement("#objectVectorStudioV2ResetViewButton"),
      runtimePreviewButton: requireElement("#objectVectorStudioV2RuntimePreviewButton"),
      searchFilter: requireElement("#objectVectorStudioV2SearchFilter"),
      selectionMetrics: requireElement("#objectVectorStudioV2SelectionMetrics"),
      selectedItemVisibility: requireElement("#objectVectorStudioV2SelectedItemVisibility"),
      shapeCount: requireElement("#objectVectorStudioV2ShapeCount"),
      sourceSummary: requireElement("#objectVectorStudioV2SourceSummary"),
      stateSelect: requireElement("#objectVectorStudioV2StateSelect"),
      stopButton: requireElement("#objectVectorStudioV2StopButton"),
      templateSelect: requireElement("#objectVectorStudioV2TemplateSelect"),
      toolLabelModeButton: requireElement("#objectVectorStudioV2ToolLabelModeButton"),
      toolToggleGrid: requireElement("#objectVectorStudioV2ToolToggleGrid"),
      toolToggles: Array.from(document.querySelectorAll("[data-shape-tool]")),
      zoomInButton: requireElement("#objectVectorStudioV2ZoomInButton"),
      zoomOutButton: requireElement("#objectVectorStudioV2ZoomOutButton")
    },
    schemaService: new ObjectVectorStudioV2SchemaService(),
    shell: new ToolStarterShellControl(),
    statusLog,
    windowRef: window
  });

  app.start().catch((error) => {
    statusLog.write(`FAIL Object Vector Studio V2 schema contract failed to load: ${error.message}`);
  });
});
