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
      addTagButton: requireElement("#objectVectorStudioV2AddTagButton"),
      angleSnapButton: requireElement("#objectVectorStudioV2AngleSnapButton"),
      bringForwardButton: requireElement("#objectVectorStudioV2BringForwardButton"),
      bringToFrontButton: requireElement("#objectVectorStudioV2BringToFrontButton"),
      centerDotButton: requireElement("#objectVectorStudioV2CenterDotButton"),
      coordinateDisplay: requireElement("#objectVectorStudioV2CoordinateDisplay"),
      deleteObjectButton: requireElement("#objectVectorStudioV2DeleteObjectButton"),
      dependencyGraph: requireElement("#objectVectorStudioV2DependencyGraph"),
      duplicateFrameButton: requireElement("#objectVectorStudioV2DuplicateFrameButton"),
      duplicateObjectButton: requireElement("#objectVectorStudioV2DuplicateObjectButton"),
      exportSvgButton: requireElement("#objectVectorStudioV2ExportSvgButton"),
      fpsInput: requireElement("#objectVectorStudioV2FpsInput"),
      frameEarlierButton: requireElement("#objectVectorStudioV2FrameEarlierButton"),
      frameLaterButton: requireElement("#objectVectorStudioV2FrameLaterButton"),
      frameTimeline: requireElement("#objectVectorStudioV2FrameTimeline"),
      gridRenderButton: requireElement("#objectVectorStudioV2GridRenderButton"),
      gridSnapButton: requireElement("#objectVectorStudioV2GridSnapButton"),
      groupShapesButton: requireElement("#objectVectorStudioV2GroupShapesButton"),
      jsonDetails: requireElement("#objectVectorStudioV2JsonDetails"),
      leftPanel: requireElement(".tool-starter__panel--left"),
      loopToggle: requireElement("#objectVectorStudioV2LoopToggle"),
      objectDetails: requireElement("#objectVectorStudioV2ObjectDetails"),
      objectDetailsCount: requireElement("#objectVectorStudioV2ObjectDetailsCount"),
      objectNameInput: requireElement("#objectVectorStudioV2ObjectNameInput"),
      objectPreviewFooter: requireElement("#objectVectorStudioV2ObjectPreviewFooter"),
      objectTagInput: requireElement("#objectVectorStudioV2ObjectTagInput"),
      objectTagList: requireElement("#objectVectorStudioV2ObjectTagList"),
      objectsContent: requireElement("#objectVectorStudioV2ObjectsContent"),
      objectTiles: requireElement("#objectVectorStudioV2ObjectTiles"),
      paintModeButton: requireElement("#objectVectorStudioV2PaintModeButton"),
      paletteSortButtons: Array.from(document.querySelectorAll("[data-palette-sort]")),
      paletteSummary: requireElement("#objectVectorStudioV2PaletteSummary"),
      paletteSwatchCount: requireElement("#objectVectorStudioV2PaletteSwatchCount"),
      panLeftButton: requireElement("#objectVectorStudioV2PanLeftButton"),
      panRightButton: requireElement("#objectVectorStudioV2PanRightButton"),
      onionSkinToggle: requireElement("#objectVectorStudioV2OnionSkinToggle"),
      pauseButton: requireElement("#objectVectorStudioV2PauseButton"),
      playButton: requireElement("#objectVectorStudioV2PlayButton"),
      copyJsonDetailsButton: requireElement("#objectVectorStudioV2CopyJsonDetailsButton"),
      renameObjectButton: requireElement("#objectVectorStudioV2RenameObjectButton"),
      renderSurface: requireElement("#objectVectorStudioV2RenderSurface"),
      resetViewButton: requireElement("#objectVectorStudioV2ResetViewButton"),
      runtimePreviewButton: requireElement("#objectVectorStudioV2RuntimePreviewButton"),
      searchFilter: requireElement("#objectVectorStudioV2SearchFilter"),
      sendBackwardButton: requireElement("#objectVectorStudioV2SendBackwardButton"),
      sendToBackButton: requireElement("#objectVectorStudioV2SendToBackButton"),
      stopButton: requireElement("#objectVectorStudioV2StopButton"),
      strokeModeButton: requireElement("#objectVectorStudioV2StrokeModeButton"),
      strokeWidth: requireElement("#objectVectorStudioV2StrokeWidth"),
      tagFilter: requireElement("#objectVectorStudioV2TagFilter"),
      toolLabelModeButton: requireElement("#objectVectorStudioV2ToolLabelModeButton"),
      toolToggleGrid: requireElement("#objectVectorStudioV2ToolToggleGrid"),
      toolToggles: Array.from(document.querySelectorAll("[data-shape-tool]")),
      ungroupButton: requireElement("#objectVectorStudioV2UngroupButton"),
      zoomInButton: requireElement("#objectVectorStudioV2ZoomInButton"),
      zoomOutButton: requireElement("#objectVectorStudioV2ZoomOutButton"),
      zOrderActions: requireElement(".object-vector-studio-v2__z-order-actions")
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
