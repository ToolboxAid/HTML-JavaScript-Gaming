import { PACMAN_LITE_FLOW_IDS, PACMAN_LITE_GAME_OVER_RETURN_MODE, PACMAN_LITE_GAME_OVER_RETURN_RESET_IDLE, createPACMANLITEFlowDescriptor } from "../rules/flowRules.js";
import { PACMAN_LITE_FLOW_LABELS, PACMAN_LITE_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const PACMAN_LITE_ATTRACT_FLOW_NEXT_ID = PACMAN_LITE_FLOW_IDS.intro;

export const attractFlow = createPACMANLITEFlowDescriptor(PACMAN_LITE_FLOW_IDS.attract, {
  label: PACMAN_LITE_FLOW_LABELS.attract,
  nextFlowId: PACMAN_LITE_ATTRACT_FLOW_NEXT_ID,
  autoAdvanceSeconds: null,
  statusText: PACMAN_LITE_GAME_OVER_RETURN_STATUS,
  returnMode: PACMAN_LITE_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: PACMAN_LITE_GAME_OVER_RETURN_RESET_IDLE
});

