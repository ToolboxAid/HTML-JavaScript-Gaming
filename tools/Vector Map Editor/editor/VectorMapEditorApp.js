/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapEditorApp.js
*/
import { VectorMapDocument } from "./VectorMapDocument.js";
import { VectorMapSerializer } from "./VectorMapSerializer.js";
import { VectorMapRenderer2D } from "./VectorMapRenderer2D.js";
import { VectorMapRenderer3D } from "./VectorMapRenderer3D.js";
import { VectorMapInteractionController } from "./VectorMapInteractionController.js";
import { VectorMapTransformController } from "./VectorMapTransformController.js";
import { VectorMapSelectionModel } from "./VectorMapSelectionModel.js";
import { VectorMapJsonEditor } from "./VectorMapJsonEditor.js";
import { VectorMapFullscreenController } from "./VectorMapFullscreenController.js";
import { VectorMapCollisionTester } from "./VectorMapCollisionTester.js";
import { VectorMapRuntimeExporter } from "./VectorMapRuntimeExporter.js";
import { VectorMapHistoryManager } from "./VectorMapHistoryManager.js";
import { assertStandaloneToolDocument, offerImportMismatchOptions } from "../../shared/documentModeGuards.js";
import {
  getToolLoadQuerySnapshot,
  getToolLoadRequestedDataPaths,
  summarizeToolLoadData,
  logToolLoadRequest,
  logToolLoadFetch,
  logToolLoadLoaded,
  logToolLoadWarning,
  logToolUiControlReady,
  logToolUiFinalReady,
  logToolUiLifecycle
} from "../../shared/toolLoadDiagnostics.js";

function normalizeDegrees(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  const wrapped = ((numeric + 180) % 360 + 360) % 360 - 180;
  return wrapped === -180 ? 180 : wrapped;
}

function parseNumericInput(value) {
  if (typeof value !== "string") {
    return Number.isFinite(Number(value)) ? Number(value) : null;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-" || trimmed === "+" || trimmed === "." || trimmed === "-." || trimmed === "+.") {
    return null;
  }
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeSamplePresetPath(pathValue) {
  if (typeof pathValue !== "string") {
    return "";
  }
  const trimmed = pathValue.trim().replace(/\\/g, "/");
  if (!trimmed || trimmed.includes("..")) {
    return "";
  }
  if (trimmed.startsWith("/samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("./samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("samples/")) {
    return `./${trimmed}`;
  }
  return "";
}

function buildPresetLoadedStatus(sampleId, samplePresetPath) {
  const normalizedSampleId = typeof sampleId === "string" ? sampleId.trim() : "";
  if (normalizedSampleId) {
    return `Loaded preset from sample ${normalizedSampleId}.`;
  }
  const normalizedPath = typeof samplePresetPath === "string" ? samplePresetPath.trim() : "";
  return normalizedPath ? `Loaded preset from ${normalizedPath}.` : "Loaded preset.";
}

function extractVectorMapDocumentFromSamplePreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }
  const containers = [
    rawPreset.payload,
    rawPreset.config,
    rawPreset
  ];
  for (const container of containers) {
    if (!container || typeof container !== "object") {
      continue;
    }
    if (container.vectorMapDocument && typeof container.vectorMapDocument === "object") {
      return container.vectorMapDocument;
    }
    if (container.vectorMap && typeof container.vectorMap === "object") {
      return container.vectorMap;
    }
    if (container.document && typeof container.document === "object") {
      return container.document;
    }
    if (Array.isArray(container.objects)) {
      return container;
    }
  }
  return null;
}

export class VectorMapEditorApp {
  constructor(rootDocument) {
    this.rootDocument = rootDocument;
    this.documentModel = new VectorMapDocument();
    this.selectionModel = new VectorMapSelectionModel();
    this.serializer = new VectorMapSerializer();
    this.runtimeExporter = new VectorMapRuntimeExporter();
    this.historyManager = new VectorMapHistoryManager(80);
    this.renderer2D = new VectorMapRenderer2D();
    this.renderer3D = new VectorMapRenderer3D();
    this.collisionTester = new VectorMapCollisionTester();
    this.transformController = new VectorMapTransformController(this.documentModel, this.selectionModel);
    this.workspaceViewMode = "2d";
    this.spaceKeyDown = false;
    this.statusMessage = "Ready.";
    this.lastCollisionResult = null;
    this.pendingHistoryEntry = null;
    this.spinAnimationFrame = null;
    this.defaultSelectionApplied = false;

    this.elements = this.cacheElements(rootDocument);
    this.jsonEditor = new VectorMapJsonEditor(this.elements.jsonEditor);
    this.fullscreenController = new VectorMapFullscreenController(this.elements.appRoot);
    this.createInteractionController();
  }

  createInteractionController() {
    this.interactionController = new VectorMapInteractionController({
      documentModel: this.documentModel,
      selectionModel: this.selectionModel,
      transformController: this.transformController,
      collisionTester: this.collisionTester,
      onStatus: (message) => this.setStatus(message),
      onCollisionResult: (hit) => {
        this.lastCollisionResult = hit;
        this.syncCollisionSummary();
      }
    });
  }

