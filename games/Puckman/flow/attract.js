import {
  PUCKMAN_FLOW_IDS,
  PUCKMAN_FLOW_LABELS,
  PUCKMAN_GAME_OVER_RETURN_MODE,
  PUCKMAN_GAME_OVER_RETURN_RESET_IDLE,
  PUCKMAN_GAME_OVER_RETURN_STATUS,
  createPuckmanFlowDescriptor
} from "../rules/gameFlowRules.js";

export const PUCKMAN_ATTRACT_FLOW_NEXT_ID = PUCKMAN_FLOW_IDS.intro;

export const attractFlow = createPuckmanFlowDescriptor(PUCKMAN_FLOW_IDS.attract, {
  label: PUCKMAN_FLOW_LABELS.attract,
  nextFlowId: PUCKMAN_ATTRACT_FLOW_NEXT_ID,
  autoAdvanceSeconds: null,
  statusText: PUCKMAN_GAME_OVER_RETURN_STATUS,
  returnMode: PUCKMAN_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: PUCKMAN_GAME_OVER_RETURN_RESET_IDLE
});
