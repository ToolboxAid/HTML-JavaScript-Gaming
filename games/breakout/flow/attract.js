import {
  BREAKOUT_FLOW_IDS,
  BREAKOUT_FLOW_LABELS,
  BREAKOUT_GAME_OVER_RETURN_MODE,
  BREAKOUT_GAME_OVER_RETURN_RESET_IDLE,
  BREAKOUT_GAME_OVER_RETURN_STATUS,
  createFlowDescriptor
} from "../rules/gameFlowRules.js";

export const BREAKOUT_ATTRACT_FLOW_NEXT_ID = BREAKOUT_FLOW_IDS.intro;

export const attractFlow = createFlowDescriptor(BREAKOUT_FLOW_IDS.attract, {
  label: BREAKOUT_FLOW_LABELS.attract,
  nextFlowId: BREAKOUT_ATTRACT_FLOW_NEXT_ID,
  autoAdvanceSeconds: null,
  statusText: BREAKOUT_GAME_OVER_RETURN_STATUS,
  returnMode: BREAKOUT_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: BREAKOUT_GAME_OVER_RETURN_RESET_IDLE
});
