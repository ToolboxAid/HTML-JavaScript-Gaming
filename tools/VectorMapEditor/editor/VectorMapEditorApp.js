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

export class VectorMapEditorApp {
  constructor(rootDocument) {
    this.rootDocument = rootDocument;
    this.documentModel = new VectorMapDocument();
    this.selectionModel = new VectorMapSelectionModel();
    this.serializer = new VectorMapSerializer();
    this.renderer2D = new VectorMapRenderer2D();
    this.renderer3D = new VectorMapRenderer3D();
    this.transformController = new VectorMapTransformController(this.documentModel, this.selectionModel);
    this.spaceKeyDown = false;
    this.statusMessage = "Ready.";

    this.elements = this.cacheElements(rootDocument);
    this.jsonEditor = new VectorMapJsonEditor(this.elements.jsonEditor);
    this.fullscreenController = new VectorMapFullscreenController(this.elements.canvasShell);
    this.interactionController = new VectorMapInteractionController({
      documentModel: this.documentModel,
      selectionModel: this.selectionModel,
      transformController: this.transformController,
      onStatus: (message) => this.setStatus(message)
    });
  }

  cacheElements(doc) {
    return {
      canvasShell: doc.getElementById("canvasShell"),
      canvas: doc.getElementById("editorCanvas"),
      objectList: doc.getElementById("objectList"),
      documentNameInput: doc.getElementById("documentNameInput"),
      documentWidthInput: doc.getElementById("documentWidthInput"),
      documentHeightInput: doc.getElementById("documentHeightInput"),
      documentBackgroundInput: doc.getElementById("documentBackgroundInput"),
      workspaceModeSelect: doc.getElementById("workspaceModeSelect"),
      toolModeSelect: doc.getElementById("toolModeSelect"),
      snapSizeInput: doc.getElementById("snapSizeInput"),
      newDocumentButton: doc.getElementById("newDocumentButton"),
      saveDocumentButton: doc.getElementById("saveDocumentButton"),
      loadDocumentInput: doc.getElementById("loadDocumentInput"),
      toggleFullscreenButton: doc.getElementById("toggleFullscreenButton"),
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
      applyRotationButton: doc.getElementById("applyRotationButton"),
      resetRotationButton: doc.getElementById("resetRotationButton"),
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
    this.resizeCanvas();
    this.wireEvents();
    this.syncUIFromDocument();
    this.render();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.setStatus("Vector Map Editor ready.");
  }

  wireEvents() {
    const canvas = this.elements.canvas;

    canvas.addEventListener("pointerdown", (event) => {
      canvas.setPointerCapture(event.pointerId);
      this.interactionController.pointerDown(this.getCanvasPosition(event), this.getInteractionMeta(event));
      this.syncUIFromDocument();
      this.render();
    });

    canvas.addEventListener("pointermove", (event) => {
      this.interactionController.pointerMove(this.getCanvasPosition(event), this.getInteractionMeta(event));
      this.updateCursorStatus(event);
      this.syncSelectionFields();
      this.render();
    });

    canvas.addEventListener("pointerup", () => {
      this.interactionController.pointerUp();
      this.syncUIFromDocument();
      this.render();
    });

    canvas.addEventListener("dblclick", (event) => {
      this.interactionController.doubleClick(this.getCanvasPosition(event), this.getInteractionMeta(event));
      this.syncUIFromDocument();
      this.render();
    });

    this.rootDocument.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        this.spaceKeyDown = true;
      }
      if (event.key === "Delete") {
        this.interactionController.deleteSelection();
        this.syncUIFromDocument();
        this.render();
      }
      if (event.key === "Escape") {
        this.interactionController.cancelPendingShape();
        this.setStatus("Pending shape canceled.");
      }
    });

    this.rootDocument.addEventListener("keyup", (event) => {
      if (event.code === "Space") {
        this.spaceKeyDown = false;
      }
    });

    document.addEventListener("fullscreenchange", () => {
      this.fullscreenController.syncBodyClass();
      this.resizeCanvas();
      this.render();
    });

    this.elements.workspaceModeSelect.addEventListener("change", () => {
      this.documentModel.setMode(this.elements.workspaceModeSelect.value);
      this.syncUIFromDocument();
      this.render();
    });

    this.elements.toolModeSelect.addEventListener("change", () => {
      this.interactionController.setToolMode(this.elements.toolModeSelect.value);
      this.syncStatus();
    });

    this.elements.newDocumentButton.addEventListener("click", () => {
      this.documentModel = new VectorMapDocument();
      this.selectionModel = new VectorMapSelectionModel();
      this.transformController = new VectorMapTransformController(this.documentModel, this.selectionModel);
      this.interactionController = new VectorMapInteractionController({
        documentModel: this.documentModel,
        selectionModel: this.selectionModel,
        transformController: this.transformController,
        onStatus: (message) => this.setStatus(message)
      });
      this.interactionController.setToolMode(this.elements.toolModeSelect.value);
      this.syncUIFromDocument();
      this.render();
      this.setStatus("New document created.");
    });

    this.elements.saveDocumentButton.addEventListener("click", () => {
      this.syncDocumentFromInputs();
      this.serializer.download(this.documentModel);
      this.setStatus("Document saved.");
    });

    this.elements.loadDocumentInput.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      const data = await this.serializer.readFile(file);
      this.documentModel.setData(data);
      this.selectionModel.clear();
      this.syncUIFromDocument();
      this.render();
      this.setStatus(`Loaded ${file.name}.`);
    });

    this.elements.toggleFullscreenButton.addEventListener("click", async () => {
      await this.fullscreenController.toggle();
      this.resizeCanvas();
      this.render();
    });

    this.elements.toggleJsonDockButton.addEventListener("click", () => {
      this.elements.jsonDock.classList.toggle("hidden");
      this.resizeCanvas();
      this.render();
    });

    this.elements.duplicateObjectButton.addEventListener("click", () => {
      if (!this.selectionModel.objectId) {
        return;
      }
      const nextObject = this.documentModel.duplicateObject(this.selectionModel.objectId);
      if (nextObject) {
        this.selectionModel.selectObject(nextObject.id);
        this.syncUIFromDocument();
        this.render();
      }
    });

    this.elements.deleteObjectButton.addEventListener("click", () => {
      this.interactionController.deleteSelection();
      this.syncUIFromDocument();
      this.render();
    });

    this.elements.documentNameInput.addEventListener("input", () => this.syncDocumentFromInputs());
    this.elements.documentWidthInput.addEventListener("input", () => this.syncDocumentFromInputs(true));
    this.elements.documentHeightInput.addEventListener("input", () => this.syncDocumentFromInputs(true));
    this.elements.documentBackgroundInput.addEventListener("input", () => this.syncDocumentFromInputs());

    this.elements.selectedObjectNameInput.addEventListener("input", () => {
      if (!this.selectionModel.objectId) {
        return;
      }
      this.documentModel.renameObject(this.selectionModel.objectId, this.elements.selectedObjectNameInput.value);
      this.syncObjectList();
      this.render();
    });

    this.elements.applyCenterButton.addEventListener("click", () => {
      this.transformController.setCenter(this.getCenterInputs());
      this.syncSelectionFields();
      this.render();
    });

    this.elements.setCenterFromSelectionButton.addEventListener("click", () => {
      this.transformController.autoCenterBySelection();
      this.syncSelectionFields();
      this.render();
    });

    this.elements.autoCenterBoundsButton.addEventListener("click", () => {
      this.transformController.autoCenterByBounds();
      this.syncSelectionFields();
      this.render();
    });

    this.elements.autoCenterCentroidButton.addEventListener("click", () => {
      this.transformController.autoCenterByCentroid();
      this.syncSelectionFields();
      this.render();
    });

    this.elements.autoCenterOriginButton.addEventListener("click", () => {
      this.transformController.autoCenterByOrigin();
      this.syncSelectionFields();
      this.render();
    });

    this.elements.autoCenterSelectionButton.addEventListener("click", () => {
      this.transformController.autoCenterBySelection();
      this.syncSelectionFields();
      this.render();
    });

    this.elements.applyRotationButton.addEventListener("click", () => {
      this.transformController.applyRotation({
        x: Number(this.elements.rotationXInput.value || 0),
        y: Number(this.elements.rotationYInput.value || 0),
        z: Number(this.elements.rotationZInput.value || 0)
      });
      this.syncSelectionFields();
      this.render();
    });

    this.elements.resetRotationButton.addEventListener("click", () => {
      const selection = this.selectionModel.getSelection(this.documentModel);
      if (selection.object) {
        selection.object.rotation = { x: 0, y: 0, z: 0 };
      }
      this.syncSelectionFields();
      this.render();
    });

    this.elements.jsonValidateButton.addEventListener("click", () => {
      try {
        this.jsonEditor.validate();
        this.setStatus("JSON valid.");
      } catch (error) {
        this.setStatus(`JSON invalid: ${error.message}`);
      }
    });

    this.elements.jsonPrettyPrintButton.addEventListener("click", () => {
      try {
        this.jsonEditor.prettyPrint();
        this.setStatus("JSON pretty printed.");
      } catch (error) {
        this.setStatus(`Pretty print failed: ${error.message}`);
      }
    });

    this.elements.jsonApplyButton.addEventListener("click", () => {
      try {
        const parsed = this.jsonEditor.validate();
        this.documentModel.setData(parsed);
        this.selectionModel.clear();
        this.syncUIFromDocument();
        this.render();
        this.setStatus("JSON applied.");
      } catch (error) {
        this.setStatus(`Apply failed: ${error.message}`);
      }
    });

    this.elements.jsonRevertButton.addEventListener("click", () => {
      this.jsonEditor.revert();
      this.setStatus("JSON reverted.");
    });
  }

  resizeCanvas() {
    const shellRect = this.elements.canvasShell.getBoundingClientRect();
    this.elements.canvas.width = Math.max(320, Math.floor(shellRect.width));
    this.elements.canvas.height = Math.max(320, Math.floor(shellRect.height));
    this.render();
  }

  getCanvasPosition(event) {
    const rect = this.elements.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  getInteractionMeta(event) {
    return {
      documentMode: this.documentModel.getData().mode,
      snapSize: Number(this.elements.snapSizeInput.value || 10),
      shiftKey: event?.shiftKey ?? false,
      spaceKey: this.spaceKeyDown
    };
  }

  syncDocumentFromInputs(shouldResize = false) {
    this.documentModel.setDocumentProperties({
      name: this.elements.documentNameInput.value,
      width: Number(this.elements.documentWidthInput.value || 1280),
      height: Number(this.elements.documentHeightInput.value || 720),
      background: this.elements.documentBackgroundInput.value
    });
    this.syncJsonEditor();
    if (shouldResize) {
      this.render();
    }
  }

  syncUIFromDocument() {
    const data = this.documentModel.getData();
    this.elements.documentNameInput.value = data.name;
    this.elements.documentWidthInput.value = data.width;
    this.elements.documentHeightInput.value = data.height;
    this.elements.documentBackgroundInput.value = data.background;
    this.elements.workspaceModeSelect.value = data.mode;
    this.interactionController.setToolMode(this.elements.toolModeSelect.value);
    this.syncObjectList();
    this.syncSelectionFields();
    this.syncJsonEditor();
    this.syncStatus();
  }

  syncObjectList() {
    const data = this.documentModel.getData();
    this.elements.objectList.innerHTML = "";
    for (const object of data.objects) {
      const item = document.createElement("li");
      item.className = `object-item ${this.selectionModel.isSelectedObject(object.id) ? "active" : ""}`;
      item.innerHTML = `<span>${object.name}</span><span class="muted">${object.kind} · ${object.space}</span>`;
      item.addEventListener("click", () => {
        this.selectionModel.selectObject(object.id);
        this.syncSelectionFields();
        this.syncObjectList();
        this.render();
      });
      this.elements.objectList.appendChild(item);
    }
  }

  syncSelectionFields() {
    const selection = this.selectionModel.getSelection(this.documentModel);
    if (!selection.object) {
      this.elements.selectedObjectNameInput.value = "";
      this.elements.selectedObjectKindInput.value = "";
      this.elements.selectedObjectSpaceInput.value = "";
      this.elements.centerXInput.value = "";
      this.elements.centerYInput.value = "";
      this.elements.centerZInput.value = "";
      this.elements.rotationXInput.value = "";
      this.elements.rotationYInput.value = "";
      this.elements.rotationZInput.value = "";
      this.elements.pointsSummary.textContent = "No selection.";
      this.syncObjectList();
      this.syncJsonEditor();
      return;
    }

    this.elements.selectedObjectNameInput.value = selection.object.name;
    this.elements.selectedObjectKindInput.value = selection.object.kind;
    this.elements.selectedObjectSpaceInput.value = selection.object.space;
    this.elements.centerXInput.value = selection.object.center.x;
    this.elements.centerYInput.value = selection.object.center.y;
    this.elements.centerZInput.value = selection.object.center.z;
    this.elements.rotationXInput.value = selection.object.rotation.x;
    this.elements.rotationYInput.value = selection.object.rotation.y;
    this.elements.rotationZInput.value = selection.object.rotation.z;
    this.elements.pointsSummary.textContent = `${selection.object.points.length} point(s).${selection.point ? ` Selected point #${selection.pointIndex + 1}` : ""}`;
    this.syncObjectList();
    this.syncJsonEditor();
  }

  syncJsonEditor() {
    this.jsonEditor.setValue(this.serializer.toPrettyJSON(this.documentModel));
  }

  syncStatus() {
    const modeLabel = this.documentModel.getData().mode === "3d" ? "3D" : "2D";
    const toolLabel = this.elements.toolModeSelect.options[this.elements.toolModeSelect.selectedIndex]?.text || "Select";
    this.elements.statusCenter.textContent = `Mode: ${modeLabel} | Tool: ${toolLabel}`;
    this.elements.statusLeft.textContent = this.statusMessage;
  }

  getCenterInputs() {
    return {
      x: Number(this.elements.centerXInput.value || 0),
      y: Number(this.elements.centerYInput.value || 0),
      z: Number(this.elements.centerZInput.value || 0)
    };
  }

  setStatus(message) {
    this.statusMessage = message;
    this.syncStatus();
  }

  updateCursorStatus(event) {
    const position = this.getCanvasPosition(event);
    const worldPoint = this.interactionController.screenToWorld(position, this.documentModel.getData().mode);
    this.elements.statusRight.textContent = `Cursor: ${worldPoint.x.toFixed(1)}, ${worldPoint.y.toFixed(1)}, ${worldPoint.z.toFixed(1)}`;
  }

  render() {
    if (!this.ctx) {
      return;
    }

    const data = this.documentModel.getData();
    const state = {
      canvas: this.elements.canvas,
      ctx: this.ctx,
      documentData: data,
      selectionModel: this.selectionModel,
      view: this.interactionController.getView(),
      hover: this.interactionController.getHoverPoint()
    };

    if (data.mode === "3d") {
      this.renderer3D.render(this.ctx, state);
    } else {
      this.renderer2D.render(this.ctx, state);
    }
  }
}
