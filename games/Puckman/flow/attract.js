import { PUCKMAN_FLOW_IDS, PUCKMAN_GAME_OVER_RETURN_MODE, PUCKMAN_GAME_OVER_RETURN_RESET_IDLE, createPuckmanFlowDescriptor } from "../rules/flowRules.js";
import { PUCKMAN_FLOW_LABELS, PUCKMAN_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const PUCKMAN_ATTRACT_FLOW_NEXT_ID = PUCKMAN_FLOW_IDS.intro;

export const attractFlow = createPuckmanFlowDescriptor(PUCKMAN_FLOW_IDS.attract, {
  label: PUCKMAN_FLOW_LABELS.attract,
  nextFlowId: PUCKMAN_ATTRACT_FLOW_NEXT_ID,
  autoAdvanceSeconds: null,
  statusText: PUCKMAN_GAME_OVER_RETURN_STATUS,
  returnMode: PUCKMAN_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: PUCKMAN_GAME_OVER_RETURN_RESET_IDLE
});

