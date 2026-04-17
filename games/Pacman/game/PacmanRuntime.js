import { attractFlow } from "../flow/attract.js";
import { introFlow } from "../flow/intro.js";
import { highscoreFlow } from "../flow/highscore.js";
import {
  PACMAN_FLOW_IDS, PACMAN_GAME_OVER_AUTO_EXIT_SECONDS, PACMAN_GAME_OVER_RETURN_MODE } from "../rules/flowRules.js";
import { PACMAN_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const pacmanFlow = Object.freeze({
  [PACMAN_FLOW_IDS.attract]: attractFlow,
  [PACMAN_FLOW_IDS.intro]: introFlow,
  [PACMAN_FLOW_IDS.highscore]: highscoreFlow
});

export function createPacmanRuntime(initialFlowId = PACMAN_FLOW_IDS.attract) {
  let currentFlowId = Object.prototype.hasOwnProperty.call(pacmanFlow, initialFlowId)
    ? initialFlowId
    : PACMAN_FLOW_IDS.attract;

  const runtimeState = {
    mode: PACMAN_GAME_OVER_RETURN_MODE,
    status: PACMAN_GAME_OVER_RETURN_STATUS,
    autoExitSeconds: PACMAN_GAME_OVER_AUTO_EXIT_SECONDS
  };

  function getCurrentFlow() {
    return pacmanFlow[currentFlowId];
  }

  function setFlow(nextFlowId) {
    if (Object.prototype.hasOwnProperty.call(pacmanFlow, nextFlowId)) {
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

