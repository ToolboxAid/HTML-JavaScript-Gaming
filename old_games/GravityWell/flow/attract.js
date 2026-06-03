import { GRAVITY_WELL_FLOW_IDS, GRAVITY_WELL_GAME_OVER_RETURN_MODE, GRAVITY_WELL_GAME_OVER_RETURN_RESET_IDLE, createFlowDescriptor } from "../rules/flowRules.js";
import { GRAVITY_WELL_FLOW_LABELS, GRAVITY_WELL_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const GRAVITY_WELL_ATTRACT_FLOW_NEXT_ID = GRAVITY_WELL_FLOW_IDS.intro;

export const attractFlow = createFlowDescriptor(GRAVITY_WELL_FLOW_IDS.attract, {
  label: GRAVITY_WELL_FLOW_LABELS.attract,
  nextFlowId: GRAVITY_WELL_ATTRACT_FLOW_NEXT_ID,
  autoAdvanceSeconds: null,
  statusText: GRAVITY_WELL_GAME_OVER_RETURN_STATUS,
  returnMode: GRAVITY_WELL_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: GRAVITY_WELL_GAME_OVER_RETURN_RESET_IDLE
});

