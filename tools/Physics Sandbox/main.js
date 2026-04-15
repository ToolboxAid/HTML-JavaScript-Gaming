import { integrateVelocity2D, stepArcadeBody } from "../../src/engine/physics/index.js";
import { safeParseJson, toPrettyJson } from "../shared/debugInspectorData.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

const refs = {
  runButton: document.getElementById("runPhysicsStepButton"),
  statusText: document.getElementById("physicsSandboxStatus"),
  input: document.getElementById("physicsBodyInput"),
  output: document.getElementById("physicsSandboxOutput")
};

function setStatus(message) {
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = message;
  }
}

function parseBody() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return null;
  }
  const parsed = safeParseJson(refs.input.value);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  return { ...parsed };
}

function runStep() {
  const body = parseBody();
  if (!body) {
    setStatus("Input JSON is invalid. Provide a body object.");
    return;
  }

  const dt = Number(body.dt) > 0 ? Number(body.dt) : 1 / 60;
  const stepped = stepArcadeBody(body, dt);
  const integrated = integrateVelocity2D(stepped, dt);
  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson({
      dt,
      body: integrated
    });
  }
  setStatus(`Step complete at dt=${dt.toFixed(4)}.`);
}

function bootPhysicsSandbox() {
  if (refs.runButton instanceof HTMLButtonElement) {
    refs.runButton.addEventListener("click", runStep);
  }
  if (refs.input instanceof HTMLTextAreaElement && !refs.input.value.trim()) {
    refs.input.value = toPrettyJson({
      x: 0,
      y: 0,
      velocityX: 100,
      velocityY: 0,
      accelerationX: -10,
      accelerationY: 0,
      dragX: 12,
      dragY: 0,
      maxSpeedX: 140,
      maxSpeedY: 140
    });
  }
  return {
    runStep
  };
}

registerToolBootContract("physics-sandbox", {
  init: bootPhysicsSandbox,
  destroy() {
    return true;
  },
  getApi() {
    return { runStep };
  }
});

bootPhysicsSandbox();
