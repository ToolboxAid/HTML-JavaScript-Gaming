import {
  labelForObject,
  numberValue,
  roundBounds,
  roundNumber,
  roundPoint
} from "./constants.js";

export class CollisionInspectorV2Controls {
  constructor({ elements, windowRef = window }) {
    this.elements = elements;
    this.window = windowRef;
  }

  mount(callbacks) {
    this.mountAccordions();
    this.elements.fileInput.addEventListener("change", () => {
      callbacks.onManifestFile(this.elements.fileInput.files?.[0] || null);
    });
    this.elements.loadAsteroidsButton.addEventListener("click", callbacks.onLoadAsteroids);
    this.elements.objectASelect.addEventListener("change", callbacks.onObjectPairChange);
    this.elements.objectBSelect.addEventListener("change", callbacks.onObjectPairChange);
    this.elements.modeSelect.addEventListener("change", () => {
      callbacks.onModeChange(this.elements.modeSelect.value);
    });
    this.elements.rotationAInput.addEventListener("input", () => {
      callbacks.onRotationChange("a", numberValue(this.elements.rotationAInput.value));
    });
    this.elements.rotationBInput.addEventListener("input", () => {
      callbacks.onRotationChange("b", numberValue(this.elements.rotationBInput.value));
    });
    this.elements.zoomInput.addEventListener("input", () => {
      callbacks.onZoomChange(numberValue(this.elements.zoomInput.value, 1));
    });
    this.elements.clearLogButton.addEventListener("click", callbacks.onClearLog);
    this.elements.resetButton.addEventListener("click", callbacks.onReset);
    this.elements.returnToWorkspaceButton.addEventListener("click", callbacks.onReturnToWorkspace);
    this.elements.canvas.addEventListener("pointerdown", callbacks.onPointerDown);
    this.window.addEventListener("pointermove", callbacks.onPointerMove);
    this.window.addEventListener("pointerup", callbacks.onPointerUp);
  }

  mountAccordions() {
    this.window.document.querySelectorAll(".accordion-v2").forEach((section) => {
      const header = section.querySelector(".accordion-v2__header");
      const content = section.querySelector(".accordion-v2__content");
      if (!header || !content || header.tagName !== "BUTTON") {
        return;
      }
      header.addEventListener("click", () => {
        const isOpen = section.classList.toggle("is-open");
        section.dataset.accordionV2Open = String(isOpen);
        header.setAttribute("aria-expanded", String(isOpen));
        content.hidden = !isOpen;
      });
    });
  }

  setLaunchMode(workspaceLaunch) {
    this.elements.toolNav.hidden = true;
    this.elements.workspaceNav.hidden = !workspaceLaunch;
  }

  setManifestSummary(text) {
    this.elements.manifestSummary.textContent = text;
  }

  clearManifestInput() {
    this.elements.fileInput.value = "";
  }

  setObjectOptions(objects) {
    const options = objects.map((object, index) => {
      const option = this.window.document.createElement("option");
      option.value = object.id || String(index);
      option.textContent = object.name || object.id || `Object ${index + 1}`;
      return option;
    });
    this.elements.objectASelect.replaceChildren(...options.map((option) => option.cloneNode(true)));
    this.elements.objectBSelect.replaceChildren(...options.map((option) => option.cloneNode(true)));
    if (objects[0]) {
      this.elements.objectASelect.value = objects[0].id;
    }
    if (objects[1]) {
      this.elements.objectBSelect.value = objects[1].id;
    } else if (objects[0]) {
      this.elements.objectBSelect.value = objects[0].id;
    }
  }

  selectedObjectId(key) {
    return key === "a" ? this.elements.objectASelect.value : this.elements.objectBSelect.value;
  }

  setMode(mode) {
    this.elements.modeSelect.value = mode;
  }

  setRotations(instances) {
    this.elements.rotationAInput.value = String(roundNumber(instances.a.rotation, 1));
    this.elements.rotationBInput.value = String(roundNumber(instances.b.rotation, 1));
  }

  setZoom(zoom) {
    this.elements.zoomInput.value = String(roundNumber(zoom, 1));
    this.elements.zoomState.textContent = `${roundNumber(zoom, 1)}x`;
  }

  syncResult(result) {
    const geometryA = result.geometryA || {};
    const geometryB = result.geometryB || {};
    this.elements.resultBadge.dataset.collisionState = result.collided ? "hit" : "clear";
    this.elements.resultBadge.textContent = result.collided ? "Collision" : "No Collision";
    this.elements.overlapState.textContent = String(result.boundsOverlap === true);
    this.elements.modeState.textContent = result.modeLabel || "Vector";
    this.elements.boundsState.textContent = result.boundsOverlap ? "overlap" : "clear";
    this.elements.originState.textContent = `A ${roundNumber(geometryA.originWorld?.x)},${roundNumber(geometryA.originWorld?.y)} / B ${roundNumber(geometryB.originWorld?.x)},${roundNumber(geometryB.originWorld?.y)}`;
    this.elements.rotationState.textContent = `A ${roundNumber(geometryA.instance?.rotation)} / B ${roundNumber(geometryB.instance?.rotation)}`;
    this.elements.pointsState.textContent = `A ${geometryA.transformedPoints?.slice(0, 24).length || 0} / B ${geometryB.transformedPoints?.slice(0, 24).length || 0}`;
    this.elements.summary.textContent = JSON.stringify({
      bounds: {
        objectA: roundBounds(geometryA.bounds),
        objectB: roundBounds(geometryB.bounds)
      },
      collision: result.collided,
      enginePath: result.enginePath,
      manualModeOverride: result.manualModeOverride === true,
      mode: result.mode,
      objectA: result.objectA ? labelForObject(result.objectA) : "",
      objectB: result.objectB ? labelForObject(result.objectB) : "",
      objectOrigins: {
        objectA: roundPoint(geometryA.origin),
        objectB: roundPoint(geometryB.origin)
      },
      overlap: result.boundsOverlap,
      pixel: result.pixelOverlap,
      recommendedMode: result.recommendedMode,
      rotation: {
        objectA: roundNumber(geometryA.instance?.rotation),
        objectB: roundNumber(geometryB.instance?.rotation),
        shapeRotationsA: (geometryA.shapeRotations || []).map((value) => roundNumber(value, 1)),
        shapeRotationsB: (geometryB.shapeRotations || []).map((value) => roundNumber(value, 1))
      },
      transformedPoints: {
        objectA: (geometryA.transformedPoints || []).slice(0, 24).map(roundPoint),
        objectB: (geometryB.transformedPoints || []).slice(0, 24).map(roundPoint)
      },
      vector: result.vectorOverlap,
      worldOrigins: {
        objectA: roundPoint(geometryA.originWorld),
        objectB: roundPoint(geometryB.originWorld)
      },
      zoom: roundNumber(result.zoom, 1)
    }, null, 2);
  }
}