  cacheElements(doc) {
    return {
      appRoot: doc.getElementById("appRoot"),
      headerAccordion: doc.querySelector(".is-collapsible"),
      toolsPlatformStatusHost: doc.querySelector("[data-tools-platform-status]"),
      leftSidebar: doc.getElementById("leftSidebar"),
      rightSidebar: doc.getElementById("rightSidebar"),
      leftPanelAccordions: Array.from(doc.querySelectorAll("#leftSidebar .panel-accordion")),
      rightPanelAccordions: Array.from(doc.querySelectorAll("#rightSidebar .panel-accordion")),
      overlayToggleButtons: Array.from(doc.querySelectorAll("[data-overlay-toggle]")),
      canvasShell: doc.getElementById("canvasShell"),
      canvas: doc.getElementById("editorCanvas"),
      objectList: doc.getElementById("objectList"),
      collisionSummary: doc.getElementById("collisionSummary"),
      documentNameInput: doc.getElementById("documentNameInput"),
      documentWidthInput: doc.getElementById("documentWidthInput"),
      documentHeightInput: doc.getElementById("documentHeightInput"),
      documentBackgroundInput: doc.getElementById("documentBackgroundInput"),
      workspaceModeSelect: doc.getElementById("workspaceModeSelect"),
      toolModeSelect: doc.getElementById("toolModeSelect"),
      snapSizeInput: doc.getElementById("snapSizeInput"),
      zoomOutButton: doc.getElementById("zoomOutButton"),
      zoomResetButton: doc.getElementById("zoomResetButton"),
      zoomInButton: doc.getElementById("zoomInButton"),
      zoomDisplay: doc.getElementById("zoomDisplay"),
      newDocumentButton: doc.getElementById("newDocumentButton"),
      undoButton: doc.getElementById("undoButton"),
      redoButton: doc.getElementById("redoButton"),
      saveDocumentButton: doc.getElementById("saveDocumentButton"),
      exportRuntimeButton: doc.getElementById("exportRuntimeButton"),
      loadDocumentInput: doc.getElementById("loadDocumentInput"),
      toggleJsonDockButton: doc.getElementById("toggleJsonDockButton"),
      duplicateObjectButton: doc.getElementById("duplicateObjectButton"),
      deleteObjectButton: doc.getElementById("deleteObjectButton"),
      selectedObjectNameInput: doc.getElementById("selectedObjectNameInput"),
      selectedObjectKindInput: doc.getElementById("selectedObjectKindInput"),
      selectedObjectSpaceInput: doc.getElementById("selectedObjectSpaceInput"),
      centerXInput: doc.getElementById("centerXInput"),
      centerYInput: doc.getElementById("centerYInput"),
      centerZInput: doc.getElementById("centerZInput"),
      applyCenterButton: doc.getElementById("applyCenterButton"),
      setCenterFromSelectionButton: doc.getElementById("setCenterFromSelectionButton"),
      autoCenterBoundsButton: doc.getElementById("autoCenterBoundsButton"),
      autoCenterCentroidButton: doc.getElementById("autoCenterCentroidButton"),
      autoCenterOriginButton: doc.getElementById("autoCenterOriginButton"),
      autoCenterSelectionButton: doc.getElementById("autoCenterSelectionButton"),
      rotationXInput: doc.getElementById("rotationXInput"),
      rotationYInput: doc.getElementById("rotationYInput"),
      rotationZInput: doc.getElementById("rotationZInput"),
      rotationXDownButton: doc.getElementById("rotationXDownButton"),
      rotationXUpButton: doc.getElementById("rotationXUpButton"),
      rotationYDownButton: doc.getElementById("rotationYDownButton"),
      rotationYUpButton: doc.getElementById("rotationYUpButton"),
      rotationZDownButton: doc.getElementById("rotationZDownButton"),
      rotationZUpButton: doc.getElementById("rotationZUpButton"),
      rotationDegreesDisplay: doc.getElementById("rotationDegreesDisplay"),
      applyRotationButton: doc.getElementById("applyRotationButton"),
      resetRotationButton: doc.getElementById("resetRotationButton"),
      rotatePointsDegreesInput: doc.getElementById("rotatePointsDegreesInput"),
      rotatePointsDegreesButton: doc.getElementById("rotatePointsDegreesButton"),
      spinAllPointsButton: doc.getElementById("spinAllPointsButton"),
      objectStrokeInput: doc.getElementById("objectStrokeInput"),
      objectFillInput: doc.getElementById("objectFillInput"),
      objectLineWidthInput: doc.getElementById("objectLineWidthInput"),
      objectColorModeSelect: doc.getElementById("objectColorModeSelect"),
      selectedPointColorInput: doc.getElementById("selectedPointColorInput"),
      applyPointColorButton: doc.getElementById("applyPointColorButton"),
      flagCollidableInput: doc.getElementById("flagCollidableInput"),
      flagDeadlyInput: doc.getElementById("flagDeadlyInput"),
      flagTriggerInput: doc.getElementById("flagTriggerInput"),
      flagSpawnBlockerInput: doc.getElementById("flagSpawnBlockerInput"),
      flagProjectileBlockerInput: doc.getElementById("flagProjectileBlockerInput"),
      flagPlayerOnlyInput: doc.getElementById("flagPlayerOnlyInput"),
      flagEnemyOnlyInput: doc.getElementById("flagEnemyOnlyInput"),
      flagTagInput: doc.getElementById("flagTagInput"),
      pointsSummary: doc.getElementById("pointsSummary"),
      statusLeft: doc.getElementById("statusLeft"),
      statusCenter: doc.getElementById("statusCenter"),
      statusRight: doc.getElementById("statusRight"),
      jsonDock: doc.getElementById("jsonDock"),
      jsonEditor: doc.getElementById("jsonEditor"),
      jsonValidateButton: doc.getElementById("jsonValidateButton"),
      jsonApplyButton: doc.getElementById("jsonApplyButton"),
      jsonPrettyPrintButton: doc.getElementById("jsonPrettyPrintButton"),
      jsonRevertButton: doc.getElementById("jsonRevertButton")
    };
  }

  start() {
    this.ctx = this.elements.canvas.getContext("2d");
    this.historyManager.reset();
    this.syncFullscreenLayoutHeight();
    this.resizeCanvas();
    this.wireEvents();
    this.syncUIFromDocument();
    this.syncOverlayToggleButtons();
    this.render();
    window.addEventListener("resize", () => {
      this.syncFullscreenLayoutHeight();
      this.resizeCanvas();
    });
    this.setStatus("Vector Map Editor ready.");
    void this.tryLoadPresetFromQuery();
  }

  emitVectorMapControlReadiness(sampleId = "", options = {}) {
    const forceMissing = options.forceMissing === true;
    const phase = typeof options.phase === "string" && options.phase.trim() ? options.phase.trim() : "load";
    const lifecycleStable = options.lifecycleStable !== false;
    const defaultSelectionApplied = options.defaultSelectionApplied === true || this.defaultSelectionApplied === true;
    const data = this.documentModel?.getData?.() || {};
    const objectCount = Array.isArray(data.objects) ? data.objects.length : 0;
    const selectedObject = !forceMissing ? this.selectionModel.getSelection(this.documentModel).object : null;
    const hasDocument = !forceMissing
      && Number.isFinite(Number(data.width))
      && Number.isFinite(Number(data.height))
      && Number(data.width) > 0
      && Number(data.height) > 0;
    const hasCanvas = !forceMissing && this.elements?.canvas instanceof HTMLCanvasElement;
    const hasObjectList = !forceMissing
      && this.elements?.objectList instanceof HTMLElement
      && objectCount > 0;
    const hasSelectedObject = !forceMissing
      && objectCount > 0
      && Boolean(selectedObject && typeof selectedObject.id === "string");
    const hasCanvasRender = !forceMissing
      && hasCanvas
      && hasDocument
      && (objectCount === 0 || hasSelectedObject);
    const hasEntityControls = !forceMissing
      && this.elements?.toolModeSelect instanceof HTMLSelectElement
      && this.elements?.selectedObjectNameInput instanceof HTMLInputElement
      && (objectCount === 0 || hasSelectedObject);

    logToolUiControlReady({
      toolId: "vector-map-editor",
      sampleId,
      controlId: "canvas-render",
      requiredData: "vector-map-document",
      loaded: hasCanvasRender,
      value: hasDocument ? `${data.width}x${data.height}` : "none",
      classification: hasCanvasRender ? "success" : (hasDocument ? "missing" : "missing")
    });

    logToolUiControlReady({
      toolId: "vector-map-editor",
      sampleId,
      controlId: "object-list",
      requiredData: "vector-map-objects",
      loaded: hasObjectList,
      count: objectCount,
      value: objectCount,
      classification: hasObjectList ? "success" : (hasDocument ? "empty" : "missing")
    });

    logToolUiControlReady({
      toolId: "vector-map-editor",
      sampleId,
      controlId: "selected-object",
      requiredData: "vector-map-objects",
      loaded: hasSelectedObject && hasEntityControls,
      value: selectedObject?.name || "none",
      "default-selection-applied": defaultSelectionApplied,
      classification: hasSelectedObject && hasEntityControls ? "success" : (hasDocument ? "empty" : "missing")
    });

    logToolUiLifecycle({
      toolId: "vector-map-editor",
      sampleId,
      phase,
      cause: forceMissing ? "preset-load-failure" : "preset-load",
      "default-selection-applied": defaultSelectionApplied,
      classification: lifecycleStable ? "success" : "lifecycle-failure"
    });

    logToolUiFinalReady({
      toolId: "vector-map-editor",
      sampleId,
      requiredInputsReady: hasCanvas && hasDocument,
      requiredControlsReady: (objectCount === 0) || (hasObjectList && hasSelectedObject && hasEntityControls),
      requiredOutputsReady: hasCanvasRender,
      lifecycleStable,
      classification: lifecycleStable && hasCanvas && hasDocument && hasCanvasRender && ((objectCount === 0) || (hasObjectList && hasSelectedObject && hasEntityControls))
        ? "success"
        : (lifecycleStable ? "missing" : "lifecycle-failure")
    });
  }

