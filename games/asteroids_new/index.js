import { attractFlow } from "./flow/attract.js";
import { introFlow } from "./flow/intro.js";
import { createAsteroidsShowcaseDebugPlugin } from "./debug/asteroidsShowcaseDebug.js";

export const asteroidFlow = Object.freeze({
  attract: attractFlow,
  intro: introFlow
});

export function loadAsteroidsWorldModule() {
  return import("./game/AsteroidsWorld.js");
}

export async function createAsteroidsWorld(...args) {
  const moduleRef = await loadAsteroidsWorldModule();
  const AsteroidsWorld = moduleRef.default;
  return new AsteroidsWorld(...args);
}

export function createAsteroidsNewDebugPlugins() {
  return [createAsteroidsShowcaseDebugPlugin()];
}

export function createAsteroidsTemplateBoot(initialFlow = "attract") {
  let currentFlowId = Object.prototype.hasOwnProperty.call(asteroidFlow, initialFlow)
    ? initialFlow
    : "attract";

  function getCurrentFlow() {
    return asteroidFlow[currentFlowId];
  }

  function setFlow(nextFlowId) {
    if (Object.prototype.hasOwnProperty.call(asteroidFlow, nextFlowId)) {
      currentFlowId = nextFlowId;
    }
    return getCurrentFlow();
  }

  function start() {
    return getCurrentFlow();
  }

  return Object.freeze({
    get currentFlowId() {
      return currentFlowId;
    },
    getCurrentFlow,
    setFlow,
    start
  });
}

export default asteroidFlow;
