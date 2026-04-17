import { PACMAN_FLOW_IDS, PACMAN_GAME_OVER_RETURN_MODE, PACMAN_GAME_OVER_RETURN_RESET_IDLE, createPacmanFlowDescriptor } from "../rules/flowRules.js";
import { PACMAN_FLOW_LABELS, PACMAN_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const PACMAN_ATTRACT_FLOW_NEXT_ID = PACMAN_FLOW_IDS.intro;

export const attractFlow = createPacmanFlowDescriptor(PACMAN_FLOW_IDS.attract, {
  label: PACMAN_FLOW_LABELS.attract,
  nextFlowId: PACMAN_ATTRACT_FLOW_NEXT_ID,
  autoAdvanceSeconds: null,
  statusText: PACMAN_GAME_OVER_RETURN_STATUS,
  returnMode: PACMAN_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: PACMAN_GAME_OVER_RETURN_RESET_IDLE
});