  async tryLoadPresetFromQuery() {
    const searchParams = new URLSearchParams(window.location.search);
    const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
    const launchQuery = getToolLoadQuerySnapshot(searchParams);
    logToolLoadRequest({
      toolId: "vector-map-editor",
      sampleId: String(searchParams.get("sampleId") || "").trim(),
      samplePresetPath,
      requestedDataPaths: getToolLoadRequestedDataPaths(launchQuery),
      launchQuery
    });
    if (!samplePresetPath) {
      logToolLoadWarning({
        toolId: "vector-map-editor",
        reason: "samplePresetPath missing",
        launchQuery,
        classification: "missing"
      });
      return false;
    }
    const sampleId = String(searchParams.get("sampleId") || "").trim();
    let loadClassification = "";
    try {
      const presetUrl = new URL(samplePresetPath, window.location.href);
      const presetHref = presetUrl.toString();
      logToolLoadFetch({
        toolId: "vector-map-editor",
        phase: "attempt",
        fetchUrl: presetHref,
        requestedPath: samplePresetPath,
        pathSource: "tool-input:query.samplePresetPath"
      });
      const response = await fetch(presetHref, { cache: "no-store" });
      logToolLoadFetch({
        toolId: "vector-map-editor",
        phase: "response",
        fetchUrl: presetHref,
        requestedPath: samplePresetPath,
        pathSource: "tool-input:query.samplePresetPath",
        status: response.status,
        ok: response.ok
      });
      if (!response.ok) {
        loadClassification = "wrong-path";
        throw new Error(`preset request failed: ${response.status}`);
      }
      const rawPreset = await response.json();
      logToolLoadLoaded({
        toolId: "vector-map-editor",
        sampleId,
        samplePresetPath,
        fetchUrl: presetHref,
        loaded: summarizeToolLoadData(rawPreset)
      });
      const toolDocument = extractVectorMapDocumentFromSamplePreset(rawPreset);
      if (!toolDocument || typeof toolDocument !== "object") {
        loadClassification = "wrong-shape";
        throw new Error("Preset payload did not include a vector map document.");
      }
      this.cancelSpinAnimation();
      this.documentModel.setData(toolDocument);
      this.selectionModel.clear();
      const defaultSelectionApplied = this.selectFirstObjectWhenUnselected();
      this.lastCollisionResult = null;
      this.historyManager.reset();
      this.pendingHistoryEntry = null;
      this.workspaceViewMode = this.documentModel.getData().mode;
      this.elements.workspaceModeSelect.value = this.workspaceViewMode;
      this.createInteractionController();
      this.interactionController.setToolMode(this.elements.toolModeSelect.value);
      this.syncUIFromDocument();
      this.render();
      this.emitVectorMapControlReadiness(sampleId, { phase: "loaded", lifecycleStable: true, defaultSelectionApplied });
      if ((Array.isArray(this.documentModel.getData().objects) ? this.documentModel.getData().objects.length : 0) === 0) {
        logToolLoadWarning({
          toolId: "vector-map-editor",
          sampleId,
          samplePresetPath,
          reason: "Loaded vector map document contains zero objects.",
          classification: "empty"
        });
      }
      this.setStatus(buildPresetLoadedStatus(sampleId, samplePresetPath));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "unknown error";
      this.emitVectorMapControlReadiness(sampleId, { forceMissing: true, phase: "error", lifecycleStable: false });
      logToolLoadWarning({
        toolId: "vector-map-editor",
        sampleId,
        samplePresetPath,
        error: errorMessage,
        classification: loadClassification || "wrong-shape"
      });
      this.setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
      return false;
    }
  }

