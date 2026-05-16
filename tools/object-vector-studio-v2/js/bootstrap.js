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

function optionalElement(selector) {
  return document.querySelector(selector);
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
      centerDotButton: requireElement("#objectVectorStudioV2CenterDotButton"),
      coordinateDisplay: requireElement("#objectVectorStudioV2CoordinateDisplay"),
      deleteFrameButton: requireElement("#objectVectorStudioV2DeleteFrameButton"),
      deleteObjectButton: optionalElement("#objectVectorStudioV2DeleteObjectButton"),
      dependencyGraph: requireElement("#objectVectorStudioV2DependencyGraph"),
      duplicateFrameButton: requireElement("#objectVectorStudioV2DuplicateFrameButton"),
      duplicateObjectButton: requireElement("#objectVectorStudioV2DuplicateObjectButton"),
      exportSvgButton: requireElement("#objectVectorStudioV2ExportSvgButton"),
      fillOpacity: requireElement("#objectVectorStudioV2FillOpacity"),
      fpsInput: requireElement("#objectVectorStudioV2FpsInput"),
      frameEarlierButton: requireElement("#objectVectorStudioV2FrameEarlierButton"),
      frameLaterButton: requireElement("#objectVectorStudioV2FrameLaterButton"),
      frameLeftButton: requireElement("#objectVectorStudioV2FrameLeftButton"),
      frameRightButton: requireElement("#objectVectorStudioV2FrameRightButton"),
      frameTimeline: requireElement("#objectVectorStudioV2FrameTimeline"),
      gridRenderButton: requireElement("#objectVectorStudioV2GridRenderButton"),
      jsonDetails: requireElement("#objectVectorStudioV2JsonDetails"),
      leftPanel: requireElement(".tool-starter__panel--left"),
      loopToggle: requireElement("#objectVectorStudioV2LoopToggle"),
      objectDetails: requireElement("#objectVectorStudioV2ObjectDetails"),
      objectGeometryName: requireElement("#objectVectorStudioV2ObjectGeometryName"),
      objectGeometrySummary: requireElement("#objectVectorStudioV2ObjectGeometrySummary"),
      objectNameInput: requireElement("#objectVectorStudioV2ObjectNameInput"),
      objectPreviewFooter: requireElement("#objectVectorStudioV2ObjectPreviewFooter"),
      objectTagInput: requireElement("#objectVectorStudioV2ObjectTagInput"),
      objectTagList: requireElement("#objectVectorStudioV2ObjectTagList"),
      objectTransform: requireElement("#objectVectorStudioV2ObjectTransform"),
      objectsContent: requireElement("#objectVectorStudioV2ObjectsContent"),
      objectsCount: requireElement("#objectVectorStudioV2ObjectsCount"),
      objectTiles: requireElement("#objectVectorStudioV2ObjectTiles"),
      paintModeButton: requireElement("#objectVectorStudioV2PaintModeButton"),
      paletteSortButtons: Array.from(document.querySelectorAll("[data-palette-sort]")),
      paletteSummary: requireElement("#objectVectorStudioV2PaletteSummary"),
      paletteSwatchCount: requireElement("#objectVectorStudioV2PaletteSwatchCount"),
      panDownButton: requireElement("#objectVectorStudioV2PanDownButton"),
      panLeftButton: requireElement("#objectVectorStudioV2PanLeftButton"),
      panRightButton: requireElement("#objectVectorStudioV2PanRightButton"),
      panUpButton: requireElement("#objectVectorStudioV2PanUpButton"),
      onionSkinToggle: requireElement("#objectVectorStudioV2OnionSkinToggle"),
      pauseButton: requireElement("#objectVectorStudioV2PauseButton"),
      playButton: requireElement("#objectVectorStudioV2PlayButton"),
      copyJsonDetailsButton: requireElement("#objectVectorStudioV2CopyJsonDetailsButton"),
      renameObjectButton: requireElement("#objectVectorStudioV2RenameObjectButton"),
      renderSurface: requireElement("#objectVectorStudioV2RenderSurface"),
      resetViewButton: requireElement("#objectVectorStudioV2ResetViewButton"),
      runtimePreviewButton: requireElement("#objectVectorStudioV2RuntimePreviewButton"),
      searchFilter: requireElement("#objectVectorStudioV2SearchFilter"),
      snapGridButton: requireElement("#objectVectorStudioV2SnapGridButton"),
      snapNoneButton: requireElement("#objectVectorStudioV2SnapNoneButton"),
      snapPointButton: requireElement("#objectVectorStudioV2SnapPointButton"),
      stopButton: requireElement("#objectVectorStudioV2StopButton"),
      strokeModeButton: requireElement("#objectVectorStudioV2StrokeModeButton"),
      strokeOpacity: requireElement("#objectVectorStudioV2StrokeOpacity"),
      strokeWidth: requireElement("#objectVectorStudioV2StrokeWidth"),
      tagFilter: requireElement("#objectVectorStudioV2TagFilter"),
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
