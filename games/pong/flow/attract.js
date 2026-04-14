import {
  PONG_FLOW_IDS,
  PONG_FLOW_LABELS,
  PONG_GAME_OVER_RETURN_MODE,
  PONG_GAME_OVER_RETURN_RESET_IDLE,
  PONG_GAME_OVER_RETURN_STATUS,
  createFlowDescriptor
} from "../rules/gameFlowRules.js";

export const PONG_ATTRACT_FLOW_NEXT_ID = PONG_FLOW_IDS.intro;

export const attractFlow = createFlowDescriptor(PONG_FLOW_IDS.attract, {
  label: PONG_FLOW_LABELS.attract,
  nextFlowId: PONG_ATTRACT_FLOW_NEXT_ID,
  autoAdvanceSeconds: null,
  statusText: PONG_GAME_OVER_RETURN_STATUS,
  returnMode: PONG_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: PONG_GAME_OVER_RETURN_RESET_IDLE
});