  wireEvents() {
    const canvas = this.elements.canvas;

    canvas.addEventListener("pointerdown", (event) => {
      if (this.workspaceViewMode === "json") {
        return;
      }
      this.beginPointerHistoryEntry(event);
      canvas.setPointerCapture(event.pointerId);
      this.interactionController.pointerDown(this.getCanvasPosition(event), this.getInteractionMeta(event));
      this.syncUIFromDocument();
      this.render();
    });

    canvas.addEventListener("pointermove", (event) => {
      if (this.workspaceViewMode !== "json") {
        this.interactionController.pointerMove(this.getCanvasPosition(event), this.getInteractionMeta(event));
      }
      this.updateCursorStatus(event);
      this.syncSelectionFields();
      this.syncCollisionSummary();
      this.render();
    });

    canvas.addEventListener("pointerup", (event) => {
      if (this.workspaceViewMode !== "json") {
        this.interactionController.pointerUp(this.getCanvasPosition(event), this.getInteractionMeta(event));
      }
      this.completePendingHistoryEntry();
      this.syncUIFromDocument();
      this.render();
    });

    canvas.addEventListener("wheel", (event) => {
      if (this.workspaceViewMode === "json") {
        return;
      }
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
      this.interactionController.zoomAtPosition(this.getCanvasPosition(event), factor);
      this.syncStatus();
      this.render();
    }, { passive: false });

    canvas.addEventListener("dblclick", (event) => {
      if (this.workspaceViewMode === "json") {
        return;
      }
      const beforeSnapshot = this.createHistorySnapshot();
      this.interactionController.doubleClick(this.getCanvasPosition(event), this.getInteractionMeta(event));
      this.commitHistorySnapshot("Add Point", beforeSnapshot);
      this.syncUIFromDocument();
      this.render();
    });

    this.rootDocument.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        this.redo();
        return;
      }
      if (event.code === "Space") {
        this.spaceKeyDown = true;
      }
      if (event.key === "Delete") {
        this.performHistoryAction(this.getDeleteHistoryLabel(), () => {
          this.interactionController.deleteSelection();
        });
      }
      if (event.key === "Escape") {
        this.cancelSpinAnimation();
        this.pendingHistoryEntry = null;
        this.interactionController.cancelPendingShape();
        this.interactionController.clearCollisionResult();
        this.setStatus("Pending interaction canceled.");
        this.render();
      }
    });

    this.rootDocument.addEventListener("keyup", (event) => {
      if (event.code === "Space") {
        this.spaceKeyDown = false;
      }
    });

    document.addEventListener("fullscreenchange", () => {
      this.fullscreenController.syncBodyClass();
      this.syncFullscreenLayoutHeight();
      this.elements.leftSidebar.classList.remove("visible-overlay");
      this.elements.rightSidebar.classList.remove("visible-overlay");
      this.syncOverlayToggleButtons();
      this.resizeCanvas();
      this.render();
    });

    this.elements.workspaceModeSelect.addEventListener("change", () => {
      this.workspaceViewMode = this.elements.workspaceModeSelect.value;
      if (this.workspaceViewMode === "2d" || this.workspaceViewMode === "3d") {
        this.documentModel.setMode(this.workspaceViewMode);
      }
      this.syncStatus();
      this.resizeCanvas();
      this.render();
    });

    this.elements.toolModeSelect.addEventListener("change", () => {
      this.interactionController.setToolMode(this.elements.toolModeSelect.value);
      this.syncStatus();
    });

    this.elements.newDocumentButton.addEventListener("click", () => {
      this.cancelSpinAnimation();
      this.documentModel = new VectorMapDocument();
      this.selectionModel = new VectorMapSelectionModel();
      this.transformController = new VectorMapTransformController(this.documentModel, this.selectionModel);
      this.createInteractionController();
      this.historyManager.reset();
      this.pendingHistoryEntry = null;
      this.interactionController.setToolMode(this.elements.toolModeSelect.value);
      this.lastCollisionResult = null;
      this.syncUIFromDocument();
      this.render();
      this.setStatus("New document created.");
    });

    this.elements.undoButton.addEventListener("click", () => this.undo());
    this.elements.redoButton.addEventListener("click", () => this.redo());

    this.elements.saveDocumentButton.addEventListener("click", () => {
      this.syncDocumentFromInputs();
      this.serializer.download(this.documentModel);
      this.setStatus("Editor document saved.");
    });

    this.elements.exportRuntimeButton.addEventListener("click", () => {
      this.syncDocumentFromInputs();
      this.runtimeExporter.download(this.documentModel);
      this.setStatus("Runtime document exported.");
    });

    this.elements.loadDocumentInput.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      try {
        const data = await this.serializer.readFile(file);
        const guard = assertStandaloneToolDocument(data, {
          expectedLabel: "Vector Map document",
          requiredToolId: "vector-map-editor"
        });
        if (!guard.ok) {
          const handled = offerImportMismatchOptions(guard, {
            viewerToolId: "state-inspector",
            viewerPayload: data,
            sourceToolId: "vector-map-editor"
          });
          if (handled) {
            return;
          }
          throw new Error(guard.reason);
        }
        this.cancelSpinAnimation();
        this.documentModel.setData(data);
        this.selectionModel.clear();
        this.selectFirstObjectWhenUnselected();
        this.lastCollisionResult = null;
        this.historyManager.reset();
        this.pendingHistoryEntry = null;
        this.workspaceViewMode = this.documentModel.getData().mode;
        this.elements.workspaceModeSelect.value = this.workspaceViewMode;
        this.createInteractionController();
        this.interactionController.setToolMode(this.elements.toolModeSelect.value);
        this.syncUIFromDocument();
        this.render();
        this.setStatus(`Loaded ${file.name}.`);
      } catch (error) {
        this.setStatus(`Load failed: ${error instanceof Error ? error.message : "invalid JSON"}`);
      } finally {
        this.elements.loadDocumentInput.value = "";
      }
    });

    this.elements.overlayToggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const side = button.dataset.overlaySide === "left" ? "left" : "right";
        const targetId = button.dataset.overlayTarget || "";
        this.toggleOverlayPanel(side, targetId);
      });
    });

    this.elements.leftPanelAccordions.forEach((panel) => {
      panel.addEventListener("toggle", () => this.handleOverlayAccordionToggle("left", panel));
    });
    this.elements.rightPanelAccordions.forEach((panel) => {
      panel.addEventListener("toggle", () => this.handleOverlayAccordionToggle("right", panel));
    });

    this.elements.toggleJsonDockButton.addEventListener("click", () => {
      this.elements.jsonDock.classList.toggle("hidden");
      this.resizeCanvas();
      this.render();
    });

    this.elements.zoomOutButton.addEventListener("click", () => {
      this.interactionController.stepZoom(-1, this.getCanvasCenter());
      this.syncStatus();
      this.render();
    });

    this.elements.zoomResetButton.addEventListener("click", () => {
      this.interactionController.resetView();
      this.syncStatus();
      this.render();
    });

    this.elements.zoomInButton.addEventListener("click", () => {
      this.interactionController.stepZoom(1, this.getCanvasCenter());
      this.syncStatus();
      this.render();
    });

    this.elements.duplicateObjectButton.addEventListener("click", () => {
      if (!this.selectionModel.objectId) {
        return;
      }
      this.performHistoryAction("Duplicate Object", () => {
        const nextObject = this.documentModel.duplicateObject(this.selectionModel.objectId);
        if (nextObject) {
          this.selectionModel.selectObject(nextObject.id);
        }
      });
    });

    this.elements.deleteObjectButton.addEventListener("click", () => {
      this.performHistoryAction(this.getDeleteHistoryLabel(), () => {
        this.interactionController.deleteSelection();
      });
    });

    this.elements.documentNameInput.addEventListener("input", () => this.syncDocumentFromInputs());
    this.elements.documentWidthInput.addEventListener("input", () => this.syncDocumentFromInputs(true));
    this.elements.documentHeightInput.addEventListener("input", () => this.syncDocumentFromInputs(true));
    this.elements.documentBackgroundInput.addEventListener("input", () => this.syncDocumentFromInputs());

    this.elements.selectedObjectNameInput.addEventListener("input", () => {
      if (!this.selectionModel.objectId) {
        return;
      }
      this.performHistoryAction("Rename Object", () => {
        this.documentModel.renameObject(this.selectionModel.objectId, this.elements.selectedObjectNameInput.value);
      });
    });

    this.elements.applyCenterButton.addEventListener("click", () => {
      this.performHistoryAction("Set Center", () => {
        this.transformController.setCenter(this.readCenterInputs());
      });
    });

    this.elements.setCenterFromSelectionButton.addEventListener("click", () => {
      this.performHistoryAction("Set Center", () => {
        this.transformController.autoCenterBySelection();
      });
    });

    this.elements.autoCenterBoundsButton.addEventListener("click", () => this.performHistoryAction("Set Center", () => this.transformController.autoCenterByBounds()));
    this.elements.autoCenterCentroidButton.addEventListener("click", () => this.performHistoryAction("Set Center", () => this.transformController.autoCenterByCentroid()));
    this.elements.autoCenterOriginButton.addEventListener("click", () => this.performHistoryAction("Set Center", () => this.transformController.autoCenterByOrigin()));
    this.elements.autoCenterSelectionButton.addEventListener("click", () => this.performHistoryAction("Set Center", () => this.transformController.autoCenterBySelection()));

    this.elements.applyRotationButton.addEventListener("click", () => {
      this.performHistoryAction("Rotate", () => {
        this.applyAbsoluteRotationFromInputs();
      });
    });

    [this.elements.rotationXInput, this.elements.rotationYInput, this.elements.rotationZInput].forEach((element) => {
      element.addEventListener("input", () => {
        if (!this.selectionModel.hasObject()) {
          return;
        }
        this.updateRotationDisplayFromInputs();
      });
      element.addEventListener("change", () => {
        if (!this.selectionModel.hasObject()) {
          return;
        }
        this.performHistoryAction("Rotate", () => {
          this.applyAbsoluteRotationFromInputs();
        });
      });
      element.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" || !this.selectionModel.hasObject()) {
          return;
        }
        this.performHistoryAction("Rotate", () => {
          this.applyAbsoluteRotationFromInputs();
        });
      });
    });

    this.elements.resetRotationButton.addEventListener("click", () => {
      this.performHistoryAction("Rotate", () => {
        this.transformController.resetRotation();
        const selection = this.selectionModel.getSelection(this.documentModel);
        if (selection.object) {
          this.documentModel.setObjectRotation(selection.object.id, { x: 0, y: 0, z: 0 });
        }
      });
    });

    this.elements.rotatePointsDegreesButton.addEventListener("click", () => {
      const degrees = parseNumericInput(this.elements.rotatePointsDegreesInput.value);
      if (degrees === null) {
        this.setStatus("Enter degrees to rotate points.");
        return;
      }
      this.performHistoryAction("Rotate", () => {
        this.transformController.applyRotation({ z: degrees });
      });
    });

    this.elements.spinAllPointsButton.addEventListener("click", () => {
      this.spinSelectedObject360();
    });

    this.wireSpinButton(this.elements.rotationXDownButton, "x", -1);
    this.wireSpinButton(this.elements.rotationXUpButton, "x", 1);
    this.wireSpinButton(this.elements.rotationYDownButton, "y", -1);
    this.wireSpinButton(this.elements.rotationYUpButton, "y", 1);
    this.wireSpinButton(this.elements.rotationZDownButton, "z", -1);
    this.wireSpinButton(this.elements.rotationZUpButton, "z", 1);

    [this.elements.objectStrokeInput, this.elements.objectFillInput, this.elements.objectLineWidthInput, this.elements.objectColorModeSelect].forEach((element) => {
      element.addEventListener("input", () => {
        const selection = this.selectionModel.getSelection(this.documentModel);
        if (!selection.object) {
          return;
        }
        this.performHistoryAction("Update Appearance", () => {
          this.documentModel.setObjectStyle(selection.object.id, this.readStyleInputs());
        });
      });
    });

    this.elements.applyPointColorButton.addEventListener("click", () => {
      const selection = this.selectionModel.getSelection(this.documentModel);
      if (!selection.object || !Number.isInteger(selection.pointIndex)) {
        this.setStatus("Select a point to apply point color.");
        return;
      }
      this.performHistoryAction("Update Appearance", () => {
        this.documentModel.setPointColor(selection.object.id, selection.pointIndex, this.elements.selectedPointColorInput.value);
      });
    });

    [
      this.elements.flagCollidableInput,
      this.elements.flagDeadlyInput,
      this.elements.flagTriggerInput,
      this.elements.flagSpawnBlockerInput,
      this.elements.flagProjectileBlockerInput,
      this.elements.flagPlayerOnlyInput,
      this.elements.flagEnemyOnlyInput,
      this.elements.flagTagInput
    ].forEach((element) => {
      element.addEventListener("input", () => {
        const selection = this.selectionModel.getSelection(this.documentModel);
        if (!selection.object) {
          return;
        }
        this.performHistoryAction("Update Collision Flags", () => {
          this.documentModel.setObjectFlags(selection.object.id, this.readFlagsInputs());
        });
      });
      element.addEventListener("change", () => {
        const selection = this.selectionModel.getSelection(this.documentModel);
        if (!selection.object) {
          return;
        }
        this.performHistoryAction("Update Collision Flags", () => {
          this.documentModel.setObjectFlags(selection.object.id, this.readFlagsInputs());
        });
      });
    });

    this.elements.jsonValidateButton.addEventListener("click", () => {
      try {
        this.jsonEditor.validate();
        this.setStatus("JSON valid.");
      } catch (error) {
        this.setStatus(`JSON invalid: ${error.message}`);
      }
    });

    this.elements.jsonApplyButton.addEventListener("click", () => {
      try {
        this.performHistoryAction("JSON Apply", () => {
          const nextData = this.jsonEditor.validate();
          this.documentModel.setData(nextData);
          this.selectionModel.clear();
          this.selectFirstObjectWhenUnselected();
          this.lastCollisionResult = null;
          this.workspaceViewMode = this.documentModel.getData().mode;
          if (this.workspaceViewMode !== "2d" && this.workspaceViewMode !== "3d") {
            this.workspaceViewMode = "json";
          }
        });
        this.setStatus("JSON applied.");
      } catch (error) {
        this.setStatus(`JSON invalid: ${error.message}`);
      }
    });

    this.elements.jsonPrettyPrintButton.addEventListener("click", () => {
      try {
        this.jsonEditor.prettyPrint();
        this.setStatus("JSON pretty printed.");
      } catch (error) {
        this.setStatus(`JSON invalid: ${error.message}`);
      }
    });

    this.elements.jsonRevertButton.addEventListener("click", () => {
      this.syncJsonEditor();
      this.setStatus("JSON reverted.");
    });
  }

  getOverlaySidebar(side) {
    return side === "left" ? this.elements.leftSidebar : this.elements.rightSidebar;
  }

  getOverlayPanels(side) {
    return side === "left" ? this.elements.leftPanelAccordions : this.elements.rightPanelAccordions;
  }

  toggleOverlayPanel(side, targetId) {
    const sidebar = this.getOverlaySidebar(side);
    const panels = this.getOverlayPanels(side);
    if (!(sidebar instanceof HTMLElement) || !Array.isArray(panels) || panels.length === 0) {
      return;
    }
    const target = panels.find((panel) => panel.id === targetId);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const fullscreenActive = Boolean(document.fullscreenElement);
    if (!fullscreenActive) {
      target.open = !target.open;
      this.syncOverlayToggleButtons();
      return;
    }

    const overlayVisible = sidebar.classList.contains("visible-overlay");
    if (!overlayVisible) {
      sidebar.classList.add("visible-overlay");
      target.open = true;
    } else {
      target.open = !target.open;
    }

    if (!panels.some((panel) => panel.open)) {
      sidebar.classList.remove("visible-overlay");
    }

    this.syncOverlayToggleButtons();
    this.resizeCanvas();
    this.render();
  }

  handleOverlayAccordionToggle(side, panel) {
    if (!document.fullscreenElement) {
      return;
    }
    const sidebar = this.getOverlaySidebar(side);
    const panels = this.getOverlayPanels(side);
    if (!(sidebar instanceof HTMLElement) || !Array.isArray(panels)) {
      return;
    }

    if (panel.open) {
      sidebar.classList.add("visible-overlay");
    } else if (!panels.some((entry) => entry.open)) {
      sidebar.classList.remove("visible-overlay");
    }

    this.syncOverlayToggleButtons();
    this.resizeCanvas();
    this.render();
  }

  syncOverlayToggleButtons() {
    const fullscreenActive = Boolean(document.fullscreenElement);
    this.elements.overlayToggleButtons.forEach((button) => {
      const side = button.dataset.overlaySide === "left" ? "left" : "right";
      const targetId = button.dataset.overlayTarget || "";
      const sidebar = this.getOverlaySidebar(side);
      const target = targetId ? this.rootDocument.getElementById(targetId) : null;
      const active = Boolean(
        fullscreenActive
        && sidebar instanceof HTMLElement
        && sidebar.classList.contains("visible-overlay")
        && target instanceof HTMLElement
        && target.open
      );
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-expanded", active ? "true" : "false");
      const symbol = button.querySelector(".overlay-toggle-symbol");
      if (symbol) {
        symbol.textContent = active ? "-" : "+";
      }
      const hideWhileOverlayOpen = Boolean(
        fullscreenActive
        && sidebar instanceof HTMLElement
        && sidebar.classList.contains("visible-overlay")
      );
      button.classList.toggle("is-hidden-while-overlay-open", hideWhileOverlayOpen);
    });
  }

  syncFullscreenLayoutHeight() {
    const appRoot = this.elements.appRoot;
    if (!(appRoot instanceof HTMLElement)) {
      return;
    }

    if (!document.fullscreenElement) {
      appRoot.style.height = "";
      appRoot.style.maxHeight = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const headerHeight = this.elements.headerAccordion instanceof HTMLElement
      ? this.elements.headerAccordion.getBoundingClientRect().height
      : 0;
    const statusHeight = this.elements.toolsPlatformStatusHost instanceof HTMLElement
      ? this.elements.toolsPlatformStatusHost.getBoundingClientRect().height
      : 0;
    const availableHeight = Math.max(320, Math.floor(viewportHeight - headerHeight - statusHeight - 4));

    appRoot.style.height = `${availableHeight}px`;
    appRoot.style.maxHeight = `${availableHeight}px`;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }

  wireSpinButton(button, axis, direction) {
    button.addEventListener("click", (event) => {
      const step = event.shiftKey ? 15 : 1;
      this.performHistoryAction("Rotate", () => {
        this.transformController.applyRotation({ [axis]: direction * step });
      });
    });
  }

  readCenterInputs() {
    return {
      x: Number(this.elements.centerXInput.value || 0),
      y: Number(this.elements.centerYInput.value || 0),
      z: Number(this.elements.centerZInput.value || 0)
    };
  }

  readStyleInputs() {
    const fillText = this.elements.objectFillInput.value.trim();
    return {
      stroke: this.elements.objectStrokeInput.value,
      fill: fillText && fillText.toLowerCase() !== "null" ? fillText : null,
      lineWidth: Number(this.elements.objectLineWidthInput.value || 2),
      colorMode: this.elements.objectColorModeSelect.value
    };
  }

  readFlagsInputs() {
    return {
      collidable: this.elements.flagCollidableInput.checked,
      deadly: this.elements.flagDeadlyInput.checked,
      trigger: this.elements.flagTriggerInput.checked,
      spawnBlocker: this.elements.flagSpawnBlockerInput.checked,
      projectileBlocker: this.elements.flagProjectileBlockerInput.checked,
      playerOnly: this.elements.flagPlayerOnlyInput.checked,
      enemyOnly: this.elements.flagEnemyOnlyInput.checked,
      tag: this.elements.flagTagInput.value
    };
  }

  applyAbsoluteRotationFromInputs() {
    const selection = this.selectionModel.getSelection(this.documentModel);
    if (!selection.object) {
      return;
    }
    const current = selection.object.rotation;
    const nextX = parseNumericInput(this.elements.rotationXInput.value);
    const nextY = parseNumericInput(this.elements.rotationYInput.value);
    const nextZ = parseNumericInput(this.elements.rotationZInput.value);
    const next = {
      x: nextX === null ? current.x : normalizeDegrees(nextX),
      y: nextY === null ? current.y : normalizeDegrees(nextY),
      z: nextZ === null ? current.z : normalizeDegrees(nextZ)
    };
    this.transformController.applyRotation({
      x: normalizeDegrees(next.x - current.x),
      y: normalizeDegrees(next.y - current.y),
      z: normalizeDegrees(next.z - current.z)
    });
  }

  syncDocumentFromInputs(shouldResize = false) {
    this.documentModel.setDocumentProperties({
      name: this.elements.documentNameInput.value,
      width: Number(this.elements.documentWidthInput.value || 0),
      height: Number(this.elements.documentHeightInput.value || 0),
      background: this.elements.documentBackgroundInput.value
    });
    this.syncJsonEditor();
    if (shouldResize) {
      this.resizeCanvas();
      this.render();
    }
  }

  selectFirstObjectWhenUnselected() {
    this.defaultSelectionApplied = false;
    const selection = this.selectionModel.getSelection(this.documentModel);
    if (selection.object) {
      return false;
    }
    const objects = this.documentModel.getObjects();
    if (!Array.isArray(objects) || objects.length === 0) {
      return false;
    }
    const firstObject = objects.find((entry) => entry && typeof entry.id === "string" && entry.id.length > 0) || null;
    if (!firstObject) {
      return false;
    }
    this.selectionModel.selectObject(firstObject.id);
    this.defaultSelectionApplied = true;
    return true;
  }

  syncUIFromDocument() {
    const data = this.documentModel.getData();
    this.elements.documentNameInput.value = data.name;
    this.elements.documentWidthInput.value = String(data.width);
    this.elements.documentHeightInput.value = String(data.height);
    this.elements.documentBackgroundInput.value = data.background;
    this.elements.workspaceModeSelect.value = this.workspaceViewMode;
    this.syncSelectionFields();
    this.syncObjectList();
    this.syncCollisionSummary();
    this.syncJsonEditor();
    this.syncStatus();
  }

  syncSelectionFields() {
    const selection = this.selectionModel.getSelection(this.documentModel);
    const object = selection.object;
    this.elements.selectedObjectNameInput.value = object?.name || "";
    this.elements.selectedObjectKindInput.value = object?.kind || "";
    this.elements.selectedObjectSpaceInput.value = object?.space || "";
    this.elements.centerXInput.value = object ? String(object.center.x) : "";
    this.elements.centerYInput.value = object ? String(object.center.y) : "";
    this.elements.centerZInput.value = object ? String(object.center.z) : "";
    this.elements.rotationXInput.value = object ? String(normalizeDegrees(object.rotation.x)) : "";
    this.elements.rotationYInput.value = object ? String(normalizeDegrees(object.rotation.y)) : "";
    this.elements.rotationZInput.value = object ? String(normalizeDegrees(object.rotation.z)) : "";
    this.elements.rotationDegreesDisplay.textContent = object
      ? this.formatRotationReadout({
        x: normalizeDegrees(object.rotation.x),
        y: normalizeDegrees(object.rotation.y),
        z: normalizeDegrees(object.rotation.z)
      })
      : this.formatRotationReadout({ x: 0, y: 0, z: 0 });
    this.elements.objectStrokeInput.value = object?.style?.stroke || "#ffffff";
    this.elements.objectFillInput.value = object?.style?.fill || "";
    this.elements.objectLineWidthInput.value = String(object?.style?.lineWidth || 2);
    this.elements.objectColorModeSelect.value = object?.style?.colorMode || "object";
    this.elements.selectedPointColorInput.value = selection.point?.color || object?.style?.stroke || "#ffffff";

    const flags = object?.flags || {};
    this.elements.flagCollidableInput.checked = Boolean(flags.collidable);
    this.elements.flagDeadlyInput.checked = Boolean(flags.deadly);
    this.elements.flagTriggerInput.checked = Boolean(flags.trigger);
    this.elements.flagSpawnBlockerInput.checked = Boolean(flags.spawnBlocker);
    this.elements.flagProjectileBlockerInput.checked = Boolean(flags.projectileBlocker);
    this.elements.flagPlayerOnlyInput.checked = Boolean(flags.playerOnly);
    this.elements.flagEnemyOnlyInput.checked = Boolean(flags.enemyOnly);
    this.elements.flagTagInput.value = flags.tag || "";

    if (!object) {
      this.elements.pointsSummary.textContent = "No selection.";
      return;
    }
    const pointRows = object.points.map((point, index) => `#${index + 1}: (${point.x}, ${point.y}, ${point.z}) ${point.color || ""}`);
    this.elements.pointsSummary.innerHTML = `${object.points.length} point(s).${selection.point ? ` Selected point #${selection.pointIndex + 1}.` : ""}<br />${pointRows.join("<br />")}`;
  }

  syncObjectList() {
    const objects = this.documentModel.getObjects();
    this.elements.objectList.innerHTML = "";
    if (!objects.length) {
      const empty = document.createElement("li");
      empty.className = "object-item muted";
      empty.textContent = "No objects loaded.";
      this.elements.objectList.appendChild(empty);
      return;
    }
    for (const object of objects) {
      const item = document.createElement("li");
      item.className = `object-item${this.selectionModel.isSelectedObject(object.id) ? " active" : ""}`;
      item.innerHTML = `<span>${object.name}</span><span class="muted">${object.space.toUpperCase()} | ${object.points.length}</span>`;
      item.addEventListener("click", () => {
        this.selectionModel.selectObject(object.id);
        this.syncUIFromDocument();
        this.render();
      });
      this.elements.objectList.appendChild(item);
    }
  }

  syncCollisionSummary() {
    const hit = this.interactionController?.getCollisionHit?.() || this.lastCollisionResult;
    if (!hit) {
      this.elements.collisionSummary.textContent = "No collision test yet.";
      return;
    }
    const flags = Object.entries(hit.flags || {}).filter(([key, value]) => key === "tag" ? Boolean(value) : Boolean(value)).map(([key, value]) => key === "tag" ? `tag=${value}` : key);
    this.elements.collisionSummary.innerHTML = `<strong>${hit.objectName}</strong><br />Distance: ${hit.distance.toFixed(2)}<br />Hit: (${hit.point.x.toFixed(1)}, ${hit.point.y.toFixed(1)}, ${hit.point.z.toFixed(1)})<br />Flags: ${flags.join(", ") || "none"}`;
  }

  syncJsonEditor() {
    if (this.rootDocument.activeElement === this.elements.jsonEditor) {
      return;
    }
    this.jsonEditor.setValue(this.serializer.toPrettyJSON(this.documentModel));
  }

  getCanvasPosition(event) {
    const rect = this.elements.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  getInteractionMeta(event) {
    return {
      documentMode: this.documentModel.getData().mode,
      snapSize: Number(this.elements.snapSizeInput.value || 1),
      shiftKey: event.shiftKey,
      spaceKey: this.spaceKeyDown
    };
  }

  updateCursorStatus(event) {
    const point = this.interactionController.screenToWorld(this.getCanvasPosition(event), this.documentModel.getData().mode);
    this.elements.statusRight.textContent = `Cursor: ${point.x.toFixed(1)}, ${point.y.toFixed(1)}, ${point.z.toFixed(1)}`;
  }

  syncStatus() {
    const selection = this.selectionModel.getSelection(this.documentModel);
    const selectedObjectLabel = selection.object?.name || "none";
    this.elements.statusLeft.textContent = this.statusMessage;
    this.elements.statusCenter.textContent = `Mode: ${this.workspaceViewMode.toUpperCase()} | Tool: ${this.elements.toolModeSelect.value} | Selected: ${selectedObjectLabel} | Zoom: ${Math.round(this.interactionController.getView().zoom * 100)}%`;
    this.elements.zoomDisplay.textContent = `${Math.round(this.interactionController.getView().zoom * 100)}%`;
    this.syncHistoryControls();
  }

  setStatus(message) {
    this.statusMessage = message;
    this.syncStatus();
  }

  resizeCanvas() {
    const rect = this.elements.canvasShell.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(320, Math.floor(rect.width || this.documentModel.getData().width));
    const height = Math.max(240, Math.floor(rect.height || this.documentModel.getData().height));
    this.elements.canvas.width = Math.floor(width * ratio);
    this.elements.canvas.height = Math.floor(height * ratio);
    this.elements.canvas.style.width = `${width}px`;
    this.elements.canvas.style.height = `${height}px`;
    this.ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  getCanvasCenter() {
    const rect = this.elements.canvas.getBoundingClientRect();
    return {
      x: rect.width * 0.5,
      y: rect.height * 0.5
    };
  }

  updateRotationDisplayFromInputs() {
    const selection = this.selectionModel.getSelection(this.documentModel);
    const object = selection.object;
    if (!object) {
      this.elements.rotationDegreesDisplay.textContent = this.formatRotationReadout({ x: 0, y: 0, z: 0 });
      return;
    }
    const next = {
      x: parseNumericInput(this.elements.rotationXInput.value),
      y: parseNumericInput(this.elements.rotationYInput.value),
      z: parseNumericInput(this.elements.rotationZInput.value)
    };
    this.elements.rotationDegreesDisplay.textContent = this.formatRotationReadout({
      x: next.x === null ? normalizeDegrees(object.rotation.x) : normalizeDegrees(next.x),
      y: next.y === null ? normalizeDegrees(object.rotation.y) : normalizeDegrees(next.y),
      z: next.z === null ? normalizeDegrees(object.rotation.z) : normalizeDegrees(next.z)
    });
  }

  formatRotationReadout(rotation) {
    return `X: ${rotation.x.toFixed(1)}deg | Y: ${rotation.y.toFixed(1)}deg | Z: ${rotation.z.toFixed(1)}deg`;
  }

  cancelSpinAnimation() {
    if (this.spinAnimationFrame !== null) {
      cancelAnimationFrame(this.spinAnimationFrame);
      this.spinAnimationFrame = null;
    }
  }

  spinSelectedObject360() {
    const selection = this.selectionModel.getSelection(this.documentModel);
    if (!selection.object) {
      this.setStatus("Select an object to spin all points.");
      return;
    }

    this.cancelSpinAnimation();
    const beforeSnapshot = this.createHistorySnapshot();
    const durationMs = 2400;
    const totalDegrees = 360;
    let rotatedDegrees = 0;
    let lastTimestamp = null;

    const step = (timestamp) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }
      const deltaMs = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      const remaining = totalDegrees - rotatedDegrees;
      const nextDegrees = Math.min(remaining, (deltaMs / durationMs) * totalDegrees);
      if (nextDegrees > 0) {
        this.transformController.applyRotation({ z: nextDegrees });
        rotatedDegrees += nextDegrees;
        this.syncUIFromDocument();
        this.render();
      }
      if (rotatedDegrees < totalDegrees) {
        this.spinAnimationFrame = requestAnimationFrame(step);
        return;
      }
      this.spinAnimationFrame = null;
      this.commitHistorySnapshot("Rotate", beforeSnapshot);
      this.syncUIFromDocument();
      this.render();
      this.setStatus("Spin 360 complete.");
    };

    this.setStatus("Spinning selected object 360deg.");
    this.spinAnimationFrame = requestAnimationFrame(step);
  }

  syncHistoryControls() {
    this.elements.undoButton.disabled = !this.historyManager.canUndo();
    this.elements.redoButton.disabled = !this.historyManager.canRedo();
  }

  createHistorySnapshot() {
    return {
      documentData: this.documentModel.toJSON(),
      selection: {
        objectId: this.selectionModel.objectId,
        pointIndex: this.selectionModel.pointIndex
      },
      workspaceViewMode: this.workspaceViewMode
    };
  }

  applyHistorySnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") {
      this.setStatus("Project state rejected: snapshot object is required.");
      return false;
    }
    const documentData = snapshot.documentData;
    if (!documentData || typeof documentData !== "object" || !Array.isArray(documentData.objects)) {
      this.setStatus("Project state rejected: documentData with objects array is required.");
      return false;
    }
    this.documentModel.setData(snapshot.documentData);
    const objectId = snapshot.selection?.objectId;
    const pointIndex = snapshot.selection?.pointIndex;
    if (objectId && this.documentModel.getObjectById(objectId)) {
      if (Number.isInteger(pointIndex)) {
        this.selectionModel.selectPoint(objectId, pointIndex);
      } else {
        this.selectionModel.selectObject(objectId);
      }
    } else {
      this.selectionModel.clear();
    }
    this.workspaceViewMode = snapshot.workspaceViewMode || this.documentModel.getData().mode;
    this.lastCollisionResult = null;
    this.interactionController.clearCollisionResult();
    this.syncUIFromDocument();
    this.render();
    return true;
  }

  commitHistorySnapshot(label, beforeSnapshot) {
    const committed = this.historyManager.push(label, beforeSnapshot, this.createHistorySnapshot());
    this.syncHistoryControls();
    return committed;
  }

  performHistoryAction(label, action, shouldRefresh = true) {
    const beforeSnapshot = this.createHistorySnapshot();
    action?.();
    this.commitHistorySnapshot(label, beforeSnapshot);
    if (shouldRefresh) {
      this.syncUIFromDocument();
      this.render();
    }
  }

  undo() {
    this.cancelSpinAnimation();
    const label = this.historyManager.undo((snapshot) => this.applyHistorySnapshot(snapshot));
    if (!label) {
      return;
    }
    this.setStatus(`Undo: ${label}.`);
  }

  redo() {
    this.cancelSpinAnimation();
    const label = this.historyManager.redo((snapshot) => this.applyHistorySnapshot(snapshot));
    if (!label) {
      return;
    }
    this.setStatus(`Redo: ${label}.`);
  }

  getDeleteHistoryLabel() {
    const selection = this.selectionModel.getSelection(this.documentModel);
    if (selection.point && Number.isInteger(selection.pointIndex)) {
      return "Delete Point";
    }
    return selection.object ? "Delete Object" : "Delete";
  }

  beginPointerHistoryEntry(event) {
    const label = this.getPointerHistoryLabel(event);
    this.pendingHistoryEntry = label ? { label, before: this.createHistorySnapshot() } : null;
  }

  completePendingHistoryEntry() {
    if (!this.pendingHistoryEntry) {
      return;
    }
    this.commitHistorySnapshot(this.pendingHistoryEntry.label, this.pendingHistoryEntry.before);
    this.pendingHistoryEntry = null;
  }

  getPointerHistoryLabel(event) {
    const mode = this.elements.toolModeSelect.value;
    const worldPoint = this.interactionController.screenToWorld(this.getCanvasPosition(event), this.documentModel.getData().mode);
    const hit = this.interactionController.getHitTarget(worldPoint, this.documentModel.getData().mode);
    if (mode === "pan" || mode === "collisionVector") {
      return null;
    }
    if (mode === "delete") {
      return hit?.type === "point" ? "Delete Point" : "Delete Object";
    }
    if (mode === "rotate") {
      return this.selectionModel.hasObject() ? "Rotate" : null;
    }
    if (mode === "setCenter") {
      return this.selectionModel.hasObject() ? "Set Center" : null;
    }
    if (mode === "point") {
      return "Create Object";
    }
    if (mode === "line" || mode === "polyline" || mode === "polygon") {
      return this.interactionController.pendingObjectId ? "Add Point" : "Create Object";
    }
    if (mode === "move" || mode === "select") {
      if (hit?.type === "point") {
        return "Move Point";
      }
      if (hit?.type === "object") {
        return "Move Object";
      }
    }
    return null;
  }

  render() {
    if (!this.ctx) {
      return;
    }
    const state = {
      canvas: this.elements.canvas,
      documentData: this.documentModel.getData(),
      selectionModel: this.selectionModel,
      view: this.interactionController.getView(),
      hover: this.interactionController.getHoverPoint(),
      collisionVector: this.interactionController.getCollisionVector(),
      collisionHit: this.interactionController.getCollisionHit()
    };
    const renderer = this.documentModel.getData().mode === "3d" ? this.renderer3D : this.renderer2D;
    renderer.render(this.ctx, state);
  }
}
