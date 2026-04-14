import {
  GRAVITY_FLOW_IDS,
  GRAVITY_FLOW_LABELS,
  GRAVITY_GAME_OVER_RETURN_MODE,
  GRAVITY_GAME_OVER_RETURN_RESET_IDLE,
  GRAVITY_GAME_OVER_RETURN_STATUS,
  createFlowDescriptor
} from "../rules/gameFlowRules.js";

export const GRAVITY_ATTRACT_FLOW_NEXT_ID = GRAVITY_FLOW_IDS.intro;

export const attractFlow = createFlowDescriptor(GRAVITY_FLOW_IDS.attract, {
  label: GRAVITY_FLOW_LABELS.attract,
  nextFlowId: GRAVITY_ATTRACT_FLOW_NEXT_ID,
  autoAdvanceSeconds: null,
  statusText: GRAVITY_GAME_OVER_RETURN_STATUS,
  returnMode: GRAVITY_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: GRAVITY_GAME_OVER_RETURN_RESET_IDLE
});
