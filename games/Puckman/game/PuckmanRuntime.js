import { attractFlow } from "../flow/attract.js";
import { introFlow } from "../flow/intro.js";
import { highscoreFlow } from "../flow/highscore.js";
import {
  PUCKMAN_FLOW_IDS, PUCKMAN_GAME_OVER_AUTO_EXIT_SECONDS, PUCKMAN_GAME_OVER_RETURN_MODE } from "../rules/flowRules.js";
import { PUCKMAN_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const puckmanFlow = Object.freeze({
  [PUCKMAN_FLOW_IDS.attract]: attractFlow,
  [PUCKMAN_FLOW_IDS.intro]: introFlow,
  [PUCKMAN_FLOW_IDS.highscore]: highscoreFlow
});

export function createPuckmanRuntime(initialFlowId = PUCKMAN_FLOW_IDS.attract) {
  let currentFlowId = Object.prototype.hasOwnProperty.call(puckmanFlow, initialFlowId)
    ? initialFlowId
    : PUCKMAN_FLOW_IDS.attract;

  const runtimeState = {
    mode: PUCKMAN_GAME_OVER_RETURN_MODE,
    status: PUCKMAN_GAME_OVER_RETURN_STATUS,
    autoExitSeconds: PUCKMAN_GAME_OVER_AUTO_EXIT_SECONDS
  };

  function getCurrentFlow() {
    return puckmanFlow[currentFlowId];
  }

  function setFlow(nextFlowId) {
    if (Object.prototype.hasOwnProperty.call(puckmanFlow, nextFlowId)) {
      currentFlowId = nextFlowId;
    }
    return getCurrentFlow();
  }

  return Object.freeze({
    get currentFlowId() {
      return currentFlowId;
    },
    runtimeState,
    getCurrentFlow,
    setFlow
  });
}

